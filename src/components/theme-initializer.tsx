'use client';

import { useEffect } from 'react';
import type { User } from '@/lib/types';

export function ThemeInitializer() {
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('userProfile');
      let theme = 'system';
      if (storedProfile) {
        const profile: User = JSON.parse(storedProfile);
        theme = profile.preferences?.theme || 'system';
      }

      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error("Failed to apply theme from localStorage", error);
      // Fallback to system theme on error
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return null;
}
