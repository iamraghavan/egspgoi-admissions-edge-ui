
'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string | undefined;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
}

interface TurnstileWidgetProps {
  onTokenChange: (token: string | null) => void;
}

export function TurnstileWidget({ onTokenChange }: TurnstileWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const renderTurnstile = () => {
      if (window.turnstile) {
        const id = window.turnstile.render(ref.current!, {
          sitekey: '0x4AAAAAACL9Gh9F6G7cEsuB',
          callback: (token) => {
            onTokenChange(token);
          },
          'expired-callback': () => {
            onTokenChange(null);
          },
          'error-callback': () => {
            onTokenChange(null);
          },
          theme: 'auto',
        });
        if (id) {
          widgetId.current = id;
        }
      }
    };
    
    // Cloudflare recommends waiting for the script to be ready
    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        renderTurnstile();
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [onTokenChange]);

  return <div ref={ref} />;
}
