

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import { refreshToken, logout } from '@/lib/auth';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SessionTimeoutDialog() {
  const { isTimeoutDialogOpen, closeTimeoutDialog } = useSessionTimeout();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    logout();
    closeTimeoutDialog();
    router.push('/');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshToken();
      closeTimeoutDialog();
    } catch (error) {
      // If refresh fails, force logout
      handleLogout();
    } finally {
        setIsRefreshing(false);
    }
  };

  return (
    <AlertDialog open={isTimeoutDialogOpen} onOpenChange={(open) => !open && closeTimeoutDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expired</AlertDialogTitle>
          <AlertDialogDescription>
            Your session has expired. You can log out or try to refresh your session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogout}>Log Out</AlertDialogCancel>
          <AlertDialogAction onClick={handleRefresh} disabled={isRefreshing}>
             {isRefreshing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
