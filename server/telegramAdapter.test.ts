import express from "express";
import { request } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HermesChatMessage } from "./_core/hermesAssistant";

const callHermesChatMock = vi.hoisted(() => vi.fn());
const getTelegramChatMessagesMock = vi.hoisted(() => vi.fn());
const addTelegramChatMessageMock = vi.hoisted(() => vi.fn());
const pruneTelegramChatMessagesMock = vi.hoisted(() => vi.fn());
const transcribeTelegramVoiceMock = vi.hoisted(() => vi.fn());
const telegramFetchMock = vi.hoisted(() => vi.fn());

vi.mock("./_core/env", () => ({
  ENV: {
    assistantProvider: "hermes",
    hermesApiBaseUrl: "http://127.0.0.1:8642/v1",
    hermesApiKey: "test-hermes-key",
    hermesModel: "dr-dia-hermes-test",
    botpressClientId: "",
    botpressApiUrl: "",
    botpressStylesheetUrl: "",
    telegramBotToken: "test-telegram-token",
    telegramWebhookSecret: "test-secret",
    telegramOperatorUrl: "https://t.me/dialab_operator",
    telegramMiniAppUrl: "https://dialab.center/telegram/dr-dia",
    mistralApiKey: "test-mistral-key",
    mistralAudioTranscriptionModel: "voxtral-mini-latest",
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
    getDiagnosticServices: empty,
    getDiagnosticServiceById: missing,
    getDiagnosticSubServices: empty,
    createDiagnosticService: ok,
    updateDiagnosticService: ok,
    deleteDiagnosticService: ok,
    createDiagnosticSubService: ok,
    updateDiagnosticSubService: ok,
    deleteDiagnosticSubService: ok,
    getLaboratoryAnalysisTypes: empty,
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
    getTelegramChatMessages: getTelegramChatMessagesMock,
    addTelegramChatMessage: addTelegramChatMessageMock,
    pruneTelegramChatMessages: pruneTelegramChatMessagesMock,
  };
});

vi.mock("./_core/mistralTranscription", () => ({
  transcribeTelegramVoice: transcribeTelegramVoiceMock,
}));

async function postTelegramUpdate(secret: string, body: unknown) {
  const { registerTelegramWebhook } = await import("./_core/telegramAdapter");
  const app = express();
  app.use(express.json());
  registerTelegramWebhook(app);

  const server = app.listen(0);
  const address = server.address();

  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Test server did not start");
  }

  try {
    return await new Promise<{ status: number; payload: unknown }>((resolve, reject) => {
      const payload = JSON.stringify(body);
      const req = request({
        hostname: "127.0.0.1",
        port: address.port,
        path: `/api/telegram/webhook/${secret}`,
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(payload),
        },
      }, (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: response.statusCode ?? 0,
            payload: text ? JSON.parse(text) : null,
          });
        });
      });
      req.on("error", reject);
      req.write(payload);
      req.end();
    });
  } finally {
    server.close();
  }
}

function lastTelegramSendBody() {
  const body = telegramFetchMock.mock.calls.at(-1)?.[1]?.body;
  return JSON.parse(String(body)) as {
    chat_id: number;
    text: string;
    reply_markup?: TelegramReplyMarkup;
  };
}

type TelegramReplyMarkup = {
  keyboard?: Array<Array<string | { text: string; web_app?: { url: string } }>>;
  inline_keyboard?: Array<Array<{ text: string; callback_data?: string }>>;
  remove_keyboard?: boolean;
};

function telegramSendBodies() {
  return telegramFetchMock.mock.calls
    .filter((call) => String(call[0]).includes("/sendMessage"))
    .map((call) => JSON.parse(String(call[1]?.body)) as {
      chat_id: number;
      text: string;
      reply_markup?: TelegramReplyMarkup;
    });
}

describe("Telegram Dr. Dia webhook", () => {
  beforeEach(() => {
    callHermesChatMock.mockReset();
    callHermesChatMock.mockResolvedValue({ content: "Hermes cavabı" });
    getTelegramChatMessagesMock.mockReset();
    getTelegramChatMessagesMock.mockResolvedValue([]);
    addTelegramChatMessageMock.mockReset();
    pruneTelegramChatMessagesMock.mockReset();
    transcribeTelegramVoiceMock.mockReset();
    transcribeTelegramVoiceMock.mockResolvedValue("Salam, mənə xidmətlər barədə məlumat ver");
    telegramFetchMock.mockReset();
    telegramFetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", telegramFetchMock);
  });

  it("rejects a wrong webhook secret", async () => {
    const result = await postTelegramUpdate("wrong-secret", {
      message: { chat: { id: 101 }, text: "Salam" },
    });

    expect(result.status).toBe(403);
    expect(telegramFetchMock).not.toHaveBeenCalled();
  });

  it("answers /start with one Mini App open button", async () => {
    const result = await postTelegramUpdate("test-secret", {
      message: { chat: { id: 101 }, text: "/start" },
    });

    expect(result.status).toBe(200);
    expect(callHermesChatMock).not.toHaveBeenCalled();

    const sent = lastTelegramSendBody();
    expect(sent.text).toContain("Dr. Dia Mini App");
    expect(sent.reply_markup?.inline_keyboard).toBeUndefined();
    expect(sent.reply_markup?.keyboard).toEqual([
      [
        {
          text: "Aç / Открыть приложение",
          web_app: {
            url: "https://dialab.center/telegram/dr-dia",
          },
        },
      ],
    ]);
  });

  it("routes price questions to an operator without Hermes and includes Telegram buttons", async () => {
    const result = await postTelegramUpdate("test-secret", {
      message: { chat: { id: 101 }, text: "Qanın ümumi analizi neçəyədir?" },
    });

    expect(result.status).toBe(200);
    expect(callHermesChatMock).not.toHaveBeenCalled();

    const sent = lastTelegramSendBody();
    expect(sent.chat_id).toBe(101);
    expect(sent.text).toContain("Qiymət məlumatını canlı operator dəqiqləşdirir");
    expect(sent.text).toContain("WhatsApp və ya Telegram");
    expect(sent.text).not.toContain("Qanın ümumi analizi");
    expect(sent.text).not.toContain("16.00 AZN");
    expect(sent.text).not.toContain("bu çatdakı");
    expect(sent.reply_markup?.keyboard).toBeUndefined();
    expect(sent.reply_markup?.inline_keyboard).toEqual([
      [
        { text: "Qəbul", callback_data: "Qəbul" },
        { text: "Qiymətlər", callback_data: "Qiymətlər" },
      ],
      [
        { text: "Ünvan", callback_data: "Ünvan" },
        { text: "Operator", callback_data: "Operator" },
      ],
    ]);
    expect(telegramSendBodies()[0]?.reply_markup?.remove_keyboard).toBe(true);
  });

  it("refuses medication advice deterministically", async () => {
    await postTelegramUpdate("test-secret", {
      message: { chat: { id: 101 }, text: "Baş ağrısı üçün hansı dərmanı içim?" },
    });

    const sent = lastTelegramSendBody();
    expect(sent.text).toContain("Dərman, doza və ya müalicə");
    expect(sent.text).not.toContain("Qəbul üçün");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("routes unavailable services to the operator", async () => {
    await postTelegramUpdate("test-secret", {
      message: { chat: { id: 101 }, text: "MRT edirsiniz?" },
    });

    const sent = lastTelegramSendBody();
    expect(sent.text).toContain("cari bazasında təsdiqlənmir");
    expect(sent.text).not.toContain("Operator düyməsindən");
    expect(callHermesChatMock).not.toHaveBeenCalled();
  });

  it("cleans raw markdown and repeated Telegram CTA hints from Hermes replies", async () => {
    callHermesChatMock.mockResolvedValue({
      content: [
        "В клинике Dialab доступны следующие основные услуги:",
        "### **1. Лабораторные анализы**",
        "- **Общий анализ крови** (16 AZN)",
        "- **Гормональные исследования**",
        "",
        "Для записи используйте кнопку Qəbul в этом Telegram-чате.",
        "Для уточнения у оператора используйте кнопку Operator в этом Telegram-чате.",
      ].join("\n"),
    });

    await postTelegramUpdate("test-secret", {
      message: { chat: { id: 303 }, text: "привет, какие у вас есть сервисы" },
    });

    const sent = lastTelegramSendBody();
    expect(sent.text).toContain("В клинике Dialab доступны следующие основные услуги:");
    expect(sent.text).toContain("1. Лабораторные анализы");
    expect(sent.text).toContain("Общий анализ крови (16 AZN)");
    expect(sent.text).not.toContain("###");
    expect(sent.text).not.toContain("**");
    expect(sent.text).not.toContain("кнопку Qəbul");
    expect(sent.text).not.toContain("кнопку Operator");
  });

  it("transcribes voice messages and sends the text to Dr. Dia", async () => {
    const result = await postTelegramUpdate("test-secret", {
      message: { chat: { id: 404 }, voice: { file_id: "voice-file" } },
    });

    expect(result.status).toBe(200);
    expect(transcribeTelegramVoiceMock).toHaveBeenCalledWith("voice-file", {
      fileName: "telegram-voice.ogg",
      language: undefined,
    });
    expect(callHermesChatMock).toHaveBeenCalled();
    const sentMessages = callHermesChatMock.mock.calls[0]?.[0].messages as HermesChatMessage[];
    expect(sentMessages.at(-1)).toEqual({
      role: "user",
      content: "Salam, mənə xidmətlər barədə məlumat ver",
    });

    const sent = lastTelegramSendBody();
    expect(sent.text).toBe("Hermes cavabı");
    expect(sent.reply_markup?.inline_keyboard).toBeDefined();
    expect(addTelegramChatMessageMock).toHaveBeenCalledWith("404", "user", "Salam, mənə xidmətlər barədə məlumat ver");
  });

  it("answers voice messages with a fallback when transcription fails", async () => {
    transcribeTelegramVoiceMock.mockResolvedValue("");

    const result = await postTelegramUpdate("test-secret", {
      message: { chat: { id: 404 }, voice: { file_id: "voice-file" } },
    });

    expect(result.status).toBe(200);
    expect(callHermesChatMock).not.toHaveBeenCalled();

    const sent = lastTelegramSendBody();
    expect(sent.text).toBe("Səsli mesajı mətnə çevirmək mümkün olmadı. Zəhmət olmasa, sualınızı mətn kimi yazın.");
    expect(sent.reply_markup?.inline_keyboard).toBeDefined();
  });

  it("handles inline button callbacks and acknowledges callback queries", async () => {
    await postTelegramUpdate("test-secret", {
      callback_query: {
        id: "callback-1",
        message: { chat: { id: 505 } },
        data: "Qiymətlər",
      },
    });

    const callbackCall = telegramFetchMock.mock.calls.find((call) => String(call[0]).includes("/answerCallbackQuery"));
    expect(callbackCall).toBeDefined();
    expect(lastTelegramSendBody().reply_markup?.inline_keyboard).toBeDefined();
  });

  it("uses stored Telegram history and sends only recent messages to Hermes", async () => {
    getTelegramChatMessagesMock.mockResolvedValue(
      Array.from({ length: 24 }, (_, index) => ({
        role: index % 2 === 0 ? "user" : "assistant",
        content: `history-${index + 1}`,
      }))
    );

    await postTelegramUpdate("test-secret", {
      message: { chat: { id: 202 }, text: "Salam, mənə xidmətlər barədə məlumat ver" },
    });

    const sentMessages = callHermesChatMock.mock.calls[0]?.[0].messages as HermesChatMessage[];
    expect(sentMessages).toHaveLength(19);
    expect(sentMessages[0]?.role).toBe("system");
    expect(sentMessages.slice(1).map((message) => message.content)).toEqual([
      ...Array.from({ length: 17 }, (_, index) => `history-${index + 8}`),
      "Salam, mənə xidmətlər barədə məlumat ver",
    ]);
    expect(addTelegramChatMessageMock).toHaveBeenCalledWith("202", "user", "Salam, mənə xidmətlər barədə məlumat ver");
    expect(addTelegramChatMessageMock).toHaveBeenCalledWith("202", "assistant", "Hermes cavabı");
    expect(pruneTelegramChatMessagesMock).toHaveBeenCalledWith("202", 18);
  });
});
