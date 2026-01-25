'use client';

type Callback = () => void;

// A simple event emitter for session-related events.
function createSessionEmitter() {
  const events: { expired?: Callback[] } = {};

  return {
    /**
     * Subscribe to the 'expired' event.
     */
    on(event: 'expired', callback: Callback) {
      if (!events[event]) {
        events[event] = [];
      }
      events[event]?.push(callback);
    },

    /**
     * Unsubscribe from the 'expired' event.
     */
    off(event: 'expired', callback: Callback) {
      if (!events[event]) {
        return;
      }
      events[event] = events[event]?.filter(cb => cb !== callback);
    },

    /**
     * Publish the 'expired' event to all subscribers.
     */
    emit(event: 'expired') {
      if (!events[event]) {
        return;
      }
      events[event]?.forEach(callback => callback());
    },
  };
}

export const sessionEmitter = createSessionEmitter();
