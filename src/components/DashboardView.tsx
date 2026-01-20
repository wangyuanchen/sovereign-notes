'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import DashboardTabs from "@/components/DashboardTabs";
import CreateNoteForm from '@/components/CreateNoteForm';
import { LayoutList, CheckSquare } from 'lucide-react';

interface DashboardViewProps {
  notes: any[];
  todos: any[];
  completedTodos: any[];
  pendingTodos: any[];
}

export default function DashboardView({ notes, todos, completedTodos, pendingTodos }: DashboardViewProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <Link href="/">
            <h1 className="text-xl font-bold tracking-tight hover:text-sky-400 transition cursor-pointer">
              SOVEREIGN <span className="text-sky-400">NOTES</span>
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">{t('dashboard.freePlan')}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h2>
          <p className="text-zinc-400">{t('dashboard.subtitle')}</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
             <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">{t('dashboard.stats.totalNotes')}</div>
             <div className="text-3xl font-bold text-zinc-100">{notes.length}</div>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
             <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">{t('dashboard.stats.totalTodos')}</div>
             <div className="text-3xl font-bold text-zinc-100">{todos.length}</div>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <div className="text-emerald-500/80 text-xs font-medium uppercase tracking-wider mb-2">{t('dashboard.stats.completed')}</div>
             <div className="text-3xl font-bold text-emerald-400">{completedTodos.length}</div>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <div className="text-orange-500/80 text-xs font-medium uppercase tracking-wider mb-2">{t('dashboard.stats.pending')}</div>
             <div className="text-3xl font-bold text-orange-400">{pendingTodos.length}</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

           {/* Left Section: Create Form or Stats */}
           <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Create Note Section */}
              <CreateNoteForm />

              {/* Tabs for List View */}
              <DashboardTabs notes={notes} todos={todos} />
           </div>

           {/* Right Section: Quick Access or small stats */}
           <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 sticky top-8">
              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition duration-700"></div>

                  <h3 className="text-lg font-bold mb-2">Pro Features</h3>
                  <p className="text-sm text-indigo-200 mb-4 leading-relaxed">
                    Access advanced AI models, unlimited cloud storage, and team collaboration.
                  </p>
                  <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-semibold w-full transition shadow-lg shadow-indigo-500/20">
                    Upgrade to Pro
                  </button>
              </div>

               {/* Calendar Placeholder */}
               <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-[300px] flex items-center justify-center text-zinc-600">
                  Calendar Module Coming Soon
               </div>
           </div>

        </div>

      </main>
    </div>
  );
}
