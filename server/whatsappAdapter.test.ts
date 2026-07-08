import express from "express";
import { request } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HermesChatMessage } from "./_core/hermesAssistant";

const callHermesChatMock = vi.hoisted(() => vi.fn());
const getWhatsAppChatMessagesMock = vi.hoisted(() => vi.fn());
const addWhatsAppChatMessageMock = vi.hoisted(() => vi.fn());
const pruneWhatsAppChatMessagesMock = vi.hoisted(() => vi.fn());
const upsertWhatsAppConversationMock = vi.hoisted(() => vi.fn());
const whatsappFetchMock = vi.hoisted(() => vi.fn());

vi.mock("./_core/env", () => ({
  ENV: {
    assistantProvider: "hermes",
    hermesApiBaseUrl: "http://127.0.0.1:8642/v1",
    hermesApiKey: "test-hermes-key",
    hermesModel: "dr-dia-hermes-test",
    botpressClientId: "",
    botpressApiUrl: "",
    botpressStylesheetUrl: "",
    whatsappAccessToken: "test-whatsapp-token",
    whatsappPhoneNumberId: "test-phone-number-id",
    whatsappWebhookVerifyToken: "test-verify-token",
    whatsappWebAppBaseUrl: "https://dialab.center/assistant",
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
    getWhatsAppChatMessages: getWhatsAppChatMessagesMock,
    addWhatsAppChatMessage: addWhatsAppChatMessageMock,
    pruneWhatsAppChatMessages: pruneWhatsAppChatMessagesMock,
    upsertWhatsAppConversation: upsertWhatsAppConversationMock,
  };
});

async function startWhatsAppApp() {
  const { registerWhatsAppWebhook } = await import("./_core/whatsappAdapter");
  const app = express();
  app.use(express.json());
  registerWhatsAppWebhook(app);

  const server = app.listen(0);
  const address = server.address();

  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Test server did not start");
  }

  return { server, port: address.port };
}

async function getWebhook(params: URLSearchParams) {
  const { server, port } = await startWhatsAppApp();

  try {
    return await new Promise<{ status: number; text: string }>((resolve, reject) => {
      const req = request({
        hostname: "127.0.0.1",
        port,
        path: `/api/whatsapp/webhook?${params.toString()}`,
        method: "GET",
      }, (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 0,
            text: Buffer.concat(chunks).toString("utf8"),
          });
        });
      });
      req.on("error", reject);
      req.end();
    });
  } finally {
    server.close();
  }
}

async function postWebhook(body: unknown) {
  const { server, port } = await startWhatsAppApp();

  try {
    return await new Promise<{ status: number; payload: unknown }>((resolve, reject) => {
      const payload = JSON.stringify(body);
      const req = request({
        hostname: "127.0.0.1",
        port,
        path: "/api/whatsapp/webhook",
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

function incomingTextBody(text = "Salam, xidmətlər barədə məlumat ver") {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        changes: [
          {
            value: {
              contacts: [
                {
                  wa_id: "994501112233",
                  profile: { name: "Test Patient" },
                },
              ],
              messages: [
                {
                  from: "994501112233",
                  id: "wamid.test-message-id",
                  timestamp: "1778640000",
                  type: "text",
                  text: { body: text },
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  };
}

function lastWhatsAppSendBody() {
  const body = whatsappFetchMock.mock.calls.at(-1)?.[1]?.body;
  return JSON.parse(String(body)) as {
    messaging_product: "whatsapp";
    to: string;
    type: "text";
    text: { body: string; preview_url?: boolean };
  };
}

describe("WhatsApp Dr. Dia webhook", () => {
  beforeEach(() => {
    callHermesChatMock.mockReset();
    callHermesChatMock.mockResolvedValue({ content: "Hermes cavabı" });
    getWhatsAppChatMessagesMock.mockReset();
    getWhatsAppChatMessagesMock.mockResolvedValue([]);
    addWhatsAppChatMessageMock.mockReset();
    pruneWhatsAppChatMessagesMock.mockReset();
    upsertWhatsAppConversationMock.mockReset();
    whatsappFetchMock.mockReset();
    whatsappFetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: "wamid.outbound" }] }),
    });
    vi.stubGlobal("fetch", whatsappFetchMock);
  });

  it("verifies the Meta webhook challenge with the configured token", async () => {
    const result = await getWebhook(new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.verify_token": "test-verify-token",
      "hub.challenge": "meta-challenge-123",
    }));

    expect(result.status).toBe(200);
    expect(result.text).toBe("meta-challenge-123");
  });

  it("rejects webhook verification with a wrong token", async () => {
    const result = await getWebhook(new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.verify_token": "wrong-token",
      "hub.challenge": "meta-challenge-123",
    }));

    expect(result.status).toBe(403);
  });

  it("answers incoming text through Dr. Dia and stores the WhatsApp conversation", async () => {
    getWhatsAppChatMessagesMock.mockResolvedValue([
      { role: "user", content: "history-user" },
      { role: "assistant", content: "history-assistant" },
    ]);

    const result = await postWebhook(incomingTextBody("Salam, xidmətlər barədə ümumi məlumat ver"));

    expect(result.status).toBe(200);
    expect(result.payload).toEqual({ ok: true });

    const sentMessages = callHermesChatMock.mock.calls[0]?.[0].messages as HermesChatMessage[];
    expect(sentMessages.slice(1).map((message) => message.content)).toEqual([
      "history-user",
      "history-assistant",
      "Salam, xidmətlər barədə ümumi məlumat ver",
    ]);

    expect(lastWhatsAppSendBody()).toMatchObject({
      messaging_product: "whatsapp",
      to: "994501112233",
      type: "text",
      text: { body: "Hermes cavabı", preview_url: true },
    });
    expect(addWhatsAppChatMessageMock).toHaveBeenCalledWith("994501112233", "user", "Salam, xidmətlər barədə ümumi məlumat ver");
    expect(addWhatsAppChatMessageMock).toHaveBeenCalledWith("994501112233", "assistant", "Hermes cavabı");
    expect(pruneWhatsAppChatMessagesMock).toHaveBeenCalledWith("994501112233", 18);
    expect(upsertWhatsAppConversationMock).toHaveBeenCalledWith(expect.objectContaining({
      waId: "994501112233",
      displayName: "Test Patient",
      phoneNumber: "994501112233",
      lastUserMessage: "Salam, xidmətlər barədə ümumi məlumat ver",
      lastAssistantMessage: "Hermes cavabı",
      status: "new",
      isRead: false,
    }));
  });

  it("creates an admin inbox item when the patient asks for an operator", async () => {
    const result = await postWebhook(incomingTextBody("Operatorla danışmaq istəyirəm"));

    expect(result.status).toBe(200);
    expect(callHermesChatMock).not.toHaveBeenCalled();
    expect(lastWhatsAppSendBody().text.body).toContain("administrator");
    expect(upsertWhatsAppConversationMock).toHaveBeenCalledWith(expect.objectContaining({
      waId: "994501112233",
      status: "new",
      isRead: false,
      needsOperator: true,
    }));
  });

  it("answers unsupported message types with a text-only fallback", async () => {
    const result = await postWebhook({
      object: "whatsapp_business_account",
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ wa_id: "994501112233", profile: { name: "Test Patient" } }],
                messages: [
                  {
                    from: "994501112233",
                    id: "wamid.voice",
                    type: "audio",
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(result.status).toBe(200);
    expect(callHermesChatMock).not.toHaveBeenCalled();
    expect(lastWhatsAppSendBody().text.body).toBe("Zəhmət olmasa, sualınızı mətn kimi yazın.");
  });
});
