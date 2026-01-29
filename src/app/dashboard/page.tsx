import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserNotes } from '@/lib/db';
import { db } from '@/db';
import { todos, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import DashboardView from "@/components/DashboardView";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // 获取用户信息
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

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
      userPlan={(user?.plan as 'free' | 'pro' | 'early_bird') || 'free'}
      subscriptionStatus={(user?.subscriptionStatus as 'active' | 'inactive' | 'expired') || 'inactive'}
    />
  );
}
