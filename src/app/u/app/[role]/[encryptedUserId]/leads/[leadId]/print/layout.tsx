
import type { ReactNode } from 'react';
import '@/app/globals.css';

// This is a special layout that will *only* apply to the print page.
// It does not include the main sidebar or header, so we get a clean page for printing.
export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <>
        {children}
    </>
  );
}
