import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { buildDrDiaKnowledgeContext, findDrDiaPriceMatches } from "./_core/drDiaKnowledgeContext";
import { buildDrDiaSystemPrompt, callHermesChat, type HermesChatMessage } from "./_core/hermesAssistant";
import { systemRouter } from "./_core/systemRouter";
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

function formatSetting(settings: Record<string, string>, key: string, label: string) {
  const value = settings[key]?.trim();
  return value ? `${label}: ${value}` : null;
}

function detectUserLanguage(text: string) {
  const normalized = text.toLowerCase();

  if (/[а-яё]/i.test(text)) {
    return "Russian";
  }

  if (/[əöüğşçı]/i.test(text)) {
    return "Azerbaijani";
  }

  if (/\b(hello|hi|what|which|where|when|how|can|could|do|does|have|need|price|service|doctor|appointment|diagnostic|analysis|test|clinic)\b/.test(normalized)) {
    return "English";
  }

  return "Azerbaijani";
}

function compactContactInstructions(content: string, language: string) {
  const hasContactIntent = /(\+994|\bwhatsapp\b|\btelegram\b|\bemail\b|\bmail\b|телефон|позвон|звон|почт|запис|appointment|book|call|phone|əlaqə|zəng|qəbul)/i.test(content);

  if (!hasContactIntent) {
    return content;
  }

  const cleaned = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) {
        return true;
      }

      return !/(\+?\d[\d\s().-]{7,}|@|https?:\/\/|mailto:|tel:|\bemail\b|\bmail\b|\bphone\b|\bcall\b|телефон|позвон|звон|почт|\bwhatsapp\b|\btelegram\b|zəng|sizə tezliklə kömək|тезликле|soon help)/i.test(line);
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (/(кнопк|button|düym|qəbul|запис|appointment)/i.test(cleaned)) {
    return cleaned;
  }

  if (/(кнопк|button|düym|qəbul|запис|appointment)/i.test(cleaned)) {
    return softenMissingInfoPhrases(cleaned, language);
  }

  const bookingIntent = /(запис|при[её]м|appointment|book|qəbul|randevu)/i.test(content);
  const buttonHint =
    language === "Russian"
      ? bookingIntent
        ? "Для записи используйте кнопку Qəbul под чатом."
        : "Для уточнения у оператора используйте кнопки WhatsApp или Telegram под чатом."
      : language === "English"
        ? bookingIntent
          ? "For booking, use the Qəbul button below the chat."
          : "To clarify with the operator, use the WhatsApp or Telegram buttons below the chat."
        : bookingIntent
          ? "Qəbul üçün çatın altındakı Qəbul düyməsindən istifadə edin."
          : "Operatorla dəqiqləşdirmək üçün çatın altındakı WhatsApp və ya Telegram düyməsindən istifadə edin.";

  if (cleaned.includes(buttonHint)) {
    return cleaned;
  }

  return softenMissingInfoPhrases([cleaned, buttonHint].filter(Boolean).join("\n\n"), language);
}

function isHomeVisitQuestion(text: string) {
  return /(осмотр|осмотреть|выезд|домой|на дому|дома|прийти|приходите|home visit|come to my home|at home|visit me|evə gəl|evde|evdə|evdə müayinə|evə çağır)/i.test(text);
}

function buildHomeVisitFallback(language: string) {
  if (language === "Russian") {
    return "Услуга домашнего осмотра не подтверждена в текущей базе клиники. Чтобы уточнить возможность индивидуально, обратитесь напрямую к оператору через кнопки под чатом: WhatsApp или Telegram.";
  }

  if (language === "English") {
    return "A home examination service is not confirmed in the current clinic knowledge base. To clarify this individually, contact the operator using the buttons below the chat: WhatsApp or Telegram.";
  }

  return "Evdə müayinə xidməti klinikanın cari məlumat bazasında təsdiqlənmir. Bunu fərdi qaydada dəqiqləşdirmək üçün çatın altındakı WhatsApp və ya Telegram düymələri ilə operatora yazın.";
}

function isReceptionTimeQuestion(text: string) {
  return /(qəbul saat|qebul saat|qəbul.*başlay|qebul.*başlay|при[её]м.*нач|когда.*при[её]м|appointment.*start|reception.*start)/i.test(text);
}

async function buildReceptionTimeAnswer(language: string) {
  const hoursMap = buildSettingsMap(await getSiteSettings("hours"));
  const weekdays = hoursMap["hours.weekdays"]?.trim() || "09:00 - 18:00";
  const saturday = hoursMap["hours.saturday"]?.trim();

  if (language === "Russian") {
    return [
      `Прием ориентируется на график клиники: в будние дни ${weekdays}.`,
      saturday ? `По субботам: ${saturday}.` : null,
      "Для точного времени конкретного врача используйте кнопку Qəbul под чатом.",
    ].filter(Boolean).join("\n\n");
  }

  if (language === "English") {
    return [
      `Appointments follow the clinic schedule: weekdays ${weekdays}.`,
      saturday ? `Saturday: ${saturday}.` : null,
      "For a specific doctor's exact time, use the Qəbul button below the chat.",
    ].filter(Boolean).join("\n\n");
  }

  return [
    `Qəbul klinikanın iş qrafikinə uyğun aparılır: həftəiçi ${weekdays}.`,
    saturday ? `Şənbə: ${saturday}.` : null,
    "Konkret həkimin dəqiq vaxtı üçün çatın altındakı Qəbul düyməsindən istifadə edin.",
  ].filter(Boolean).join("\n\n");
}

function isBranchQuestion(text: string) {
  return /(филиал|филиалы|другие адрес|branch|branches|filial|başqa ünvan|başqa filial)/i.test(text);
}

function buildBranchAnswer(language: string) {
  if (language === "Russian") {
    return "Да, филиал имеется. Чтобы получить актуальный адрес, график и удобный вариант обращения, уточните у оператора через кнопки WhatsApp или Telegram под чатом.";
  }

  if (language === "English") {
    return "Yes, a branch is available. For the current address, schedule, and the most convenient option, please clarify with the operator using the WhatsApp or Telegram buttons below the chat.";
  }

  return "Bəli, filial mövcuddur. Aktual ünvan, iş qrafiki və sizin üçün rahat müraciət variantını dəqiqləşdirmək üçün çatın altındakı WhatsApp və ya Telegram düyməsi ilə operatora yazın.";
}

function isPreparationQuestion(text: string) {
  return /(подготов|готовит|натощак|голодн|сдач[аеу]|analysis preparation|prepare|fasting|before test|hazırlıq|hazirliq|acqarına|acqarina|analizə.*hazır|analiz.*hazır|müayinəyə.*hazır|müayinə.*hazır)/i.test(text);
}

function buildPreparationFallback(language: string) {
  if (language === "Russian") {
    return "Правила подготовки зависят от конкретного анализа или обследования. В текущей базе Dr. Dia нет отдельного подтвержденного документа по подготовке, поэтому для точной инструкции напишите оператору через кнопки WhatsApp или Telegram под чатом.";
  }

  if (language === "English") {
    return "Preparation rules depend on the exact test or examination. Dr. Dia does not currently have a separate confirmed preparation document, so please clarify the exact instruction with the operator using the WhatsApp or Telegram buttons below the chat.";
  }

  return "Hazırlıq qaydası konkret analiz və ya müayinədən asılıdır. Dr. Dia-nın cari bazasında ayrıca təsdiqlənmiş hazırlıq sənədi yoxdur, buna görə dəqiq təlimat üçün çatın altındakı WhatsApp və ya Telegram düyməsi ilə operatora yazın.";
}

function isMedicationAdviceQuestion(text: string) {
  return /(какое лекар|что пить|какие таблетки|препарат|дозиров|which medicine|what medicine|what pills|dosage|dərman|hansı dərman|nə içim|ne icim|preparat|doza)/i.test(text);
}

function buildMedicationSafetyFallback(language: string) {
  if (language === "Russian") {
    return "Я не могу подбирать лекарства, дозировку или лечение. Для такой рекомендации нужно обратиться к врачу. Для записи используйте кнопку Qəbul под чатом.";
  }

  if (language === "English") {
    return "I cannot choose medicines, dosage, or treatment. A doctor should make that recommendation. For an appointment, use the Qəbul button below the chat.";
  }

  return "Dərman, doza və ya müalicə seçimi barədə məsləhət verə bilmirəm. Bu qərarı həkim verməlidir. Qəbul üçün çatın altındakı Qəbul düyməsindən istifadə edin.";
}

function isUnavailableServiceQuestion(text: string) {
  return /\b(mrt|mri|кт|kt|tomoqraf\w*|rentgen\w*|рентген\w*|stomatolog\w*|стоматолог\w*|diş həkimi)\b/i.test(text);
}

function buildUnavailableServiceFallback(language: string) {
  if (language === "Russian") {
    return "Эта услуга не подтверждена в текущей базе Dr. Dia. Чтобы уточнить возможность, напишите оператору через кнопки WhatsApp или Telegram под чатом.";
  }

  if (language === "English") {
    return "This service is not confirmed in the current Dr. Dia knowledge base. To clarify availability, contact the operator using the WhatsApp or Telegram buttons below the chat.";
  }

  return "Bu xidmət Dr. Dia-nın cari bazasında təsdiqlənmir. Mövcudluğu dəqiqləşdirmək üçün çatın altındakı WhatsApp və ya Telegram düyməsi ilə operatora yazın.";
}

function isPriceQuestion(text: string) {
  return /(qiymət|qiymeti|neçəyə|neceye|nə qədər|ne qeder|стоим|цена|сколько стоит|price|cost|how much)/i.test(text);
}

function buildPriceAnswer(text: string, language: string) {
  const matches = findDrDiaPriceMatches(text, 3);

  if (!matches.length) {
    return null;
  }

  if (language === "Russian") {
    const lines = matches.map((item) => `- ${item.name_az}: ${item.price}`);
    return [
      matches.length === 1 ? `Подтвержденная цена: ${matches[0].name_az} - ${matches[0].price}.` : "Найденные подтвержденные цены:",
      matches.length === 1 ? null : lines.join("\n"),
      "Для записи используйте кнопку Qəbul под чатом.",
    ].filter(Boolean).join("\n\n");
  }

  if (language === "English") {
    const lines = matches.map((item) => `- ${item.name_az}: ${item.price}`);
    return [
      matches.length === 1 ? `Confirmed price: ${matches[0].name_az} - ${matches[0].price}.` : "Confirmed matching prices:",
      matches.length === 1 ? null : lines.join("\n"),
      "For booking, use the Qəbul button below the chat.",
    ].filter(Boolean).join("\n\n");
  }

  const lines = matches.map((item) => `- ${item.name_az}: ${item.price}`);
  return [
    matches.length === 1 ? `Təsdiqlənmiş qiymət: ${matches[0].name_az} - ${matches[0].price}.` : "Uyğun təsdiqlənmiş qiymətlər:",
    matches.length === 1 ? null : lines.join("\n"),
    "Qəbul üçün çatın altındakı Qəbul düyməsindən istifadə edin.",
  ].filter(Boolean).join("\n\n");
}

function softenMissingInfoPhrases(content: string, language: string) {
  if (!/(нет|не указан|не указана|не представлены|не найден|yoxdur|göstərilməyib|mövcud kontekst|not available|not provided|not found)/i.test(content)) {
    return content;
  }

  const operatorHint =
    language === "Russian"
      ? "Для точного уточнения этой информации рекомендуем написать оператору через WhatsApp или Telegram под чатом."
      : language === "English"
        ? "For an exact clarification, please contact the operator using WhatsApp or Telegram below the chat."
        : "Bu məlumatı dəqiqləşdirmək üçün çatın altındakı WhatsApp və ya Telegram düyməsi ilə operatora yazmağınız tövsiyə olunur.";

  const cleaned = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/(нет|не указан|не указана|не представлены|не найден|yoxdur|göstərilməyib|mövcud kontekst|not available|not provided|not found)/i.test(line))
    .join("\n")
    .trim();

  return [cleaned, operatorHint].filter(Boolean).join("\n\n");
}

async function buildDrDiaClinicContext() {
  const [
    contactSettings,
    hoursSettings,
    assistantSettings,
    doctors,
  ] = await Promise.all([
    getSiteSettings("contact"),
    getSiteSettings("hours"),
    getSiteSettings("assistant"),
    getDoctors(true),
  ]);

  return buildDrDiaKnowledgeContext({
    contactSettings,
    hoursSettings,
    assistantSettings,
    cmsDoctors: doctors,
  });
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
      if (ENV.assistantProvider !== "hermes" || !ENV.hermesApiBaseUrl || !ENV.hermesApiKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Hermes aktiv deyil",
        });
      }

      const clinicContext = await buildDrDiaClinicContext();
      const contextHint = input.context?.label
        ? `İstifadəçi widget-da "${input.context.label}" istiqamətindən gəlib.`
        : "İstifadəçi ümumi Dr. Dia söhbətindən gəlib.";
      const lastUserMessage = [...input.messages].reverse().find((message) => message.role === "user");
      const userLanguage = detectUserLanguage(lastUserMessage?.content ?? "");

      if (lastUserMessage && isHomeVisitQuestion(lastUserMessage.content)) {
        return {
          content: buildHomeVisitFallback(userLanguage),
        };
      }

      if (lastUserMessage && isReceptionTimeQuestion(lastUserMessage.content)) {
        return {
          content: await buildReceptionTimeAnswer(userLanguage),
        };
      }

      if (lastUserMessage && isBranchQuestion(lastUserMessage.content)) {
        return {
          content: buildBranchAnswer(userLanguage),
        };
      }

      if (lastUserMessage && isPreparationQuestion(lastUserMessage.content)) {
        return {
          content: buildPreparationFallback(userLanguage),
        };
      }

      if (lastUserMessage && isMedicationAdviceQuestion(lastUserMessage.content)) {
        return {
          content: buildMedicationSafetyFallback(userLanguage),
        };
      }

      if (lastUserMessage && isUnavailableServiceQuestion(lastUserMessage.content)) {
        return {
          content: buildUnavailableServiceFallback(userLanguage),
        };
      }

      if (lastUserMessage && isPriceQuestion(lastUserMessage.content)) {
        const priceAnswer = buildPriceAnswer(lastUserMessage.content, userLanguage);

        if (priceAnswer) {
          return {
            content: priceAnswer,
          };
        }
      }

      const recentMessages = input.messages.slice(-18);
      const messages: HermesChatMessage[] = [
        {
          role: "system",
          content: [
            buildDrDiaSystemPrompt(clinicContext),
            "",
            `Cari söhbət konteksti: ${contextHint}`,
            `Son istifadəçi mesajının dili: ${userLanguage}. Bu cavabı yalnız ${userLanguage} dilində yaz.`,
          ].join("\n"),
        },
        ...recentMessages,
      ];

      const response = await callHermesChat({
        baseUrl: ENV.hermesApiBaseUrl,
        apiKey: ENV.hermesApiKey,
        model: ENV.hermesModel,
        messages,
      });

      return {
        content: compactContactInstructions(softenMissingInfoPhrases(response.content, userLanguage), userLanguage),
      };
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
