'use client';

import { useState } from 'react';

export default function MarkdownEditor() {
  const [content, setContent] = useState('');

  return (
    <div className="flex flex-col h-full">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 p-4 border rounded-lg resize-none"
        placeholder="开始写作..."
      />
    </div>
  );
}
