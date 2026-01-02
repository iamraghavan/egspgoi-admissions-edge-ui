

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
 * @returns The user's profile or null if not found.
 */
export function getProfile(): UserProfile | null {
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('userProfile');
        if (storedUser) {
            try {
                return JSON.parse(storedUser) as UserProfile;
            } catch (error) {
                console.error("Failed to parse user profile from localStorage", error);
                return null;
            }
        }
    }
    return null;
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
            const storedUser = localStorage.getItem('userProfile');
            if (storedUser) {
                const userProfile = JSON.parse(storedUser);
                userProfile.preferences = { ...userProfile.preferences, ...result.data.settings };
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
                return userProfile;
            }
        }
    }
    
    return getProfile() as User;
}


export function logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userProfile');
    stopSessionTimer(); // Stop the session timer on logout
}
