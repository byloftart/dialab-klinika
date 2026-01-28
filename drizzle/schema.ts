import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// CMS Tables for Dynamic Content Management

// Diagnostics Services
export const diagnosticServices = mysqlTable("diagnosticServices", {
  id: int("id").autoincrement().primaryKey(),
  titleAz: varchar("titleAz", { length: 255 }).notNull(),
  descriptionAz: text("descriptionAz").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  icon: varchar("icon", { length: 100 }),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DiagnosticService = typeof diagnosticServices.$inferSelect;
export type InsertDiagnosticService = typeof diagnosticServices.$inferInsert;

// Diagnostic Sub-services (procedures/tests within each service)
export const diagnosticSubServices = mysqlTable("diagnosticSubServices", {
  id: int("id").autoincrement().primaryKey(),
  diagnosticServiceId: int("diagnosticServiceId").notNull(),
  titleAz: varchar("titleAz", { length: 255 }).notNull(),
  descriptionAz: text("descriptionAz"),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DiagnosticSubService = typeof diagnosticSubServices.$inferSelect;
export type InsertDiagnosticSubService = typeof diagnosticSubServices.$inferInsert;

// Laboratory Analysis Types
export const laboratoryAnalysisTypes = mysqlTable("laboratoryAnalysisTypes", {
  id: int("id").autoincrement().primaryKey(),
  titleAz: varchar("titleAz", { length: 255 }).notNull(),
  descriptionAz: text("descriptionAz").notNull(),
  icon: varchar("icon", { length: 100 }),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LaboratoryAnalysisType = typeof laboratoryAnalysisTypes.$inferSelect;
export type InsertLaboratoryAnalysisType = typeof laboratoryAnalysisTypes.$inferInsert;

// Laboratory Sub-tests (specific tests within each analysis type)
export const laboratorySubTests = mysqlTable("laboratorySubTests", {
  id: int("id").autoincrement().primaryKey(),
  analysisTypeId: int("analysisTypeId").notNull(),
  titleAz: varchar("titleAz", { length: 255 }).notNull(),
  descriptionAz: text("descriptionAz"),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LaboratorySubTest = typeof laboratorySubTests.$inferSelect;
export type InsertLaboratorySubTest = typeof laboratorySubTests.$inferInsert;