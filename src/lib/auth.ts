
import type { User, UserPreferences } from './types';
import { apiClient } from './api-client';
import { startSessionTimer, stopSessionTimer } from './session-timer';

// Mock implementation of a profile object you might get from an API
interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    preferences?: UserPreferences;
    designation?: string;
    agent_number?: string;
    caller_id?: string;
}

export function getAuthHeaders() {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('Authentication token not found');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}


/**
 * Logs in a user.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns A promise that resolves with the login response data.
 */
export async function login(email: string, password: string): Promise<{ accessToken: string, user: UserProfile }> {
    const response = await fetch(`https://cms-egspgoi.vercel.app/api/v1/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || 'Login failed');
        } catch (e) {
            throw new Error(errorText || 'An unknown error occurred');
        }
    }

    try {
        const responseData = await response.json();
        if (responseData && responseData.accessToken && responseData.user) {
            // Store the token and user info
            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', responseData.accessToken);
                localStorage.setItem('userProfile', JSON.stringify(responseData.user));
                startSessionTimer(responseData.accessToken); // Start the session timer
            }
            return { accessToken: responseData.accessToken, user: responseData.user };
        } else {
             throw new Error('Login response did not include an accessToken or user object.');
        }
    } catch (error) {
        throw new Error('Failed to parse successful login response.');
    }
}


/**
 * Refreshes the authentication token.
 * @returns A promise that resolves when the token is refreshed.
 */
export async function refreshToken(): Promise<void> {
    const response = await fetch(`https://cms-egspgoi.vercel.app/api/v1/auth/refresh`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

     const responseData = await response.json();
    if (responseData && responseData.accessToken) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', responseData.accessToken);
            startSessionTimer(responseData.accessToken); // Reset the session timer with the new token
        }
    } else {
        throw new Error('Refresh response did not include a new accessToken.');
    }
}

/**
 * Fetches the current user's profile from localStorage.
 * If the profile in localStorage is missing a phone number, it fetches the full profile from the API.
 * @returns The user's profile or null if not found.
 */
export async function getProfile(): Promise<UserProfile | null> {
    if (typeof window === 'undefined') {
        return null;
    }

    const storedUser = localStorage.getItem('userProfile');
    let profile: UserProfile | null = null;

    if (storedUser) {
        try {
            profile = JSON.parse(storedUser) as UserProfile;
        } catch (error) {
            console.error("Failed to parse user profile from localStorage", error);
            return null;
        }
    }
    
    // If profile exists but phone is missing, fetch from API
    if (profile && !profile.phone) {
        const { data: apiProfile, error } = await apiClient<{ success: boolean; data: any }>('/auth/profile');
        if (error) {
            console.error("Failed to fetch full user profile:", error.message);
            // Return the stale profile from local storage, the caller might handle it
            return profile;
        }
        
        if (apiProfile?.success && apiProfile.data) {
            const fullProfile: UserProfile = {
                id: apiProfile.data.id,
                name: apiProfile.data.name,
                email: apiProfile.data.email,
                role: apiProfile.data.role.name,
                phone: apiProfile.data.phone,
                preferences: apiProfile.data.preferences,
                designation: apiProfile.data.designation,
                agent_number: apiProfile.data.agent_number,
                caller_id: apiProfile.data.caller_id,
            };
            localStorage.setItem('userProfile', JSON.stringify(fullProfile));
            return fullProfile;
        }
    }
    
    return profile;
}

export async function updateUserProfile(payload: Partial<User>): Promise<User> {
    const { data, error } = await apiClient<any>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });

    if (error) {
        throw new Error(error.message);
    }
    
    const updatedUser = data.data;

    // Update local storage
    if (typeof window !== 'undefined') {
        const storedUser = await getProfile();
        if (storedUser) {
            const newUserProfile = { ...storedUser, ...updatedUser };
            localStorage.setItem('userProfile', JSON.stringify(newUserProfile));
            return newUserProfile as User;
        }
    }
    
    return await getProfile() as User;
}


export async function updateUserSettings(payload: { preferences: Partial<UserPreferences> }): Promise<any> {
    const result = await apiClient<{ settings: UserPreferences }>(`/users/auth/settings`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });

    if (result.error) {
        throw new Error(result.error.message);
    }

    if (result.data?.settings) {
        // Update local storage
        if (typeof window !== 'undefined') {
            const storedUser = await getProfile();
            if (storedUser) {
                const userProfile = storedUser;
                userProfile.preferences = { ...userProfile.preferences, ...result.data.settings };
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
                return userProfile;
            }
        }
    }
    
    return await getProfile();
}


export function logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userProfile');
    stopSessionTimer(); // Stop the session timer on logout
}
