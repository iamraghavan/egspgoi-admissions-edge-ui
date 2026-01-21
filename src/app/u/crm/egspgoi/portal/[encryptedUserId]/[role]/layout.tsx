// This file has been modified to disable a conflicting route.
import { notFound } from 'next/navigation';
export default function ConflictingLayout({ children }: { children: React.ReactNode }) {
  notFound();
}
