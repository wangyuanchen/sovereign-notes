'use client';

import { useState } from 'react';
import { addTodo, deleteTodo, toggleTodo, updateTodo } from '@/app/actions/todo-actions';
import { useTranslation } from '@/lib/i18n';

interface Todo {
  id: number;
  task: string;
  completed: boolean | null;
  dueDate: Date | null;
  frequency: string | null;
}

export default function TodoList({ todos }: { todos: Todo[] }) {
  const { t } = useTranslation();
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTask, setEditTask] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await addTodo(newTask);
    setNewTask('');
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTask(todo.task);
  };

  const saveEdit = async () => {
    if (editingId && editTask.trim()) {
      await updateTodo(editingId, editTask);
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col w-full h-full min-h-[500px]">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-sky-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
        {t('todo.title')}
      </h3>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder={t('todo.addPlaceholder')}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm placeholder-zinc-500 text-zinc-200"
        />
        <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
          {t('todo.add')}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center justify-between p-3 bg-zinc-950/30 rounded-lg border border-zinc-800/30 hover:bg-zinc-900 transition group">
               <div className="flex items-center gap-3 overflow-hidden flex-1">
                 <input
                   type="checkbox"
                   checked={todo.completed || false}
                   onChange={() => toggleTodo(todo.id, todo.completed || false)}
                   className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-sky-500 focus:ring-sky-500/20 cursor-pointer flex-shrink-0"
                 />

                 {editingId === todo.id ? (
                   <input
                     type="text"
                     value={editTask}
                     onChange={(e) => setEditTask(e.target.value)}
                     onBlur={saveEdit}
                     onKeyDown={handleKeyDown}
                     autoFocus
                     className="bg-zinc-800 text-white rounded px-2 py-0.5 w-full text-sm outline-none border border-sky-500/50"
                   />
                 ) : (
                   <span
                     onDoubleClick={() => startEditing(todo)}
                     className={`truncate text-sm cursor-text ${todo.completed ? 'line-through text-zinc-600' : 'text-zinc-300'}`}
                     title={t('todo.doubleClickToEdit')}
                   >
                     {todo.task}
                   </span>
                 )}
               </div>

               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 {editingId !== todo.id && (
                   <button
                     onClick={() => startEditing(todo)}
                     className="text-zinc-600 hover:text-sky-400 p-1"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                     </svg>
                   </button>
                 )}
                 <button
                   onClick={() => deleteTodo(todo.id)}
                   className="text-zinc-600 hover:text-red-400 p-1"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                     <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                   </svg>
                 </button>
               </div>
            </li>
          ))}
          {todos.length === 0 && (
            <div className="text-center text-zinc-600 py-8 text-sm">
              {t('todo.empty')}
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
