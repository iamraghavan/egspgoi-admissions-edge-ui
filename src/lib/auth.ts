
'use client';

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
    const { data, error } = await apiClient<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    }, true); // `true` marks this as a public endpoint

    if (error) {
        throw new Error(error.message || 'Login failed');
    }

    if (data && data.accessToken && data.user) {
        if (typeof window !== 'undefined') {
            const userProfile: UserProfile = {
                ...data.user,
                phone: data.user.caller_id // Map caller_id to phone
            };

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            startSessionTimer(data.accessToken); // Start the session timer
            
            // Immediately fetch the full profile to get all details including preferences
            const fullProfile = await getProfile();
            if (fullProfile) {
                localStorage.setItem('userProfile', JSON.stringify(fullProfile));
                return { accessToken: data.accessToken, user: fullProfile };
            }

            return { accessToken: data.accessToken, user: userProfile };
        }
        return { accessToken: data.accessToken, user: data.user };
    } else {
        throw new Error('Login response did not include an accessToken or user object.');
    }
}


/**
 * Refreshes the authentication token.
 * @returns A promise that resolves when the token is refreshed.
 */
export async function refreshToken(): Promise<void> {
    const { data, error } = await apiClient<{accessToken: string}>('/auth/refresh', {
        method: 'POST',
    });

    if (error) {
        throw new Error(error.message || 'Failed to refresh token');
    }

    if (data && data.accessToken) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.accessToken);
            startSessionTimer(data.accessToken); // Reset the session timer with the new token
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
    
    // Always try to fetch the latest profile from the API if a token exists
    if (localStorage.getItem('accessToken')) {
        const { data: apiProfile, error } = await apiClient<{ success: boolean; data: any }>('/auth/auth/profile');
        if (error) {
            console.error("Failed to fetch full user profile:", error.message);
            // Return the stale profile from local storage, the caller might handle it
            return profile;
        }
        
        if (apiProfile?.success === false && apiProfile.data) {
             const fullProfile: UserProfile = {
                id: apiProfile.data.id,
                name: apiProfile.data.name,
                email: apiProfile.data.email,
                role: apiProfile.data.role?.name || apiProfile.data.role_id,
                phone: apiProfile.data.caller_id || apiProfile.data.phone,
                preferences: apiProfile.data.preferences,
                designation: apiProfile.data.designation,
                agent_number: apiProfile.data.agent_number,
                caller_id: apiProfile.data.caller_id,
            };
            localStorage.setItem('userProfile', JSON.stringify(fullProfile));
            return fullProfile;
        } else if (apiProfile) {
            const apiData = Array.isArray(apiProfile) ? apiProfile[0] : apiProfile;
            const fullProfile: UserProfile = {
                id: apiData.id,
                name: apiData.name,
                email: apiData.email,
                role: apiData.role?.name || apiData.role_id,
                phone: apiData.caller_id || apiData.phone,
                preferences: apiData.preferences,
                designation: apiData.designation,
                agent_number: apiData.agent_number,
                caller_id: apiData.caller_id,
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
