

import { getAuthHeaders } from './auth';

const API_BASE_URL = "https://cms-egspgoi.vercel.app";

type ApiResult<T> = {
    data: T;
    error: null;
} | {
    data: null;
    error: { message: string, status: number, [key: string]: any };
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {},
    isPublic: boolean = false
): Promise<ApiResult<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const baseHeaders: HeadersInit = { 'Content-Type': 'application/json' };
    
    if (options.body instanceof FormData) {
        delete (baseHeaders as any)['Content-Type'];
    }

    const finalOptions = { ...options };

    try {
         if (!isPublic) {
            const authHeaders = getAuthHeaders();
            finalOptions.headers = { ...baseHeaders, ...options.headers, ...authHeaders };
        } else {
            finalOptions.headers = { ...baseHeaders, ...options.headers };
        }

        const response = await fetch(url, finalOptions);
        
        if (response.status === 401 && !isPublic) {
            // This indicates an expired or invalid token.
            // Instead of throwing, we return a structured error.
            // The calling function can decide how to handle it (e.g., show a toast).
             return { data: null, error: { message: 'Your session has expired. Please log in again.', status: 401 }};
        }

        const responseData = await response.json().catch(() => null);

        if (!response.ok) {
             const errorMessage = responseData?.message || responseData?.error || `Request failed with status ${response.status}`;
             const errorDetails = responseData ? { ...responseData } : {};
             return { data: null, error: { message: errorMessage, status: response.status, ...errorDetails } };
        }
        
        // Handle successful but empty responses (e.g., DELETE, PUT with no content)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
             return { data: (responseData || {}) as T, error: null };
        }

        return { data: responseData, error: null };

    } catch (error: any) {
        return { data: null, error: { message: error.message || 'A network error occurred.', status: 0 } };
    }
}
