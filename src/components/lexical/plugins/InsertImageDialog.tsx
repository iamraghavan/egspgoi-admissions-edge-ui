'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_IMAGE_COMMAND } from './ImagesPlugin';

interface InsertImageDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function InsertImageDialog({ isOpen, onOpenChange }: InsertImageDialogProps) {
  const [editor] = useLexicalComposerContext();
  const [src, setSrc] = useState('');
  const [altText, setAltText] = useState('');

  const handleInsertImage = () => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src, altText });
    onOpenChange(false);
    setSrc('');
    setAltText('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Enter the URL and alt text for the image.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="image-src">Image URL</Label>
            <Input id="image-src" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://example.com/image.png" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-alt">Alt Text</Label>
            <Input id="image-alt" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="A description of the image" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleInsertImage} disabled={!src}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
