

import { getAuthHeaders } from './auth';

const API_BASE_URL = "https://cms-egspgoi.vercel.app";

type ApiResult<T> = {
    data: T | null; // Allow data to be null on error
    error: { message: string, status: number, [key: string]: any } | null;
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {},
    isPublic: boolean = false
): Promise<ApiResult<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = { ...options.headers };

    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    let finalOptions: RequestInit = { ...options, headers };

    try {
         if (!isPublic) {
            const authHeaders = getAuthHeaders();
            finalOptions.headers = { ...finalOptions.headers, ...authHeaders };
        }

        const response = await fetch(url, finalOptions);
        
        if (response.status === 401 && !isPublic) {
            // Don't throw, just return the error. Let the caller decide how to handle it.
            return { data: null, error: { message: 'Your session has expired. Please log in again.', status: 401 } };
        }
        
        // Handle cases with no content, like a 204 response
        if (response.status === 204 || response.headers.get('content-length') === '0') {
             return { data: {} as T, error: null }; // Return an empty object as data
        }

        const responseData = await response.json().catch(() => null);

        if (!response.ok) {
             const errorMessage = responseData?.message || responseData?.error || `Request failed with status ${response.status}`;
             const errorDetails = responseData ? { ...responseData } : {};
             return { data: null, error: { message: errorMessage, status: response.status, ...errorDetails } };
        }

        return { data: responseData, error: null };

    } catch (error: any) {
        return { data: null, error: { message: error.message || 'A network error occurred. Failed to fetch.', status: 0 } };
    }
}
