
'use client';

import { useEffect } from 'react';
import type { User } from '@/lib/types';

export function ThemeInitializer() {
  useEffect(() => {
    let theme = 'system';
    try {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const profile: User = JSON.parse(storedProfile);
        if (profile.preferences?.theme) {
          theme = profile.preferences.theme;
        }
      }
    } catch (error) {
      console.error("Failed to apply theme from localStorage, defaulting to system.", error);
    }
    
    if (theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else { // 'system'
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

  }, []);

  return null;
}
