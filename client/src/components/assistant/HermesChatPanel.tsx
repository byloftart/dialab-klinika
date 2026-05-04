import { useEffect, useMemo, useRef, type Dispatch, type SetStateAction } from "react";
import { Loader2, MessageCircle, RotateCcw, Send } from "lucide-react";
import type { AssistantChatContext, AssistantChatMessage, AssistantProvider } from "@/lib/assistant";
import { trpc } from "@/lib/trpc";

type HermesChatPanelProps = {
  provider: AssistantProvider;
  chatContext: AssistantChatContext;
  messages: AssistantChatMessage[];
  setMessages: Dispatch<SetStateAction<AssistantChatMessage[]>>;
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
};

const contextCopy: Record<string, { message: string; suggestion: string }> = {
  appointment: {
    message: "Salam. Qəbul müraciəti üçün xidmət və ya həkim seçimini dəqiqləşdirməyə kömək edə bilərəm.",
    suggestion: "Qəbula yazılmaq üçün hansı məlumatlar lazımdır?",
  },
  services: {
    message: "Salam. Laboratoriya və diaqnostika xidmətləri ilə bağlı sualınızı yazın.",
    suggestion: "Dialab-da hansı xidmətlər mövcuddur?",
  },
  doctors: {
    message: "Salam. Uyğun həkim və ya ixtisas seçimi barədə sual verə bilərsiniz.",
    suggestion: "Hansı həkimlər qəbul aparır?",
  },
};

export function getInitialAssistantMessage(chatContext: AssistantChatContext): AssistantChatMessage {
  const quickActionId = chatContext.quickActionId ?? "";
  const copy = contextCopy[quickActionId];

  if (copy) {
    return {
      role: "assistant",
      content: copy.message,
    };
  }

  return {
    role: "assistant",
    content: "Salam. Sualınızı yazın, qəbul, xidmətlər və həkimlər üzrə kömək edim.",
  };
}

function renderInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

function renderAssistantText(content: string) {
  const lines = content
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const heading = line.replace(/^#{1,6}\s*/, "");
        const bullet = heading.match(/^[-*•]\s+(.+)/);
        const ordered = heading.match(/^\d+[.)]\s+(.+)/);

        if (bullet || ordered) {
          return (
            <div key={`${line}-${index}`} className="flex gap-2">
              <span className="mt-[0.55em] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#00b982]" />
              <span>{renderInlineText((bullet?.[1] ?? ordered?.[1] ?? heading).replace(/\s+--\s+/g, " "))}</span>
            </div>
          );
        }

        return <p key={`${line}-${index}`}>{renderInlineText(heading.replace(/\s+--\s+/g, " "))}</p>;
      })}
    </div>
  );
}

export default function HermesChatPanel({
  provider,
  chatContext,
  messages,
  setMessages,
  draft,
  setDraft,
}: HermesChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.assistant.chat.useMutation();
  const quickActionId = chatContext.quickActionId ?? "";
  const activeCopy = contextCopy[quickActionId];
  const isHermesReady = provider.type === "hermes";

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([getInitialAssistantMessage(chatContext)]);
    }
  }, [chatContext, messages.length, setMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, chatMutation.isPending]);

  const visibleMessages = useMemo(() => messages.slice(-12), [messages]);

  const sendMessage = async (content: string) => {
    const trimmedContent = content.trim();

    if (!trimmedContent || !isHermesReady || chatMutation.isPending) {
      return;
    }

    const nextMessages: AssistantChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: trimmedContent,
      },
    ];

    setMessages(nextMessages);
    setDraft("");

    try {
      const requestMessages = nextMessages.slice(-18);
      const response = await chatMutation.mutateAsync({
        messages: requestMessages,
        context: chatContext,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.content,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Hazırda cavab almaq mümkün olmadı. Zəhmət olmasa bir az sonra yenidən yazın.",
        },
      ]);
    }
  };

  const resetChat = () => {
    setMessages([getInitialAssistantMessage(chatContext)]);
    setDraft("");
    chatMutation.reset();
  };

  if (!isHermesReady) {
    return (
      <div className="min-h-[380px] rounded-[24px] border border-dashed border-[#00b982]/30 bg-white px-4 py-5 shadow-[0_16px_40px_rgba(26,54,93,0.08)]">
        <div className="flex h-full min-h-[330px] flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8fffa]">
            <MessageCircle className="h-7 w-7 text-[#00b982]" />
          </div>
          <p className="mt-4 text-sm font-semibold text-[#1a365d]">Hermes bağlantısı hazırlanır</p>
          <p className="mt-2 max-w-[280px] text-sm leading-6 text-gray-600">
            Dr. Dia agent aktivləşdiriləndən sonra burada canlı söhbət görünəcək.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#00b982]/18 bg-white shadow-[0_16px_40px_rgba(26,54,93,0.08)]">
      <div className="flex items-center justify-end border-b border-[#e1f3ef] bg-[#fbfffd] px-4 py-2.5">
        <button
          type="button"
          onClick={resetChat}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dcefeb] text-gray-500 transition-colors hover:border-[#00b982]/35 hover:text-[#1a365d]"
          aria-label="Söhbəti yenilə"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f8fffb] px-4 py-4">
        {visibleMessages.map((message, index) => (
          <div
            key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={[
                "max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                message.role === "user"
                  ? "bg-[#00b982] text-white"
                  : "border border-[#dcefeb] bg-white text-[#1a365d]",
              ].join(" ")}
            >
              {message.role === "assistant" ? renderAssistantText(message.content) : message.content}
            </div>
          </div>
        ))}

        {chatMutation.isPending ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#dcefeb] bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-[#00b982]" />
              Dr. Dia cavab hazırlayır...
            </div>
          </div>
        ) : null}
      </div>

      {activeCopy ? (
        <div className="border-t border-[#e1f3ef] bg-white px-3 pt-3">
          <button
            type="button"
            onClick={() => sendMessage(activeCopy.suggestion)}
            disabled={chatMutation.isPending}
            className="w-full rounded-2xl border border-[#00b982]/20 bg-[#f7fffb] px-4 py-2.5 text-left text-xs font-medium text-[#1a365d] transition-colors hover:border-[#00b982]/40 disabled:opacity-60"
          >
            {activeCopy.suggestion}
          </button>
        </div>
      ) : null}

      <form
        className="flex gap-2 border-t border-[#e1f3ef] bg-white p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage(draft);
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={chatMutation.isPending}
          className="min-w-0 flex-1 rounded-2xl border border-[#dcefeb] bg-white px-4 py-3 text-sm text-[#1a365d] outline-none transition-colors placeholder:text-gray-400 focus:border-[#00b982]"
          placeholder="Sualınızı yazın..."
        />
        <button
          type="submit"
          disabled={!draft.trim() || chatMutation.isPending}
          className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00b982] text-white transition-colors hover:bg-[#00a572] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Mesaj göndər"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
