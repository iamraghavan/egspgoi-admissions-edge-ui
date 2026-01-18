

import { getAuthHeaders } from './auth';

const API_BASE_URL = "https://cms-egspgoi.vercel.app";

type ApiResult<T> = {
    data: T;
    error: null;
} | {
    data: null;
    error: { message: string, status: number };
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

        if ((response.status === 401 || response.status === 403) && !isPublic) {
            // The token is invalid or expired. We no longer automatically log out.
            // The UI component that made the call will receive the error and can decide how to handle it.
            return { data: null, error: { message: 'Session expired. Please log in again.', status: response.status }};
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            return { data: null, error: { message: errorData.message || `Request failed with status ${response.status}`, status: response.status } };
        }

        // Handle successful but empty responses (e.g., DELETE, PUT with no content)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
             return { data: {} as T, error: null };
        }

        const responseData = await response.json();
        return { data: responseData, error: null };

    } catch (error: any) {
        return { data: null, error: { message: error.message || 'A network error occurred.', status: 0 } };
    }
}
