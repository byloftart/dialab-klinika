import { afterEach, describe, expect, it, vi } from "vitest";
import { callHermesChat } from "./hermesAssistant";

describe("callHermesChat", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends an OpenAI-compatible chat request to Hermes and returns the assistant text", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "Salam, Dr. Dia sizə kömək edə bilər.",
            },
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await callHermesChat({
      baseUrl: "http://127.0.0.1:8642/v1",
      apiKey: "test-key",
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: "You are Dr. Dia." },
        { role: "user", content: "Salam" },
      ],
    });

    expect(result).toEqual({ content: "Salam, Dr. Dia sizə kömək edə bilər." });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8642/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer test-key",
          "content-type": "application/json",
        }),
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [
            { role: "system", content: "You are Dr. Dia." },
            { role: "user", content: "Salam" },
          ],
          temperature: 0.4,
        }),
      })
    );
  });
});
