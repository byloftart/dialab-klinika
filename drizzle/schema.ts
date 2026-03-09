import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CMS: Diagnostics ────────────────────────────────────────────────────────

export const diagnosticServices = mysqlTable("diagnosticServices", {
  id: int("id").autoincrement().primaryKey(),
  titleAz: varchar("titleAz", { length: 255 }).notNull(),
  descriptionAz: text("descriptionAz").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  icon: varchar("icon", { length: 100 }),
  order: int("order").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DiagnosticService = typeof diagnosticServices.$inferSelect;
export type InsertDiagnosticService = typeof diagnosticServices.$inferInsert;

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

// ─── CMS: Laboratory ─────────────────────────────────────────────────────────

export const laboratoryAnalysisTypes = mysqlTable("laboratoryAnalysisTypes", {
  id: int("id").autoincrement().primaryKey(),
  titleAz: varchar("titleAz", { length: 255 }).notNull(),
  descriptionAz: text("descriptionAz").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  icon: varchar("icon", { length: 100 }),
  order: int("order").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LaboratoryAnalysisType = typeof laboratoryAnalysisTypes.$inferSelect;
export type InsertLaboratoryAnalysisType = typeof laboratoryAnalysisTypes.$inferInsert;

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

// ─── CMS: Doctors ─────────────────────────────────────────────────────────────

export const doctors = mysqlTable("doctors", {
  id: int("id").autoincrement().primaryKey(),
  nameAz: varchar("nameAz", { length: 255 }).notNull(),
  specialtyAz: varchar("specialtyAz", { length: 255 }).notNull(),
  bioAz: text("bioAz"),
  photoUrl: varchar("photoUrl", { length: 512 }),
  experienceYears: int("experienceYears").default(0),
  order: int("order").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;

// ─── CMS: Gallery ─────────────────────────────────────────────────────────────

export const galleryImages = mysqlTable("galleryImages", {
  id: int("id").autoincrement().primaryKey(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  titleAz: varchar("titleAz", { length: 255 }),
  descriptionAz: text("descriptionAz"),
  category: varchar("category", { length: 100 }).default("general"),
  order: int("order").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

// ─── CMS: Appointments ────────────────────────────────────────────────────────

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  appointmentDate: varchar("appointmentDate", { length: 20 }),
  appointmentTime: varchar("appointmentTime", { length: 10 }),
  serviceType: varchar("serviceType", { length: 255 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "confirmed", "completed", "cancelled"]).default("new").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// ─── CMS: Feedback Messages ───────────────────────────────────────────────────

export const feedbackMessages = mysqlTable("feedbackMessages", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  status: mysqlEnum("status", ["new", "read", "replied"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeedbackMessage = typeof feedbackMessages.$inferSelect;
export type InsertFeedbackMessage = typeof feedbackMessages.$inferInsert;

// ─── CMS: Site Settings ───────────────────────────────────────────────────────

export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  label: varchar("label", { length: 255 }),
  group: varchar("group", { length: 100 }).default("general"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// ─── CMS: Static Pages ────────────────────────────────────────────────────────

export const staticPages = mysqlTable("staticPages", {
  id: int("id").autoincrement().primaryKey(),
  titleAz: varchar("titleAz", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  excerptAz: text("excerptAz"),
  contentAz: text("contentAz"),
  heroImageUrl: varchar("heroImageUrl", { length: 512 }),
  order: int("order").default(0),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StaticPage = typeof staticPages.$inferSelect;
export type InsertStaticPage = typeof staticPages.$inferInsert;
