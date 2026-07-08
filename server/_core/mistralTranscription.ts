import { ENV } from "./env";

type TelegramFileResponse = {
  ok?: boolean;
  result?: {
    file_path?: string;
  };
  description?: string;
};

type MistralTranscriptionResponse = {
  text?: string;
};

export type MistralAudioTranscriptionOptions = {
  contentType: string;
  fileName: string;
  language?: string;
};

export type TelegramVoiceTranscriptionOptions = {
  fileName?: string;
  language?: string;
};

const CYRILLIC_TO_AZERBAIJANI_LATIN: Record<string, string> = {
  А: "A",
  а: "a",
  Ә: "Ə",
  ә: "ə",
  Б: "B",
  б: "b",
  В: "V",
  в: "v",
  Г: "G",
  г: "g",
  Ғ: "Ğ",
  ғ: "ğ",
  Д: "D",
  д: "d",
  Е: "E",
  е: "e",
  Ё: "Yo",
  ё: "yo",
  Ж: "J",
  ж: "j",
  З: "Z",
  з: "z",
  И: "İ",
  и: "i",
  Ы: "I",
  ы: "ı",
  Й: "Y",
  й: "y",
  К: "K",
  к: "k",
  Қ: "Q",
  қ: "q",
  Л: "L",
  л: "l",
  М: "M",
  м: "m",
  Н: "N",
  н: "n",
  О: "O",
  о: "o",
  Ө: "Ö",
  ө: "ö",
  П: "P",
  п: "p",
  Р: "R",
  р: "r",
  С: "S",
  с: "s",
  Т: "T",
  т: "t",
  У: "U",
  у: "u",
  Ү: "Ü",
  ү: "ü",
  Ф: "F",
  ф: "f",
  Х: "X",
  х: "x",
  Һ: "H",
  һ: "h",
  Ц: "Ts",
  ц: "ts",
  Ч: "Ç",
  ч: "ç",
  Ҹ: "C",
  ҹ: "c",
  Ш: "Ş",
  ш: "ş",
  Щ: "Ş",
  щ: "ş",
  Ъ: "",
  ъ: "",
  Ь: "",
  ь: "",
  Э: "E",
  э: "e",
  Ю: "Yu",
  ю: "yu",
  Я: "Ya",
  я: "ya",
};

export function normalizeAzerbaijaniLatinTranscription(text: string) {
  if (!/[А-Яа-яЁёӘәҒғҚқӨөҮүҺһҸҹ]/.test(text)) {
    return text;
  }

  return text
    .split("")
    .map((char) => CYRILLIC_TO_AZERBAIJANI_LATIN[char] ?? char)
    .join("")
    .replace(/\bSizde\b/g, "Sizdə")
    .replace(/\bsizde\b/g, "sizdə")
    .replace(/\banalizler/g, "analizlər")
    .replace(/\bkliniki\b/g, "klinik")
    .replace(/\btaxıdır\b/g, "daxildir")
    .replace(/\btaxidir\b/g, "daxildir");
}

function buildTelegramApiUrl(method: string) {
  return `https://api.telegram.org/bot${ENV.telegramBotToken}/${method}`;
}

function buildTelegramFileUrl(filePath: string) {
  return `https://api.telegram.org/file/bot${ENV.telegramBotToken}/${filePath}`;
}

async function fetchTelegramFilePath(fileId: string) {
  const response = await fetch(buildTelegramApiUrl("getFile"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  });

  if (!response.ok) {
    throw new Error(`Telegram getFile failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json() as TelegramFileResponse;
  const filePath = payload.result?.file_path;
  if (!payload.ok || !filePath) {
    throw new Error(payload.description || "Telegram getFile returned no file path");
  }

  return filePath;
}

async function downloadTelegramFile(filePath: string) {
  const response = await fetch(buildTelegramFileUrl(filePath));
  if (!response.ok) {
    throw new Error(`Telegram file download failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "audio/ogg";
  const bytes = new Uint8Array(await response.arrayBuffer());
  return { bytes, contentType };
}

export async function transcribeTelegramVoice(
  fileId: string,
  options: TelegramVoiceTranscriptionOptions = {},
) {
  if (!ENV.telegramBotToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is required for voice transcription");
  }

  if (!ENV.mistralApiKey) {
    throw new Error("MISTRAL_API_KEY is required for voice transcription");
  }

  const filePath = await fetchTelegramFilePath(fileId);
  const audio = await downloadTelegramFile(filePath);
  const fileName = options.fileName || filePath.split("/").pop() || "telegram-voice.ogg";

  return transcribeMistralAudio(audio.bytes, {
    contentType: audio.contentType,
    fileName,
    language: options.language,
  });
}

export async function transcribeMistralAudio(
  audioBytes: Uint8Array,
  options: MistralAudioTranscriptionOptions,
) {
  if (!ENV.mistralApiKey) {
    throw new Error("MISTRAL_API_KEY is required for voice transcription");
  }

  const formData = new FormData();
  const audioBuffer = audioBytes.buffer.slice(
    audioBytes.byteOffset,
    audioBytes.byteOffset + audioBytes.byteLength,
  ) as ArrayBuffer;

  formData.append("model", ENV.mistralAudioTranscriptionModel);
  formData.append("file", new Blob([audioBuffer], { type: options.contentType }), options.fileName);

  if (options.language) {
    formData.append("language", options.language);
  }

  const response = await fetch("https://api.mistral.ai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${ENV.mistralApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Mistral transcription failed: ${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`);
  }

  const result = await response.json() as MistralTranscriptionResponse;
  return result.text?.trim() || "";
}
