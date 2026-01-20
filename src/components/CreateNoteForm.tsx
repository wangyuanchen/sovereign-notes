'use client';

import { useState, useEffect } from 'react';
import { createNote } from '@/app/actions/note-actions';
import { addTodo } from '@/app/actions/todo-actions';
import { generateNoteFromPrompt } from '@/app/actions/ai-actions';
import { encryptData } from '@/lib/crypto';
import { useWeb3Vault } from '@/hooks/useWeb3Vault';
import { useTranslation } from '@/lib/i18n';
import { Loader2, Wand2, Eye, PenLine, Lock, Save, Columns, FileText, FileCode, Wallet } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

type DocType = 'plain' | 'markdown';
type ViewMode = 'wysiwyg' | 'split';

export default function CreateNoteForm() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // const [password, setPassword] = useState(''); // Removed manual password
  const { vaultKey, connectWallet, deriveKeyFromSignature, isReady } = useWeb3Vault();

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [docType, setDocType] = useState<DocType>('plain');
  const [viewMode, setViewMode] = useState<ViewMode>('wysiwyg');

  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateNoteFromPrompt(aiPrompt);
      if (result.success && result.data) {
        setTitle(result.data.title);
        setContent(result.data.content);

        // Auto-add todos
        if (result.data.todos && result.data.todos.length > 0) {
          if (confirm(t('editor.aiFoundTasks', { count: result.data.todos.length.toString() }))) {
            for (const todo of result.data.todos) {
              await addTodo(todo.task, undefined, todo.dueDate ? new Date(todo.dueDate) : undefined, todo.frequency);
            }
          }
        }
        setShowAiInput(false);
      }
    } catch (e) {
      console.error(e);
      alert(t('editor.generationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    // Web3: Check if we have the derived key
    if (!vaultKey) {
      if (confirm(t('editor.connectPrompt'))) {
        const address = await connectWallet();
        if (address) {
          await deriveKeyFromSignature();
        }
      }
      return;
    }

    setIsSaving(true);
    try {
      // Use vaultKey derived from signature as the password
      const { encryptedContent, iv, salt } = await encryptData(content, vaultKey);

      const result = await createNote({
        title,
        encryptedContent,
        iv,
        salt
      });

      if (result.success) {
        setTitle('');
        setContent('');
        alert(t('editor.noteSaved'));
      }
    } catch (e) {
      console.error(e);
      alert(t('editor.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditorTools = () => {
    return (
      <div className="flex bg-zinc-950/50 p-1 rounded-lg border border-zinc-800/50">
        <button
          onClick={() => setDocType('plain')}
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-2 ${
            docType === 'plain' 
              ? 'bg-zinc-800 text-white shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          {t('editor.plainText')}
        </button>
        <button
          onClick={() => {
            setDocType('markdown');
            // 切换到 Markdown 时，默认为所见即所得 (wysiwyg)
            if (viewMode !== 'split') setViewMode('wysiwyg');
          }}
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-2 ${
            docType === 'markdown' 
              ? 'bg-zinc-800 text-white shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          {t('editor.markdown')}
        </button>
      </div>
    );
  };

  const renderMarkdownToolbar = () => {
    if (docType !== 'markdown') return null;

    return (
      <div className="flex gap-1 border-l border-zinc-800 pl-4 ml-4">
        <button
          onClick={() => setViewMode('wysiwyg')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            viewMode === 'wysiwyg' ? 'bg-zinc-800 text-sky-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title={t('editor.wysiwyg')}
        >
          <PenLine className="w-4 h-4" />
          <span>{t('editor.wysiwyg')}</span>
        </button>
        <button
          onClick={() => setViewMode('split')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            viewMode === 'split' ? 'bg-zinc-800 text-sky-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title={t('editor.splitView')}
        >
          <Columns className="w-4 h-4" />
          <span>{t('editor.splitView')}</span>
        </button>
      </div>
    );
  };

  return (
    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col gap-4 transition-all duration-300 ${viewMode === 'split' ? 'md:col-span-12' : 'p-4'}`}>

      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 pt-4">
         <div className="flex items-center">
            {renderEditorTools()}
            {renderMarkdownToolbar()}
         </div>
         <button
           onClick={() => setShowAiInput(!showAiInput)}
           className="text-sky-400 hover:text-sky-300 text-xs font-medium flex items-center gap-1.5 transition px-3 py-1.5 rounded-lg hover:bg-sky-500/10"
         >
           <Wand2 className="w-3.5 h-3.5" />
           <span>{t('editor.aiAssistant')}</span>
         </button>
      </div>

      {/* AI Input Area */}
      {showAiInput && (
        <div className="mx-4 bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
           <textarea
             value={aiPrompt}
             onChange={(e) => setAiPrompt(e.target.value)}
             className="w-full bg-transparent text-sm outline-none resize-none placeholder-sky-500/50 text-sky-100 mb-2 font-medium"
             placeholder={t('editor.aiPromptPlaceholder')}
             rows={2}
           />
           <div className="flex justify-end">
             <button
               onClick={handleAiGenerate}
               disabled={isGenerating}
               className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-2"
             >
               {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
               {t('editor.generate')}
             </button>
           </div>
        </div>
      )}

      <div className="px-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-2xl font-bold outline-none placeholder-zinc-600 border-none p-0 focus:ring-0"
          placeholder={t('common.untitled')}
        />
      </div>

      <div className={`relative px-4 ${docType === 'markdown' ? 'h-[500px]' : 'min-h-[300px]'}`}>

        {/* Editor Container */}
        <div className={`w-full h-full`}>

          {/* Plain Text or Markdown Split Mode (Source) */}
          {(docType === 'plain' || (docType === 'markdown' && viewMode === 'split')) && (
             <div className={`w-full h-full ${viewMode === 'split' ? 'grid grid-cols-2 gap-4' : ''}`}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full h-full bg-transparent outline-none resize-none placeholder-zinc-600 custom-scrollbar leading-relaxed p-4 ${
                    docType === 'markdown' ? 'font-mono text-sm text-zinc-300 bg-zinc-950/30 rounded-lg border border-zinc-800/30' : 'font-sans text-base text-zinc-100'
                  }`}
                  placeholder={docType === 'markdown' ? t('editor.placeholderMarkdown') : t('editor.placeholderPlain')}
                />

                {/* Preview Pane for Split View */}
                {viewMode === 'split' && docType === 'markdown' && (
                  <div className="h-full overflow-y-auto custom-scrollbar bg-zinc-950/30 rounded-lg border border-zinc-800/30 p-6">
                    <MarkdownRenderer content={content} />
                  </div>
                )}
             </div>
          )}

          {/* TypeTap WYSIWYG Mode */}
          {docType === 'markdown' && viewMode === 'wysiwyg' && (
             <div className="h-full bg-zinc-950/30 rounded-lg border border-zinc-800/30 p-4 overflow-y-auto custom-scrollbar">
                <TiptapEditor
                  content={content}
                  onChange={(newContent) => setContent(newContent)}
                  placeholder="Type '/' for commands..."
                />
             </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center p-4 border-t border-zinc-800 mt-auto">
        <div className="flex items-center gap-3">
           {vaultKey ? (
             <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium px-2">
               <Lock className="w-3.5 h-3.5" />
               <span className="hidden sm:inline">{t('editor.encrypted')}</span>
             </div>
           ) : (
             <button
               onClick={async () => {
                 await connectWallet();
                 await deriveKeyFromSignature();
               }}
               className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-medium transition border border-zinc-700 hover:border-zinc-600"
             >
               <Wallet className="w-3.5 h-3.5" />
               {isReady ? t('editor.signToUnlock') : t('editor.installWallet')}
             </button>
           )}
        </div>

        <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-sky-900/20"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t('editor.saveNote')}
        </button>
      </div>
    </div>
  );
}
