

import { useSessionTimeout } from '@/hooks/use-session-timeout';

// This is a bit of a hack to allow non-React components to access the session timeout context.
// In a real app, you might use a more robust solution like a dedicated event emitter.

type SessionTimeoutContextType = ReturnType<typeof useSessionTimeout>;

let sessionTimeoutContext: SessionTimeoutContextType | null = null;

export function setSessionTimeoutContext(context: SessionTimeoutContextType) {
    sessionTimeoutContext = context;
}

export function getSessionTimeoutContext() {
    return sessionTimeoutContext;
}
