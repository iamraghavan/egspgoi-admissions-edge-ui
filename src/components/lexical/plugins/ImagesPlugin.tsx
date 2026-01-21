'use client';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from 'lexical';
import {useEffect} from 'react';

import {$createImageNode, ImageNode, ImagePayload} from '../nodes/ImageNode';

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND');

export default function ImagesPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor');
    }

    return editor.registerCommand<ImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (selection.isCollapsed()) {
            const imageNode = $createImageNode(payload);
            selection.insertNodes([imageNode]);
          } else {
             // Handle replacement of selected text
            const imageNode = $createImageNode(payload);
            selection.insertNodes([imageNode]);
          }
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
