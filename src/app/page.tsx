import React from 'react';
import { Shield, Plus, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { todos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import CreateNoteForm from '@/components/CreateNoteForm';
import TodoList from '@/components/TodoList';

export default async function Dashboard() {
  const { userId } = await auth();

  let userTodos: any[] = [];
  if (userId) {
    userTodos = await db.select().from(todos).where(eq(todos.userId, userId));
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-sky-500" /> Sovereign Notes
        </h1>
        <div className="flex gap-4">
          <SignedOut>
             <SignInButton mode="modal">
                <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition">
                  Sign In
                </button>
             </SignInButton>
          </SignedOut>
           <SignedIn>
             <Link href="/dashboard">
               <button className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-700 transition mr-2">
                 Go to Dashboard
               </button>
             </Link>
             <UserButton afterSignOutUrl="/"/>
           </SignedIn>
        </div>
      </div>

      <SignedOut>
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-5xl font-bold mb-6">Your Notes, Encrypted & Secure.</h2>
          <p className="text-xl text-zinc-400 mb-10">
            End-to-end encrypted notes and tasks. Accessible only by you.
          </p>
          <SignInButton mode="modal">
            <button className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition shadow-lg shadow-sky-900/20">
              Get Started for Free
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-7 space-y-6">
            <header className="flex justify-between items-center">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="text-sky-500" /> My Vault
              </h1>
            </header>

            <CreateNoteForm />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <TodoList todos={userTodos} />
          </div>

        </div>
      </SignedIn>
    </div>
  );
}
