'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import DashboardTabs from "@/components/DashboardTabs";
import CreateNoteForm from '@/components/CreateNoteForm';
import SubscriptionButton from '@/components/SubscriptionButton';
import { LayoutList, CheckSquare } from 'lucide-react';

interface DashboardViewProps {
  notes: any[];
  todos: any[];
  completedTodos: any[];
  pendingTodos: any[];
  userPlan?: 'free' | 'pro' | 'early_bird';
  subscriptionStatus?: 'active' | 'inactive' | 'expired';
}

export default function DashboardView({ notes, todos, completedTodos, pendingTodos, userPlan = 'free', subscriptionStatus = 'inactive' }: DashboardViewProps) {
  const { t } = useTranslation();

  const planLabel = userPlan === 'pro' ? 'Pro Plan' : userPlan === 'early_bird' ? 'Early Bird' : t('dashboard.freePlan');

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
          <span className={`text-sm ${userPlan !== 'free' ? 'text-sky-400' : 'text-zinc-500'}`}>{planLabel}</span>
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
              {/* Subscription Button */}
              <SubscriptionButton currentPlan={userPlan} subscriptionStatus={subscriptionStatus} />

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
