import { eq, asc, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  diagnosticServices, InsertDiagnosticService,
  diagnosticSubServices, InsertDiagnosticSubService,
  laboratoryAnalysisTypes, InsertLaboratoryAnalysisType,
  laboratorySubTests, InsertLaboratorySubTest,
  doctors, InsertDoctor,
  galleryImages, InsertGalleryImage,
  appointments, InsertAppointment,
  feedbackMessages, InsertFeedbackMessage,
  siteSettings, InsertSiteSetting,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Diagnostic Services ──────────────────────────────────────────────────────

export async function getDiagnosticServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(diagnosticServices).orderBy(asc(diagnosticServices.order));
}

export async function getDiagnosticServiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(diagnosticServices).where(eq(diagnosticServices.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getDiagnosticSubServices(serviceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(diagnosticSubServices).where(eq(diagnosticSubServices.diagnosticServiceId, serviceId)).orderBy(asc(diagnosticSubServices.order));
}

export async function createDiagnosticService(data: InsertDiagnosticService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(diagnosticServices).values(data);
  return result;
}

export async function updateDiagnosticService(id: number, data: Partial<InsertDiagnosticService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(diagnosticServices).set(data).where(eq(diagnosticServices.id, id));
}

export async function deleteDiagnosticService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(diagnosticSubServices).where(eq(diagnosticSubServices.diagnosticServiceId, id));
  return db.delete(diagnosticServices).where(eq(diagnosticServices.id, id));
}

export async function createDiagnosticSubService(data: InsertDiagnosticSubService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(diagnosticSubServices).values(data);
}

export async function updateDiagnosticSubService(id: number, data: Partial<InsertDiagnosticSubService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(diagnosticSubServices).set(data).where(eq(diagnosticSubServices.id, id));
}

export async function deleteDiagnosticSubService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(diagnosticSubServices).where(eq(diagnosticSubServices.id, id));
}

// ─── Laboratory Analysis Types ────────────────────────────────────────────────

export async function getLaboratoryAnalysisTypes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(laboratoryAnalysisTypes).orderBy(asc(laboratoryAnalysisTypes.order));
}

export async function getLaboratoryAnalysisTypeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(laboratoryAnalysisTypes).where(eq(laboratoryAnalysisTypes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getLaboratorySubTests(analysisTypeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(laboratorySubTests).where(eq(laboratorySubTests.analysisTypeId, analysisTypeId)).orderBy(asc(laboratorySubTests.order));
}

export async function createLaboratoryAnalysisType(data: InsertLaboratoryAnalysisType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(laboratoryAnalysisTypes).values(data);
}

export async function updateLaboratoryAnalysisType(id: number, data: Partial<InsertLaboratoryAnalysisType>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(laboratoryAnalysisTypes).set(data).where(eq(laboratoryAnalysisTypes.id, id));
}

export async function deleteLaboratoryAnalysisType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(laboratorySubTests).where(eq(laboratorySubTests.analysisTypeId, id));
  return db.delete(laboratoryAnalysisTypes).where(eq(laboratoryAnalysisTypes.id, id));
}

export async function createLaboratorySubTest(data: InsertLaboratorySubTest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(laboratorySubTests).values(data);
}

export async function updateLaboratorySubTest(id: number, data: Partial<InsertLaboratorySubTest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(laboratorySubTests).set(data).where(eq(laboratorySubTests.id, id));
}

export async function deleteLaboratorySubTest(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(laboratorySubTests).where(eq(laboratorySubTests.id, id));
}

// ─── Doctors ──────────────────────────────────────────────────────────────────

export async function getDoctors(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(doctors);
  if (activeOnly) return query.where(eq(doctors.isActive, true)).orderBy(asc(doctors.order));
  return query.orderBy(asc(doctors.order));
}

export async function getDoctorById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createDoctor(data: InsertDoctor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(doctors).values(data);
}

export async function updateDoctor(id: number, data: Partial<InsertDoctor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(doctors).set(data).where(eq(doctors.id, id));
}

export async function deleteDoctor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(doctors).where(eq(doctors.id, id));
}

// ─── Gallery Images ───────────────────────────────────────────────────────────

export async function getGalleryImages(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(galleryImages);
  if (activeOnly) return query.where(eq(galleryImages.isActive, true)).orderBy(asc(galleryImages.order));
  return query.orderBy(asc(galleryImages.order));
}

export async function createGalleryImage(data: InsertGalleryImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(galleryImages).values(data);
}

export async function updateGalleryImage(id: number, data: Partial<InsertGalleryImage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(galleryImages).set(data).where(eq(galleryImages.id, id));
}

export async function deleteGalleryImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(galleryImages).where(eq(galleryImages.id, id));
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function getAppointments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).orderBy(desc(appointments.createdAt));
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(appointments).values(data);
}

export async function updateAppointment(id: number, data: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(appointments).set(data).where(eq(appointments.id, id));
}

export async function deleteAppointment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(appointments).where(eq(appointments.id, id));
}

export async function countNewAppointments() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(appointments).where(eq(appointments.status, "new"));
  return result.length;
}

// ─── Feedback Messages ────────────────────────────────────────────────────────

export async function getFeedbackMessages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedbackMessages).orderBy(desc(feedbackMessages.createdAt));
}

export async function getFeedbackMessageById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(feedbackMessages).where(eq(feedbackMessages.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createFeedbackMessage(data: InsertFeedbackMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(feedbackMessages).values(data);
}

export async function updateFeedbackMessage(id: number, data: Partial<InsertFeedbackMessage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(feedbackMessages).set(data).where(eq(feedbackMessages.id, id));
}

export async function deleteFeedbackMessage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(feedbackMessages).where(eq(feedbackMessages.id, id));
}

export async function countUnreadMessages() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(feedbackMessages).where(eq(feedbackMessages.isRead, false));
  return result.length;
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function getSiteSettings(group?: string) {
  const db = await getDb();
  if (!db) return [];
  if (group) return db.select().from(siteSettings).where(eq(siteSettings.group, group));
  return db.select().from(siteSettings);
}

export async function getSiteSettingByKey(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertSiteSetting(key: string, value: string, label?: string, group?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(siteSettings).values({ key, value, label, group }).onDuplicateKeyUpdate({ set: { value } });
}

// ─── Local Auth Functions ────────────────────────────────────────────────────

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(users);
  return result.length;
}

export async function updateUserLastSignedIn(openId: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.openId, openId));
}
