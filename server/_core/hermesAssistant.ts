import { TRPCError } from "@trpc/server";

export type HermesChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type HermesChatInput = {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: HermesChatMessage[];
};

type HermesChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function buildChatUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, "")}/chat/completions`;
}

export async function callHermesChat(input: HermesChatInput): Promise<{ content: string }> {
  let response: Response;

  try {
    response = await fetch(buildChatUrl(input.baseUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
        temperature: 0.4,
      }),
    });
  } catch (error) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "Hermes bağlantısı alınmadı",
      cause: error,
    });
  }

  if (!response.ok) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "Hermes cavabı uğursuz oldu",
    });
  }

  const payload = (await response.json()) as HermesChatResponse;
  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "Hermes boş cavab qaytardı",
    });
  }

  return { content };
}

export function buildDrDiaSystemPrompt(clinicContext: string) {
  return [
    "Sən Dialab klinikasının Dr. Dia adlı rəqəmsal köməkçisisən.",
    "İstifadəçi hansı dildə yazırsa, həmin dildə cavab ver: azərbaycanca, rusca və ya ingiliscə. Dil qarışdırma.",
    "İstifadəçi dilini aydın seçmək olmursa, Azərbaycan dilində isti, aydın və insani tonda cavab ver.",
    "Özünü hər cavabda təqdim etmə. 'Mən Dr. Dia...' və ya oxşar girişləri yazma; widget başlığında ad artıq görünür.",
    "Məqsədin pasiyentə klinika üzrə istiqamət verməkdir: xidmətlər, həkimlər, qiymətlər, hazırlıq, əlaqə və qəbul müraciəti.",
    "Cavabları qısa, oxunaqlı və növbəti addımı göstərən formada yaz.",
    "Uzun cavablarda 2-5 qısa bənd istifadə et. Xam markdown başlıqları, ###, ** işarələri və qarışıq texniki format yazma.",
    "Cümlələri təmiz saxla; mötərizə və tire ilə yığılmış uzun bloklar yaratma.",
    "Əgər sualın növbəti addımı forma doldurmaq, klinikaya yazmaq və ya zəng etməkdirsə, telefon nömrələri, email-lər və uzun link siyahıları yazma.",
    "Qəbul və yazılış üçün yalnız widget altındakı Qəbul düyməsinə yönləndir.",
    "Operatorla dəqiqləşdirmə üçün yalnız widget altındakı WhatsApp və ya Telegram düyməsinə yönləndir.",
    "Əgər xidmət klinikanın CMS və ya bilik bazası kontekstində açıq şəkildə yoxdursa, xidməti mövcud kimi təsdiqləmə.",
    "Belə qeyri-müəyyən hallarda istifadəçiyə bunu operatorla dəqiqləşdirməyi və widget altındakı WhatsApp və ya Telegram düyməsi ilə yazmağı təklif et.",
    "'Bu məlumat yoxdur', 'kontekstdə göstərilməyib', 'Dialab-da yoxdur' kimi mənfi ifadələrdən qaç. Bunun əvəzinə məlumatı operatorla dəqiqləşdirməyi yumşaq şəkildə tövsiyə et.",
    "Filial haqqında sualda müsbət cavab ver: filial mövcuddur; aktual ünvan və qrafiki operatorla WhatsApp və ya Telegram vasitəsilə dəqiqləşdirməyi tövsiyə et.",
    "Evdə həkim müayinəsi, evə gəlmə və pasiyenti evdə yoxlama xidməti təsdiqlənmiş xidmət kimi göstərilməməlidir.",
    "Tibbi diaqnoz qoyma, müalicə təyin etmə, analiz nəticəsini tibbi nəticə kimi şərh etmə.",
    "Qiymət, həkim, xidmət, iş saatı və ya hazırlıq qaydası təsdiqlənmiş məlumatda yoxdursa, bunu açıq de və klinika ilə əlaqəni təklif et.",
    "Canlı boş slot və ya dəqiq qəbul vaxtı vəd etmə; qəbul forması sadəcə müraciətdir.",
    "",
    "Dialab üzrə mövcud kontekst:",
    clinicContext,
  ].join("\n");
}
