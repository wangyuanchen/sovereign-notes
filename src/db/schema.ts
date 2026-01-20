import { pgTable, serial, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title"), // 可选：标题不加密方便检索，或全文加密
  encryptedContent: text("encrypted_content").notNull(), 
  iv: varchar("iv", { length: 255 }).notNull(), // 加密偏移量
  salt: varchar("salt", { length: 255 }), // PBKDF2 盐值
  createdAt: timestamp("created_at").defaultNow(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  noteId: integer("note_id").references(() => notes.id), // 关联笔记
  task: text("task").notNull(),
  completed: boolean("completed").default(false),
  dueDate: timestamp("due_date"),
  frequency: text("frequency").default('once'), // 'once', 'daily', 'weekly', 'monthly', 'yearly'
  interval: integer("interval").default(1),
  endDate: timestamp("end_date"),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
});

// 用户表
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // Clerk ID
  email: varchar("email", { length: 255 }),
  plan: varchar("plan", { length: 50 }).default("free"), // 'free', 'pro', 'early_bird'
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("inactive"), // 'active', 'inactive', 'expired'
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  walletAddress: varchar("wallet_address", { length: 255 }), // Web3 支付钱包地址
});