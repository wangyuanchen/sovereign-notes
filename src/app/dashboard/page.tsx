import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserNotes } from '@/lib/db';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import DashboardView from "@/components/DashboardView";

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
    <DashboardView
      notes={notes}
      todos={allTodos}
      completedTodos={completedTodos}
      pendingTodos={pendingTodos}
    />
  );
}
