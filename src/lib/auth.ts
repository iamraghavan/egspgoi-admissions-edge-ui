
'use client';

import type { User, UserPreferences, Role } from './types';
import { apiClient } from './api-client';

const roleIdToNameMap: Record<string, Role> = {
    "1c71bf70-49cf-410b-8d81-990825bed137": "Admission Manager",
    "5ad3c8c2-28f5-4685-848c-3b07ffe1d6e3": "Admission Executive",
    "1847e5ff-ca6c-46b9-8cce-993f69b90ff5": "Super Admin", // Assuming this is Super Admin
};

export function getAuthHeaders() {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('Authentication token not found');
    }
    return {
        'Authorization': `Bearer ${token}`,
    };
}


/**
 * Logs in a user.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns A promise that resolves with the login response data.
 */
export async function login(email: string, password: string): Promise<{ accessToken: string, user: User }> {
    const { data, error } = await apiClient<any>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    }, true); // `true` marks this as a public endpoint

    if (error) {
        throw new Error(error.message || 'Login failed');
    }

    if (data && data.accessToken) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.accessToken);
            if(data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            
            // Immediately fetch the full profile to get all details including preferences and correct role
            const fullProfile = await getProfile();
            if (!fullProfile) {
                throw new Error("Could not fetch user profile after login.");
            }
            
            localStorage.setItem('userProfile', JSON.stringify(fullProfile));
            return { accessToken: data.accessToken, user: fullProfile };
        }
        // This server-side path should ideally not be hit in a client-side login flow
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
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if(!refreshToken) {
      throw new Error("No refresh token available.");
    }
    
    const { data, error } = await apiClient<{accessToken: string}>('/api/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
    });

    if (error) {
        throw new Error(error.message || 'Failed to refresh token');
    }

    if (data && data.accessToken) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', data.accessToken);
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
export async function getProfile(): Promise<User | null> {
    if (typeof window === 'undefined') {
        return null;
    }

    const storedUser = localStorage.getItem('userProfile');
    let profile: User | null = null;

    if (storedUser) {
        try {
            profile = JSON.parse(storedUser) as User;
        } catch (error) {
            console.error("Failed to parse user profile from localStorage", error);
            return null;
        }
    }
    
    // Always try to fetch the latest profile from the API if a token exists
    if (localStorage.getItem('accessToken')) {
        const { data: apiResponse, error } = await apiClient<any>('/api/v1/users/users/profile');
        if (error) {
            console.error("Failed to fetch full user profile:", error.message);
            // Return the stale profile from local storage if API fails
            return profile;
        }
        
        if (apiResponse) {
            const apiData = apiResponse.data || apiResponse; // Handle cases where data is nested
            const roleName = roleIdToNameMap[apiData.role_id] || apiData.role || 'Admission Executive';
             const fullProfile: User = {
                id: apiData.id,
                name: apiData.name,
                email: apiData.email,
                role: roleName,
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
    const { data, error } = await apiClient<any>('/api/v1/users/users/profile', {
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
    const result = await apiClient<{ settings: UserPreferences }>(`/api/v1/users/auth/settings`, {
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
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
}
