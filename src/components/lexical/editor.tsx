'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EditorState, $getRoot, $insertNodes, $generateNodesFromDOM } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useEffect } from 'react';
import { ToolbarPlugin } from './toolbar-plugin';
import { editorTheme } from './theme';
import ImagesPlugin from './plugins/ImagesPlugin';
import { ImageNode } from './nodes/ImageNode';


interface LexicalEditorProps {
  initialHTML?: string;
  onChange: (html: string) => void;
}

const editorNodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
  ImageNode, // Added ImageNode
];

function InitialStatePlugin({ initialHTML }: { initialHTML?: string }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (initialHTML) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialHTML, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().select();
        $insertNodes(nodes);
      });
    }
  }, [editor, initialHTML]);
  return null;
}

export default function LexicalEditor({ initialHTML, onChange }: LexicalEditorProps) {
  
  const initialConfig = {
    namespace: 'MyEditor',
    theme: editorTheme,
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: editorNodes,
    editorState: initialHTML ? undefined : null,
  };

  const handleOnChange = (editorState: EditorState, editor: any) => {
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      onChange(htmlString);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="rounded-lg border">
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[400px] p-4 outline-none resize-y" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                Enter your page content here...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <LinkPlugin />
        <ImagesPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={handleOnChange} />
        {initialHTML && <InitialStatePlugin initialHTML={initialHTML} />}
      </div>
    </LexicalComposer>
  );
}
