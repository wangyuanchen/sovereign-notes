'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  className?: string;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, className, placeholder }: TiptapEditorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: `prose prose-invert prose-sm max-w-none focus:outline-none min-h-[300px] ${className || ''}`,
      },
    },
    onUpdate: ({ editor }) => {
      // 获取 Markdown 内容，增加防御性检查
      const storage = editor.storage as any;
      const markdown = storage.markdown?.getMarkdown?.() || editor.getText();
      onChange(markdown);
    },
    immediatelyRender: false,
  });

  // 当外部 content 变化且与编辑器内容不一致时（例如切换模式回来），更新编辑器
  useEffect(() => {
    if (editor && content) {
       // 简单的防抖或检查，防止循环更新
       const storage = editor.storage as any;
       const currentContent = storage.markdown?.getMarkdown?.() || '';
       if (content !== currentContent) {
           editor.commands.setContent(content);
       }
    }
  }, [content, editor]);

  if (!isClient || !editor) {
    return <div className="min-h-[300px] animate-pulse bg-zinc-900/50 rounded-lg"></div>;
  }

  return <EditorContent editor={editor} className="h-full" />;
}
