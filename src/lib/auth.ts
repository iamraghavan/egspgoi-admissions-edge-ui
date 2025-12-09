// This is a placeholder for actual authentication logic.
// In a real application, this would interact with a backend API.

const API_BASE_URL = "/api/v1";

// Mock implementation of a profile object you might get from an API
interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
}

/**
 * Logs in a user.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns A promise that resolves when login is successful.
 */
export async function login(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        // Attempt to get a more specific error message from the response body
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || 'Login failed');
        } catch (e) {
            // If the error response is not JSON, use the text content
            throw new Error(errorText || 'An unknown error occurred');
        }
    }

    // Only parse JSON if the response was successful
    try {
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Failed to parse successful login response.');
    }
}


/**
 * Refreshes the authentication token.
 * @returns A promise that resolves when the token is refreshed.
 */
export async function refreshToken(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }
}

/**
 * Fetches the current user's profile.
 * @returns A promise that resolves with the user's profile.
 */
export async function getProfile(): Promise<UserProfile> {
     const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'Failed to fetch profile');
    }
    
    return response.json();
}
