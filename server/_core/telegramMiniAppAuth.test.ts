import crypto from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./env", () => ({
  ENV: {
    isProduction: true,
    telegramBotToken: "test-telegram-token",
  },
}));

const fixedNow = 1_700_000_000;

function signTelegramInitData(values: Record<string, string>) {
  const dataCheckString = Object.entries(values)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update("test-telegram-token")
    .digest();
  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  const params = new URLSearchParams(values);
  params.set("hash", hash);
  return params.toString();
}

describe("validateTelegramMiniAppInitData", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(fixedNow * 1000));
  });

  it("accepts signed Telegram Mini App initData", async () => {
    const { validateTelegramMiniAppInitData } = await import("./telegramMiniAppAuth");
    const initData = signTelegramInitData({
      auth_date: String(fixedNow),
      query_id: "query-1",
      user: JSON.stringify({ id: 123, first_name: "Test", username: "dialab_user" }),
    });

    const result = validateTelegramMiniAppInitData(initData);

    expect(result.user?.id).toBe(123);
    expect(result.user?.username).toBe("dialab_user");
  });

  it("rejects tampered initData", async () => {
    const { validateTelegramMiniAppInitData } = await import("./telegramMiniAppAuth");
    const initData = signTelegramInitData({
      auth_date: String(fixedNow),
      user: JSON.stringify({ id: 123, first_name: "Test" }),
    }).replace("Test", "Changed");

    expect(() => validateTelegramMiniAppInitData(initData)).toThrow("Telegram initData imzası düzgün deyil");
  });

  it("rejects expired initData", async () => {
    const { validateTelegramMiniAppInitData } = await import("./telegramMiniAppAuth");
    const initData = signTelegramInitData({
      auth_date: String(fixedNow - 90_000),
      user: JSON.stringify({ id: 123 }),
    });

    expect(() => validateTelegramMiniAppInitData(initData)).toThrow("Telegram initData vaxtı keçib");
  });
});
