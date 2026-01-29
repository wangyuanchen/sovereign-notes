'use client';

import { useState, useEffect } from 'react';
import { deleteNoteAction } from '@/app/actions/note-actions';
import { decryptData } from '@/lib/crypto';
import { Lock, Unlock, X, Trash2, Loader2, Wallet } from 'lucide-react';
import { useWeb3Vault } from '@/hooks/useWeb3Vault';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/Confirm';
import MarkdownRenderer from './MarkdownRenderer';

interface Note {
  id: number;
  userId: string;
  title: string | null;
  encryptedContent: string;
  iv: string;
  salt?: string;
  createdAt: Date | null;
}

interface NoteListProps {
  notes: Note[];
  onNoteSelect?: (note: Note) => void;
  onNoteDeleted?: () => void;
}

export default function NoteList({ notes, onNoteDeleted, onNoteSelect }: NoteListProps) {
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const { vaultKey, connectWallet, deriveKeyFromSignature, isReady } = useWeb3Vault();

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Auto-attempt decryption when vaultKey becomes available (e.g., after wallet sign)
  useEffect(() => {
    if (vaultKey && selectedNote && !decryptedContent) {
      attemptDecrypt(selectedNote, vaultKey);
    }
  }, [vaultKey, selectedNote, decryptedContent]);

  const handleNoteClick = (note: Note) => {
    if (onNoteSelect) {
      onNoteSelect(note);
    } else {
      setSelectedNote(note);
      setDecryptedContent(null);
      setDecryptError(false);
      // Auto try decrypt if vaultKey exists
      if (vaultKey) {
        attemptDecrypt(note, vaultKey);
      }
    }
  };

  const attemptDecrypt = async (note: Note, key: string) => {
    setIsDecrypting(true);
    setDecryptError(false);
    try {
      // Use stored salt if available, otherwise fallback (for old data or different logic)
      // Note: In CreateNoteForm we generate a salt but createNote action expects 'salt' field.
      // schema.ts has 'salt' field.
      // If note.salt is null, decryption will likely fail if we used a salt during encryption.
      // But for backward compatibility or demo, we handle it.

      // 'demo-salt' in base64 is 'ZGVtby1zYWx0'
      const saltToUse = note.salt || 'ZGVtby1zYWx0';

      const content = await decryptData(note.encryptedContent, note.iv, saltToUse, key);
      if (content) {
        setDecryptedContent(content);
        localStorage.setItem('sovereign_key', key); // Save successful key
      } else {
        setDecryptError(true);
      }
    } catch (e: any) {
      if (e.message?.includes('Invalid Base64')) {
        console.warn(`Decryption skipped for note ${note.id}: ${e.message}`);
      } else {
        console.error(e);
      }
      setDecryptError(true);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDelete = async (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const shouldDelete = await confirm({
      title: t('common.deleteNote'),
      message: t('common.deleteConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      type: 'danger',
    });
    if (!shouldDelete) {
      return;
    }
    setDeletingId(noteId);
    if (selectedNote?.id === noteId) setSelectedNote(null);

    const result = await deleteNoteAction(noteId);

    if (result.success) {
      toast.success(t('common.deleteSuccess'));
      onNoteDeleted?.();
    } else {
      toast.error(result.error || t('common.deleteFailed'));
    }
    setDeletingId(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(t('common.dateFormat'), {
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
        <p className="text-zinc-400 text-sm">{t('common.emptyNotes')}</p>
        <p className="text-zinc-600 text-xs mt-1">{t('common.createFirstNote')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => handleNoteClick(note)}
            className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-4 rounded-xl hover:border-sky-500/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-zinc-100 truncate group-hover:text-sky-400 transition">
                  {note.title || t('common.untitled')}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    {t('common.noteId')}: {note.id.toString().substring(0, 8)}...
                  </span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> {t('editor.encrypted')}
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
                   onClick={(e) => handleDelete(note.id, e)}
                   className="p-2 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-lg transition"
                 >
                   {deletingId === note.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 shrink-0">
                 <h2 className="text-lg font-bold truncate pr-8">{selectedNote.title || t('common.noteDetails')}</h2>
                 <button
                   onClick={() => setSelectedNote(null)}
                   className="p-1 hover:bg-zinc-800 rounded-full transition absolute right-4 top-4"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 min-h-[400px] custom-scrollbar">
                 {decryptedContent ? (
                   <div className="animate-in fade-in slide-in-from-bottom-2">
                     <div className="flex items-center gap-2 text-emerald-400 mb-4 text-xs uppercase tracking-widest">
                       <Unlock className="w-3 h-3" /> {t('common.decryptedSuccess')}
                     </div>
                     <MarkdownRenderer content={decryptedContent} />
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
                      <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center text-zinc-500">
                        <Lock className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold">{t('common.contentLocked')}</h3>
                      <p className="text-zinc-400 text-center max-w-xs text-sm">
                        {t('common.contentLockedDesc')}
                      </p>

                      <div className="flex gap-2 w-full max-w-xs mt-4 justify-center">
                        <button
                          onClick={async () => {
                             if (!vaultKey) {
                               await connectWallet();
                               await deriveKeyFromSignature();
                             } else {
                               if (selectedNote) attemptDecrypt(selectedNote, vaultKey);
                             }
                          }}
                          disabled={isDecrypting}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-6 py-2.5 rounded-xl font-medium transition flex items-center gap-2"
                        >
                          {isDecrypting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                          {isDecrypting ? t('common.unlocking') : t('common.signToUnlock')}
                        </button>
                      </div>
                      {decryptError && (
                        <p className="text-red-400 text-xs animate-in shake">{t('common.decryptFailed')}</p>
                      )}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </>
  );
}
