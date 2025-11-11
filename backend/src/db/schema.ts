import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Users Table
 * Stores user account information
 */
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

/**
 * Session Table
 * Stores active user sessions for authentication
 */
export const session = pgTable("session", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

export type NewSession = typeof session.$inferInsert;
export type Session = typeof session.$inferSelect;
