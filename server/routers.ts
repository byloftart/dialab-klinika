import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { uploadRouter } from "./_core/uploadRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getDiagnosticServices, getDiagnosticServiceById, getDiagnosticSubServices,
  createDiagnosticService, updateDiagnosticService, deleteDiagnosticService,
  createDiagnosticSubService, updateDiagnosticSubService, deleteDiagnosticSubService,
  getLaboratoryAnalysisTypes, getLaboratoryAnalysisTypeById, getLaboratorySubTests,
  createLaboratoryAnalysisType, updateLaboratoryAnalysisType, deleteLaboratoryAnalysisType,
  createLaboratorySubTest, updateLaboratorySubTest, deleteLaboratorySubTest,
  getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor,
  getGalleryImages, createGalleryImage, updateGalleryImage, deleteGalleryImage,
  getAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment, countNewAppointments,
  getFeedbackMessages, getFeedbackMessageById, createFeedbackMessage, updateFeedbackMessage, deleteFeedbackMessage, countUnreadMessages,
  getSiteSettings, getSiteSettingByKey, upsertSiteSetting,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  upload: uploadRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Public CMS Read API ──────────────────────────────────────────────────
  cms: router({
    diagnostics: router({
      list: publicProcedure.query(async () => getDiagnosticServices()),
      getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const service = await getDiagnosticServiceById(input.id);
        const subServices = await getDiagnosticSubServices(input.id);
        return { service, subServices };
      }),
    }),
    laboratory: router({
      list: publicProcedure.query(async () => getLaboratoryAnalysisTypes()),
      getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const analysisType = await getLaboratoryAnalysisTypeById(input.id);
        const subTests = await getLaboratorySubTests(input.id);
        return { analysisType, subTests };
      }),
    }),
    doctors: router({
      list: publicProcedure.query(async () => getDoctors(true)),
    }),
    gallery: router({
      list: publicProcedure.query(async () => getGalleryImages(true)),
    }),
    settings: router({
      get: publicProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => getSiteSettingByKey(input.key)),
      getGroup: publicProcedure.input(z.object({ group: z.string() })).query(async ({ input }) => getSiteSettings(input.group)),
    }),
    // Public appointment submission
    appointments: router({
      create: publicProcedure.input(z.object({
        fullName: z.string().min(2),
        phone: z.string().min(6),
        appointmentDate: z.string().optional(),
        appointmentTime: z.string().optional(),
        serviceType: z.string().optional(),
        notes: z.string().optional(),
      })).mutation(async ({ input }) => {
        await createAppointment(input);
        return { success: true };
      }),
    }),
    // Public feedback submission
    feedback: router({
      create: publicProcedure.input(z.object({
        fullName: z.string().min(2),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        subject: z.string().optional(),
        message: z.string().min(5),
      })).mutation(async ({ input }) => {
        await createFeedbackMessage(input);
        return { success: true };
      }),
    }),
  }),

  // ─── Admin Panel API (protected) ──────────────────────────────────────────
  admin: router({
    // Dashboard stats
    stats: adminProcedure.query(async () => {
      const [newAppointments, unreadMessages] = await Promise.all([
        countNewAppointments(),
        countUnreadMessages(),
      ]);
      return { newAppointments, unreadMessages };
    }),

    // Diagnostic Services CRUD
    diagnostics: router({
      list: adminProcedure.query(async () => getDiagnosticServices()),
      getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const service = await getDiagnosticServiceById(input.id);
        const subServices = await getDiagnosticSubServices(input.id);
        return { service, subServices };
      }),
      create: adminProcedure.input(z.object({
        titleAz: z.string().min(1),
        descriptionAz: z.string().min(1),
        imageUrl: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        await createDiagnosticService(input);
        return { success: true };
      }),
      update: adminProcedure.input(z.object({
        id: z.number(),
        titleAz: z.string().min(1).optional(),
        descriptionAz: z.string().optional(),
        imageUrl: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateDiagnosticService(id, data);
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteDiagnosticService(input.id);
        return { success: true };
      }),
      createSubService: adminProcedure.input(z.object({
        diagnosticServiceId: z.number(),
        titleAz: z.string().min(1),
        descriptionAz: z.string().optional(),
        order: z.number().optional(),
      })).mutation(async ({ input }) => {
        await createDiagnosticSubService(input);
        return { success: true };
      }),
      updateSubService: adminProcedure.input(z.object({
        id: z.number(),
        titleAz: z.string().optional(),
        descriptionAz: z.string().optional(),
        order: z.number().optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateDiagnosticSubService(id, data);
        return { success: true };
      }),
      deleteSubService: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteDiagnosticSubService(input.id);
        return { success: true };
      }),
    }),

    // Laboratory CRUD
    laboratory: router({
      list: adminProcedure.query(async () => getLaboratoryAnalysisTypes()),
      getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
        const analysisType = await getLaboratoryAnalysisTypeById(input.id);
        const subTests = await getLaboratorySubTests(input.id);
        return { analysisType, subTests };
      }),
      create: adminProcedure.input(z.object({
        titleAz: z.string().min(1),
        descriptionAz: z.string().min(1),
        icon: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        await createLaboratoryAnalysisType(input);
        return { success: true };
      }),
      update: adminProcedure.input(z.object({
        id: z.number(),
        titleAz: z.string().optional(),
        descriptionAz: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateLaboratoryAnalysisType(id, data);
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteLaboratoryAnalysisType(input.id);
        return { success: true };
      }),
      createSubTest: adminProcedure.input(z.object({
        analysisTypeId: z.number(),
        titleAz: z.string().min(1),
        descriptionAz: z.string().optional(),
        order: z.number().optional(),
      })).mutation(async ({ input }) => {
        await createLaboratorySubTest(input);
        return { success: true };
      }),
      updateSubTest: adminProcedure.input(z.object({
        id: z.number(),
        titleAz: z.string().optional(),
        descriptionAz: z.string().optional(),
        order: z.number().optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateLaboratorySubTest(id, data);
        return { success: true };
      }),
      deleteSubTest: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteLaboratorySubTest(input.id);
        return { success: true };
      }),
    }),

    // Doctors CRUD
    doctors: router({
      list: adminProcedure.query(async () => getDoctors()),
      getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getDoctorById(input.id)),
      create: adminProcedure.input(z.object({
        nameAz: z.string().min(1),
        specialtyAz: z.string().min(1),
        bioAz: z.string().optional(),
        photoUrl: z.string().optional(),
        experienceYears: z.number().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        await createDoctor(input);
        return { success: true };
      }),
      update: adminProcedure.input(z.object({
        id: z.number(),
        nameAz: z.string().optional(),
        specialtyAz: z.string().optional(),
        bioAz: z.string().optional(),
        photoUrl: z.string().optional(),
        experienceYears: z.number().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateDoctor(id, data);
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteDoctor(input.id);
        return { success: true };
      }),
    }),

    // Gallery CRUD
    gallery: router({
      list: adminProcedure.query(async () => getGalleryImages()),
      create: adminProcedure.input(z.object({
        imageUrl: z.string().min(1),
        titleAz: z.string().optional(),
        descriptionAz: z.string().optional(),
        category: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        await createGalleryImage(input);
        return { success: true };
      }),
      update: adminProcedure.input(z.object({
        id: z.number(),
        imageUrl: z.string().optional(),
        titleAz: z.string().optional(),
        descriptionAz: z.string().optional(),
        category: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateGalleryImage(id, data);
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteGalleryImage(input.id);
        return { success: true };
      }),
    }),

    // Appointments management
    appointments: router({
      list: adminProcedure.query(async () => getAppointments()),
      getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getAppointmentById(input.id)),
      updateStatus: adminProcedure.input(z.object({
        id: z.number(),
        status: z.enum(["new", "confirmed", "completed", "cancelled"]),
        isRead: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateAppointment(id, data);
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteAppointment(input.id);
        return { success: true };
      }),
    }),

    // Feedback management
    feedback: router({
      list: adminProcedure.query(async () => getFeedbackMessages()),
      getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getFeedbackMessageById(input.id)),
      markRead: adminProcedure.input(z.object({
        id: z.number(),
        isRead: z.boolean(),
        status: z.enum(["new", "read", "replied"]).optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateFeedbackMessage(id, data);
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteFeedbackMessage(input.id);
        return { success: true };
      }),
    }),

    // Site Settings
    settings: router({
      list: adminProcedure.query(async () => getSiteSettings()),
      upsert: adminProcedure.input(z.object({
        key: z.string(),
        value: z.string(),
        label: z.string().optional(),
        group: z.string().optional(),
      })).mutation(async ({ input }) => {
        await upsertSiteSetting(input.key, input.value, input.label, input.group);
        return { success: true };
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
