'use client';

import * as React from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';
import {mergeRegister} from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey,
} from 'lexical';
import {Suspense, useCallback, useEffect, useRef, useState} from 'react';
import { $isImageNode } from './ImageNode';
import { cn } from '@/lib/utils';

function ImageResizer({
  onResizeStart,
  onResizeEnd,
  imageRef,
  maxWidth,
  editor,
  show,
}: {
  onResizeStart: () => void;
  onResizeEnd: (width: 'inherit' | number, height: 'inherit' | number) => void;
  imageRef: React.RefObject<HTMLImageElement>;
  editor: any;
  maxWidth: number;
  show: boolean;
}): JSX.Element {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const positioningRef = useRef<{
    currentHeight: 'inherit' | number;
    currentWidth: 'inherit' | number;
    isResizing: boolean;
    ratio: number;
    startWidth: number;
    startX: number;
  }>({
    currentHeight: 0,
    currentWidth: 0,
    isResizing: false,
    ratio: 0,
    startWidth: 0,
    startX: 0,
  });

  const editorRootElement = editor.getRootElement();
  // const eRect = editorRootElement.getBoundingClientRect();
  // const eWidth = eRect.width;

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const image = imageRef.current;
    if (image) {
      const {width, height} = image.getBoundingClientRect();
      const positioning = positioningRef.current;
      positioning.startWidth = width;
      positioning.ratio = width / height;
      positioning.currentWidth = width;
      positioning.currentHeight = height;
      positioning.startX = event.clientX;
      positioning.isResizing = true;
      onResizeStart();
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    const image = imageRef.current;
    const positioning = positioningRef.current;

    if (image && positioning.isResizing) {
      const diff = event.clientX - positioning.startX;
      const newWidth = Math.min(
        Math.max(positioning.startWidth + diff, 50),
        maxWidth,
      );
      if (newWidth !== positioning.currentWidth) {
        positioning.currentWidth = newWidth;
        image.style.width = `${newWidth}px`;
        image.style.height = 'auto';
      }
    }
  };

  const handlePointerUp = () => {
    const positioning = positioningRef.current;
    if (positioning.isResizing) {
      const {currentWidth, currentHeight} = positioning;
      positioning.isResizing = false;
      onResizeEnd(currentWidth, currentHeight);
    }
  };

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      handlePointerMove(event);
    };
    const onUp = () => {
      handlePointerUp();
    };

    if (positioningRef.current.isResizing) {
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);

      return () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };
    }
  }, [positioningRef.current.isResizing]);

  return (
    <button
      ref={buttonRef}
      className={cn("absolute bottom-2 right-2 w-4 h-4 bg-primary rounded-full cursor-ew-resize", !show && 'hidden')}
      onPointerDown={handlePointerDown}
    />
  );
}


export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
}: {
  src: string;
  altText: string;
  nodeKey: NodeKey;
  width: 'inherit' | number;
  height: 'inherit' | number;
  maxWidth: number;
  resizable: boolean;
}): JSX.Element {
  const imageRef = useRef<null | HTMLImageElement>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState(null);

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
        }
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;
          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, isSelected, onDelete, setSelected, editor]);

  const onResizeEnd = (nextWidth: 'inherit' | number, nextHeight: 'inherit' | number) => {
    setTimeout(() => {
      setIsResizing(false);
    }, 200);

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };
  
  const draggable = isSelected && !isResizing;
  const isFocused = isSelected || isResizing;

  return (
    <Suspense fallback={null}>
      <div className={cn("relative inline-block", draggable && 'cursor-grab')} draggable={draggable}>
        <img
          src={src}
          alt={altText}
          ref={imageRef}
          width={width}
          height={height}
          className={cn('max-w-full', isFocused && 'ring-2 ring-primary')}
        />
        {resizable && isFocused && (
          <ImageResizer
            show={isFocused}
            editor={editor}
            imageRef={imageRef}
            maxWidth={maxWidth}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
          />
        )}
      </div>
    </Suspense>
  );
}
