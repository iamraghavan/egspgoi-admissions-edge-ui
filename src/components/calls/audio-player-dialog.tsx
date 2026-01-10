
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AudioPlayerDialogProps {
  recordingUrl: string;
  onOpenChange: (isOpen: boolean) => void;
}

export function AudioPlayerDialog({ recordingUrl, onOpenChange }: AudioPlayerDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Play Recording</DialogTitle>
        </DialogHeader>
        <audio controls autoPlay src={recordingUrl} className="w-full">
          Your browser does not support the audio element.
        </audio>
      </DialogContent>
    </Dialog>
  );
}
