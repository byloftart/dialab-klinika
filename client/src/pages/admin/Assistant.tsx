import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";

type AssistantField =
  | {
      key: string;
      label: string;
      type: "switch";
      placeholder?: undefined;
      multiline?: false;
    }
  | {
      key: string;
      label: string;
      type?: "text";
      placeholder: string;
      multiline?: boolean;
    };

type AssistantSection = {
  group: string;
  label: string;
  fields: AssistantField[];
};

const ASSISTANT_SECTIONS: AssistantSection[] = [
  {
    group: "assistant",
    label: "Ümumi ayarlar",
    fields: [
      { key: "assistant.enabled", label: "Widget aktivdir", type: "switch" },
      { key: "assistant.launcherVisible", label: "Launcher görünür", type: "switch" },
      { key: "assistant.welcomeTitle", label: "Welcome başlığı", placeholder: "Salam, mən Dr. Dia." },
      {
        key: "assistant.welcomeText",
        label: "Welcome mətni",
        placeholder: "Qəbul, xidmətlər və əlaqə ilə bağlı sizə istiqamət vermək üçün buradayam.",
        multiline: true,
      },
    ],
  },
  {
    group: "assistant",
    label: "Xarici kanallar",
    fields: [
      { key: "assistant.whatsappUrl", label: "WhatsApp URL", placeholder: "https://wa.me/994..." },
      { key: "assistant.instagramUrl", label: "Instagram URL", placeholder: "https://instagram.com/dialab..." },
      { key: "assistant.telegramUrl", label: "Telegram URL", placeholder: "https://t.me/dialab..." },
    ],
  },
  {
    group: "assistant",
    label: "Booking və mesajlar",
    fields: [
      { key: "assistant.bookingWebhookUrl", label: "Booking webhook URL", placeholder: "https://example.com/webhook" },
      {
        key: "assistant.bookingSuccessMessage",
        label: "Uğurlu göndəriş mətni",
        placeholder: "Müraciətiniz qəbul edildi. Tezliklə sizinlə əlaqə saxlayacağıq.",
        multiline: true,
      },
      {
        key: "assistant.bookingErrorMessage",
        label: "Xəta mətni",
        placeholder: "Müraciət göndərilərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.",
        multiline: true,
      },
    ],
  },
];

function normalizeBooleanValue(value: string | undefined, fallback: boolean) {
  if (value == null || value === "") {
    return fallback;
  }

  return value === "true";
}

export default function AssistantAdminPage() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.admin.settings.list.useQuery(undefined, { retry: false });
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const upsertMutation = trpc.admin.settings.upsert.useMutation({
    onSuccess: () => utils.admin.settings.list.invalidate(),
  });

  useEffect(() => {
    if (!settings) {
      return;
    }

    const nextValues: Record<string, string> = {};
    settings.forEach((setting: { key: string; value: string | null }) => {
      nextValues[setting.key] = setting.value ?? "";
    });
    setValues(nextValues);
  }, [settings]);

  const sections = useMemo(() => ASSISTANT_SECTIONS, []);

  const handleSaveGroup = async (group: string, keys: string[]) => {
    try {
      for (const section of sections.filter((item) => item.group === group)) {
        for (const field of section.fields) {
          if (!keys.includes(field.key)) {
            continue;
          }

          await upsertMutation.mutateAsync({
            key: field.key,
            value: values[field.key] ?? "",
            label: field.label,
            group,
          });
        }
      }

      setSavedSection(keys.join("|"));
      toast.success("Dr. Dia ayarları yadda saxlanıldı");
      setTimeout(() => setSavedSection(null), 2000);
    } catch {
      toast.error("Ayarlar saxlanılarkən xəta baş verdi");
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="Dr. Dia">
        <p className="mb-6 text-sm text-gray-500">
          Widget, kanallar və qəbul müraciətləri üçün əsas ayarları idarə edin.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#00b982]" />
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.label} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00b982]/10">
                      <Bot className="h-4 w-4 text-[#00b982]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#1a365d]">{section.label}</h3>
                  </div>

                  <button
                    onClick={() => handleSaveGroup(section.group, section.fields.map((field) => field.key))}
                    disabled={upsertMutation.isPending}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                      savedSection === section.fields.map((field) => field.key).join("|")
                        ? "bg-green-100 text-green-700"
                        : "bg-[#00b982] text-white hover:bg-[#00a572]"
                    }`}
                  >
                    {savedSection === section.fields.map((field) => field.key).join("|") ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        Saxlanıldı
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        Yadda saxla
                      </>
                    )}
                  </button>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <div key={field.key} className={field.multiline ? "sm:col-span-2" : ""}>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label>

                      {field.type === "switch" ? (
                        <div className="flex min-h-[46px] items-center rounded-xl border border-gray-200 px-4">
                          <Switch
                            checked={normalizeBooleanValue(values[field.key], true)}
                            onCheckedChange={(checked) =>
                              setValues((current) => ({
                                ...current,
                                [field.key]: checked ? "true" : "false",
                              }))
                            }
                          />
                        </div>
                      ) : field.multiline ? (
                        <textarea
                          rows={4}
                          value={values[field.key] ?? ""}
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                        />
                      ) : (
                        <input
                          value={values[field.key] ?? ""}
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
