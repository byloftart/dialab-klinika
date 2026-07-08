import type { Express, Request, Response } from "express";
import { ENV } from "./env";
import { createDrDiaReply, type DrDiaReplyMessage } from "./drDiaReplyService";
import {
  addWhatsAppChatMessage,
  getWhatsAppChatMessages,
  pruneWhatsAppChatMessages,
  upsertWhatsAppConversation,
} from "../db";

type WhatsAppWebhookBody = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: {
        contacts?: Array<{
          wa_id?: string;
          profile?: { name?: string };
        }>;
        messages?: Array<{
          from?: string;
          id?: string;
          type?: string;
          text?: { body?: string };
        }>;
        statuses?: unknown[];
      };
    }>;
  }>;
};

type IncomingWhatsAppMessage = {
  waId: string;
  displayName?: string;
  text?: string;
  type?: string;
};

const TEXT_ONLY_FALLBACK = "Zəhmət olmasa, sualınızı mətn kimi yazın.";

function isOperatorRequest(text: string) {
  return /(operator|admin|administrator|менеджер|админ|администратор|оператор|canlı|canli|insan|şəxs|sexs|adam|əlaqə|elaqe)/i.test(text);
}

function buildOperatorReply(languageText: string) {
  if (/[а-яё]/i.test(languageText)) {
    return "Ваше обращение передано администратору. Мы ответим вам в этом WhatsApp-чате.";
  }

  if (/\b(hello|hi|operator|admin|administrator|manager|human|person)\b/i.test(languageText)) {
    return "Your request has been sent to the administrator. We will reply in this WhatsApp chat.";
  }

  return "Müraciətiniz administratora göndərildi. Sizə bu WhatsApp çatında cavab verəcəyik.";
}

function detectWebAppLink(text: string) {
  const baseUrl = ENV.whatsappWebAppBaseUrl.replace(/\/+$/, "");

  if (/(qəbul|qebul|запис|при[её]м|appointment|book|randevu)/i.test(text)) {
    return `${baseUrl}/booking?source=whatsapp`;
  }

  if (/(подготов|натощак|hazırlıq|hazirliq|acqarına|acqarina|prepare|fasting)/i.test(text)) {
    return `${baseUrl}/preparation?source=whatsapp`;
  }

  if (/(консультац|consultation|məsləhət|meslehet)/i.test(text)) {
    return `${baseUrl}/consultation?source=whatsapp`;
  }

  return null;
}

function withRelevantWebAppLink(reply: string, userText: string) {
  const link = detectWebAppLink(userText);
  if (!link || reply.includes(link)) {
    return reply;
  }

  return `${reply}\n\nRahat forma üçün: ${link}`;
}

function extractIncomingMessages(body: WhatsAppWebhookBody): IncomingWhatsAppMessage[] {
  const messages: IncomingWhatsAppMessage[] = [];

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages?.length) continue;

      for (const message of value.messages) {
        const waId = message.from;
        if (!waId) continue;

        const contact = value.contacts?.find((item) => item.wa_id === waId) ?? value.contacts?.[0];
        messages.push({
          waId,
          displayName: contact?.profile?.name,
          text: message.text?.body?.trim(),
          type: message.type,
        });
      }
    }
  }

  return messages;
}

function buildWhatsAppApiUrl() {
  return `https://graph.facebook.com/${ENV.whatsappGraphApiVersion}/${ENV.whatsappPhoneNumberId}/messages`;
}

export async function sendWhatsAppTextMessage(to: string, text: string) {
  if (!ENV.whatsappAccessToken || !ENV.whatsappPhoneNumberId) {
    throw new Error("WhatsApp Cloud API is not configured");
  }

  const response = await fetch(buildWhatsAppApiUrl(), {
    method: "POST",
    headers: {
      authorization: `Bearer ${ENV.whatsappAccessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: text,
        preview_url: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp send failed with ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

async function handleIncomingMessage(message: IncomingWhatsAppMessage) {
  const userText = message.text?.trim();
  const fallbackMode = !userText || message.type !== "text";
  const replyText = fallbackMode
    ? TEXT_ONLY_FALLBACK
    : isOperatorRequest(userText)
      ? buildOperatorReply(userText)
      : await buildDrDiaReply(message.waId, userText);

  await sendWhatsAppTextMessage(message.waId, replyText);

  if (userText) {
    await addWhatsAppChatMessage(message.waId, "user", userText);
  }

  await addWhatsAppChatMessage(message.waId, "assistant", replyText);
  await pruneWhatsAppChatMessages(message.waId, 18);
  await upsertWhatsAppConversation({
    waId: message.waId,
    displayName: message.displayName,
    phoneNumber: message.waId,
    lastUserMessage: userText || `[${message.type || "unsupported"}]`,
    lastAssistantMessage: replyText,
    status: "new",
    isRead: false,
    needsOperator: Boolean(userText && isOperatorRequest(userText)),
  });
}

async function buildDrDiaReply(waId: string, text: string) {
  const history = await getWhatsAppChatMessages(waId, 17);
  const assistantHistory: DrDiaReplyMessage[] = history.flatMap((message) => {
    if (message.role !== "user" && message.role !== "assistant") {
      return [];
    }

    return [{
      role: message.role,
      content: message.content,
    }];
  });
  const messages: DrDiaReplyMessage[] = [
    ...assistantHistory,
    { role: "user", content: text },
  ];

  const reply = await createDrDiaReply({
    messages,
    channel: "whatsapp",
    context: {
      entryPoint: "whatsapp",
      label: "WhatsApp",
    },
  });

  return withRelevantWebAppLink(reply.content, text);
}

export function registerWhatsAppWebhook(app: Express) {
  app.get("/api/whatsapp/webhook", (req: Request, res: Response) => {
    const mode = String(req.query["hub.mode"] ?? "");
    const token = String(req.query["hub.verify_token"] ?? "");
    const challenge = String(req.query["hub.challenge"] ?? "");

    if (mode === "subscribe" && token && token === ENV.whatsappWebhookVerifyToken) {
      res.status(200).send(challenge);
      return;
    }

    res.sendStatus(403);
  });

  app.post("/api/whatsapp/webhook", async (req: Request, res: Response) => {
    if (!ENV.whatsappAccessToken || !ENV.whatsappPhoneNumberId) {
      res.status(403).json({ ok: false });
      return;
    }

    const incomingMessages = extractIncomingMessages(req.body as WhatsAppWebhookBody);
    if (!incomingMessages.length) {
      res.json({ ok: true });
      return;
    }

    try {
      for (const message of incomingMessages) {
        await handleIncomingMessage(message);
      }

      res.json({ ok: true });
    } catch (error) {
      console.error("[WhatsApp] Dr. Dia webhook failed:", error);
      res.status(500).json({ ok: false });
    }
  });
}
