
import { jwtDecode } from 'jwt-decode';
import { getSessionTimeoutContext } from './session-context';

let sessionTimeoutId: NodeJS.Timeout | null = null;
const TIMEOUT_BUFFER = 2 * 60 * 1000; // 2 minutes in milliseconds

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export function startSessionTimer(token: string) {
  stopSessionTimer(); // Clear any existing timer

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    const timeoutDuration = expirationTime - currentTime - TIMEOUT_BUFFER;

    if (timeoutDuration > 0) {
      sessionTimeoutId = setTimeout(() => {
        const sessionContext = getSessionTimeoutContext();
        if (sessionContext) {
          sessionContext.openTimeoutDialog();
        }
      }, timeoutDuration);
    }
  } catch (error) {
    console.error('Failed to decode token or start session timer:', error);
  }
}

export function stopSessionTimer() {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }
}

export function initializeSessionTimer() {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            startSessionTimer(token);
        }
    }
}
