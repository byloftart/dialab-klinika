export type AssistantProvider =
  | {
      type: "none";
      isConfigured: false;
    }
  | {
      type: "hermes";
      isConfigured: true;
      model: string;
    }
  | {
      type: "botpress";
      isConfigured: true;
      clientId: string;
      apiUrl?: string;
      additionalStylesheetUrl?: string;
    };

export type AssistantChatContext = {
  entryPoint: "welcome" | "quick_action";
  quickActionId?: string | null;
  label?: string;
};

export type AssistantChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type BookingSubmissionPayload = {
  doctor_or_service: string;
  preferred_date?: string;
  preferred_time?: string;
  patient_name: string;
  phone: string;
  note?: string;
};

export function parseBooleanSetting(value: string | undefined, fallback: boolean) {
  if (value == null || value === "") {
    return fallback;
  }

  return value === "true";
}
