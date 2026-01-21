
'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TrixEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const TrixEditor = ({ value, onChange, className }: TrixEditorProps) => {
  const trixEditorRef = useRef<any>(null);
  const isContentLoaded = useRef(false);

  useEffect(() => {
    const editorElement = trixEditorRef.current;
    if (!editorElement) return;

    const handleChange = (event: any) => {
      // When the content changes, we get the innerHTML of the editor
      onChange(event.target.innerHTML);
    };

    editorElement.addEventListener('trix-change', handleChange);

    // Set the initial content only once
    if (!isContentLoaded.current && value) {
      editorElement.editor.loadHTML(value);
      isContentLoaded.current = true;
    } else if (!isContentLoaded.current && !value) {
      isContentLoaded.current = true; // Mark as loaded even if empty
    }

    return () => {
      editorElement.removeEventListener('trix-change', handleChange);
    };
  }, [onChange, value]);

  return (
    <div className={cn("rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
      {/* The hidden input is what the Trix editor is bound to */}
      <input id="trix-input" type="hidden" value={value} />
      <trix-editor ref={trixEditorRef} input="trix-input" />
    </div>
  );
};

export default TrixEditor;
