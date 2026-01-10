
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Space_Grotesk } from 'next/font/google';
import { useEffect } from 'react';
import type { User } from '@/lib/types';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

// This can't be in the exported metadata object because it's client-side.
// We'll set the title dynamically if needed, or keep it static here.
if (typeof document !== 'undefined') {
  document.title = 'Admissions Edge';
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    // Apply theme from localStorage on initial load
    try {
      const storedUser = localStorage.getItem('userProfile');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        const theme = user.preferences?.theme;

        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // Handle 'system' preference
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    } catch (error) {
      console.error("Failed to apply theme from localStorage", error);
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={cn("font-sans antialiased", "min-h-screen bg-background font-sans")} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
