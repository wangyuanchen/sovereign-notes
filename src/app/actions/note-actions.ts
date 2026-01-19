"use server";

import { db } from "@/db";
import { notes, todos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createNote(formData: {
  title: string;
  encryptedContent: string;
  iv: string;
  salt?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(notes).values({
    userId,
    title: formData.title,
    encryptedContent: formData.encryptedContent,
    iv: formData.iv,
    salt: formData.salt,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/notes");
  return { success: true };
}

export async function updateNote(noteId: number, formData: {
  title?: string;
  encryptedContent: string;
  iv: string;
  salt?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.update(notes)
    .set({
      title: formData.title,
      encryptedContent: formData.encryptedContent,
      iv: formData.iv,
      salt: formData.salt,
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/notes");
  return { success: true };
}

export async function getMyNotes() {
  const { userId } = await auth();
  if (!userId) return [];

  return await db.query.notes.findMany({
    where: (notes, { eq }) => eq(notes.userId, userId),
    orderBy: (notes, { desc }) => [desc(notes.createdAt)],
  });
}

export async function deleteNoteAction(noteId: number) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Ensure the note belongs to the user before deleting
    // Drizzle delete with where clause acts as a check, but we should be careful about cascading if logic differs

    // Delete associated todos first (if any)
    await db
      .delete(todos)
      .where(and(eq(todos.noteId, noteId), eq(todos.userId, userId)));

    // Delete the note
    await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

    revalidatePath("/notes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete note:", error);
    return { success: false, error: "Failed to delete note" };
  }
}
