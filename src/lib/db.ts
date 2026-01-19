import { db } from '@/db';
import { notes, todos } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// ==================== 笔记操作 ====================

/**
 * 创建加密笔记
 */
export async function createNote(data: {
  userId: string;
  title?: string;
  encryptedContent: string;
  iv: string;
  salt?: string;
}) {
  const [note] = await db.insert(notes).values(data).returning();
  return note;
}

/**
 * 获取用户所有笔记
 */
export async function getUserNotes(userId: string) {
  return await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt));
}

/**
 * 根据 ID 获取笔记
 */
export async function getNoteById(noteId: number, userId: string) {
  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
  return note;
}

/**
 * 更新笔记
 */
export async function updateNote(
  noteId: number,
  userId: string,
  data: {
    title?: string;
    encryptedContent?: string;
    iv?: string;
  }
) {
  const [updated] = await db
    .update(notes)
    .set(data)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();
  return updated;
}

/**
 * 删除笔记
 */
export async function deleteNote(noteId: number, userId: string) {
  // 先删除关联的待办事项
  await db.delete(todos).where(eq(todos.noteId, noteId));
  
  // 再删除笔记
  await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}

// ==================== 待办事项操作 ====================

/**
 * 创建待办事项
 */
export async function createTodo(data: {
  userId: string;
  noteId?: number;
  task: string;
  completed?: boolean;
  dueDate?: Date;
}) {
  const [todo] = await db.insert(todos).values(data).returning();
  return todo;
}

/**
 * 获取用户所有待办事项
 */
export async function getUserTodos(userId: string) {
  return await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.dueDate));
}

/**
 * 获取笔记关联的待办事项
 */
export async function getTodosByNoteId(noteId: number, userId: string) {
  return await db
    .select()
    .from(todos)
    .where(and(eq(todos.noteId, noteId), eq(todos.userId, userId)));
}

/**
 * 更新待办事项
 */
export async function updateTodo(
  todoId: number,
  userId: string,
  data: {
    task?: string;
    completed?: boolean;
    dueDate?: Date | null;
  }
) {
  const [updated] = await db
    .update(todos)
    .set(data)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
    .returning();
  return updated;
}

/**
 * 切换待办事项完成状态
 */
export async function toggleTodoComplete(todoId: number, userId: string) {
  const [todo] = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));
  
  if (!todo) return null;
  
  const [updated] = await db
    .update(todos)
    .set({ completed: !todo.completed })
    .where(eq(todos.id, todoId))
    .returning();
  
  return updated;
}

/**
 * 删除待办事项
 */
export async function deleteTodo(todoId: number, userId: string) {
  await db.delete(todos).where(and(eq(todos.id, todoId), eq(todos.userId, userId)));
}

/**
 * 批量删除已完成的待办事项
 */
export async function deleteCompletedTodos(userId: string) {
  await db
    .delete(todos)
    .where(and(eq(todos.userId, userId), eq(todos.completed, true)));
}