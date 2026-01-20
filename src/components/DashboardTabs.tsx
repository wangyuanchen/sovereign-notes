'use client';

import { useState } from 'react';
import NoteList from './NoteList';
import TodoList from './TodoList';
import { LayoutList, CheckSquare, Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface DashboardTabsProps {
  notes: any[];
  todos: any[];
}

export default function DashboardTabs({ notes, todos }: DashboardTabsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'notes' | 'todos'>('notes');

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl w-fit border border-zinc-800">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'notes'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <LayoutList className="w-4 h-4" />
          {t('dashboard.tabs.myNotes')}
          <span className="bg-zinc-700/50 text-xs px-1.5 py-0.5 rounded-md ml-1">{notes.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('todos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'todos'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          {t('dashboard.tabs.todoList')}
          <span className="bg-zinc-700/50 text-xs px-1.5 py-0.5 rounded-md ml-1">{todos.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'notes' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t('dashboard.tabs.myNotes')}</h3>
            </div>
            {/* NoteList 已经包含了列表渲染 */}
            <NoteList notes={notes} />
          </div>
        )}

        {activeTab === 'todos' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             {/*
                TodoList 组件目前带有自己的 Card 样式 (border, bg, padding, h-full)。
                在 Tab 视图下，我们可能希望稍微弱化这个 Card 感或者让它看起来自然。
             */}
             <TodoList todos={todos} />
          </div>
        )}
      </div>
    </div>
  );
}
