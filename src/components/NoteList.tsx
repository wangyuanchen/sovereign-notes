'use client';

import { useState } from 'react';
import { deleteNoteAction } from '@/app/actions/note-actions';

interface Note {
  id: number;
  userId: string;
  title: string | null;
  encryptedContent: string;
  iv: string;
  createdAt: Date | null;
}

interface NoteListProps {
  notes: Note[];
  onNoteSelect?: (note: Note) => void;
  onNoteDeleted?: () => void;
}

export default function NoteList({ notes, onNoteSelect, onNoteDeleted }: NoteListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('确定要删除这条笔记吗？此操作无法撤销。')) {
      return;
    }

    setDeletingId(noteId);
    const result = await deleteNoteAction(noteId);
    
    if (result.success) {
      onNoteDeleted?.();
    } else {
      alert(result.error || '删除失败');
    }
    
    setDeletingId(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 text-zinc-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
        <p className="text-zinc-400 text-sm">还没有笔记</p>
        <p className="text-zinc-600 text-xs mt-1">点击上方按钮创建第一条笔记</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => onNoteSelect?.(note)}
          className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-4 rounded-xl hover:border-sky-500/50 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-zinc-100 truncate group-hover:text-sky-400 transition">
                {note.title || '无标题笔记'}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                  ID: {note.id.toString().substring(0, 8)}...
                </span>
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                  已加密
                </span>
              </div>
              {note.createdAt && (
                <p className="text-xs text-zinc-600 mt-1">
                  {formatDate(note.createdAt)}
                </p>
              )}
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNoteSelect?.(note);
                }}
                className="p-2 text-zinc-500 hover:text-sky-400 transition"
                title="查看详情"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </button>
              <button
                onClick={(e) => handleDelete(note.id, e)}
                disabled={deletingId === note.id}
                className="p-2 text-zinc-500 hover:text-red-400 transition disabled:opacity-50"
                title="删除"
              >
                {deletingId === note.id ? (
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

