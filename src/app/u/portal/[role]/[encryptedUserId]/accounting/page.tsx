// This file has been modified to disable a conflicting route.
import { notFound } from 'next/navigation';
export default function ConflictingPage() {
  notFound();
}
