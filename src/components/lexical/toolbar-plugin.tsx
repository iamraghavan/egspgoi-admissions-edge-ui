'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $isRootOrShadowRoot,
  ElementNode,
  $isElementNode,
} from 'lexical';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from '@lexical/rich-text';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $findMatchingParent } from '@lexical/utils';
import {
  Undo, Redo, Bold, Italic, Underline, Code, List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { InsertImageDialog } from './plugins/InsertImageDialog';

const LowPriority = 1;

function getSelectedNode(selection: any) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isRangeSelection(selection) ? anchorNode : focusNode;
  } else {
    return $isRangeSelection(selection) ? focusNode : anchorNode;
  }
}

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [isImageDialogOpen, setImageDialogOpen] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsCode(selection.hasFormat('code'));

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
      
      // Update block format
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e: ElementNode) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          setBlockType(type);
        }
      }
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, updateToolbar]);
  
    const insertLink = useCallback(() => {
        if (!isLink) {
            const url = prompt("Enter URL");
            if (url) {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
            }
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink]);

  const formatBulletList = () => {
    if (blockType !== 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const quoteNode = $createQuoteNode();
          selection.wrapNodes(quoteNode);
        }
      });
    } else {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const nodes = selection.getNodes();
                nodes.forEach((node) => {
                    const parent = node.getParent();
                    if ($isElementNode(parent) && parent.getType() === 'quote') {
                        const children = parent.getChildren();
                        parent.replace(...children);
                    }
                });
            }
        });
    }
  };


  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
      <Button variant="ghost" size="icon" disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        <Redo className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant={isBold ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant={isItalic ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant={isUnderline ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}>
        <Underline className="h-4 w-4" />
      </Button>
      <Button variant={isCode ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}>
        <Code className="h-4 w-4" />
      </Button>
      <Button variant={isLink ? 'secondary' : 'ghost'} size="icon" onClick={insertLink}>
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
       <Button variant={blockType === 'ul' ? 'secondary' : 'ghost'} size="icon" onClick={formatBulletList}>
        <List className="h-4 w-4" />
      </Button>
       <Button variant={blockType === 'ol' ? 'secondary' : 'ghost'} size="icon" onClick={formatNumberedList}>
        <ListOrdered className="h-4 w-4" />
      </Button>
       <Button variant={blockType === 'quote' ? 'secondary' : 'ghost'} size="icon" onClick={formatQuote}>
        <Quote className="h-4 w-4" />
      </Button>
       <Button variant={'ghost'} size="icon" onClick={() => setImageDialogOpen(true)}>
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}>
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}>
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}>
        <AlignRight className="h-4 w-4" />
      </Button>
       <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}>
        <AlignJustify className="h-4 w-4" />
      </Button>
       <InsertImageDialog isOpen={isImageDialogOpen} onOpenChange={setImageDialogOpen} />
    </div>
  );
}
