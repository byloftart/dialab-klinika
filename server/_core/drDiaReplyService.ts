import { TRPCError } from "@trpc/server";
import { ENV } from "./env";
import { buildDrDiaKnowledgeContext } from "./drDiaKnowledgeContext";
import { buildDrDiaSystemPrompt, callHermesChat, type HermesChatMessage } from "./hermesAssistant";
import { getDoctors, getSiteSettings } from "../db";

export type DrDiaReplyChannel = "web" | "telegram" | "telegram_mini_app" | "whatsapp";

export type DrDiaReplyMessage = {
  role: "user" | "assistant";
  content: string;
};

type DrDiaReplyContext = {
  entryPoint?: "welcome" | "quick_action" | "telegram" | "telegram_mini_app" | "whatsapp";
  quickActionId?: string | null;
  label?: string;
};

type CreateDrDiaReplyInput = {
  messages: DrDiaReplyMessage[];
  channel: DrDiaReplyChannel;
  context?: DrDiaReplyContext;
};

function buildSettingsMap(settings: Array<{ key: string; value: string | null }>) {
  return settings.reduce<Record<string, string>>((acc, setting) => {
    if (setting.value != null) {
      acc[setting.key] = setting.value;
    }
    return acc;
  }, {});
}

function detectUserLanguage(text: string) {
  const normalized = text.toLowerCase();

  if (/[а-яё]/i.test(text)) {
    return "Russian";
  }

  if (/[əöüğşçı]/i.test(text)) {
    return "Azerbaijani";
  }

  if (/\b(hello|hi|what|which|where|when|how|can|could|do|does|have|need|price|service|doctor|appointment|diagnostic|analysis|test|clinic)\b/.test(normalized)) {
    return "English";
  }

  return "Azerbaijani";
}

function contactPlace(channel: DrDiaReplyChannel, language: string) {
  if (channel === "telegram" || channel === "telegram_mini_app") {
    if (language === "Russian") return "в этом Telegram-чате";
    if (language === "English") return "in this Telegram chat";
    return "bu çatdakı";
  }

  if (channel === "whatsapp") {
    if (language === "Russian") return "в этом WhatsApp-чате";
    if (language === "English") return "in this WhatsApp chat";
    return "bu WhatsApp çatında";
  }

  if (language === "Russian") return "в чате";
  if (language === "English") return "in the chat";
  return "çat daxilində";
}

function bookingHint(language: string, channel: DrDiaReplyChannel) {
  const place = contactPlace(channel, language);

  if (language === "Russian") {
    if (channel === "whatsapp") return `Для записи напишите администратору ${place}.`;
    return `Для записи используйте кнопку Qəbul ${place}.`;
  }

  if (language === "English") {
    if (channel === "whatsapp") return `For booking, write to the administrator ${place}.`;
    return `For booking, use the Qəbul button ${place}.`;
  }

  if (channel === "whatsapp") {
    return `Qəbul üçün administratora ${place} yazın.`;
  }

  return `Qəbul üçün ${place} Qəbul düyməsindən istifadə edin.`;
}

function operatorHint(language: string, channel: DrDiaReplyChannel) {
  const place = contactPlace(channel, language);

  if (language === "Russian") {
    if (channel === "whatsapp") return `Для уточнения у оператора напишите администратору ${place}.`;
    return channel === "telegram" || channel === "telegram_mini_app"
      ? `Для уточнения у оператора используйте кнопку Operator ${place}.`
      : `Для уточнения у оператора используйте кнопки WhatsApp или Telegram ${place}.`;
  }

  if (language === "English") {
    if (channel === "whatsapp") return `To clarify with the operator, write to the administrator ${place}.`;
    return channel === "telegram" || channel === "telegram_mini_app"
      ? `To clarify with the operator, use the Operator button ${place}.`
      : `To clarify with the operator, use the WhatsApp or Telegram buttons ${place}.`;
  }

  if (channel === "whatsapp") {
    return `Operatorla dəqiqləşdirmək üçün administratora ${place} yazın.`;
  }

  return channel === "telegram" || channel === "telegram_mini_app"
    ? `Operatorla dəqiqləşdirmək üçün ${place} Operator düyməsindən istifadə edin.`
    : `Operatorla dəqiqləşdirmək üçün ${place} WhatsApp və ya Telegram düyməsindən istifadə edin.`;
}

function compactContactInstructions(content: string, language: string, channel: DrDiaReplyChannel) {
  const hasContactIntent = /(\+994|\bwhatsapp\b|\btelegram\b|\bemail\b|\bmail\b|телефон|позвон|звон|почт|запис|appointment|book|call|phone|əlaqə|zəng|qəbul)/i.test(content);

  if (!hasContactIntent) {
    return content;
  }

  const cleaned = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) {
        return true;
      }

      return !/(\+?\d[\d\s().-]{7,}|@|https?:\/\/|mailto:|tel:|\bemail\b|\bmail\b|\bphone\b|\bcall\b|телефон|позвон|звон|почт|\bwhatsapp\b|\btelegram\b|zəng|sizə tezliklə kömək|тезликле|soon help)/i.test(line);
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (/(кнопк|button|düym|qəbul|запис|appointment|operator)/i.test(cleaned)) {
    return softenMissingInfoPhrases(cleaned, language, channel);
  }

  const bookingIntent = /(запис|при[её]м|appointment|book|qəbul|randevu)/i.test(content);
  const buttonHint = bookingIntent ? bookingHint(language, channel) : operatorHint(language, channel);

  if (cleaned.includes(buttonHint)) {
    return cleaned;
  }

  return softenMissingInfoPhrases([cleaned, buttonHint].filter(Boolean).join("\n\n"), language, channel);
}

function isHomeVisitQuestion(text: string) {
  return /(осмотр|осмотреть|выезд|домой|на дому|дома|прийти|приходите|home visit|come to my home|at home|visit me|evə gəl|evde|evdə|evdə müayinə|evə çağır)/i.test(text);
}

function buildHomeVisitFallback(language: string, channel: DrDiaReplyChannel) {
  if (language === "Russian") {
    return `Услуга домашнего осмотра не подтверждена в текущей базе клиники. Чтобы уточнить возможность индивидуально, обратитесь к оператору. ${operatorHint(language, channel)}`;
  }

  if (language === "English") {
    return `A home examination service is not confirmed in the current clinic knowledge base. To clarify this individually, contact the operator. ${operatorHint(language, channel)}`;
  }

  return `Evdə müayinə xidməti klinikanın cari məlumat bazasında təsdiqlənmir. Bunu fərdi qaydada dəqiqləşdirmək üçün operatora yazın. ${operatorHint(language, channel)}`;
}

function isReceptionTimeQuestion(text: string) {
  return /(qəbul saat|qebul saat|qəbul.*başlay|qebul.*başlay|при[её]м.*нач|когда.*при[её]м|appointment.*start|reception.*start)/i.test(text);
}

async function buildReceptionTimeAnswer(language: string, channel: DrDiaReplyChannel) {
  const hoursMap = buildSettingsMap(await getSiteSettings("hours"));
  const weekdays = hoursMap["hours.weekdays"]?.trim() || "09:00 - 18:00";
  const saturday = hoursMap["hours.saturday"]?.trim();

  if (language === "Russian") {
    return [
      `Прием ориентируется на график клиники: в будние дни ${weekdays}.`,
      saturday ? `По субботам: ${saturday}.` : null,
      `Для точного времени конкретного врача используйте кнопку Qəbul ${contactPlace(channel, language)}.`,
    ].filter(Boolean).join("\n\n");
  }

  if (language === "English") {
    return [
      `Appointments follow the clinic schedule: weekdays ${weekdays}.`,
      saturday ? `Saturday: ${saturday}.` : null,
      `For a specific doctor's exact time, use the Qəbul button ${contactPlace(channel, language)}.`,
    ].filter(Boolean).join("\n\n");
  }

  return [
    `Qəbul klinikanın iş qrafikinə uyğun aparılır: həftəiçi ${weekdays}.`,
    saturday ? `Şənbə: ${saturday}.` : null,
    `Konkret həkimin dəqiq vaxtı üçün ${contactPlace(channel, language)} Qəbul düyməsindən istifadə edin.`,
  ].filter(Boolean).join("\n\n");
}

function isBranchQuestion(text: string) {
  return /(филиал|филиалы|другие адрес|branch|branches|filial|başqa ünvan|başqa filial)/i.test(text);
}

function buildBranchAnswer(language: string, channel: DrDiaReplyChannel) {
  if (language === "Russian") {
    return `Да, филиал имеется. Чтобы получить актуальный адрес, график и удобный вариант обращения, уточните у оператора. ${operatorHint(language, channel)}`;
  }

  if (language === "English") {
    return `Yes, a branch is available. For the current address, schedule, and the most convenient option, please clarify with the operator. ${operatorHint(language, channel)}`;
  }

  return `Bəli, filial mövcuddur. Aktual ünvan, iş qrafiki və sizin üçün rahat müraciət variantını dəqiqləşdirmək üçün operatora yazın. ${operatorHint(language, channel)}`;
}

function isPreparationQuestion(text: string) {
  return /(подготов|готовит|натощак|голодн|сдач[аеу]|analysis preparation|prepare|fasting|before test|hazırlıq|hazirliq|acqarına|acqarina|analizə.*hazır|analiz.*hazır|müayinəyə.*hazır|müayinə.*hazır)/i.test(text);
}

function buildPreparationFallback(language: string, channel: DrDiaReplyChannel) {
  if (language === "Russian") {
    return `Правила подготовки зависят от конкретного анализа или обследования. В текущей базе Dr. Dia нет отдельного подтвержденного документа по подготовке, поэтому для точной инструкции напишите оператору. ${operatorHint(language, channel)}`;
  }

  if (language === "English") {
    return `Preparation rules depend on the exact test or examination. Dr. Dia does not currently have a separate confirmed preparation document, so please clarify the exact instruction with the operator. ${operatorHint(language, channel)}`;
  }

  return `Hazırlıq qaydası konkret analiz və ya müayinədən asılıdır. Dr. Dia-nın cari bazasında ayrıca təsdiqlənmiş hazırlıq sənədi yoxdur, buna görə dəqiq təlimat üçün operatora yazın. ${operatorHint(language, channel)}`;
}

function isMedicationAdviceQuestion(text: string) {
  return /(какое лекар|что пить|какие таблетки|препарат|дозиров|which medicine|what medicine|what pills|dosage|dərman|hansı dərman|nə içim|ne icim|preparat|doza)/i.test(text);
}

function buildMedicationSafetyFallback(language: string, channel: DrDiaReplyChannel) {
  if (language === "Russian") {
    return `Я не могу подбирать лекарства, дозировку или лечение. Для такой рекомендации нужно обратиться к врачу. ${bookingHint(language, channel)}`;
  }

  if (language === "English") {
    return `I cannot choose medicines, dosage, or treatment. A doctor should make that recommendation. ${bookingHint(language, channel)}`;
  }

  return `Dərman, doza və ya müalicə seçimi barədə məsləhət verə bilmirəm. Bu qərarı həkim verməlidir. ${bookingHint(language, channel)}`;
}

function isUnavailableServiceQuestion(text: string) {
  return /\b(mrt|mri|кт|kt|tomoqraf\w*|rentgen\w*|рентген\w*|stomatolog\w*|стоматолог\w*|diş həkimi)\b/i.test(text);
}

function buildUnavailableServiceFallback(language: string, channel: DrDiaReplyChannel) {
  if (language === "Russian") {
    return `Эта услуга не подтверждена в текущей базе Dr. Dia. Чтобы уточнить возможность, напишите оператору. ${operatorHint(language, channel)}`;
  }

  if (language === "English") {
    return `This service is not confirmed in the current Dr. Dia knowledge base. To clarify availability, contact the operator. ${operatorHint(language, channel)}`;
  }

  return `Bu xidmət Dr. Dia-nın cari bazasında təsdiqlənmir. Mövcudluğu dəqiqləşdirmək üçün operatora yazın. ${operatorHint(language, channel)}`;
}

function isPriceQuestion(text: string) {
  return /(qiymət|qiymeti|neçəyə|neceye|nə qədər|ne qeder|стоим|цена|сколько стоит|price|cost|how much)/i.test(text);
}

function buildPriceAnswer(text: string, language: string, channel: DrDiaReplyChannel) {
  if (language === "Russian") {
    return `Информацию по ценам уточняет живой оператор. Напишите оператору через WhatsApp или Telegram, и вам подскажут актуальную стоимость. ${operatorHint(language, channel)}`;
  }

  if (language === "English") {
    return `Price information is clarified by a live operator. Message the operator via WhatsApp or Telegram, and they will confirm the current cost. ${operatorHint(language, channel)}`;
  }

  return `Qiymət məlumatını canlı operator dəqiqləşdirir. WhatsApp və ya Telegram vasitəsilə operatora yazın, aktual qiyməti sizə bildirsinlər. ${operatorHint(language, channel)}`;
}

function softenMissingInfoPhrases(content: string, language: string, channel: DrDiaReplyChannel) {
  if (!/(нет|не указан|не указана|не представлены|не найден|yoxdur|göstərilməyib|mövcud kontekst|not available|not provided|not found)/i.test(content)) {
    return content;
  }

  const cleaned = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/(нет|не указан|не указана|не представлены|не найден|yoxdur|göstərilməyib|mövcud kontekst|not available|not provided|not found)/i.test(line))
    .join("\n")
    .trim();

  return [cleaned, operatorHint(language, channel)].filter(Boolean).join("\n\n");
}

function cleanAssistantFormatting(content: string, language: string, channel: DrDiaReplyChannel) {
  let cleaned = content
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,!?;:])/g, "$1$2")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (channel === "telegram_mini_app" || channel === "telegram") {
    cleaned = cleaned
      .replace(/кнопк[ау]\s+["«]?Запись["»]?/gi, "кнопку Qəbul")
      .replace(/кнопк[ау]\s+["«]?При[её]м["»]?/gi, "кнопку Qəbul")
      .replace(/кнопк[ау]\s+["«]?Оператор["»]?/gi, "кнопку Operator");
  }

  if (language === "Russian") {
    cleaned = cleaned
      .replace(/\bDialab\b/g, "Dialab")
      .replace(/\bDr\. Dia\b/g, "Dr. Dia");
  }

  return cleaned;
}

async function buildDrDiaClinicContext() {
  const [
    contactSettings,
    hoursSettings,
    assistantSettings,
    doctors,
  ] = await Promise.all([
    getSiteSettings("contact"),
    getSiteSettings("hours"),
    getSiteSettings("assistant"),
    getDoctors(true),
  ]);

  return buildDrDiaKnowledgeContext({
    contactSettings,
    hoursSettings,
    assistantSettings,
    cmsDoctors: doctors,
  });
}

function buildContextHint(context: DrDiaReplyContext | undefined, channel: DrDiaReplyChannel) {
  if (context?.label) {
    const source = channel === "telegram"
      ? "Telegram"
      : channel === "telegram_mini_app"
        ? "Telegram Mini App"
        : channel === "whatsapp"
          ? "WhatsApp"
        : "widget";
    return `İstifadəçi ${source}-da "${context.label}" istiqamətindən gəlib.`;
  }

  return channel === "telegram"
    ? "İstifadəçi Telegram Dr. Dia söhbətindən gəlib."
    : channel === "telegram_mini_app"
      ? "İstifadəçi Telegram Mini App daxilində Dr. Dia söhbətindən gəlib."
      : channel === "whatsapp"
        ? "İstifadəçi WhatsApp Dr. Dia söhbətindən gəlib."
      : "İstifadəçi ümumi Dr. Dia söhbətindən gəlib.";
}

export async function createDrDiaReply(input: CreateDrDiaReplyInput): Promise<{ content: string }> {
  if (ENV.assistantProvider !== "hermes" || !ENV.hermesApiBaseUrl || !ENV.hermesApiKey) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Hermes aktiv deyil",
    });
  }

  const clinicContext = await buildDrDiaClinicContext();
  const lastUserMessage = [...input.messages].reverse().find((message) => message.role === "user");
  const userLanguage = detectUserLanguage(lastUserMessage?.content ?? "");

  if (lastUserMessage && isHomeVisitQuestion(lastUserMessage.content)) {
    return { content: buildHomeVisitFallback(userLanguage, input.channel) };
  }

  if (lastUserMessage && isReceptionTimeQuestion(lastUserMessage.content)) {
    return { content: await buildReceptionTimeAnswer(userLanguage, input.channel) };
  }

  if (lastUserMessage && isBranchQuestion(lastUserMessage.content)) {
    return { content: buildBranchAnswer(userLanguage, input.channel) };
  }

  if (lastUserMessage && isPreparationQuestion(lastUserMessage.content)) {
    return { content: buildPreparationFallback(userLanguage, input.channel) };
  }

  if (lastUserMessage && isMedicationAdviceQuestion(lastUserMessage.content)) {
    return { content: buildMedicationSafetyFallback(userLanguage, input.channel) };
  }

  if (lastUserMessage && isUnavailableServiceQuestion(lastUserMessage.content)) {
    return { content: buildUnavailableServiceFallback(userLanguage, input.channel) };
  }

  if (lastUserMessage && isPriceQuestion(lastUserMessage.content)) {
    return { content: buildPriceAnswer(lastUserMessage.content, userLanguage, input.channel) };
  }

  const recentMessages = input.messages.slice(-18);
  const messages: HermesChatMessage[] = [
    {
      role: "system",
      content: [
        buildDrDiaSystemPrompt(clinicContext),
        "",
        `Cari söhbət konteksti: ${buildContextHint(input.context, input.channel)}`,
        `Son istifadəçi mesajının dili: ${userLanguage}. Bu cavabı yalnız ${userLanguage} dilində yaz.`,
        "Cavabda Markdown formatından istifadə etmə: **qalın**, __vurğu__, başlıq işarələri və dekorativ ulduzlar yazma.",
        "İstifadəçinin dili Russian-dirsə, cavab təbii və savadlı rus dili ilə yazılmalıdır; interfeys düymələrinin adlarını isə dəyişmə: Qəbul, Operator, Chat.",
      ].join("\n"),
    },
    ...recentMessages,
  ];

  const response = await callHermesChat({
    baseUrl: ENV.hermesApiBaseUrl,
    apiKey: ENV.hermesApiKey,
    model: ENV.hermesModel,
    messages,
  });

  return {
    content: cleanAssistantFormatting(
      compactContactInstructions(softenMissingInfoPhrases(response.content, userLanguage, input.channel), userLanguage, input.channel),
      userLanguage,
      input.channel
    ),
  };
}
