"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db"; // Use @/db instead of @/lib/db to match note-actions
import { todos } from "@/db/schema";

export async function addTodo(
  task: string,
  noteId?: number,
  dueDate?: Date,
  frequency: string = 'once',
  interval: number = 1
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(todos).values({
    userId,
    task,
    noteId: noteId || null,
    dueDate,
    frequency,
    interval,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function updateTodo(id: number, task: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(todos)
    .set({ task })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function toggleTodo(id: number, currentStatus: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(todos)
    .set({ completed: !currentStatus })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function deleteTodo(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));
  revalidatePath("/");
  revalidatePath("/dashboard");
}