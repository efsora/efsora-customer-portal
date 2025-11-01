import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Users Table
 * Stores user account information
 */
export const users = pgTable("users", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  email: text("email").notNull().unique(),
  id: serial("id").primaryKey(),
  name: text("name"),
  password: text("password").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Type exports for use in application code
export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
