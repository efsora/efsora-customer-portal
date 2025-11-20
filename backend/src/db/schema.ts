import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

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

  // New fields for project management
  surname: text("surname"),
  bio: text("bio"),
  companyId: integer("company_id"),
  roleId: integer("role_id"),
  projectId: integer("project_id"),
});

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

/**
 * Session Table
 * Stores active user sessions for authentication
 * Note: No DB foreign key constraint (ORM-only relation)
 */
export const session = pgTable("session", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  userId: uuid("user_id").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

export type NewSession = typeof session.$inferInsert;
export type Session = typeof session.$inferSelect;

// Session Relations (ORM-only, no DB FK)
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, {
    fields: [session.userId],
    references: [users.id],
  }),
}));

/**
 * Portal Mail Invitations Table
 * Stores email invitations for registration
 * Only users with valid, non-expired invitations can register
 */
export const portalMailInvitations = pgTable("portal_mail_invitations", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("PENDING"), // "PENDING", "ACCEPTED", "CANCELLED"
  dueDate: timestamp("due_date").notNull(), // Invitation expires after this date (default: 48h from creation)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type PortalMailInvitation = typeof portalMailInvitations.$inferSelect;
export type NewPortalMailInvitation = typeof portalMailInvitations.$inferInsert;

/**
 * Companies Table
 * Stores company information
 */
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  logoUrl: text("logo_url"),
  adminUserId: uuid("admin_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

/**
 * Roles Table
 * Stores user roles (MANAGEMENT, LEGAL, PRODUCT, DEVELOPMENT)
 */
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

/**
 * ProgressStatus Table
 * Stores progress statuses for projects and events
 */
export const progressStatus = pgTable("progress_status", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProgressStatus = typeof progressStatus.$inferSelect;
export type NewProgressStatus = typeof progressStatus.$inferInsert;

/**
 * Projects Table
 * Stores project information linked to companies
 */
export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    companyId: integer("company_id"),
    status: integer("status"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.name, table.companyId)],
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

/**
 * Milestones Table
 * Stores project milestones with assignees and due dates
 */
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  projectId: integer("project_id"),
  assigneeUserId: uuid("assignee_user_id"),
  status: integer("status"),
  dueDate: timestamp("due_date"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;

/**
 * Events Table
 * Stores project events with status tracking
 */
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  eventDatetime: timestamp("event_datetime").notNull(),
  description: text("description"),
  ownerUserId: uuid("owner_user_id"),
  milestoneId: integer("milestone_id"),
  status: integer("status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

/**
 * ORM Relations (No DB Foreign Keys)
 * These enable joins and nested queries in Drizzle ORM
 */

// Companies Relations
export const companiesRelations = relations(companies, ({ one, many }) => ({
  adminUser: one(users, {
    fields: [companies.adminUserId],
    references: [users.id],
  }),
  users: many(users),
  projects: many(projects),
}));

// Users Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  project: one(projects, {
    fields: [users.projectId],
    references: [projects.id],
  }),
  adminOfCompanies: many(companies),
  assignedMilestones: many(milestones),
  ownedEvents: many(events),
}));

// Roles Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

// ProgressStatus Relations
export const progressStatusRelations = relations(
  progressStatus,
  ({ many }) => ({
    projects: many(projects),
    milestones: many(milestones),
    events: many(events),
  }),
);

// Projects Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, {
    fields: [projects.companyId],
    references: [companies.id],
  }),
  statusRef: one(progressStatus, {
    fields: [projects.status],
    references: [progressStatus.id],
  }),
  users: many(users),
  milestones: many(milestones),
}));

// Milestones Relations
export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
  assigneeUser: one(users, {
    fields: [milestones.assigneeUserId],
    references: [users.id],
  }),
  statusRef: one(progressStatus, {
    fields: [milestones.status],
    references: [progressStatus.id],
  }),
  events: many(events),
}));

// Events Relations
export const eventsRelations = relations(events, ({ one }) => ({
  milestone: one(milestones, {
    fields: [events.milestoneId],
    references: [milestones.id],
  }),
  ownerUser: one(users, {
    fields: [events.ownerUserId],
    references: [users.id],
  }),
  statusRef: one(progressStatus, {
    fields: [events.status],
    references: [progressStatus.id],
  }),
}));

/**
 * Chat Sessions Table
 * Stores chat session metadata
 */
export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey(), // Client-provided UUID
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;

/**
 * Chat Messages Table
 * Stores all chat messages (user + assistant)
 */
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

// Chat Sessions Relations
export const chatSessionRelations = relations(
  chatSessions,
  ({ one, many }) => ({
    user: one(users, { fields: [chatSessions.userId], references: [users.id] }),
    messages: many(chatMessages),
  }),
);

// Chat Messages Relations
export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));
