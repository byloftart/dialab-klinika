import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import ImageUpload from '@/components/admin/ImageUpload';
import { trpc } from '@/lib/trpc';
import { Settings, Loader2, Save, CheckCircle, Image as ImageIcon } from 'lucide-react';

const SETTINGS_SCHEMA = [
  {
    group: 'header',
    label: 'Header və Naviqasiya',
    fields: [
      { key: 'header.logoTitle', label: 'Logo başlıq', placeholder: 'DIALAB' },
      { key: 'header.logoSubtitle', label: 'Logo alt başlıq', placeholder: 'KLİNİKA' },
      { key: 'header.phone', label: 'Header telefon', placeholder: '+994 12 345 67 89' },
      { key: 'header.ctaLabel', label: 'CTA düymə mətni', placeholder: 'Randevu Al' },
      {
        key: 'header.navItems',
        label: 'Naviqasiya JSON',
        placeholder: '[{"id":"hero","label":"Ana Səhifə","href":"#hero"},{"id":"about-page","label":"Səhifə","href":"/pages/about"}]',
        multiline: true,
      },
    ],
  },
  {
    group: 'home',
    label: 'Ana səhifə bölmələri',
    fields: [
      {
        key: 'home.sections',
        label: 'Bölmələrin sırası və görünməsi (JSON)',
        placeholder: '[{"id":"hero","enabled":true},{"id":"infoBar","enabled":true},{"id":"gallery","enabled":true},{"id":"laboratory","enabled":true},{"id":"diagnostics","enabled":true},{"id":"appointment","enabled":true}]',
        multiline: true,
      },
    ],
  },
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
      { key: 'about.eyebrow', label: 'Kiçik başlıq', placeholder: 'Haqqımızda' },
      { key: 'about.title', label: 'Başlıq', placeholder: 'Bizim Hekayəmiz' },
      { key: 'about.text1', label: 'Birinci paraqraf', placeholder: 'Dialab Klinika olaraq...', multiline: true },
      { key: 'about.text2', label: 'İkinci paraqraf', placeholder: 'Komandamız...', multiline: true },
      { key: 'about.stat1Value', label: 'Statistika 1 rəqəm', placeholder: '500+' },
      { key: 'about.stat1Label', label: 'Statistika 1 mətn', placeholder: 'Laboratoriya testləri' },
      { key: 'about.stat2Value', label: 'Statistika 2 rəqəm', placeholder: '50K+' },
      { key: 'about.stat2Label', label: 'Statistika 2 mətn', placeholder: 'Xoşbəxt pasient' },
      { key: 'about.stat3Value', label: 'Statistika 3 rəqəm', placeholder: '15+ il' },
      { key: 'about.stat3Label', label: 'Statistika 3 mətn', placeholder: 'Sahə təcrübəsi' },
      { key: 'about.videoUrl', label: 'Video URL', placeholder: 'MP4/WebM faylı, YouTube və ya Vimeo linki' },
    ],
    imageFields: [
      { key: 'about.media1', label: 'Media 1' },
      { key: 'about.media2', label: 'Media 2' },
      { key: 'about.media3', label: 'Media 3' },
      { key: 'about.media4', label: 'Media 4' },
    ],
  },
  {
    group: 'laboratory',
    label: 'Laboratoriya bölməsi',
    fields: [
      { key: 'laboratory.eyebrow', label: 'Kiçik başlıq', placeholder: 'Laboratoriya Xidmətləri' },
      { key: 'laboratory.title', label: 'Başlıq', placeholder: 'Laboratoriya Xidmətləri' },
      { key: 'laboratory.subtitle', label: 'Alt başlıq', placeholder: 'Geniş spektrli laborator analizlər və dəqiq nəticələr' },
    ],
  },
  {
    group: 'diagnostics',
    label: 'Diaqnostika bölməsi',
    fields: [
      { key: 'diagnostics.eyebrow', label: 'Kiçik başlıq', placeholder: 'Tibbi Diaqnostika' },
      { key: 'diagnostics.title', label: 'Başlıq', placeholder: 'Tibbi Diaqnostika' },
      { key: 'diagnostics.subtitle', label: 'Alt başlıq', placeholder: 'Müasir avadanlıqlarla instrumental diaqnostika' },
    ],
  },
  {
    group: 'infoBar',
    label: 'Info Bar bölməsi',
    fields: [
      { key: 'infoBar.contactsTitle', label: 'Kontakt kart başlığı', placeholder: 'Əlaqə' },
      { key: 'infoBar.appointmentTitle', label: 'Qəbul kart başlığı', placeholder: 'Qəbula Yazıl' },
      { key: 'infoBar.hoursTitle', label: 'Saat kart başlığı', placeholder: 'İş Saatları' },
      { key: 'infoBar.emergencyNote', label: 'Əlavə qeyd', placeholder: 'Təcili hallarda 7/24 xidmət' },
    ],
  },
  {
    group: 'appointment',
    label: 'Məlumat və FAQ bölməsi',
    fields: [
      { key: 'appointment.title', label: 'Bölmə başlığı', placeholder: 'Məlumat' },
      { key: 'appointment.faqTitle', label: 'FAQ başlığı', placeholder: 'Tez-tez Verilən Suallar' },
      { key: 'appointment.faqSubtitle', label: 'FAQ alt başlıq', placeholder: 'Ən çox soruşulan suallar' },
      {
        key: 'appointment.faqItems',
        label: 'FAQ JSON',
        placeholder: '[{"question":"...","answer":"..."}]',
        multiline: true,
      },
    ],
  },
  {
    group: 'feedback',
    label: 'Əks əlaqə forması',
    fields: [
      { key: 'feedback.title', label: 'Form başlığı', placeholder: 'Bizə Yazın' },
      { key: 'feedback.subtitle', label: 'Form alt başlıq', placeholder: 'Suallarınız və təklifləriniz üçün' },
      { key: 'feedback.subjectPlaceholder', label: 'Mövzu placeholder', placeholder: 'Mesajın mövzusu' },
      { key: 'feedback.buttonLabel', label: 'Göndər düyməsi', placeholder: 'Göndər' },
      { key: 'feedback.successTitle', label: 'Uğurlu göndəriş başlığı', placeholder: 'Təşəkkür Edirik!' },
      { key: 'feedback.successText', label: 'Uğurlu göndəriş mətni', placeholder: 'Mesajınız uğurla göndərildi. Tezliklə sizinlə əlaqə saxlayacağıq.' },
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
    const group = key.split('.')[0];
    const fieldDef = SETTINGS_SCHEMA
      .flatMap(section => [...(section.fields ?? []), ...(section.imageFields ?? [])])
      .find(field => field.key === key);
    upsertMutation.mutateAsync({ key, value: url, label: fieldDef?.label, group });
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
                            category={group}
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
