import type { Express, Request, Response } from "express";
import { ENV } from "./env";
import { createDrDiaReply, type DrDiaReplyMessage } from "./drDiaReplyService";
import { transcribeTelegramVoice } from "./mistralTranscription";
import {
  addTelegramChatMessage,
  getTelegramChatMessages,
  pruneTelegramChatMessages,
} from "../db";

type TelegramUpdate = {
  message?: {
    message_id?: number;
    chat?: { id?: number | string };
    text?: string;
    voice?: { file_id?: string };
    audio?: { file_id?: string; file_name?: string };
  };
  callback_query?: {
    id?: string;
    message?: {
      chat?: { id?: number | string };
    };
    data?: string;
  };
};

const TELEGRAM_INLINE_BUTTONS = [
  [
    { text: "Qəbul", callback_data: "Qəbul" },
    { text: "Qiymətlər", callback_data: "Qiymətlər" },
  ],
  [
    { text: "Ünvan", callback_data: "Ünvan" },
    { text: "Operator", callback_data: "Operator" },
  ],
];

const TEXT_ONLY_FALLBACK = "Zəhmət olmasa, sualınızı mətn kimi yazın.";
const VOICE_TRANSCRIPTION_FALLBACK = "Səsli mesajı mətnə çevirmək mümkün olmadı. Zəhmət olmasa, sualınızı mətn kimi yazın.";
const START_COMMAND_PATTERN = /^\/start(?:\s|$)/i;

function normalizeButtonText(text: string) {
  if (text === "Qəbul") return "Qəbul üçün necə müraciət edə bilərəm?";
  if (text === "Qiymətlər") return "Qiymətlər barədə məlumat ver";
  if (text === "Ünvan") return "Ünvan və iş saatları barədə məlumat ver";
  return text;
}

function getTelegramMessage(update: TelegramUpdate) {
  const chatId = update.message?.chat?.id ?? update.callback_query?.message?.chat?.id;
  const rawText = update.message?.text ?? update.callback_query?.data;
  const text = rawText?.trim();
  const voiceFileId = update.message?.voice?.file_id;
  const audioFileId = update.message?.audio?.file_id;

  if (chatId == null) {
    return null;
  }

  return {
    chatId: String(chatId),
    telegramChatId: chatId,
    text,
    voiceFileId: voiceFileId || audioFileId,
    voiceFileName: update.message?.audio?.file_name || (voiceFileId ? "telegram-voice.ogg" : "telegram-audio"),
    callbackQueryId: update.callback_query?.id,
    isTextOnlyUnsupported: !text && Boolean(update.message?.voice || update.message?.audio) && !voiceFileId && !audioFileId,
  };
}

function buildTelegramApiUrl(method: string) {
  return `https://api.telegram.org/bot${ENV.telegramBotToken}/${method}`;
}

async function callTelegramApi(method: string, body: Record<string, unknown>) {
  const response = await fetch(buildTelegramApiUrl(method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Telegram ${method} failed`);
  }

  return response.json() as Promise<{ ok?: boolean; result?: { message_id?: number } }>;
}

function stripTelegramCtaHints(text: string) {
  return text
    .replace(/(?:Для записи|Для уточнения|To clarify|For booking|Qəbul üçün|Operatorla dəqiqləşdirmək üçün)[^.]*?(?:кнопк[ауи]?|button|düym\w*)[^.]*\./gi, "")
    .replace(/(?:Qəbul|Operator|WhatsApp|Telegram)[^.]*?(?:кнопк[ауи]?|button|düym\w*)[^.]*\./gi, "");
}

function formatTelegramText(text: string) {
  return stripTelegramCtaHints(text)
    .split("\n")
    .map((line) => line
      .replace(/^#{1,6}\s*/, "")
      .replace(/^\s*[-*]\s+/, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function removeReplyKeyboard(chatId: string | number) {
  const payload = await callTelegramApi("sendMessage", {
    chat_id: chatId,
    text: "\u2060",
    reply_markup: {
      remove_keyboard: true,
    },
  });

  const messageId = payload.result?.message_id;
  if (!messageId) {
    return;
  }

  await callTelegramApi("deleteMessage", {
    chat_id: chatId,
    message_id: messageId,
  }).catch(() => undefined);
}

async function answerCallbackQuery(callbackQueryId: string | undefined) {
  if (!callbackQueryId) {
    return;
  }

  await callTelegramApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
  });
}

async function sendTelegramMessage(chatId: string | number, text: string) {
  await callTelegramApi("sendMessage", {
    chat_id: chatId,
    text: formatTelegramText(text) || TEXT_ONLY_FALLBACK,
    reply_markup: {
      inline_keyboard: TELEGRAM_INLINE_BUTTONS,
    },
  });
}

async function sendMiniAppStartMessage(chatId: string | number) {
  await callTelegramApi("sendMessage", {
    chat_id: chatId,
    text: "Dr. Dia Mini App açmaq üçün düyməyə toxunun.",
    reply_markup: {
      keyboard: [
        [
          {
            text: "Aç / Открыть приложение",
            web_app: {
              url: ENV.telegramMiniAppUrl,
            },
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  });
}

function buildOperatorReply() {
  if (ENV.telegramOperatorUrl) {
    return `Operatorla əlaqə üçün: ${ENV.telegramOperatorUrl}`;
  }

  return "Operatorla dəqiqləşdirmək üçün bu çatdakı Operator düyməsindən istifadə edin.";
}

export function registerTelegramWebhook(app: Express) {
  app.post("/api/telegram/webhook/:secret", async (req: Request, res: Response) => {
    if (!ENV.telegramBotToken || !ENV.telegramWebhookSecret || req.params.secret !== ENV.telegramWebhookSecret) {
      res.status(403).json({ ok: false });
      return;
    }

    const telegramMessage = getTelegramMessage(req.body as TelegramUpdate);
    if (!telegramMessage) {
      res.json({ ok: true });
      return;
    }

    try {
      await removeReplyKeyboard(telegramMessage.telegramChatId);
      await answerCallbackQuery(telegramMessage.callbackQueryId);

      let messageText = telegramMessage.text;
      if (!messageText && telegramMessage.voiceFileId) {
        messageText = await transcribeTelegramVoice(telegramMessage.voiceFileId, {
          fileName: telegramMessage.voiceFileName,
          language: undefined,
        }).catch((error) => {
          console.warn("[Telegram] Voice transcription failed:", error);
          return "";
        });
      }

      if (telegramMessage.isTextOnlyUnsupported || !messageText) {
        const fallback = telegramMessage.voiceFileId ? VOICE_TRANSCRIPTION_FALLBACK : TEXT_ONLY_FALLBACK;
        await sendTelegramMessage(telegramMessage.telegramChatId, fallback);
        res.json({ ok: true });
        return;
      }

      if (START_COMMAND_PATTERN.test(messageText)) {
        await sendMiniAppStartMessage(telegramMessage.telegramChatId);
        res.json({ ok: true });
        return;
      }

      const normalizedText = normalizeButtonText(messageText);
      const history = await getTelegramChatMessages(telegramMessage.chatId, 17);
      const messages: DrDiaReplyMessage[] = [
        ...history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: "user", content: normalizedText },
      ];

      const reply = messageText === "Operator"
        ? { content: buildOperatorReply() }
        : await createDrDiaReply({
          messages,
          channel: "telegram",
          context: {
            entryPoint: "telegram",
            label: messageText,
          },
        });

      await sendTelegramMessage(telegramMessage.telegramChatId, reply.content);
      await addTelegramChatMessage(telegramMessage.chatId, "user", normalizedText);
      await addTelegramChatMessage(telegramMessage.chatId, "assistant", reply.content);
      await pruneTelegramChatMessages(telegramMessage.chatId, 18);

      res.json({ ok: true });
    } catch (error) {
      console.error("[Telegram] Dr. Dia webhook failed:", error);
      res.status(500).json({ ok: false });
    }
  });
}
