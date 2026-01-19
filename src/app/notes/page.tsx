import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getMyNotes } from "@/app/actions/note-actions";
import NoteList from "@/components/NoteList";

export default async function NotesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const notes = await getMyNotes();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold">My Notes</h1>
        </header>

        <NoteList notes={notes} />
      </div>
    </div>
  );
}
