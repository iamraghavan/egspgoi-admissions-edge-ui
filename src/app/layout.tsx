import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import { FirebaseClientProvider } from '@/firebase';


export const metadata: Metadata = {
  title: 'Login',
  description: 'Secure CRM for admissions management.',
   manifest: "/manifest.json",
  robots: "noindex, nofollow",
  googlebot: "noindex, nofollow",
  appleWebApp: {
    capable: true,
    title: "Admission CRM",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
        <FirebaseClientProvider>
            {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
