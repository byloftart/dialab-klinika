import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import type { HermesChatMessage } from "./_core/hermesAssistant";

const callHermesChatMock = vi.hoisted(() => vi.fn());

vi.mock("./_core/env", () => ({
  ENV: {
    assistantProvider: "hermes",
    hermesApiBaseUrl: "http://127.0.0.1:8642/v1",
    hermesApiKey: "test-hermes-key",
    hermesModel: "dr-dia-hermes-test",
    botpressClientId: "",
    botpressApiUrl: "",
    botpressStylesheetUrl: "",
  },
}));

vi.mock("./_core/hermesAssistant", async () => {
  const actual = await vi.importActual<typeof import("./_core/hermesAssistant")>("./_core/hermesAssistant");

  return {
    ...actual,
    callHermesChat: callHermesChatMock,
  };
});

vi.mock("./db", () => {
  const empty = vi.fn(async () => []);
  const missing = vi.fn(async () => null);
  const ok = vi.fn(async () => ({ success: true }));

  return {
    getDiagnosticServices: vi.fn(async () => [
      { titleAz: "Ultrasəs müayinəsi", descriptionAz: "Diaqnostika xidməti" },
    ]),
    getDiagnosticServiceById: missing,
    getDiagnosticSubServices: empty,
    createDiagnosticService: ok,
    updateDiagnosticService: ok,
    deleteDiagnosticService: ok,
    createDiagnosticSubService: ok,
    updateDiagnosticSubService: ok,
    deleteDiagnosticSubService: ok,
    getLaboratoryAnalysisTypes: vi.fn(async () => [
      { titleAz: "Ümumi qan analizi", descriptionAz: "Laborator analiz" },
    ]),
    getLaboratoryAnalysisTypeById: missing,
    getLaboratorySubTests: empty,
    createLaboratoryAnalysisType: ok,
    updateLaboratoryAnalysisType: ok,
    deleteLaboratoryAnalysisType: ok,
    createLaboratorySubTest: ok,
    updateLaboratorySubTest: ok,
    deleteLaboratorySubTest: ok,
    getDoctors: vi.fn(async () => [
      { nameAz: "Dr. Test", specialtyAz: "Kardioloq", experienceYears: 7 },
    ]),
    getDoctorById: missing,
    createDoctor: ok,
    updateDoctor: ok,
    deleteDoctor: ok,
    getGalleryImages: empty,
    createGalleryImage: ok,
    updateGalleryImage: ok,
    deleteGalleryImage: ok,
    getAppointments: empty,
    getAppointmentById: missing,
    createAppointment: ok,
    updateAppointment: ok,
    deleteAppointment: ok,
    countNewAppointments: vi.fn(async () => 0),
    getFeedbackMessages: empty,
    getFeedbackMessageById: missing,
    createFeedbackMessage: ok,
    updateFeedbackMessage: ok,
    deleteFeedbackMessage: ok,
    countUnreadMessages: vi.fn(async () => 0),
    getSiteSettings: vi.fn(async (group?: string) => {
      if (group === "hours") {
        return [
          { key: "hours.weekdays", value: "09:00 - 18:00" },
          { key: "hours.saturday", value: "09:00 - 14:00" },
        ];
      }

      if (group === "contact") {
        return [
          { key: "contact.phone1", value: "+994 00 000 00 00" },
          { key: "contact.address", value: "Bakı" },
        ];
      }

      if (group === "assistant") {
        return [
          { key: "assistant.whatsappUrl", value: "https://wa.me/test" },
          { key: "assistant.telegramUrl", value: "https://t.me/test" },
        ];
      }

      return [];
    }),
    getSiteSettingByKey: missing,
    upsertSiteSetting: ok,
    getStaticPages: empty,
    getStaticPageById: missing,
    getStaticPageBySlug: missing,
    createStaticPage: ok,
    updateStaticPage: ok,
    deleteStaticPage: ok,
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("assistant.chat", () => {
  beforeEach(() => {
    callHermesChatMock.mockReset();
    callHermesChatMock.mockResolvedValue({ content: "Hermes cavabı" });
  });

  it("trims long chat history before sending it to Hermes", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());
    const messages = Array.from({ length: 30 }, (_, index) => ({
      role: (index % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `message-${index + 1}`,
    }));

    await caller.assistant.chat({ messages });

    const sentMessages = callHermesChatMock.mock.calls[0]?.[0].messages as HermesChatMessage[];

    expect(sentMessages).toHaveLength(19);
    expect(sentMessages[0]?.role).toBe("system");
    expect(sentMessages[0]?.content).toContain("Laboratoriya qiymətləri:");
    expect(sentMessages[0]?.content).toContain("Qanın ümumi analizi");
    expect(sentMessages[0]?.content).toContain("16.00 AZN");
    expect(sentMessages[0]?.content).toContain("Birbaşa həkim telefon nömrələrini cavabda yazma");
    expect(sentMessages[0]?.content).not.toContain("+994 50 735 26 92");
    expect(sentMessages.slice(1).map((message) => message.content)).toEqual(
      messages.slice(-18).map((message) => message.content)
    );
  });

  it("returns the home visit fallback without calling Hermes", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "Врач может прийти домой на осмотр?" }],
    });

    expect(result.content).toContain("домашнего осмотра не подтверждена");
    expect(result.content).toContain("WhatsApp или Telegram");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("answers branch questions deterministically without calling Hermes", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "У вас есть другие филиалы?" }],
    });

    expect(result.content).toContain("Да, филиал имеется");
    expect(result.content).toContain("WhatsApp или Telegram");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("answers reception time questions from clinic hours without calling Hermes", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "Qəbul saat neçədə başlayır?" }],
    });

    expect(result.content).toContain("həftəiçi 09:00 - 18:00");
    expect(result.content).toContain("Şənbə: 09:00 - 14:00");
    expect(result.content).toContain("Qəbul düyməsindən istifadə edin");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("routes preparation questions to the operator without calling Hermes", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "Analizə necə hazırlaşmalıyam?" }],
    });

    expect(result.content).toContain("ayrıca təsdiqlənmiş hazırlıq sənədi yoxdur");
    expect(result.content).toContain("WhatsApp və ya Telegram");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("answers known price questions deterministically without calling Hermes", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "Histerosalpinqoqrafiya qiyməti nə qədərdir?" }],
    });

    expect(result.content).toContain("Histerosalpinqoqrafiya");
    expect(result.content).toContain("50.00 AZN");
    expect(result.content).not.toContain("Exohisterosalpinqoqrafiya");
    expect(result.content).toContain("Qəbul düyməsindən istifadə edin");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("prefers the exact longer service name for similar price items", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "Exohisterosalpinqoqrafiya qiyməti nə qədərdir?" }],
    });

    expect(result.content).toContain("Exohisterosalpinqoqrafiya");
    expect(result.content).toContain("40.00 AZN");
    expect(result.content).not.toContain("Histerosalpinqoqrafiya - 50.00 AZN");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("answers exact laboratory price questions without broad extra matches", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "Qanın ümumi analizi neçəyədir?" }],
    });

    expect(result.content).toContain("Qanın ümumi analizi");
    expect(result.content).toContain("16.00 AZN");
    expect(result.content).not.toContain("Ümumi zülal");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("answers common diagnostic price aliases deterministically", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "EKQ qiyməti nə qədərdir?" }],
    });

    expect(result.content).toContain("Ürəyin elektrokardioqramması");
    expect(result.content).toContain("20.00 AZN");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("routes unavailable services to the operator without calling Hermes", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "MRT edirsiniz?" }],
    });

    expect(result.content).toContain("cari bazasında təsdiqlənmir");
    expect(result.content).toContain("WhatsApp və ya Telegram");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("routes unavailable specialty services to the operator without calling Hermes", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "Stomatologiya xidməti var?" }],
    });

    expect(result.content).toContain("cari bazasında təsdiqlənmir");
    expect(result.content).toContain("WhatsApp və ya Telegram");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });


  it("refuses medication advice without general treatment suggestions", async () => {
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.assistant.chat({
      messages: [{ role: "user", content: "Baş ağrısı üçün hansı dərmanı içim?" }],
    });

    expect(result.content).toContain("Dərman, doza və ya müalicə");
    expect(result.content).toContain("həkim verməlidir");
    expect(result.content).not.toContain("Bol su");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });
});
