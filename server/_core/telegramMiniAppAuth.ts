import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

const INIT_DATA_TTL_SECONDS = 24 * 60 * 60;

export type TelegramMiniAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

type ValidationResult = {
  user: TelegramMiniAppUser | null;
};

function hmacSha256(key: crypto.BinaryLike | crypto.KeyObject, value: string) {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function parseInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Telegram initData imzası yoxdur",
    });
  }

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  return { params, hash, dataCheckString };
}

function timingSafeHexEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateTelegramMiniAppInitData(initData: string): ValidationResult {
  if (!ENV.telegramBotToken) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Telegram bot token konfiqurasiya edilməyib",
    });
  }

  const trimmed = initData.trim();
  if (!trimmed) {
    if (!ENV.isProduction) {
      return { user: null };
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Telegram initData boşdur",
    });
  }

  const { params, hash, dataCheckString } = parseInitData(trimmed);
  const secretKey = hmacSha256("WebAppData", ENV.telegramBotToken);
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!timingSafeHexEqual(hash, calculatedHash)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Telegram initData imzası düzgün deyil",
    });
  }

  const authDate = Number(params.get("auth_date") ?? 0);
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || now - authDate > INIT_DATA_TTL_SECONDS) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Telegram initData vaxtı keçib",
    });
  }

  const rawUser = params.get("user");
  if (!rawUser) {
    return { user: null };
  }

  try {
    return { user: JSON.parse(rawUser) as TelegramMiniAppUser };
  } catch {
    return { user: null };
  }
}
