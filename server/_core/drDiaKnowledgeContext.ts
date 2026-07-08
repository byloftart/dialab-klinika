import { drDiaKnowledgeBase } from "../../shared/drDiaKnowledgeBase";

type SettingRecord = {
  key: string;
  value: string | null;
};

type RuntimeDoctor = {
  nameAz: string;
  specialtyAz: string;
  experienceYears?: number | null;
};

type BuildKnowledgeContextInput = {
  contactSettings: SettingRecord[];
  hoursSettings: SettingRecord[];
  assistantSettings: SettingRecord[];
  cmsDoctors: RuntimeDoctor[];
};

function buildSettingsMap(settings: SettingRecord[]) {
  return settings.reduce<Record<string, string>>((acc, setting) => {
    if (setting.value != null) {
      acc[setting.key] = setting.value;
    }
    return acc;
  }, {});
}

function formatSetting(settings: Record<string, string>, key: string, label: string) {
  const value = settings[key]?.trim();
  return value ? `${label}: ${value}` : null;
}

function formatDoctors(cmsDoctors: RuntimeDoctor[]) {
  const cmsDoctorKeys = new Set(cmsDoctors.map((doctor) => doctor.nameAz.trim().toLowerCase()));
  const lines = ["Həkimlər:"];

  for (const doctor of drDiaKnowledgeBase.doctors) {
    const isActiveInCms = cmsDoctorKeys.has(doctor.name_az.toLowerCase());
    const status = isActiveInCms ? "CMS-də aktivdir" : "sənədlərdə var, aktivliyi operatorla təsdiqlənməlidir";
    const focus = doctor.public_focus_areas_az.length
      ? ` Əsas istiqamətlər: ${doctor.public_focus_areas_az.slice(0, 4).join("; ")}.`
      : "";
    lines.push(`- ${doctor.name_az}, ${doctor.specialty_az}. Status: ${status}.${focus}`);
  }

  if (cmsDoctors.length) {
    lines.push("CMS-də aktiv görünən həkimlər:");
    for (const doctor of cmsDoctors) {
      lines.push(`- ${doctor.nameAz}, ${doctor.specialtyAz}${doctor.experienceYears ? `, ${doctor.experienceYears} il təcrübə` : ""}`);
    }
  }

  return lines.join("\n");
}

export function buildDrDiaKnowledgeContext(input: BuildKnowledgeContextInput) {
  const contactMap = buildSettingsMap(input.contactSettings);
  const hoursMap = buildSettingsMap(input.hoursSettings);
  const assistantMap = buildSettingsMap(input.assistantSettings);

  const contactLines = [
    formatSetting(contactMap, "contact.phone1", "Telefon"),
    formatSetting(contactMap, "contact.phone2", "Əlavə telefon"),
    formatSetting(contactMap, "contact.whatsapp", "WhatsApp"),
    formatSetting(contactMap, "contact.address", "Ünvan"),
    formatSetting(hoursMap, "hours.weekdays", "Həftəiçi iş saatı"),
    formatSetting(hoursMap, "hours.saturday", "Şənbə iş saatı"),
    formatSetting(hoursMap, "hours.sunday", "Bazar iş saatı"),
    formatSetting(assistantMap, "assistant.whatsappUrl", "WhatsApp linki"),
    formatSetting(assistantMap, "assistant.telegramUrl", "Telegram linki"),
    formatSetting(assistantMap, "assistant.instagramUrl", "Instagram linki"),
  ].filter(Boolean);

  return [
    "Dr. Dia üçün təsdiqlənmiş cavab qaydaları:",
    "- Qəbul və yazılış üçün istifadəçini cavabın altındakı Qəbul düyməsinə yönləndir.",
    "- Operatorla dəqiqləşdirmə üçün cavabın altındakı WhatsApp və ya Telegram düymələrinə yönləndir.",
    "- Birbaşa həkim telefon nömrələrini cavabda yazma.",
    "- Hazırlıq qaydaları üçün ayrıca təsdiqlənmiş sənəd yoxdur; sual konkret hazırlıq tələb edirsə operatora yönləndir.",
    "- Qiymət məlumatı Dr. Dia tərəfindən verilmir. Qiymət suallarında məbləğ yazma və istifadəçini canlı operatora yönləndir.",
    "",
    "Əlaqə, filial və iş saatları:",
    contactLines.length ? contactLines.join("\n") : "Əlaqə məlumatları CMS-də təsdiqlənməlidir.",
    "Filial: hazırkı məlumatda bir filial kimi qəbul edilir; aktual ünvan və qrafik üçün operatorla dəqiqləşdirmə tövsiyə olunur.",
    "",
    "Əsas naviqasiya bölmələri:",
    drDiaKnowledgeBase.navigationSections.map((section) => `- ${section}`).join("\n"),
    "",
    formatDoctors(input.cmsDoctors),
  ].join("\n");
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9а-яё]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function meaningfulTokens(value: string) {
  return normalizeSearchText(value)
    .split(" ")
    .filter((token) => (token.length >= 4 || ["ekq", "eeq", "exo"].includes(token)) && !["qiymeti", "qederdir", "neceye", "neceyedir", "qebul", "analizi", "muayine", "xidmet"].includes(token));
}

const PRICE_ALIASES: Array<{ pattern: RegExp; itemName: string }> = [
  { pattern: /\bekq\b|elektrokardioqram/i, itemName: "Ürəyin elektrokardioqramması" },
  { pattern: /\beeq\b|elektroensef/i, itemName: "Elektroensefoloqramma (EEQ)" },
  { pattern: /\bexo\b|exokardioqraf/i, itemName: "Rəngli ЕХО dopplerokardioqrafiya" },
];

export function findDrDiaPriceMatches(query: string, limit = 3) {
  const normalizedQuery = normalizeSearchText(query);
  const querySubject = normalizedQuery
    .split(" ")
    .filter((token) => ![
      "qiymet",
      "qiymeti",
      "neceye",
      "neceyedir",
      "qederdir",
      "qeder",
      "ne",
      "nedir",
      "nedi",
      "сколько",
      "стоит",
      "цена",
      "стоимость",
      "price",
      "cost",
      "much",
    ].includes(token))
    .join(" ");
  const queryTokens = meaningfulTokens(query);
  if (!queryTokens.length) {
    return [];
  }

  const items = [...drDiaKnowledgeBase.laboratoryPriceItems, ...drDiaKnowledgeBase.diagnosticPriceItems];
  const alias = PRICE_ALIASES.find((candidate) => candidate.pattern.test(query));
  const aliasMatch = alias ? items.find((item) => item.name_az === alias.itemName) : undefined;

  if (aliasMatch) {
    return [aliasMatch];
  }

  const exactMatch = items
    .map((item) => ({ item, name: normalizeSearchText(item.name_az) }))
    .find(({ name }) => name === querySubject || name.startsWith(`${querySubject} `) || normalizedQuery.includes(` ${name} `));

  if (exactMatch) {
    return [exactMatch.item];
  }

  const scored = items
    .map((item) => {
      const name = normalizeSearchText(item.name_az);
      const matchedTokens = queryTokens.filter((token) => name.includes(token));
      return { item, score: matchedTokens.length };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.name_az.length - b.item.name_az.length);

  return scored.slice(0, limit).map(({ item }) => item);
}
