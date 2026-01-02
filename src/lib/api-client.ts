

import { getAuthHeaders, logout } from './auth';
import { getSessionTimeoutContext } from './session-context';

const API_BASE_URL = "https://cms-egspgoi.vercel.app/api/v1";

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
    
    let headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (!isPublic) {
        try {
            const authHeaders = getAuthHeaders();
            headers = { ...headers, ...authHeaders };
        } catch (error: any) {
            const sessionContext = getSessionTimeoutContext();
            if (sessionContext) {
                sessionContext.openTimeoutDialog();
            } else {
                console.error("Session context not available to open timeout dialog.");
                if (typeof window !== 'undefined') logout();
            }
            return { data: null, error: { message: error.message || 'Authentication token not found', status: 401 }};
        }
    }
    
    if (options.body instanceof FormData) {
        delete (headers as any)['Content-Type'];
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401 || response.status === 403) {
            const sessionContext = getSessionTimeoutContext();
            if (sessionContext) {
                sessionContext.openTimeoutDialog();
            } else {
                console.error("Session context not available to open timeout dialog.");
                 if (typeof window !== 'undefined') logout();
            }
            return { data: null, error: { message: 'Session expired. Please log in again.', status: response.status }};
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            return { data: null, error: { message: errorData.message, status: response.status } };
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
