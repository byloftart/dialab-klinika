import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import ImageUpload from '@/components/admin/ImageUpload';
import { trpc } from '@/lib/trpc';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  ToggleLeft,
  ToggleRight,
  UserCircle,
  MessageCircle,
  Send,
  Instagram,
} from 'lucide-react';

type Doctor = {
  id: number;
  nameAz: string;
  specialtyAz: string;
  bioAz: string | null;
  photoUrl: string | null;
  whatsappUrl?: string | null;
  telegramUrl?: string | null;
  instagramUrl?: string | null;
  experienceYears: number | null;
  order: number | null;
  isActive: boolean;
};

type DoctorForm = {
  nameAz: string;
  specialtyAz: string;
  bioAz: string;
  photoUrl: string;
  whatsappUrl: string;
  telegramUrl: string;
  instagramUrl: string;
  experienceYears: number;
  order: number;
  isActive: boolean;
};

const emptyForm: DoctorForm = {
  nameAz: '',
  specialtyAz: '',
  bioAz: '',
  photoUrl: '',
  whatsappUrl: '',
  telegramUrl: '',
  instagramUrl: '',
  experienceYears: 0,
  order: 0,
  isActive: true,
};

function getDoctorDisplayName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h3 className="text-lg font-bold text-[#1a365d]">{title}</h3>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-gray-400 transition-colors hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Doctors() {
  const utils = trpc.useUtils();
  const { data: doctors, isLoading } = trpc.admin.doctors.list.useQuery(undefined, { retry: false });

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Doctor | null>(null);
  const [form, setForm] = useState<DoctorForm>(emptyForm);

  const activeCount = useMemo(
    () => (doctors ?? []).filter((doctor) => doctor.isActive).length,
    [doctors]
  );

  const resetState = () => {
    setShowAdd(false);
    setEditItem(null);
    setForm(emptyForm);
  };

  const createMutation = trpc.admin.doctors.create.useMutation({
    onSuccess: async () => {
      await utils.admin.doctors.list.invalidate();
      resetState();
    },
  });

  const updateMutation = trpc.admin.doctors.update.useMutation({
    onSuccess: async () => {
      await utils.admin.doctors.list.invalidate();
      resetState();
    },
  });

  const deleteMutation = trpc.admin.doctors.delete.useMutation({
    onSuccess: () => utils.admin.doctors.list.invalidate(),
  });

  const seedCatalogMutation = trpc.admin.doctors.seedCatalog.useMutation({
    onSuccess: async () => {
      await utils.admin.doctors.list.invalidate();
    },
  });

  useEffect(() => {
    if (isLoading) return;
    if ((doctors?.length ?? 0) > 0) return;
    if (seedCatalogMutation.isPending || seedCatalogMutation.isSuccess) return;

    seedCatalogMutation.mutate();
  }, [doctors?.length, isLoading, seedCatalogMutation]);

  const openCreate = () => {
    setForm({
      ...emptyForm,
      order: doctors?.length ?? 0,
    });
    setShowAdd(true);
  };

  const openEdit = (doctor: Doctor) => {
    setEditItem(doctor);
    setForm({
      nameAz: doctor.nameAz,
      specialtyAz: doctor.specialtyAz,
      bioAz: doctor.bioAz ?? '',
      photoUrl: doctor.photoUrl ?? '',
      whatsappUrl: doctor.whatsappUrl ?? '',
      telegramUrl: doctor.telegramUrl ?? '',
      instagramUrl: doctor.instagramUrl ?? '',
      experienceYears: doctor.experienceYears ?? 0,
      order: doctor.order ?? 0,
      isActive: doctor.isActive,
    });
  };

  const handleSubmit = () => {
    if (!form.nameAz.trim() || !form.specialtyAz.trim()) return;

    const payload = {
      nameAz: form.nameAz.trim(),
      specialtyAz: form.specialtyAz.trim(),
      bioAz: form.bioAz.trim() || undefined,
      photoUrl: form.photoUrl.trim() || undefined,
      whatsappUrl: form.whatsappUrl.trim() || undefined,
      telegramUrl: form.telegramUrl.trim() || undefined,
      instagramUrl: form.instagramUrl.trim() || undefined,
      experienceYears: Number.isFinite(form.experienceYears) ? form.experienceYears : 0,
      order: Number.isFinite(form.order) ? form.order : 0,
      isActive: form.isActive,
    };

    if (editItem) {
      updateMutation.mutate({ id: editItem.id, ...payload });
      return;
    }

    createMutation.mutate(payload);
  };

  return (
    <AdminGuard>
      <AdminLayout title="Həkimlər">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-gray-500">Həkim kartlarını tam idarə edin</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Ümumi həkim</div>
                <div className="mt-1 text-2xl font-bold text-[#1a365d]">{doctors?.length ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Aktiv kartlar</div>
                <div className="mt-1 text-2xl font-bold text-[#00b982]">{activeCount}</div>
              </div>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00b982] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00a572]"
          >
            <Plus className="h-4 w-4" />
            Yeni həkim əlavə et
          </button>
        </div>

        {(doctors?.length ?? 0) === 0 ? (
          <div className="mb-6 rounded-2xl border border-[#00b982]/15 bg-[#f5fffa] p-4 text-sm text-[#245b4f]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                {seedCatalogMutation.isPending
                  ? 'İlkin 10 həkim kartı CMS-ə əlavə olunur...'
                  : 'Bazadakı həkim kartları görünmürsə, onları bir kliklə yenidən doldura bilərsiniz.'}
              </div>
              <button
                onClick={() => seedCatalogMutation.mutate()}
                disabled={seedCatalogMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl border border-[#00b982]/25 bg-white px-4 py-2 font-semibold text-[#00b982] transition-colors hover:bg-[#ecfdf5] disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                İlkin 10 həkimi doldur
              </button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#00b982]" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(doctors ?? []).map((doctor) => (
              <article
                key={doctor.id}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-gray-100">
                  {doctor.photoUrl ? (
                    <img
                      src={doctor.photoUrl}
                      alt={doctor.nameAz}
                      className="h-full w-full bg-white object-contain object-top p-3"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserCircle className="h-20 w-20 text-gray-300" />
                    </div>
                  )}

                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1a365d] backdrop-blur-md">
                    Sıra: {doctor.order ?? 0}
                  </div>

                  <div className="absolute right-3 top-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        doctor.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {doctor.isActive ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-bold text-[#1a365d]">{doctor.nameAz}</h3>
                  <p className="mt-1 text-sm font-medium text-[#00b982]">{doctor.specialtyAz}</p>
                  {doctor.experienceYears ? (
                    <p className="mt-2 text-xs text-gray-400">{doctor.experienceYears} il təcrübə</p>
                  ) : null}
                  {doctor.bioAz ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">{doctor.bioAz}</p>
                  ) : (
                    <p className="mt-3 text-sm text-gray-400">Bio əlavə edilməyib</p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {doctor.whatsappUrl ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-medium text-[#00b982]">
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </span>
                    ) : null}
                    {doctor.telegramUrl ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eef6ff] px-2.5 py-1 text-xs font-medium text-[#2563eb]">
                        <Send className="h-3.5 w-3.5" />
                        Telegram
                      </span>
                    ) : null}
                    {doctor.instagramUrl ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1f8] px-2.5 py-1 text-xs font-medium text-[#db2777]">
                        <Instagram className="h-3.5 w-3.5" />
                        Instagram
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => openEdit(doctor as Doctor)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition-all hover:border-[#00b982] hover:text-[#00b982]"
                    >
                      <Pencil className="h-4 w-4" />
                      Redaktə et
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Bu həkim kartını silmək istədiyinizə əminsiniz?')) {
                          deleteMutation.mutate({ id: doctor.id });
                        }
                      }}
                      className="rounded-xl border border-gray-200 p-2.5 text-gray-400 transition-all hover:border-red-300 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {(doctors ?? []).length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-400">
                <Users className="mx-auto mb-3 h-12 w-12 opacity-30" />
                <p>Hələ həkim əlavə edilməyib</p>
              </div>
            )}
          </div>
        )}

        {(showAdd || editItem) && (
          <Modal
            title={editItem ? 'Həkim kartını redaktə et' : 'Yeni həkim kartı yarat'}
            onClose={resetState}
          >
            <div className="grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <div className="rounded-3xl border border-gray-100 bg-[#f8fbfa] p-5">
                  <ImageUpload
                    label="Həkim fotosunu yüklə"
                    currentImage={form.photoUrl}
                    category="doctors"
                    previewMode="doctor"
                    onUpload={(url) => setForm((current) => ({ ...current, photoUrl: url }))}
                  />
                  <div className="mt-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700">və ya foto URL</label>
                    <input
                      value={form.photoUrl}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, photoUrl: event.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Ad və soyad *</label>
                    <input
                      value={form.nameAz}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, nameAz: event.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                      placeholder="məs. Nəsibova Afaq"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">İxtisas *</label>
                    <input
                      value={form.specialtyAz}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, specialtyAz: event.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                      placeholder="məs. Həkim-kardioloq"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Təcrübə (il)</label>
                    <input
                      type="number"
                      value={form.experienceYears}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          experienceYears: Number(event.target.value) || 0,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Sıra</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, order: Number(event.target.value) || 0 }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Qısa bio / təsvir</label>
                  <textarea
                    value={form.bioAz}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, bioAz: event.target.value }))
                    }
                    rows={5}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                    placeholder="Həkim haqqında qısa məlumat..."
                  />
                </div>

                <div className="rounded-3xl border border-gray-100 bg-[#fafdfb] p-5">
                  <div className="mb-4 text-sm font-semibold text-[#1a365d]">Sosial şəbəkə və əlaqə linkləri</div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
                      <input
                        value={form.whatsappUrl}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, whatsappUrl: event.target.value }))
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                        placeholder="https://wa.me/..."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Telegram</label>
                      <input
                        value={form.telegramUrl}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, telegramUrl: event.target.value }))
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                        placeholder="https://t.me/..."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Instagram</label>
                      <input
                        value={form.instagramUrl}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, instagramUrl: event.target.value }))
                        }
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !form.nameAz.trim() ||
                      !form.specialtyAz.trim() ||
                      createMutation.isPending ||
                      updateMutation.isPending
                    }
                    className="flex-1 rounded-xl bg-[#00b982] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00a572] disabled:opacity-50"
                  >
                    {editItem ? 'Dəyişiklikləri yadda saxla' : 'Həkim əlavə et'}
                  </button>
                  <button
                    onClick={resetState}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Ləğv et
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Live Preview
                    </div>
                    <button
                      onClick={() => setForm((current) => ({ ...current, isActive: !current.isActive }))}
                      className={`inline-flex items-center gap-2 text-sm font-medium ${
                        form.isActive ? 'text-[#00b982]' : 'text-gray-400'
                      }`}
                    >
                      {form.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      {form.isActive ? 'Aktiv' : 'Deaktiv'}
                    </button>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[30px] border border-gray-100 bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_100%)] shadow-[0_22px_55px_-34px_rgba(15,31,53,0.28)]">
                    <div className="px-4 pt-4">
                      <div className="relative h-[320px] overflow-hidden rounded-[24px] border border-[#d9e7df] bg-[linear-gradient(180deg,#f8fcfa_0%,#eef6f2_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-14 bg-[linear-gradient(180deg,rgba(255,255,255,0.65)_0%,rgba(255,255,255,0)_100%)]" />
                        {form.photoUrl ? (
                          <img
                            src={form.photoUrl}
                            alt={form.nameAz || 'Həkim'}
                            className="h-full w-full bg-white object-contain object-top p-4"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#eff8f4] via-white to-[#eef5fb]">
                            <UserCircle className="h-20 w-20 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between px-6 pb-6 pt-5">
                      <div>
                        <h3 className="text-xl font-bold leading-tight text-[#173255]">
                          {getDoctorDisplayName(form.nameAz) || 'Həkim adı'}
                        </h3>
                        <p className="mt-2 text-sm font-medium leading-6 text-[#00b982]">
                          {form.specialtyAz || 'İxtisas'}
                        </p>
                        {form.bioAz ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
                            {form.bioAz}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm text-gray-400">
                            Bio əlavə ediləndə burada görünəcək.
                          </p>
                        )}
                      </div>
                    </div>

                      <div className="mt-5 border-t border-[#edf3ef] pt-4">
                        <div className="flex items-center justify-start">
                          <div className="relative inline-flex items-center gap-2">
                            {[form.whatsappUrl, form.telegramUrl, form.instagramUrl].map((link, index) => {
                              const Icon = index === 0 ? MessageCircle : index === 1 ? Send : Instagram;
                              const color =
                                index === 0
                                  ? 'text-[#00b982]'
                                  : index === 1
                                  ? 'text-[#2563eb]'
                                  : 'text-[#db2777]';

                              return (
                                <div
                                  key={`${index}-${link || 'empty'}`}
                                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9eae1] bg-white shadow-[0_12px_22px_-18px_rgba(15,31,53,0.25)] ${color} ${
                                    link ? 'opacity-100' : 'opacity-35'
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                              );
                            })}

                            <div className="ml-1 mb-1 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#00b982] text-white shadow-[0_18px_30px_-18px_rgba(0,185,130,0.62)]">
                              <Plus className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-[#fafdfb] p-5 text-sm text-gray-500">
                  Bu preview sayt kartına yaxın görünüş verir:
                  foto, iki sözlük ad, ixtisas, aktiv status və sosial ikonlar
                  yadda saxlamadan əvvəl burada yoxlanıla bilər.
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
