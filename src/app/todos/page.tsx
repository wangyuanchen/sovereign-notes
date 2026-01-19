import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function TodosPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">待办事项</h1>
      {/* 待办列表组件 */}
    </div>
  );
}
