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
      <div className="rounded-2xl border border-dashed border-[#00b982]/24 bg-white px-4 py-5">
        <p className="text-sm font-medium text-[#1a365d]">
          Web chat hələ qoşulmayıb
        </p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Botpress bağlantısı aktiv ediləndən sonra bu sahədə canlı söhbət görünəcək.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[360px] overflow-hidden rounded-2xl border border-[#00b982]/18 bg-white">
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
