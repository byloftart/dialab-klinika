import { Webchat } from "@botpress/webchat";
import type { AssistantChatContext, AssistantProvider } from "@/lib/assistant";

type BotpressWebchatPanelProps = {
  provider: AssistantProvider;
  chatContext: AssistantChatContext;
  botName: string;
  botDescription: string;
};

export default function BotpressWebchatPanel({
  provider,
  chatContext,
  botName,
  botDescription,
}: BotpressWebchatPanelProps) {
  if (provider.type !== "botpress" || !provider.clientId) {
    return (
      <div className="min-h-[320px] rounded-[22px] border border-dashed border-[#00b982]/30 bg-white px-4 py-5 shadow-[0_16px_40px_rgba(26,54,93,0.08)]">
        <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8fffa]">
            <img
              src="/images/dia_logo_symbol.png"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 object-contain"
            />
          </div>
          <p className="mt-4 text-sm font-semibold text-[#1a365d]">
            Dr. Dia söhbəti aktivləşdirilir
          </p>
          <p className="mt-2 max-w-[260px] text-sm leading-6 text-gray-600">
            Botpress Client ID əlavə ediləndən sonra burada canlı çat görünəcək.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[380px] overflow-hidden rounded-[22px] border border-[#00b982]/18 bg-white shadow-[0_16px_40px_rgba(26,54,93,0.08)]">
      <Webchat
        key={`${provider.clientId}:${chatContext.quickActionId ?? "default"}`}
        clientId={provider.clientId}
        apiUrl={provider.apiUrl}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
        configuration={
          {
            botName,
            botDescription,
            botAvatar: "/images/dia_logo_symbol.png",
            composerPlaceholder: "Mesajınızı yazın...",
            additionalStylesheetUrl: provider.additionalStylesheetUrl,
          } as never
        }
      />
    </div>
  );
}
