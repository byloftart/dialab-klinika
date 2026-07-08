import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { CalendarDays, Loader2, MessageCircle, Mic, Phone, RotateCcw, Send, Square } from "lucide-react";
import type { AssistantChatContext, AssistantChatMessage, AssistantProvider } from "@/lib/assistant";
import { trpc } from "@/lib/trpc";

type HermesChatPanelProps = {
  provider: AssistantProvider;
  chatContext: AssistantChatContext;
  messages: AssistantChatMessage[];
  setMessages: Dispatch<SetStateAction<AssistantChatMessage[]>>;
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
  onOpenBooking?: () => void;
  phoneHref?: string;
  whatsappUrl?: string;
  telegramUrl?: string;
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

function getSupportedAudioMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.slice(index, index + chunkSize);
    for (let chunkIndex = 0; chunkIndex < chunk.length; chunkIndex += 1) {
      binary += String.fromCharCode(chunk[chunkIndex]);
    }
  }

  return btoa(binary);
}

function normalizeMimeType(mimeType: string) {
  return (mimeType.split(";")[0] || "audio/webm") as "audio/webm" | "audio/ogg" | "audio/mpeg" | "audio/mp4" | "audio/wav";
}

function getMessageActions(content: string) {
  const normalized = content.toLowerCase();
  const hasBookingAction = /(qəbul|qebul|randevu|запис|при[её]м|appointment|book)/i.test(content);
  const hasOperatorAction = /(operator|оператор|whatsapp|telegram|dəqiqləş|deqiqləş|уточн|связ|contact|əlaqə|elaqe)/i.test(content);
  const hasCallAction = /(zəng|zeng|звон|позвон|телефон|call|phone)/i.test(content);

  return {
    booking: hasBookingAction,
    call: hasCallAction,
    operator: hasOperatorAction || normalized.includes("canlı operator"),
  };
}

export default function HermesChatPanel({
  provider,
  chatContext,
  messages,
  setMessages,
  draft,
  setDraft,
  onOpenBooking,
  phoneHref,
  whatsappUrl,
  telegramUrl,
}: HermesChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const chatMutation = trpc.assistant.chat.useMutation();
  const voiceMutation = trpc.assistant.transcribeVoice.useMutation();
  const quickActionId = chatContext.quickActionId ?? "";
  const activeCopy = contextCopy[quickActionId];
  const isHermesReady = provider.type === "hermes";
  const isVoiceBusy = isRecordingVoice || voiceMutation.isPending;

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
  }, [messages, chatMutation.isPending, voiceMutation.isPending]);

  useEffect(() => () => {
    mediaRecorderRef.current?.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const visibleMessages = useMemo(() => messages.slice(-12), [messages]);

  const renderAssistantActions = (content: string) => {
    const actions = getMessageActions(content);

    if (!actions.booking && !actions.call && !actions.operator) {
      return null;
    }

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.booking && onOpenBooking ? (
          <button
            type="button"
            onClick={onOpenBooking}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-2xl border border-[#00b982]/25 bg-[#f3fffb] px-3 text-xs font-semibold text-[#1a365d] transition-colors hover:border-[#00b982]/45 hover:bg-white"
          >
            <CalendarDays className="h-3.5 w-3.5 text-[#00b982]" />
            Qəbul
          </button>
        ) : null}

        {actions.call && phoneHref ? (
          <a
            href={phoneHref}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-2xl border border-[#00b982]/25 bg-[#f3fffb] px-3 text-xs font-semibold text-[#1a365d] transition-colors hover:border-[#00b982]/45 hover:bg-white"
          >
            <Phone className="h-3.5 w-3.5 text-[#00b982]" />
            Zəng
          </a>
        ) : null}

        {actions.operator && whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-2xl border border-[#00b982]/25 bg-[#f3fffb] px-3 text-xs font-semibold text-[#1a365d] transition-colors hover:border-[#00b982]/45 hover:bg-white"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#00b982]" />
            WhatsApp
          </a>
        ) : null}

        {actions.operator && telegramUrl ? (
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-2xl border border-[#00b982]/25 bg-[#f3fffb] px-3 text-xs font-semibold text-[#1a365d] transition-colors hover:border-[#00b982]/45 hover:bg-white"
          >
            <Send className="h-3.5 w-3.5 text-[#00b982]" />
            Telegram
          </a>
        ) : null}
      </div>
    );
  };

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
    voiceMutation.reset();
    setVoiceError("");
  };

  const transcribeVoiceBlob = async (blob: Blob) => {
    if (!blob.size) {
      setVoiceError("Səs yazısı boşdur. Yenidən cəhd edin.");
      return;
    }

    try {
      setVoiceError("");
      const audioBase64 = await blobToBase64(blob);
      const mimeType = normalizeMimeType(blob.type);
      const result = await voiceMutation.mutateAsync({
        audioBase64,
        mimeType,
        fileName: `dr-dia-voice.${mimeType.split("/")[1] || "webm"}`,
      });

      setDraft(result.text);
    } catch {
      setVoiceError("Səsi mətnə çevirmək mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.");
    }
  };

  const stopVoiceRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceError("Brauzeriniz səsli giriş funksiyasını dəstəkləmir.");
      return;
    }

    try {
      setVoiceError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
        setIsRecordingVoice(false);
        void transcribeVoiceBlob(audioBlob);
      });

      recorder.start();
      setIsRecordingVoice(true);
    } catch {
      setIsRecordingVoice(false);
      setVoiceError("Mikrofona giriş alınmadı. Brauzer icazəsini yoxlayın.");
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      stopVoiceRecording();
      return;
    }

    void startVoiceRecording();
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
              {message.role === "assistant" ? (
                <>
                  {renderAssistantText(message.content)}
                  {renderAssistantActions(message.content)}
                </>
              ) : (
                message.content
              )}
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

        {voiceMutation.isPending ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#dcefeb] bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-[#00b982]" />
              Səs mətnə çevrilir...
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

      <div className="border-t border-[#e1f3ef] bg-white p-3">
        {voiceError ? <p className="mb-2 text-xs font-medium text-red-600">{voiceError}</p> : null}
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(draft);
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={chatMutation.isPending || voiceMutation.isPending}
            className="min-w-0 flex-1 rounded-2xl border border-[#dcefeb] bg-white px-4 py-3 text-sm text-[#1a365d] outline-none transition-colors placeholder:text-gray-400 focus:border-[#00b982]"
            placeholder={isRecordingVoice ? "Danışın..." : "Sualınızı yazın və ya səsli daxil edin..."}
          />
          <button
            type="button"
            onClick={toggleVoiceRecording}
            disabled={chatMutation.isPending || voiceMutation.isPending}
            className={[
              "inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              isRecordingVoice
                ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-[#dcefeb] bg-white text-[#00b982] hover:border-[#00b982]/40 hover:bg-[#f7fffb]",
            ].join(" ")}
            aria-label={isRecordingVoice ? "Səs yazısını dayandır" : "Səsli giriş"}
          >
            {isRecordingVoice ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
          </button>
          <button
            type="submit"
            disabled={!draft.trim() || chatMutation.isPending || isVoiceBusy}
            className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#00b982] text-white transition-colors hover:bg-[#00a572] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Mesaj göndər"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
