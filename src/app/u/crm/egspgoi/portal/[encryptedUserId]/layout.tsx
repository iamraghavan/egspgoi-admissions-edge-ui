// This file has been modified to disable a conflicting route.
// It should not export a default component.
import type { ReactNode } from 'react';
export default function DeprecatedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
