import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserNotes } from '@/lib/db';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import DashboardTabs from "@/components/DashboardTabs";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // 获取统计数据
  const notes = await getUserNotes(userId);
  const allTodos = await db.select().from(todos).where(eq(todos.userId, userId));
  const completedTodos = allTodos.filter(todo => todo.completed);
  const pendingTodos = allTodos.filter(todo => !todo.completed);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 text-sky-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div> */}
          <Link href="/">
            <h1 className="text-xl font-bold tracking-tight hover:text-sky-400 transition cursor-pointer">
              SOVEREIGN <span className="text-sky-400">NOTES</span>
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">Free Plan</span>
          {/* Link removed as Tabs handle view now */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">仪表盘</h2>
          <p className="text-zinc-400">查看你的笔记和待办事项统计</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">总笔记数</span>
              <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">{notes.length}</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">待办事项</span>
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center text-violet-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">{allTodos.length}</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">待完成</span>
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">{pendingTodos.length}</p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">已完成</span>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">{completedTodos.length}</p>
          </div>
        </div>

        {/* Tabs for Lists */}
        <div>
           <DashboardTabs notes={notes} todos={allTodos} />
        </div>
      </main>
    </div>
  );
}
