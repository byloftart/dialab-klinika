import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ExternalLink,
  FlaskConical,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import BotpressWebchatPanel from "@/components/assistant/BotpressWebchatPanel";
import { buildServiceOptions } from "@/lib/services";
import { parseBooleanSetting, type AssistantChatContext, type BookingSubmissionPayload } from "@/lib/assistant";
import { trpc } from "@/lib/trpc";
import { buildSettingsMap, getSetting } from "@/lib/siteSettings";

type AssistantLauncherConfig = {
  launcherLabel: string;
  launcherAriaLabel: string;
  visualVariant: "minimal";
};

type AssistantWidgetState = {
  isLauncherOpen: boolean;
  isPanelReady: boolean;
};

type AssistantView = "home" | "prices" | "doctors" | "preparation" | "contacts" | "chat" | "booking";

type QuickActionId =
  | "appointment"
  | "prices"
  | "doctors"
  | "preparation"
  | "contacts"
  | "whatsapp";

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

const launcherConfig: AssistantLauncherConfig = {
  launcherLabel: "Dr. Dia",
  launcherAriaLabel: "Dr. Dia köməkçisini aç",
  visualVariant: "minimal",
};

const initialWidgetState: AssistantWidgetState = {
  isLauncherOpen: false,
  isPanelReady: false,
};

const initialBookingForm: BookingFormState = {
  doctorOrService: "",
  preferredDate: "",
  preferredTime: "",
  patientName: "",
  phone: "",
  note: "",
};

const quickActions: Array<{
  id: QuickActionId;
  label: string;
  description: string;
}> = [
  {
    id: "appointment",
    label: "Qəbula yazılmaq",
    description: "Müraciət formunu doldurun",
  },
  {
    id: "prices",
    label: "Qiymətləri öyrən",
    description: "Xidmətlər üzrə yönləndirmə",
  },
  {
    id: "doctors",
    label: "Həkimlər",
    description: "Mütəxəssis seçimi üçün kömək",
  },
  {
    id: "preparation",
    label: "Analizlərə hazırlıq",
    description: "Hazırlıq qaydaları haqqında məlumat",
  },
  {
    id: "contacts",
    label: "Əlaqə",
    description: "Ünvan və əlaqə kanalları",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Birbaşa yazışma kanalına keçid",
  },
];

const chatPlaceholderCopy: Record<Exclude<QuickActionId, "appointment" | "whatsapp">, { title: string; body: string }> = {
  prices: {
    title: "Qiymətlər üzrə istiqamət",
    body: "Laboratoriya və diaqnostika xidmətlərini sayt bölmələri üzrə daha rahat tapa bilərsiniz.",
  },
  doctors: {
    title: "Həkim seçimi üçün kömək",
    body: "Uyğun mütəxəssis istiqaməti üçün əvvəlcə qısa yönləndirmə, sonra isə canlı söhbət mümkündür.",
  },
  preparation: {
    title: "Hazırlıq qaydaları",
    body: "Analiz və müayinədən əvvəl əsas hazırlıq prinsiplərini burada görə bilərsiniz.",
  },
  contacts: {
    title: "Əlaqə məlumatları",
    body: "Telefon, ünvan və sosial kanallar üzrə birbaşa keçidlər buradadır.",
  },
};

const defaultPreparationTips = [
  "Bəzi analizlər üçün acqarına gəlmək tələb oluna bilər.",
  "Daimi qəbul etdiyiniz dərmanları əvvəlcədən qeyd edin.",
  "Hazırlıq qaydasını dəqiqləşdirmək üçün əvvəlcədən bizimlə əlaqə saxlayın.",
];

function getPulseAnimation(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      animate: undefined,
      transition: undefined,
    };
  }

  return {
    animate: {
      scale: [1, 1.18, 1],
      opacity: [0.42, 0.08, 0.42],
    },
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };
}

function getButtonMotionProps(reducedMotion: boolean) {
  if (reducedMotion) {
    return {};
  }

  return {
    whileHover: { scale: 1.09, y: -3 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 300, damping: 18 },
  };
}

export default function VirtualAssistant() {
  const reducedMotion = useReducedMotion();
  const [widgetState, setWidgetState] = useState<AssistantWidgetState>(initialWidgetState);
  const [activeView, setActiveView] = useState<AssistantView>("home");
  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionId | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormState>(initialBookingForm);
  const [bookingState, setBookingState] = useState<BookingUiState>({ status: "idle", message: null });
  const [isLauncherHovered, setIsLauncherHovered] = useState(false);
  const { data: assistantConfig } = trpc.assistant.config.useQuery(undefined, { retry: false });
  const { data: contactSettings } = trpc.cms.settings.getGroup.useQuery({ group: "contact" });
  const { data: socialSettings } = trpc.cms.settings.getGroup.useQuery({ group: "social" });
  const { data: hoursSettings } = trpc.cms.settings.getGroup.useQuery({ group: "hours" });
  const { data: assistantSettings } = trpc.cms.settings.getGroup.useQuery({ group: "assistant" });
  const { data: contentSettings } = trpc.cms.settings.getGroup.useQuery({ group: "content" });
  const { data: laboratory } = trpc.cms.laboratory.list.useQuery();
  const { data: diagnostics } = trpc.cms.diagnostics.list.useQuery();
  const { data: doctors } = trpc.cms.doctors.list.useQuery();
  const bookingMutation = trpc.assistant.submitBooking.useMutation();

  const contactMap = buildSettingsMap(contactSettings);
  const socialMap = buildSettingsMap(socialSettings);
  const hoursMap = buildSettingsMap(hoursSettings);
  const assistantMap = buildSettingsMap(assistantSettings);
  const contentMap = buildSettingsMap(contentSettings);
  const services = useMemo(() => buildServiceOptions(laboratory, diagnostics), [diagnostics, laboratory]);
  const pricesPageSlug = getSetting(contentMap, "content.pricesPageSlug", "prices");
  const preparationPageSlug = getSetting(contentMap, "content.preparationPageSlug", "preparation");
  const pricesPageHref = `/pages/${pricesPageSlug}`;
  const preparationPageHref = `/pages/${preparationPageSlug}`;
  const pricesCtaLabel = getSetting(contentMap, "content.pricesCtaLabel", "Tam qiymət siyahısı");
  const preparationCtaLabel = getSetting(contentMap, "content.preparationCtaLabel", "Hazırlıq qaydalarını aç");
  const { data: pricesPage } = trpc.cms.pages.getBySlug.useQuery(
    { slug: pricesPageSlug },
    { enabled: Boolean(pricesPageSlug) }
  );
  const { data: preparationPage } = trpc.cms.pages.getBySlug.useQuery(
    { slug: preparationPageSlug },
    { enabled: Boolean(preparationPageSlug) }
  );

  const widgetEnabled = parseBooleanSetting(assistantMap["assistant.enabled"], true);
  const launcherVisible = parseBooleanSetting(assistantMap["assistant.launcherVisible"], true);

  if (!widgetEnabled || !launcherVisible) {
    return null;
  }

  const whatsappNumber = getSetting(contactMap, "contact.whatsapp", "+994501234567");
  const whatsappUrl =
    assistantMap["assistant.whatsappUrl"] ||
    `https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=Salam,%20Dr.%20Dia%20vasit%C9%99sil%C9%99%20m%C3%BCraci%C9%99t%20edir%C9%99m.`;
  const phone = getSetting(contactMap, "contact.phone1", "+994 12 345 67 89");
  const address = getSetting(contactMap, "contact.address", "Tbilisi prospekti, 3007 məhəllə, bina 44c");
  const mapUrl = getSetting(contactMap, "contact.mapUrl", "https://www.google.com/maps");
  const instagramUrl =
    assistantMap["assistant.instagramUrl"] || getSetting(socialMap, "social.instagram", "https://instagram.com/dialabklinika");
  const telegramUrl =
    assistantMap["assistant.telegramUrl"] || getSetting(socialMap, "social.telegram", "https://t.me/");
  const weekdayHours = getSetting(hoursMap, "hours.weekdays", "09:00 - 18:00");
  const welcomeTitle = assistantMap["assistant.welcomeTitle"] || "Salam, mən Dr. Dia.";
  const welcomeText =
    assistantMap["assistant.welcomeText"] ||
    "Qəbul, xidmətlər və əlaqə ilə bağlı sizə istiqamət vermək üçün buradayam.";
  const bookingSuccessMessage =
    assistantMap["assistant.bookingSuccessMessage"] ||
    "Müraciətiniz qəbul edildi. Tezliklə sizinlə əlaqə saxlayacağıq.";
  const bookingErrorMessage =
    assistantMap["assistant.bookingErrorMessage"] ||
    "Müraciət göndərilərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.";
  const pulseAnimation = getPulseAnimation(Boolean(reducedMotion));
  const buttonMotionProps = getButtonMotionProps(Boolean(reducedMotion));
  const chatContext: AssistantChatContext = {
    entryPoint: activeQuickAction ? "quick_action" : "welcome",
    quickActionId: activeQuickAction,
    label: activeQuickAction ? quickActions.find((item) => item.id === activeQuickAction)?.label : "Ümumi söhbət",
  };

  useEffect(() => {
    if (!widgetState.isLauncherOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setWidgetState((current) => ({ ...current, isLauncherOpen: false }));
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [widgetState.isLauncherOpen]);

  useEffect(() => {
    if (!widgetState.isLauncherOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [widgetState.isLauncherOpen]);

  const handleLauncherClick = () => {
    setWidgetState((current) => ({
      ...current,
      isLauncherOpen: !current.isLauncherOpen,
      isPanelReady: true,
    }));
  };

  const closePanel = () => {
    setWidgetState((current) => ({
      ...current,
      isLauncherOpen: false,
      isPanelReady: true,
    }));
  };

  const resetToHome = () => {
    setActiveView("home");
    setActiveQuickAction(null);
    setBookingState({ status: "idle", message: null });
  };

  const openChatMode = (quickActionId?: QuickActionId | null) => {
    setActiveView("chat");
    setActiveQuickAction(quickActionId ?? null);
  };

  const scrollToSection = (sectionId: string) => {
    closePanel();

    requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);
      if (!section) {
        return;
      }

      const headerOffset = 96;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: sectionTop - headerOffset,
        behavior: "smooth",
      });
    });
  };

  const handleQuickActionClick = (actionId: QuickActionId) => {
    setActiveQuickAction(actionId);
    setBookingState({ status: "idle", message: null });

    if (actionId === "appointment") {
      setActiveView("booking");
      return;
    }

    if (actionId === "whatsapp") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setActiveView(getViewForQuickAction(actionId));
  };

  const handleBookingFormChange = (field: keyof BookingFormState, value: string) => {
    setBookingForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (bookingState.status !== "idle") {
      setBookingState({ status: "idle", message: null });
    }
  };

  const handleBookingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!bookingForm.doctorOrService || !bookingForm.patientName || !bookingForm.phone) {
      setBookingState({
        status: "error",
        message: "Zəhmət olmasa bütün məcburi sahələri doldurun.",
      });
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
      setBookingState({
        status: "success",
        message: bookingSuccessMessage,
      });
    } catch {
      setBookingState({
        status: "error",
        message: bookingErrorMessage,
      });
    }
  };

  const isActive = widgetState.isLauncherOpen || widgetState.isPanelReady;
  const showLauncherPreview = isLauncherHovered && !widgetState.isLauncherOpen;
  const activeChatContent =
    activeQuickAction && activeQuickAction !== "appointment" && activeQuickAction !== "whatsapp"
      ? chatPlaceholderCopy[activeQuickAction]
      : null;

  const getViewForQuickAction = (actionId: QuickActionId): AssistantView => {
    switch (actionId) {
      case "appointment":
        return "booking";
      case "prices":
        return "prices";
      case "doctors":
        return "doctors";
      case "preparation":
        return "preparation";
      case "contacts":
        return "contacts";
      default:
        return "home";
    }
  };

  const renderHomeContent = () => {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-[#00b982]/14 bg-white p-4">
          <p className="text-sm font-medium text-[#1a365d]">Bir mövzu seçin</p>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Qəbul, qiymətlər, həkimlər, hazırlıq və əlaqə üzrə uyğun bölməni açın və ya birbaşa sual verin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openChatMode(null)}
          className="flex w-full items-center justify-between rounded-2xl border border-[#1a365d]/15 bg-[#f7fafc] px-4 py-3 text-left transition-colors hover:border-[#1a365d]/30 hover:bg-white"
        >
          <div>
            <div className="text-sm font-semibold text-[#1a365d]">Sual ver</div>
            <div className="mt-1 text-xs text-gray-500">Canlı söhbət ekranını aç</div>
          </div>
          <MessageCircle className="h-4 w-4 text-[#00b982]" />
        </button>
      </div>
    );
  };

  const renderLocalViewContent = () => {
    if (activeView === "prices") {
      return (
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#00b982]/14 bg-white p-4">
            <p className="text-sm font-medium text-[#1a365d]">Qiymətlər üzrə istiqamət seçin</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {pricesPage?.excerptAz || "Uyğun xidmət kateqoriyasına keçərək ətraflı siyahını aça bilərsiniz."}
            </p>
          </div>

          <a
            href={pricesPageHref}
            className="flex items-center justify-between rounded-2xl border border-[#00b982]/20 bg-[#f7fffb] px-4 py-3 text-left transition-colors hover:border-[#00b982]/40 hover:bg-white"
          >
            <div>
              <div className="text-sm font-semibold text-[#1a365d]">{pricesCtaLabel}</div>
              <div className="mt-1 text-xs text-gray-500">
                {pricesPage?.titleAz || "Qiymət və xidmət kateqoriyalarını aç"}
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-[#00b982]" />
          </a>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => scrollToSection("laboratory")}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-[#00b982]/30 hover:bg-[#f8fffb]"
            >
              <div>
                <div className="text-sm font-semibold text-[#1a365d]">Laboratoriya xidmətləri</div>
                <div className="mt-1 text-xs text-gray-500">Analiz növləri və istiqamətlər</div>
              </div>
              <FlaskConical className="h-4 w-4 text-[#00b982]" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("diagnostics")}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-[#00b982]/30 hover:bg-[#f8fffb]"
            >
              <div>
                <div className="text-sm font-semibold text-[#1a365d]">Diaqnostika xidmətləri</div>
                <div className="mt-1 text-xs text-gray-500">Mövcud diaqnostika istiqamətləri</div>
              </div>
              <Stethoscope className="h-4 w-4 text-[#00b982]" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => openChatMode("prices")}
            className="flex w-full items-center justify-between rounded-2xl border border-[#1a365d]/15 bg-[#f7fafc] px-4 py-3 text-left transition-colors hover:border-[#1a365d]/30 hover:bg-white"
          >
            <div>
              <div className="text-sm font-semibold text-[#1a365d]">Qiymətlə bağlı sual ver</div>
              <div className="mt-1 text-xs text-gray-500">Dr. Dia ilə söhbətə keçin</div>
            </div>
            <MessageCircle className="h-4 w-4 text-[#00b982]" />
          </button>
        </div>
      );
    }

    if (activeView === "doctors") {
      return (
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#00b982]/14 bg-white p-4">
            <p className="text-sm font-medium text-[#1a365d]">Həkim seçimi üçün yardım</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Uyğun mütəxəssis üçün aktual CMS məlumatları əsasında istiqamət seçə bilərsiniz.
            </p>
          </div>

          <div className="space-y-2">
            {(doctors ?? []).slice(0, 4).map((doctor) => (
              <div
                key={doctor.id}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3"
              >
                <div className="text-sm font-semibold text-[#1a365d]">{doctor.nameAz}</div>
                <div className="mt-1 text-xs text-[#00b982]">{doctor.specialtyAz}</div>
                {doctor.experienceYears ? (
                  <div className="mt-1 text-xs text-gray-500">{doctor.experienceYears} il təcrübə</div>
                ) : null}
              </div>
            ))}

            {(doctors ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
                Həkim siyahısı yenilənəndən sonra burada görünəcək.
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => handleQuickActionClick("appointment")}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-[#00b982]/30 hover:bg-[#f8fffb]"
          >
            <div>
              <div className="text-sm font-semibold text-[#1a365d]">Qəbul müraciəti yarat</div>
              <div className="mt-1 text-xs text-gray-500">Mütəxəssis və tarix seçimi üçün forma açılır</div>
            </div>
            <CalendarDays className="h-4 w-4 text-[#00b982]" />
          </button>

          <button
            type="button"
            onClick={() => openChatMode("doctors")}
            className="flex w-full items-center justify-between rounded-2xl border border-[#1a365d]/15 bg-[#f7fafc] px-4 py-3 text-left transition-colors hover:border-[#1a365d]/30 hover:bg-white"
          >
            <div>
              <div className="text-sm font-semibold text-[#1a365d]">Həkimlə bağlı sual ver</div>
              <div className="mt-1 text-xs text-gray-500">Dr. Dia ilə söhbətə keçin</div>
            </div>
            <MessageCircle className="h-4 w-4 text-[#00b982]" />
          </button>
        </div>
      );
    }

    if (activeView === "preparation") {
      return (
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#00b982]/14 bg-white p-4">
            <p className="text-sm font-medium text-[#1a365d]">Hazırlıq qaydaları</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {preparationPage?.excerptAz || "Dəqiq qaydalar analiz və müayinə növünə görə dəyişə bilər."}
            </p>
          </div>

          <a
            href={preparationPageHref}
            className="flex items-center justify-between rounded-2xl border border-[#00b982]/20 bg-[#f7fffb] px-4 py-3 text-left transition-colors hover:border-[#00b982]/40 hover:bg-white"
          >
            <div>
              <div className="text-sm font-semibold text-[#1a365d]">{preparationCtaLabel}</div>
              <div className="mt-1 text-xs text-gray-500">
                {preparationPage?.titleAz || "Analiz və müayinəyə hazırlıq səhifəsini aç"}
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-[#00b982]" />
          </a>

          <div className="space-y-2">
            {defaultPreparationTips.map((tip) => (
              <div
                key={tip}
                className="flex items-start gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-600"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00b982]" />
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openChatMode("preparation")}
            className="flex w-full items-center justify-between rounded-2xl border border-[#1a365d]/15 bg-[#f7fafc] px-4 py-3 text-left transition-colors hover:border-[#1a365d]/30 hover:bg-white"
          >
            <div>
              <div className="text-sm font-semibold text-[#1a365d]">Hazırlıqla bağlı sual ver</div>
              <div className="mt-1 text-xs text-gray-500">Dr. Dia ilə söhbətə keçin</div>
            </div>
            <MessageCircle className="h-4 w-4 text-[#00b982]" />
          </button>
        </div>
      );
    }

    if (activeView === "contacts") {
      return (
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#00b982]/14 bg-white p-4">
            <p className="text-sm font-medium text-[#1a365d]">Əlaqə seçimləri</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Bizimlə əlaqə saxlamaq və ya ünvanı açmaq üçün uyğun kanalı seçin.
            </p>
          </div>

          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-[#00b982]/30 hover:bg-[#f8fffb]"
          >
            <div>
              <div className="text-sm font-semibold text-[#1a365d]">Telefon</div>
              <div className="mt-1 text-xs text-gray-500">{phone}</div>
            </div>
            <Phone className="h-4 w-4 text-[#00b982]" />
          </a>

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-[#00b982]/30 hover:bg-[#f8fffb]"
          >
            <div>
              <div className="text-sm font-semibold text-[#1a365d]">Ünvan</div>
              <div className="mt-1 text-xs text-gray-500">{address}</div>
            </div>
            <MapPin className="h-4 w-4 text-[#00b982]" />
          </a>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-[#00b982]/30 hover:bg-[#f8fffb]"
            >
              <span className="text-sm font-semibold text-[#1a365d]">Telegram</span>
              <Send className="h-4 w-4 text-[#00b982]" />
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-[#00b982]/30 hover:bg-[#f8fffb]"
            >
              <span className="text-sm font-semibold text-[#1a365d]">Instagram</span>
              <ExternalLink className="h-4 w-4 text-[#00b982]" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => openChatMode("contacts")}
            className="flex w-full items-center justify-between rounded-2xl border border-[#1a365d]/15 bg-[#f7fafc] px-4 py-3 text-left transition-colors hover:border-[#1a365d]/30 hover:bg-white"
          >
            <div>
              <div className="text-sm font-semibold text-[#1a365d]">Əlaqə ilə bağlı sual ver</div>
              <div className="mt-1 text-xs text-gray-500">Dr. Dia ilə söhbətə keçin</div>
            </div>
            <MessageCircle className="h-4 w-4 text-[#00b982]" />
          </button>
        </div>
      );
    }

    return renderHomeContent();
  };

  const renderChatContent = () => {
    return (
      <div className="rounded-2xl border border-dashed border-[#00b982]/24 bg-white px-4 py-5">
        <p className="text-sm font-medium text-[#1a365d]">
          {activeChatContent?.title ?? "Dr. Dia ilə söhbət"}
        </p>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {activeChatContent?.body ?? "Sualınızı yazın və Dr. Dia sizə klinika məlumatları üzrə cavab versin."}
        </p>
      </div>
    );
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <div
        className="pointer-events-auto"
        onMouseEnter={() => setIsLauncherHovered(true)}
        onMouseLeave={() => setIsLauncherHovered(false)}
      >
        <AnimatePresence>
          {widgetState.isLauncherOpen ? (
            <>
              <motion.button
                type="button"
                aria-label="Dr. Dia panelini bağla"
                className="fixed inset-0 bg-[#1a365d]/16 backdrop-blur-[1px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
                onClick={closePanel}
              />

              <motion.section
                role="dialog"
                aria-modal="true"
                aria-label="Dr. Dia köməkçi paneli"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
                className={[
                  "fixed inset-x-3 bottom-20 h-[min(82vh,720px)] overflow-hidden rounded-[28px] border border-[#00b982]/14 bg-white shadow-[0_24px_80px_rgba(26,54,93,0.2)]",
                  "sm:inset-x-auto sm:right-6 sm:w-[420px] sm:bottom-24",
                ].join(" ")}
              >
                <div className="flex h-full min-h-0 flex-col">
                  <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00b982]">
                        Dr. Dia
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-[#1a365d]">
                        Rəqəmsal köməkçi
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={closePanel}
                      className="rounded-full border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#1a365d]"
                      aria-label="Paneli bağla"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 touch-pan-y sm:px-6">
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#1a365d]">Tez seçimlər</h4>
                          {activeView !== "home" ? (
                            <button
                              type="button"
                              onClick={resetToHome}
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#00b982]"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                              Geri
                            </button>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {quickActions.map((action) => (
                            <button
                              key={action.id}
                              type="button"
                              onClick={() => handleQuickActionClick(action.id)}
                              className={[
                                "rounded-2xl border px-4 py-3 text-left transition-colors",
                                activeQuickAction === action.id
                                  ? "border-[#00b982]/30 bg-[#f4fffb]"
                                  : "border-gray-200 bg-white hover:border-[#00b982]/20 hover:bg-gray-50",
                              ].join(" ")}
                            >
                              <div className="text-sm font-semibold text-[#1a365d]">{action.label}</div>
                              <div className="mt-1 text-xs leading-5 text-gray-500">{action.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 rounded-[24px] border border-gray-100 bg-[#fbfcfd] p-4">
                        {activeView === "booking" ? (
                          <div>
                            <div className="mb-4 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-[#00b982]" />
                                <h4 className="text-sm font-semibold text-[#1a365d]">Qəbul müraciəti</h4>
                              </div>
                              <button
                                type="button"
                                onClick={resetToHome}
                                className="inline-flex items-center gap-1 text-xs font-medium text-[#00b982]"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Geri
                              </button>
                            </div>

                            <form className="grid grid-cols-1 gap-3" onSubmit={handleBookingSubmit}>
                              <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-gray-600">Həkim və ya xidmət</span>
                                <select
                                  value={bookingForm.doctorOrService}
                                  onChange={(event) => handleBookingFormChange("doctorOrService", event.target.value)}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#00b982]"
                                >
                                  <option value="">Xidmət seçin</option>
                                  {services.map((service) => (
                                    <option key={service.value} value={service.label}>
                                      {service.label}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                  <span className="mb-1.5 block text-xs font-medium text-gray-600">Tarix</span>
                                  <input
                                    type="date"
                                    value={bookingForm.preferredDate}
                                    onChange={(event) => handleBookingFormChange("preferredDate", event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#00b982]"
                                  />
                                </label>
                                <label className="block">
                                  <span className="mb-1.5 block text-xs font-medium text-gray-600">Saat</span>
                                  <input
                                    type="time"
                                    value={bookingForm.preferredTime}
                                    onChange={(event) => handleBookingFormChange("preferredTime", event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#00b982]"
                                  />
                                </label>
                              </div>

                              <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-gray-600">Ad və soyad</span>
                                <input
                                  value={bookingForm.patientName}
                                  onChange={(event) => handleBookingFormChange("patientName", event.target.value)}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#00b982]"
                                  placeholder="Pasiyentin adı"
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-gray-600">Telefon</span>
                                <input
                                  value={bookingForm.phone}
                                  onChange={(event) => handleBookingFormChange("phone", event.target.value)}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#00b982]"
                                  placeholder="+994 ..."
                                />
                              </label>

                              <label className="block">
                                <span className="mb-1.5 block text-xs font-medium text-gray-600">Qeyd</span>
                                <textarea
                                  value={bookingForm.note}
                                  onChange={(event) => handleBookingFormChange("note", event.target.value)}
                                  rows={3}
                                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#00b982]"
                                  placeholder="Əlavə məlumat və ya istək"
                                />
                              </label>

                              {bookingState.status !== "idle" ? (
                                <div
                                  className={`rounded-2xl px-4 py-3 text-xs leading-5 ${
                                    bookingState.status === "success"
                                      ? "border border-green-200 bg-green-50 text-green-700"
                                      : bookingState.status === "error"
                                      ? "border border-red-200 bg-red-50 text-red-700"
                                      : "border border-[#00b982]/20 bg-[#f8fffb] text-gray-600"
                                  }`}
                                >
                                  {bookingState.status === "submitting"
                                    ? "Müraciət göndərilir..."
                                    : bookingState.message}
                                </div>
                              ) : null}

                              <button
                                type="submit"
                                disabled={bookingState.status === "submitting"}
                                className="inline-flex items-center justify-center rounded-xl bg-[#00b982] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00a572] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {bookingState.status === "submitting" ? "Göndərilir..." : "Müraciəti göndər"}
                              </button>
                            </form>
                          </div>
                        ) : activeView === "chat" ? (
                          <div className="space-y-4">
                            <div>
                              <div className="mb-4 flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-[#00b982]" />
                                <h4 className="text-sm font-semibold text-[#1a365d]">Söhbət sahəsi</h4>
                              </div>

                              {renderChatContent()}
                            </div>

                            <BotpressWebchatPanel
                              provider={assistantConfig?.provider ?? { type: "none", isConfigured: false }}
                              chatContext={chatContext}
                              botName="Dr. Dia"
                              botDescription={activeChatContent?.body ?? "Klinika ilə bağlı suallarınızı verə bilərsiniz."}
                            />
                          </div>
                        ) : (
                          <div>
                            {renderLocalViewContent()}
                          </div>
                        )}
                      </div>
                    </div>

                  <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-xs text-gray-500 sm:px-6">
                    <div className="inline-flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[#00b982]" />
                      <span>{phone}</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <UserRound className="h-3.5 w-3.5 text-[#00b982]" />
                      <span>{weekdayHours}</span>
                    </div>
                  </div>
                </div>
              </motion.section>
            </>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showLauncherPreview ? (
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.96 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
              className="absolute bottom-[92px] right-0 hidden w-[280px] sm:block"
            >
              <div className="relative rounded-[24px] border border-[#8eece4]/50 bg-white/95 px-4 py-3 shadow-[0_20px_44px_rgba(20,55,87,0.18)] backdrop-blur-md">
                <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-[#8eece4]/50 bg-white/95" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00b982]">
                  Dr. Dia
                </p>
                <p className="mt-2 text-sm font-semibold leading-5 text-[#1a365d]">
                  {welcomeTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {welcomeText}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleLauncherClick}
          aria-label={launcherConfig.launcherAriaLabel}
          aria-pressed={widgetState.isLauncherOpen}
          title={launcherConfig.launcherLabel}
          data-visual-variant={launcherConfig.visualVariant}
          className={[
            "group relative flex h-[88px] w-[88px] items-center justify-center rounded-full",
            isActive
              ? "shadow-[0_20px_48px_rgba(0,185,130,0.38)]"
              : "shadow-[0_18px_40px_rgba(26,54,93,0.24)]",
            "before:absolute before:inset-[5px] before:rounded-full before:border before:border-white/92 before:content-['']",
            "after:absolute after:inset-[1px] after:rounded-full after:border after:border-[#7fe6df]/75 after:content-['']",
            "outline-none focus-visible:ring-4 focus-visible:ring-[#00b982]/35 focus-visible:ring-offset-2",
            "focus-visible:ring-offset-white",
            "transition-shadow duration-200",
          ].join(" ")}
          onFocus={() => setIsLauncherHovered(true)}
          onBlur={() => setIsLauncherHovered(false)}
          {...buttonMotionProps}
        >
          <motion.span
            className="absolute inset-[6px] rounded-full bg-[radial-gradient(circle,rgba(92,244,230,0.72)_0%,rgba(92,244,230,0.34)_46%,rgba(92,244,230,0)_78%)] blur-lg"
            animate={
              reducedMotion
                ? undefined
                : widgetState.isLauncherOpen
                  ? { scale: 1.08, opacity: 0.92 }
                  : { scale: 1.02, opacity: 1 }
            }
            transition={{ duration: 0.28, ease: "easeOut" }}
            aria-hidden="true"
          />

          <motion.span
            className="absolute inset-[5px] rounded-full border border-[#b9f4ef]/85"
            aria-hidden="true"
            animate={
              reducedMotion
                ? undefined
                : isLauncherHovered
                  ? { borderColor: "rgba(0,185,130,0.82)", opacity: 1 }
                  : { borderColor: "rgba(185,244,239,0.82)", opacity: 0.96 }
            }
            transition={{ duration: 0.22, ease: "easeOut" }}
          />

          <motion.span
            className="absolute inset-[8px] rounded-full bg-[#79efe5]/40 blur-[14px]"
            aria-hidden="true"
            animate={pulseAnimation.animate}
            transition={pulseAnimation.transition}
          />

          <motion.span
            className="absolute left-1/2 top-1/2 h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,84,84,0.56)_0%,rgba(227,29,29,0.26)_48%,rgba(227,29,29,0)_78%)] blur-lg"
            aria-hidden="true"
            animate={
              reducedMotion
                ? undefined
                : {
                    scale: [0.94, 1.24, 0.94],
                    opacity: [0.58, 1, 0.58],
                  }
            }
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.img
            src="/images/assistant-launcher-transparent.png"
            alt=""
            aria-hidden="true"
            className="relative h-full w-full select-none object-contain drop-shadow-[0_16px_34px_rgba(0,185,130,0.26)]"
            animate={
              reducedMotion
                ? undefined
                : {
                    scale: widgetState.isLauncherOpen ? 0.98 : isLauncherHovered ? 1.06 : 1.01,
                    filter: isLauncherHovered
                      ? "drop-shadow(0 20px 34px rgba(79,237,225,0.42))"
                      : "drop-shadow(0 16px 34px rgba(0,185,130,0.26))",
                  }
            }
            transition={{ duration: 0.24, ease: "easeOut" }}
            draggable={false}
          />
        </motion.button>
      </div>
    </div>
  );
}
