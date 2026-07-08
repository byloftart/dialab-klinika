import { useEffect, useMemo, useRef, useState, type ElementType, type FormEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  FlaskConical,
  Headphones,
  HeartPulse,
  Home,
  Loader2,
  MessageCircle,
  Monitor,
  Search,
  Send,
  UserRound,
} from "lucide-react";
import { getDiagnosticPresentation, getLaboratoryPresentation, buildServiceOptions } from "@/lib/services";
import { buildSettingsMap, getSetting } from "@/lib/siteSettings";
import type { AssistantChatMessage, BookingSubmissionPayload } from "@/lib/assistant";
import { trpc } from "@/lib/trpc";
import { diagnosticsCatalog, laboratoryCatalog } from "@shared/serviceCatalog";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        colorScheme?: "light" | "dark";
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
      };
    };
  }
}

type MiniAppScreen = "home" | "chat" | "services" | "doctors" | "booking";
type ServiceMode = "root" | "laboratory" | "diagnostics";

type BookingFormState = {
  doctorOrService: string;
  preferredDate: string;
  preferredTime: string;
  patientName: string;
  phone: string;
  note: string;
};

type BookingUiState =
  | { status: "idle"; message: null }
  | { status: "submitting"; message: null }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type ServiceGroup = {
  id: number;
  titleAz: string;
  descriptionAz?: string | null;
  icon?: string | null;
  color: string;
  Icon: ElementType;
};

type ServiceItem = {
  id: number;
  titleAz: string;
  descriptionAz?: string | null;
};

const logoVideoSrc = "/videos/dia-logo-animation-miniapp.mp4";
const logoFallbackSrc = "/images/dia-logo-miniapp-poster.jpg";

const initialBookingForm: BookingFormState = {
  doctorOrService: "",
  preferredDate: "",
  preferredTime: "",
  patientName: "",
  phone: "",
  note: "",
};

const initialMessages: AssistantChatMessage[] = [
  {
    role: "assistant",
    content: "Salam. Mən Dr. Dia - Dialab klinikasının virtual köməkçisiyəm. Sizə necə kömək edə bilərəm?",
  },
];

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatChatMessageContent(content: string) {
  return content
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,!?;:])/g, "$1$2")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .trim();
}

function MiniAppHeader({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#e2eeeb] bg-white/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className={cx(
            "inline-flex h-10 w-10 items-center justify-center rounded-full text-[#1a365d] transition-colors",
            onBack ? "hover:bg-[#eef9f6]" : "invisible"
          )}
          aria-label="Geri"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold leading-6 text-[#1a365d]">{title}</h1>
        </div>
        <div className="h-10 w-10" />
      </div>
    </header>
  );
}

function FloatingDock({
  activeScreen,
  onChange,
}: {
  activeScreen: MiniAppScreen;
  onChange: (screen: MiniAppScreen) => void;
}) {
  const items: Array<{ id: MiniAppScreen; label: string; Icon: ElementType }> = [
    { id: "home", label: "Dr. Dia", Icon: Home },
    { id: "chat", label: "Chat", Icon: MessageCircle },
    { id: "services", label: "Xidmətlər", Icon: HeartPulse },
    { id: "doctors", label: "Həkimlər", Icon: UserRound },
    { id: "booking", label: "Qəbul", Icon: CalendarDays },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)]">
      <div className="mx-auto grid max-w-[430px] grid-cols-5 rounded-[28px] border border-[#d7e7e3] bg-white/96 px-2 py-2 shadow-[0_18px_42px_rgba(26,54,93,0.18)] backdrop-blur">
        {items.map(({ id, label, Icon }) => {
          const isActive = activeScreen === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cx(
                "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition-colors",
                isActive ? "" : "hover:bg-[#f2faf7]"
              )}
              style={{
                backgroundColor: isActive ? "#e8fffa" : "transparent",
                color: isActive ? "#008c75" : "#34495e",
              }}
            >
              <Icon className={cx("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
              <span className="leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function HomeScreen({
  onOpenChat,
  onOpenBooking,
  operatorUrl,
}: {
  onOpenChat: () => void;
  onOpenBooking: () => void;
  operatorUrl: string;
}) {
  const [isLogoVideoReady, setIsLogoVideoReady] = useState(false);
  const [showLogoPoster, setShowLogoPoster] = useState(true);
  const showLogoVideo = isLogoVideoReady && !showLogoPoster;

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLogoPoster(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-3 px-4 pt-3">
      <section className="overflow-hidden rounded-[28px] border border-[#dcefeb] bg-white shadow-[0_16px_38px_rgba(26,54,93,0.08)]">
        <div className="flex items-center justify-center bg-white px-5 py-4" style={{ minHeight: "clamp(148px, 26svh, 210px)" }}>
          <div className="relative flex w-full max-w-[340px] items-center justify-center overflow-hidden bg-white" style={{ height: "clamp(132px, 23svh, 190px)" }}>
            <img
              src={logoFallbackSrc}
              alt=""
              aria-hidden="true"
              className={cx(
                "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
                showLogoVideo ? "opacity-0" : "opacity-100"
              )}
            />
            <video
              className={cx("relative h-full w-full object-cover transition-opacity duration-300", showLogoVideo ? "opacity-100" : "opacity-0")}
              autoPlay
              muted
              loop
              playsInline
              onCanPlay={() => setIsLogoVideoReady(true)}
              onPlaying={() => setIsLogoVideoReady(true)}
              aria-label="Dialab klinika loqo animasiyası"
            >
              <source src={logoVideoSrc} type="video/mp4" />
              <img src={logoFallbackSrc} alt="Dialab Klinika" className="h-full w-full object-contain" />
            </video>
            <span className="pointer-events-none absolute inset-y-0 left-0 z-10 w-3 bg-white" aria-hidden="true" />
            <span className="pointer-events-none absolute inset-y-0 right-0 z-10 w-3 bg-white" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#dcefeb] bg-white p-4 text-center shadow-[0_16px_38px_rgba(26,54,93,0.08)]">
        <p className="text-[clamp(20px,3svh,28px)] font-semibold leading-tight text-[#1a365d]">Salam!</p>
        <p className="mx-auto mt-2 max-w-[320px] text-[clamp(16px,2.3svh,20px)] font-medium leading-snug text-[#1a365d]">
          Mən Dr. Dia - Dialab klinikasının virtual köməkçisiyəm.
        </p>
        <p className="mx-auto mt-2 max-w-[300px] text-[clamp(14px,2svh,16px)] leading-snug text-gray-600">
          Qəbul, xidmətlər və həkimlər üzrə sizə istiqamət verə bilərəm.
        </p>
        <button
          type="button"
          onClick={onOpenChat}
          className="mt-5 inline-flex w-full items-center justify-between rounded-2xl border border-[#c8dfda] bg-[#f8fffb] px-4 py-3 text-left text-sm font-semibold text-[#1a365d] transition-colors hover:border-[#00b982]/45"
        >
          <span>Chat aç</span>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1a365d]">
            <ChevronRight className="h-5 w-5" />
          </span>
        </button>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center rounded-[24px] border border-[#dcefeb] bg-white text-[#1a365d] shadow-[0_12px_30px_rgba(26,54,93,0.08)] transition-colors hover:border-[#00b982]/40"
          style={{ minHeight: "clamp(88px, 14svh, 124px)" }}
        >
          <CalendarDays className="h-10 w-10 stroke-[1.8] text-[#008c75]" />
          <span className="mt-2 text-base font-bold">Qəbul</span>
        </button>
        <a
          href={operatorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center rounded-[24px] border border-[#dcefeb] bg-white text-[#1a365d] shadow-[0_12px_30px_rgba(26,54,93,0.08)] transition-colors hover:border-[#00b982]/40"
          style={{ minHeight: "clamp(88px, 14svh, 124px)" }}
        >
          <Headphones className="h-10 w-10 stroke-[1.8] text-[#008c75]" />
          <span className="mt-2 text-base font-bold">Operator</span>
        </a>
      </div>
    </div>
  );
}

function ChatScreen({ initData }: { initData: string }) {
  const [messages, setMessages] = useState<AssistantChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.assistant.telegramMiniAppChat.useMutation();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatMutation.isPending]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || chatMutation.isPending) return;

    const nextMessages: AssistantChatMessage[] = [...messages, { role: "user", content: trimmed }];
    const effectiveInitData = initData || window.Telegram?.WebApp?.initData || "";
    setMessages(nextMessages);
    setDraft("");

    try {
      const reply = await chatMutation.mutateAsync({
        initData: effectiveInitData,
        messages: nextMessages.slice(-18),
        context: {
          entryPoint: "telegram_mini_app",
          label: "Chat",
        },
      });

      setMessages((current) => [...current, { role: "assistant", content: reply.content }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Hazırda cavab almaq mümkün olmadı. Zəhmət olmasa bir az sonra yenidən yazın." },
      ]);
    }
  };

  return (
    <div className="flex h-[calc(100svh-84px)] min-h-0 flex-col">
      <MiniAppHeader title="Chat" />
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}-${message.content.slice(0, 16)}`} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={cx(
                "max-w-[82%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm",
                message.role === "user"
                  ? "border border-[#8fded4] bg-[#e9fbf8] text-[#1a365d]"
                  : "whitespace-pre-line border border-[#e1e9e7] bg-white text-[#1a365d]"
              )}
            >
              {message.role === "assistant" ? formatChatMessageContent(message.content) : message.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-[22px] border border-[#e1e9e7] bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-[#008c75]" />
              Dr. Dia cavab hazırlayır...
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-[#e2eeeb] bg-white px-4 py-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(draft);
          }}
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={chatMutation.isPending}
            className="min-w-0 flex-1 rounded-2xl border border-[#d7e7e3] bg-white px-4 py-3 text-sm outline-none focus:border-[#00b982]"
            placeholder="Mesaj yazın..."
          />
          <button
            type="submit"
            disabled={!draft.trim() || chatMutation.isPending}
            className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#008c75] text-white disabled:opacity-50"
            aria-label="Göndər"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function ServiceGroupList({
  title,
  searchPlaceholder,
  groups,
  selectedGroup,
  items,
  query,
  onQueryChange,
  onSelectGroup,
  onClearGroup,
  onBack,
}: {
  title: string;
  searchPlaceholder: string;
  groups: ServiceGroup[];
  selectedGroup: ServiceGroup | null;
  items: ServiceItem[];
  query: string;
  onQueryChange: (value: string) => void;
  onSelectGroup: (group: ServiceGroup) => void;
  onClearGroup: () => void;
  onBack: () => void;
}) {
  const normalizedQuery = normalizeText(query);
  const visibleGroups = groups.filter((group) => normalizeText(`${group.titleAz} ${group.descriptionAz ?? ""}`).includes(normalizedQuery));
  const visibleItems = items.filter((item) => normalizeText(`${item.titleAz} ${item.descriptionAz ?? ""}`).includes(normalizedQuery));

  return (
    <div>
      <MiniAppHeader title={title} onBack={selectedGroup ? onClearGroup : onBack} />
      <div className="space-y-4 px-4 py-4">
        <label className="flex items-center gap-3 rounded-2xl border border-[#d7e7e3] bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            placeholder={searchPlaceholder}
          />
        </label>

        {!selectedGroup ? (
          <div className="space-y-3">
            {visibleGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => onSelectGroup(group)}
                className="flex w-full items-center gap-4 rounded-[22px] border border-[#d7e7e3] bg-white p-4 text-left shadow-[0_10px_28px_rgba(26,54,93,0.07)] transition-colors hover:border-[#00b982]/40"
              >
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e8fffa]" style={{ color: group.color }}>
                  <group.Icon className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-[#1a365d]">{group.titleAz}</span>
                  {group.descriptionAz ? (
                    <span className="mt-1 block text-xs leading-5 text-gray-500">{group.descriptionAz}</span>
                  ) : null}
                </span>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-[22px] border border-[#00b982]/25 bg-[#f7fffb] p-4">
              <p className="text-lg font-bold text-[#1a365d]">{selectedGroup.titleAz}</p>
              {selectedGroup.descriptionAz ? <p className="mt-1 text-sm leading-6 text-gray-600">{selectedGroup.descriptionAz}</p> : null}
            </div>
            {visibleItems.map((item) => (
              <div key={item.id} className="rounded-[20px] border border-[#d7e7e3] bg-white p-4 shadow-sm">
                <p className="text-sm font-bold leading-6 text-[#1a365d]">{item.titleAz}</p>
                {item.descriptionAz ? <p className="mt-1 text-xs leading-5 text-gray-500">{item.descriptionAz}</p> : null}
              </div>
            ))}
            {!visibleItems.length ? (
              <div className="rounded-[20px] border border-dashed border-[#d7e7e3] bg-white p-5 text-center text-sm text-gray-500">
                Bu bölmə üzrə məlumat admin paneldən əlavə oluna bilər.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function ServicesScreen() {
  const [mode, setMode] = useState<ServiceMode>("root");
  const [query, setQuery] = useState("");
  const [selectedLab, setSelectedLab] = useState<ServiceGroup | null>(null);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<ServiceGroup | null>(null);
  const { data: laboratory } = trpc.cms.laboratory.list.useQuery();
  const { data: diagnostics } = trpc.cms.diagnostics.list.useQuery();

  const activeLaboratory = (laboratory ?? []).filter((item) => item.isActive !== false);
  const activeDiagnostics = (diagnostics ?? []).filter((item) => item.isActive !== false);
  const usingLaboratoryFallback = activeLaboratory.length === 0;
  const usingDiagnosticsFallback = activeDiagnostics.length === 0;

  const laboratoryGroups = (usingLaboratoryFallback ? laboratoryCatalog.map((item, index) => ({
    id: -(index + 1),
    titleAz: item.titleAz,
    descriptionAz: item.descriptionAz,
    icon: item.icon,
  })) : activeLaboratory).map((item, index) => {
    const presentation = getLaboratoryPresentation(item.icon, index);
    return { ...item, Icon: presentation.icon, color: presentation.color };
  });

  const diagnosticGroups = (usingDiagnosticsFallback ? diagnosticsCatalog.map((item, index) => ({
    id: -(index + 1),
    titleAz: item.titleAz,
    descriptionAz: item.descriptionAz,
    icon: item.icon,
  })) : activeDiagnostics).map((item, index) => {
    const presentation = getDiagnosticPresentation(item.icon, index);
    return { ...item, Icon: presentation.icon, color: presentation.color };
  });

  const selectedLabFallback = usingLaboratoryFallback
    ? laboratoryCatalog.find((_, index) => selectedLab?.id === -(index + 1))
    : null;
  const selectedDiagnosticFallback = usingDiagnosticsFallback
    ? diagnosticsCatalog.find((_, index) => selectedDiagnostic?.id === -(index + 1))
    : null;

  const { data: labData } = trpc.cms.laboratory.getById.useQuery(
    { id: selectedLab?.id ?? 0 },
    { enabled: Boolean(selectedLab?.id) && !usingLaboratoryFallback && (selectedLab?.id ?? 0) > 0 }
  );
  const { data: diagnosticData } = trpc.cms.diagnostics.getById.useQuery(
    { id: selectedDiagnostic?.id ?? 0 },
    { enabled: Boolean(selectedDiagnostic?.id) && !usingDiagnosticsFallback && (selectedDiagnostic?.id ?? 0) > 0 }
  );

  const labItems: ServiceItem[] = usingLaboratoryFallback
    ? (selectedLabFallback?.subTests ?? []).map(([titleAz, descriptionAz], index) => ({ id: index, titleAz, descriptionAz }))
    : (labData?.subTests ?? []);
  const diagnosticItems: ServiceItem[] = usingDiagnosticsFallback
    ? (selectedDiagnosticFallback?.subServices ?? []).map((titleAz, index) => ({ id: index, titleAz }))
    : (diagnosticData?.subServices ?? []);

  if (mode === "laboratory") {
    return (
      <ServiceGroupList
        title="Laboratoriya"
        searchPlaceholder="Axtarın..."
        groups={laboratoryGroups}
        selectedGroup={selectedLab}
        items={labItems}
        query={query}
        onQueryChange={setQuery}
        onSelectGroup={(group) => setSelectedLab(group)}
        onClearGroup={() => setSelectedLab(null)}
        onBack={() => {
          setMode("root");
          setSelectedLab(null);
          setQuery("");
        }}
      />
    );
  }

  if (mode === "diagnostics") {
    return (
      <ServiceGroupList
        title="Diaqnostika"
        searchPlaceholder="Axtarın..."
        groups={diagnosticGroups}
        selectedGroup={selectedDiagnostic}
        items={diagnosticItems}
        query={query}
        onQueryChange={setQuery}
        onSelectGroup={(group) => setSelectedDiagnostic(group)}
        onClearGroup={() => setSelectedDiagnostic(null)}
        onBack={() => {
          setMode("root");
          setSelectedDiagnostic(null);
          setQuery("");
        }}
      />
    );
  }

  return (
    <div>
      <MiniAppHeader title="Xidmətlər" />
      <div className="grid min-h-[calc(100svh-220px)] grid-rows-2 gap-4 px-4 py-5">
        <button
          type="button"
          onClick={() => {
            setMode("laboratory");
            setQuery("");
          }}
          className="relative flex min-h-[190px] w-full overflow-hidden rounded-[30px] border border-[#bfeee4] bg-gradient-to-br from-[#e8fffa] via-white to-[#c8fff2] p-6 text-left shadow-[0_18px_42px_rgba(0,140,117,0.14)]"
        >
          <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/55" />
          <span className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-[28px] bg-white text-[#008c75] shadow-[0_14px_30px_rgba(0,140,117,0.12)]">
            <FlaskConical className="h-12 w-12 stroke-[1.9]" />
          </span>
          <span className="relative z-10 ml-5 flex min-w-0 flex-1 flex-col justify-center">
            <span className="block text-3xl font-extrabold leading-tight text-[#1a365d]">Laboratoriya</span>
            <span className="mt-3 block text-base font-medium leading-6 text-[#4f5f6e]">Analiz qrupları, alt testlər və laborator istiqamətlər</span>
          </span>
          <ChevronRight className="relative z-10 mt-auto h-8 w-8 flex-shrink-0 text-[#008c75]" />
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("diagnostics");
            setQuery("");
          }}
          className="relative flex min-h-[190px] w-full overflow-hidden rounded-[30px] border border-[#c9e3ff] bg-gradient-to-br from-[#eef7ff] via-white to-[#dff1ff] p-6 text-left shadow-[0_18px_42px_rgba(26,54,93,0.12)]"
        >
          <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/60" />
          <span className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-[28px] bg-white text-[#1f7fb8] shadow-[0_14px_30px_rgba(31,127,184,0.12)]">
            <Monitor className="h-12 w-12 stroke-[1.9]" />
          </span>
          <span className="relative z-10 ml-5 flex min-w-0 flex-1 flex-col justify-center">
            <span className="block text-3xl font-extrabold leading-tight text-[#1a365d]">Diaqnostika</span>
            <span className="mt-3 block text-base font-medium leading-6 text-[#4f5f6e]">USM, funksional və instrumental müayinə istiqamətləri</span>
          </span>
          <ChevronRight className="relative z-10 mt-auto h-8 w-8 flex-shrink-0 text-[#1f7fb8]" />
        </button>
      </div>
    </div>
  );
}

function DoctorsScreen({ onBookDoctor }: { onBookDoctor: (doctorOrService: string) => void }) {
  const { data: doctors } = trpc.cms.doctors.list.useQuery();

  return (
    <div>
      <MiniAppHeader title="Həkimlər" />
      <div className="space-y-3 px-4 py-4">
        {(doctors ?? []).map((doctor) => (
          <article key={doctor.id} className="rounded-[26px] border border-[#d7e7e3] bg-white p-4 shadow-[0_10px_28px_rgba(26,54,93,0.07)]">
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-[#e3efec] bg-[#eef9f6] shadow-inner">
                {doctor.photoUrl ? (
                  <img src={doctor.photoUrl} alt={doctor.nameAz} className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-10 w-10 text-[#008c75]" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <h2 className="text-lg font-extrabold leading-6 text-[#1a365d]">{doctor.nameAz}</h2>
                  <p className="mt-1 text-base font-bold leading-5 text-[#008c75]">{doctor.specialtyAz}</p>
                </div>
                {doctor.experienceYears ? <p className="mt-1 text-xs text-gray-500">Təcrübə: {doctor.experienceYears} il</p> : null}
                <button
                  type="button"
                  onClick={() => onBookDoctor(`${doctor.nameAz} - ${doctor.specialtyAz}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#008c75] px-4 py-2.5 text-sm font-bold text-white"
                >
                  <CalendarDays className="h-4 w-4" />
                  Qəbul
                </button>
              </div>
            </div>
          </article>
        ))}
        {(doctors ?? []).length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#d7e7e3] bg-white p-6 text-center text-sm leading-6 text-gray-500">
            Həkim siyahısı yüklənir və ya admin paneldən əlavə oluna bilər.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BookingScreen({
  form,
  state,
  services,
  onChange,
  onSubmit,
}: {
  form: BookingFormState;
  state: BookingUiState;
  services: Array<{ value: string; label: string }>;
  onChange: (field: keyof BookingFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div>
      <MiniAppHeader title="Qəbul" />
      <form onSubmit={onSubmit} className="space-y-4 px-4 py-4">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#637381]">Xidmət / Həkim</span>
          <select
            value={form.doctorOrService}
            onChange={(event) => onChange("doctorOrService", event.target.value)}
            className="h-12 w-full rounded-2xl border border-[#d7e7e3] bg-white px-4 text-sm outline-none focus:border-[#00b982]"
          >
            <option value="">Seçin</option>
            {form.doctorOrService && !services.some((service) => service.label === form.doctorOrService) ? (
              <option value={form.doctorOrService}>{form.doctorOrService}</option>
            ) : null}
            {services.map((service) => (
              <option key={service.value} value={service.label}>{service.label}</option>
            ))}
          </select>
        </label>
        {[
          ["patientName", "Ad", "Adınızı yazın"],
          ["phone", "Telefon", "+994"],
          ["preferredDate", "Tarix", ""],
          ["preferredTime", "Saat", ""],
        ].map(([field, label, placeholder]) => (
          <label key={field} className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#637381]">{label}</span>
            <input
              value={form[field as keyof BookingFormState]}
              onChange={(event) => onChange(field as keyof BookingFormState, event.target.value)}
              type={field === "preferredDate" ? "date" : field === "preferredTime" ? "time" : "text"}
              placeholder={placeholder}
              className="h-12 w-full rounded-2xl border border-[#d7e7e3] bg-white px-4 text-sm outline-none focus:border-[#00b982]"
            />
          </label>
        ))}
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#637381]">Qeyd</span>
          <textarea
            value={form.note}
            onChange={(event) => onChange("note", event.target.value)}
            rows={4}
            placeholder="Əlavə qeydlər..."
            className="w-full resize-none rounded-2xl border border-[#d7e7e3] bg-white px-4 py-3 text-sm outline-none focus:border-[#00b982]"
          />
        </label>
        {state.message ? (
          <div className={cx("rounded-2xl px-4 py-3 text-sm", state.status === "success" ? "bg-[#e8fffa] text-[#008c75]" : "bg-red-50 text-red-700")}>
            {state.message}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[#008c75] px-5 py-4 text-sm font-bold text-white disabled:opacity-60"
        >
          {state.status === "submitting" ? "Göndərilir..." : "Göndər"}
        </button>
      </form>
    </div>
  );
}

export default function TelegramMiniApp() {
  const [screen, setScreen] = useState<MiniAppScreen>("home");
  const [bookingForm, setBookingForm] = useState<BookingFormState>(initialBookingForm);
  const [bookingState, setBookingState] = useState<BookingUiState>({ status: "idle", message: null });
  const [initData, setInitData] = useState("");
  const bookingMutation = trpc.assistant.submitBooking.useMutation();
  const { data: contactSettings } = trpc.cms.settings.getGroup.useQuery({ group: "contact" });
  const { data: assistantSettings } = trpc.cms.settings.getGroup.useQuery({ group: "assistant" });
  const { data: laboratory } = trpc.cms.laboratory.list.useQuery();
  const { data: diagnostics } = trpc.cms.diagnostics.list.useQuery();
  const contactMap = buildSettingsMap(contactSettings);
  const assistantMap = buildSettingsMap(assistantSettings);
  const services = useMemo(() => buildServiceOptions(laboratory, diagnostics), [diagnostics, laboratory]);

  useEffect(() => {
    const syncTelegramWebApp = () => {
      const webApp = window.Telegram?.WebApp;
      webApp?.ready?.();
      webApp?.expand?.();
      setInitData(webApp?.initData ?? "");
    };

    syncTelegramWebApp();
    const timer = window.setTimeout(syncTelegramWebApp, 250);
    return () => window.clearTimeout(timer);
  }, []);

  const operatorUrl = assistantMap["assistant.telegramUrl"] || getSetting(contactMap, "contact.telegram", "https://t.me/dialab");
  const successMessage = assistantMap["assistant.bookingSuccessMessage"] || "Müraciətiniz qəbul edildi. Tezliklə sizinlə əlaqə saxlayacağıq.";
  const errorMessage = assistantMap["assistant.bookingErrorMessage"] || "Müraciət göndərilərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.";

  const openBooking = (doctorOrService?: string) => {
    if (doctorOrService) {
      setBookingForm((current) => ({ ...current, doctorOrService }));
    }
    setBookingState({ status: "idle", message: null });
    setScreen("booking");
  };

  const handleBookingFormChange = (field: keyof BookingFormState, value: string) => {
    setBookingForm((current) => ({ ...current, [field]: value }));
    if (bookingState.status !== "idle") {
      setBookingState({ status: "idle", message: null });
    }
  };

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!bookingForm.doctorOrService || !bookingForm.patientName || !bookingForm.phone) {
      setBookingState({ status: "error", message: "Zəhmət olmasa məcburi sahələri doldurun." });
      return;
    }

    const payload: BookingSubmissionPayload = {
      doctor_or_service: bookingForm.doctorOrService,
      preferred_date: bookingForm.preferredDate || undefined,
      preferred_time: bookingForm.preferredTime || undefined,
      patient_name: bookingForm.patientName,
      phone: bookingForm.phone,
      note: bookingForm.note || undefined,
    };

    setBookingState({ status: "submitting", message: null });

    try {
      await bookingMutation.mutateAsync(payload);
      setBookingForm(initialBookingForm);
      setBookingState({ status: "success", message: successMessage });
    } catch {
      setBookingState({ status: "error", message: errorMessage });
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fbfa] pb-[112px] text-[#1a365d]">
      {screen === "home" ? (
        <HomeScreen
          onOpenChat={() => setScreen("chat")}
          onOpenBooking={() => openBooking()}
          operatorUrl={operatorUrl}
        />
      ) : null}
      {screen === "chat" ? <ChatScreen initData={initData} /> : null}
      {screen === "services" ? <ServicesScreen /> : null}
      {screen === "doctors" ? <DoctorsScreen onBookDoctor={openBooking} /> : null}
      {screen === "booking" ? (
        <BookingScreen
          form={bookingForm}
          state={bookingState}
          services={services}
          onChange={handleBookingFormChange}
          onSubmit={handleBookingSubmit}
        />
      ) : null}
      <FloatingDock activeScreen={screen} onChange={setScreen} />
    </main>
  );
}
