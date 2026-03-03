import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import ImageUpload from '@/components/admin/ImageUpload';
import { trpc } from '@/lib/trpc';
import { Settings, Loader2, Save, CheckCircle, Image as ImageIcon } from 'lucide-react';

const SETTINGS_SCHEMA = [
  {
    group: 'contact',
    label: 'Əlaqə məlumatları',
    fields: [
      { key: 'contact.address', label: 'Ünvan', placeholder: 'Bakı, Nəsimi rayonu, Atatürk prospekti 45' },
      { key: 'contact.phone1', label: 'Telefon 1', placeholder: '+994 12 345 67 89' },
      { key: 'contact.phone2', label: 'Telefon 2', placeholder: '+994 50 123 45 67' },
      { key: 'contact.email', label: 'E-mail', placeholder: 'info@dialab.az' },
      { key: 'contact.whatsapp', label: 'WhatsApp', placeholder: '+994501234567' },
    ],
  },
  {
    group: 'hours',
    label: 'İş saatları',
    fields: [
      { key: 'hours.weekdays', label: 'Bazar ertəsi – Cümə', placeholder: '08:00 – 18:00' },
      { key: 'hours.saturday', label: 'Şənbə', placeholder: '09:00 – 15:00' },
      { key: 'hours.sunday', label: 'Bazar', placeholder: 'Bağlı' },
    ],
  },
  {
    group: 'hero',
    label: 'Hero bölməsi',
    fields: [
      { key: 'hero.badge', label: 'Badge mətni', placeholder: 'DIALAB TİBB MƏRKƏZİ' },
      { key: 'hero.title1', label: 'Başlıq sətri 1', placeholder: 'Sağlamlığınız —' },
      { key: 'hero.title2', label: 'Başlıq sətri 2 (qalın)', placeholder: 'Bizim Prioritet' },
      { key: 'hero.subtitle', label: 'Alt başlıq', placeholder: '500+ növ laboratoriya testi...' },
    ],
    imageFields: [
      { key: 'hero.slide1', label: 'Slayd 1 Şəkili' },
      { key: 'hero.slide2', label: 'Slayd 2 Şəkili' },
      { key: 'hero.slide3', label: 'Slayd 3 Şəkili' },
    ],
  },
  {
    group: 'about',
    label: 'Haqqımızda bölməsi',
    fields: [
      { key: 'about.title', label: 'Başlıq', placeholder: 'Bizim Hekayəmiz' },
      { key: 'about.text1', label: 'Birinci paraqraf', placeholder: 'Dialab Klinika olaraq...', multiline: true },
      { key: 'about.text2', label: 'İkinci paraqraf', placeholder: 'Komandamız...', multiline: true },
      { key: 'about.stat1', label: 'Statistika 1 (rəqəm)', placeholder: '500+' },
      { key: 'about.stat2', label: 'Statistika 2 (rəqəm)', placeholder: '50K+' },
      { key: 'about.stat3', label: 'Statistika 3 (rəqəm)', placeholder: '15+ il' },
    ],
  },
  {
    group: 'social',
    label: 'Sosial şəbəkələr',
    fields: [
      { key: 'social.instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/dialab' },
      { key: 'social.facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/dialab' },
      { key: 'social.youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@dialab' },
    ],
  },
];

export default function SiteSettings() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.admin.settings.list.useQuery(undefined, { retry: false });
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const upsertMutation = trpc.admin.settings.upsert.useMutation({
    onSuccess: () => utils.admin.settings.list.invalidate(),
  });

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s: any) => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [settings]);

  const handleSaveGroup = async (group: string, fields: { key: string; label: string }[]) => {
    for (const field of fields) {
      if (values[field.key] !== undefined) {
        await upsertMutation.mutateAsync({ key: field.key, value: values[field.key], label: field.label, group });
      }
    }
    setSaved(group);
    setTimeout(() => setSaved(null), 2000);
  };

  const handleImageUpload = (key: string, url: string) => {
    setValues(v => ({ ...v, [key]: url }));
    // Автосохранение после загрузки
    const group = key.split('.')[0];
    const label = SETTINGS_SCHEMA.find(s => s.group === group)?.label || '';
    upsertMutation.mutateAsync({ key, value: url, label, group });
  };

  return (
    <AdminGuard>
      <AdminLayout title="Tənzimləmələr">
        <p className="text-sm text-gray-500 mb-6">Saytın əsas məlumatlarını idarə edin</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#00b982] animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            {SETTINGS_SCHEMA.map(({ group, label, fields, imageFields }: any) => (
              <div key={group} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#00b982]/10 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-[#00b982]" />
                    </div>
                    <h3 className="font-bold text-[#1a365d] text-sm">{label}</h3>
                  </div>
                  <button
                    onClick={() => handleSaveGroup(group, fields)}
                    disabled={upsertMutation.isPending}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${saved === group ? 'bg-green-100 text-green-700' : 'bg-[#00b982] text-white hover:bg-[#00a572]'}`}
                  >
                    {saved === group ? <><CheckCircle className="w-3.5 h-3.5" /> Saxlanıldı</> : <><Save className="w-3.5 h-3.5" /> Yadda saxla</>}
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Text Fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {fields.map((field: any) => (
                      <div key={field.key} className={field.multiline ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                        {field.multiline ? (
                          <textarea
                            value={values[field.key] ?? ''}
                            onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none resize-none"
                            placeholder={field.placeholder}
                          />
                        ) : (
                          <input
                            value={values[field.key] ?? ''}
                            onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none"
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Image Upload Fields */}
                  {imageFields && (
                    <div className="border-t border-gray-100 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="w-4 h-4 text-[#00b982]" />
                        <h4 className="font-semibold text-sm text-gray-700">Şəkillər</h4>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        {imageFields.map((field: any) => (
                          <ImageUpload
                            key={field.key}
                            label={field.label}
                            currentImage={values[field.key]}
                            onUpload={(url) => handleImageUpload(field.key, url)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
