import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { createDrDiaReply } from "./_core/drDiaReplyService";
import { ENV } from "./_core/env";
import { callHermesChat } from "./_core/hermesAssistant";
import { normalizeAzerbaijaniLatinTranscription, transcribeMistralAudio } from "./_core/mistralTranscription";
import { sendWhatsAppTextMessage } from "./_core/whatsappAdapter";
import { systemRouter } from "./_core/systemRouter";
import { validateTelegramMiniAppInitData } from "./_core/telegramMiniAppAuth";
import { uploadRouter } from "./_core/uploadRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { doctorsCatalog } from "../shared/doctorsCatalog";
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
  getWhatsAppConversations, getWhatsAppConversationByWaId, updateWhatsAppConversation, deleteWhatsAppConversation, countUnreadWhatsAppConversations,
  getWhatsAppChatMessages, addWhatsAppChatMessage,
  getSiteSettings, getSiteSettingByKey, upsertSiteSetting,
  getStaticPages, getStaticPageById, getStaticPageBySlug, createStaticPage, updateStaticPage, deleteStaticPage,
} from "./db";

function buildSettingsMap(settings: Array<{ key: string; value: string | null }>) {
  return settings.reduce<Record<string, string>>((acc, setting) => {
    if (setting.value != null) {
      acc[setting.key] = setting.value;
    }
    return acc;
  }, {});
}

type VoiceTranscriptionLanguage = "Azerbaijani" | "Russian" | "English";

function detectVoiceTranscriptionLanguage(text: string): VoiceTranscriptionLanguage {
  const normalized = text.toLowerCase();

  if (/[а-яё]/i.test(text)) {
    if (/(сизде|сиздә|салам|вермек|истейир|тахыдыр|тахидыр|нечей|гебул|хеким|клиники|анализлер)/i.test(text)) {
      return "Azerbaijani";
    }

    if (/(сколько|стоит|цена|стоимость|анализ|кров|здравств|можно|есть|врач|при[её]м|запис|хочу|мне|нужно|где|когда|работа|скажите|подскажите)/i.test(text)) {
      return "Russian";
    }

    return "Azerbaijani";
  }

  if (/\b(hello|hi|what|which|where|when|how|can|could|do|does|have|need|price|cost|service|doctor|appointment|diagnostic|analysis|test|clinic|blood)\b/.test(normalized)) {
    return "English";
  }

  return "Azerbaijani";
}

function buildVoiceTranscriptionFallback(rawText: string, language: VoiceTranscriptionLanguage) {
  const trimmed = rawText.trim();

  if (language === "Russian" || language === "English") {
    return trimmed;
  }

  return normalizeAzerbaijaniLatinTranscription(trimmed).trim();
}

function looksLikeAzerbaijaniTranslation(text: string) {
  return /[əöüğşçı]/i.test(text) || /\b(qan|analiz|neçəyə|neceye|qəbul|qebul|həkim|hekim|sizdə|sizde|klinikada|daxildir)\b/i.test(text);
}

function shouldRejectCleanedTranscription(
  cleaned: string,
  language: VoiceTranscriptionLanguage,
) {
  if (language === "Russian") {
    return !/[а-яё]/i.test(cleaned) && looksLikeAzerbaijaniTranslation(cleaned);
  }

  if (language === "English") {
    return looksLikeAzerbaijaniTranslation(cleaned);
  }

  return false;
}

async function cleanVoiceTranscription(rawText: string) {
  const detectedLanguage = detectVoiceTranscriptionLanguage(rawText);
  const normalizedFallback = buildVoiceTranscriptionFallback(rawText, detectedLanguage);

  if (detectedLanguage === "Russian" || detectedLanguage === "English") {
    return normalizedFallback;
  }

  if (!ENV.hermesApiBaseUrl || !ENV.hermesApiKey) {
    return normalizedFallback;
  }

  try {
    const response = await callHermesChat({
      baseUrl: ENV.hermesApiBaseUrl,
      apiKey: ENV.hermesApiKey,
      model: ENV.hermesModel,
      messages: [
        {
          role: "system",
          content: [
            "You clean speech-to-text output before it is shown in a medical clinic chat input.",
            `Detected user language: ${detectedLanguage}.`,
            `Return ${detectedLanguage} text only. Do not translate to another language.`,
            "Return only the corrected user utterance, no explanation, no quotes, no markdown.",
            "Do not answer the user and do not add facts.",
            "Do not introduce new topics such as prices, preparation rules, services, diagnosis, or appointment unless those words are already present in the transcript.",
            "Preserve the user's intent, wording, and language as much as possible.",
            "If the text is Azerbaijani or Azerbaijani written in Cyrillic-like ASR output, rewrite it as clean Azerbaijani Latin text.",
            "Fix obvious ASR, grammar, casing, punctuation, and Azerbaijani letter errors.",
            "Prefer the shortest literal correction when a phrase is unclear.",
            "Example: Салам! Сизде клиники анализлерене тахыдыр. -> Salam! Sizdə klinik analizlərə nə daxildir?",
            "Example: Мен анализ вермек истейирем -> Mən analiz vermək istəyirəm.",
            "If the user clearly spoke Russian or English, keep that language and only clean punctuation/ASR mistakes.",
            "The output must be one short chat-ready message.",
          ].join(" "),
        },
        {
          role: "user",
          content: rawText,
        },
      ],
    });

    const cleaned = response.content
      .replace(/^["'“”«»]+|["'“”«»]+$/g, "")
      .trim();

    if (!cleaned) {
      return normalizedFallback;
    }

    if (shouldRejectCleanedTranscription(cleaned, detectedLanguage)) {
      return normalizedFallback;
    }

    return detectedLanguage === "Azerbaijani"
      ? normalizeAzerbaijaniLatinTranscription(cleaned)
      : cleaned;
  } catch {
    return normalizedFallback;
  }
}

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

  assistant: router({
    config: publicProcedure.query(async () => {
      if (ENV.assistantProvider === "hermes") {
        if (ENV.hermesApiBaseUrl && ENV.hermesApiKey) {
          return {
            provider: {
              type: "hermes" as const,
              isConfigured: true as const,
              model: ENV.hermesModel,
            },
          };
        }

        return {
          provider: {
            type: "none" as const,
            isConfigured: false as const,
          },
        };
      }

      if (ENV.botpressClientId) {
        return {
          provider: {
            type: "botpress" as const,
            isConfigured: true as const,
            clientId: ENV.botpressClientId,
            apiUrl: ENV.botpressApiUrl || undefined,
            additionalStylesheetUrl: ENV.botpressStylesheetUrl || undefined,
          },
        };
      }

      return {
        provider: {
          type: "none" as const,
          isConfigured: false as const,
        },
      };
    }),
    chat: publicProcedure.input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1200),
      })).min(1).max(80),
      context: z.object({
        entryPoint: z.enum(["welcome", "quick_action"]),
        quickActionId: z.string().nullable().optional(),
        label: z.string().optional(),
      }).optional(),
    })).mutation(async ({ input }) => {
      return createDrDiaReply({
        messages: input.messages,
        channel: "web",
        context: input.context,
      });
    }),
    transcribeVoice: publicProcedure.input(z.object({
      audioBase64: z.string().min(1).max(12_000_000),
      mimeType: z.enum(["audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4", "audio/wav"]),
      fileName: z.string().min(1).max(120).optional(),
    })).mutation(async ({ input }) => {
      if (!ENV.mistralApiKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voice transcription is not configured",
        });
      }

      let audioBytes: Uint8Array;
      try {
        audioBytes = new Uint8Array(Buffer.from(input.audioBase64, "base64"));
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Audio payload is invalid",
          cause: error,
        });
      }

      if (audioBytes.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Audio payload is empty",
        });
      }

      const text = await cleanVoiceTranscription(await transcribeMistralAudio(audioBytes, {
        contentType: input.mimeType,
        fileName: input.fileName || "dr-dia-voice.webm",
        language: undefined,
      }));

      if (!text) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Voice transcription returned no text",
        });
      }

      return { text };
    }),
    telegramMiniAppChat: publicProcedure.input(z.object({
      initData: z.string(),
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1200),
      })).min(1).max(80),
      context: z.object({
        entryPoint: z.enum(["telegram_mini_app", "quick_action", "welcome"]),
        quickActionId: z.string().nullable().optional(),
        label: z.string().optional(),
      }).optional(),
    })).mutation(async ({ input }) => {
      validateTelegramMiniAppInitData(input.initData);

      return createDrDiaReply({
        messages: input.messages,
        channel: "telegram_mini_app",
        context: input.context ?? {
          entryPoint: "telegram_mini_app",
          label: "Mini App Chat",
        },
      });
    }),
    submitBooking: publicProcedure.input(z.object({
      doctor_or_service: z.string().min(2),
      preferred_date: z.string().optional().or(z.literal("")),
      preferred_time: z.string().optional().or(z.literal("")),
      patient_name: z.string().min(2),
      phone: z.string().min(6),
      note: z.string().optional().or(z.literal("")),
    })).mutation(async ({ input }) => {
      const assistantSettings = buildSettingsMap(await getSiteSettings("assistant"));
      const webhookUrl = assistantSettings["assistant.bookingWebhookUrl"]?.trim();

      await createAppointment({
        fullName: input.patient_name,
        phone: input.phone,
        appointmentDate: input.preferred_date || undefined,
        appointmentTime: input.preferred_time || undefined,
        serviceType: input.doctor_or_service,
        notes: input.note || undefined,
      });

      if (webhookUrl) {
        let response: Response;

        try {
          response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              ...input,
              source: "assistant_widget",
              submitted_at: new Date().toISOString(),
            }),
          });
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Webhook göndərilmədi",
            cause: error,
          });
        }

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Webhook cavabı uğursuz oldu",
          });
        }
      }

      return { success: true };
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
    pages: router({
      list: publicProcedure.query(async () => getStaticPages(true)),
      getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => getStaticPageBySlug(input.slug, true)),
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
      const [newAppointments, unreadMessages, unreadWhatsApp] = await Promise.all([
        countNewAppointments(),
        countUnreadMessages(),
        countUnreadWhatsAppConversations(),
      ]);
      return { newAppointments, unreadMessages, unreadWhatsApp };
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
        imageUrl: z.string().optional(),
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
        imageUrl: z.string().optional(),
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
      seedCatalog: adminProcedure.mutation(async () => {
        const existingDoctors = await getDoctors();

        for (let index = 0; index < doctorsCatalog.length; index += 1) {
          const doctor = doctorsCatalog[index];
          const existingDoctor = existingDoctors.find((item) => item.nameAz === doctor.nameAz);
          const payload = {
            nameAz: doctor.nameAz,
            specialtyAz: doctor.specialtyAz,
            bioAz: doctor.bioAz ?? undefined,
            photoUrl: doctor.photoUrl ?? undefined,
            whatsappUrl: doctor.whatsappUrl ?? undefined,
            telegramUrl: doctor.telegramUrl ?? undefined,
            instagramUrl: doctor.instagramUrl ?? undefined,
            experienceYears: doctor.experienceYears ?? 0,
            order: doctor.order ?? index,
            isActive: doctor.isActive,
          };

          if (existingDoctor) {
            await updateDoctor(existingDoctor.id, payload);
          } else {
            await createDoctor(payload);
          }
        }

        return { success: true, count: doctorsCatalog.length };
      }),
      create: adminProcedure.input(z.object({
        nameAz: z.string().min(1),
        specialtyAz: z.string().min(1),
        bioAz: z.string().optional(),
        photoUrl: z.string().optional(),
        whatsappUrl: z.string().optional(),
        telegramUrl: z.string().optional(),
        instagramUrl: z.string().optional(),
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
        whatsappUrl: z.string().optional(),
        telegramUrl: z.string().optional(),
        instagramUrl: z.string().optional(),
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

    whatsapp: router({
      list: adminProcedure.query(async () => getWhatsAppConversations()),
      getByWaId: adminProcedure.input(z.object({ waId: z.string().min(1) })).query(async ({ input }) => {
        const [conversation, messages] = await Promise.all([
          getWhatsAppConversationByWaId(input.waId),
          getWhatsAppChatMessages(input.waId, 80),
        ]);

        return { conversation, messages };
      }),
      updateStatus: adminProcedure.input(z.object({
        waId: z.string().min(1),
        status: z.enum(["new", "open", "resolved"]),
        isRead: z.boolean().optional(),
        needsOperator: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const { waId, ...data } = input;
        await updateWhatsAppConversation(waId, data);
        return { success: true };
      }),
      reply: adminProcedure.input(z.object({
        waId: z.string().min(1),
        text: z.string().min(1).max(1200),
      })).mutation(async ({ input }) => {
        await sendWhatsAppTextMessage(input.waId, input.text);
        await addWhatsAppChatMessage(input.waId, "admin", input.text);
        await updateWhatsAppConversation(input.waId, {
          lastAssistantMessage: input.text,
          status: "open",
          isRead: true,
          needsOperator: false,
        });

        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ waId: z.string().min(1) })).mutation(async ({ input }) => {
        await deleteWhatsAppConversation(input.waId);
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

    pages: router({
      list: adminProcedure.query(async () => getStaticPages()),
      getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getStaticPageById(input.id)),
      create: adminProcedure.input(z.object({
        titleAz: z.string().min(1),
        slug: z.string().min(1),
        excerptAz: z.string().optional(),
        contentAz: z.string().optional(),
        heroImageUrl: z.string().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        await createStaticPage(input);
        return { success: true };
      }),
      update: adminProcedure.input(z.object({
        id: z.number(),
        titleAz: z.string().optional(),
        slug: z.string().optional(),
        excerptAz: z.string().optional(),
        contentAz: z.string().optional(),
        heroImageUrl: z.string().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateStaticPage(id, data);
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await deleteStaticPage(input.id);
        return { success: true };
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
