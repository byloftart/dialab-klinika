import { useState } from 'react';
import { Link } from 'wouter';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import ImageUpload from '@/components/admin/ImageUpload';
import { trpc } from '@/lib/trpc';
import { FileText, Loader2, Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

type StaticPage = {
  id: number;
  titleAz: string;
  slug: string;
  excerptAz: string | null;
  contentAz: string | null;
  heroImageUrl: string | null;
  order: number | null;
  isPublished: boolean;
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-[#1a365d]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function Pages() {
  const utils = trpc.useUtils();
  const { data: pages, isLoading } = trpc.admin.pages.list.useQuery(undefined, { retry: false });
  const [showAdd, setShowAdd] = useState(false);
  const [editPage, setEditPage] = useState<StaticPage | null>(null);
  const [form, setForm] = useState({
    titleAz: '',
    slug: '',
    excerptAz: '',
    contentAz: '',
    heroImageUrl: '',
    order: 0,
    isPublished: false,
  });

  const createMutation = trpc.admin.pages.create.useMutation({
    onSuccess: () => {
      utils.admin.pages.list.invalidate();
      setShowAdd(false);
      setForm({ titleAz: '', slug: '', excerptAz: '', contentAz: '', heroImageUrl: '', order: 0, isPublished: false });
    },
  });

  const updateMutation = trpc.admin.pages.update.useMutation({
    onSuccess: () => {
      utils.admin.pages.list.invalidate();
      setEditPage(null);
    },
  });

  const deleteMutation = trpc.admin.pages.delete.useMutation({
    onSuccess: () => utils.admin.pages.list.invalidate(),
  });

  const openCreate = () => {
    setForm({ titleAz: '', slug: '', excerptAz: '', contentAz: '', heroImageUrl: '', order: 0, isPublished: false });
    setShowAdd(true);
  };

  const openEdit = (page: StaticPage) => {
    setEditPage(page);
    setForm({
      titleAz: page.titleAz,
      slug: page.slug,
      excerptAz: page.excerptAz ?? '',
      contentAz: page.contentAz ?? '',
      heroImageUrl: page.heroImageUrl ?? '',
      order: page.order ?? 0,
      isPublished: page.isPublished,
    });
  };

  return (
    <AdminGuard>
      <AdminLayout title="Səhifələr">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">Əlavə məzmun səhifələrini idarə edin</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#00b982] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#00a572] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni səhifə
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#00b982] animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {(pages ?? []).map((page) => (
              <div key={page.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00b982]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-[#00b982]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1a365d] text-sm">{page.titleAz}</p>
                  <p className="text-xs text-gray-400 truncate">/pages/{page.slug}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${page.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {page.isPublished ? 'Dərc olunub' : 'Qaralama'}
                </span>
                <div className="flex items-center gap-2">
                  {page.isPublished && (
                    <Link href={`/pages/${page.slug}`} className="text-xs text-[#00b982] hover:underline">
                      Aç
                    </Link>
                  )}
                  <button onClick={() => openEdit(page as StaticPage)} className="p-2 text-gray-400 hover:text-[#00b982] hover:bg-[#00b982]/10 rounded-lg transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Bu səhifəni silmək istədiyinizə əminsiniz?')) deleteMutation.mutate({ id: page.id }); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {(pages ?? []).length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Hələ əlavə səhifə yoxdur</p>
              </div>
            )}
          </div>
        )}

        {(showAdd || editPage) && (
          <Modal title={editPage ? 'Səhifəni redaktə et' : 'Yeni səhifə'} onClose={() => { setShowAdd(false); setEditPage(null); }}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlıq *</label>
                  <input
                    value={form.titleAz}
                    onChange={(e) => setForm((f) => ({ ...f, titleAz: e.target.value, slug: editPage ? f.slug : slugify(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qısa təsvir</label>
                <textarea
                  value={form.excerptAz}
                  onChange={(e) => setForm((f) => ({ ...f, excerptAz: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none resize-none"
                />
              </div>

              <ImageUpload
                label="Hero şəkli"
                currentImage={form.heroImageUrl}
                category="pages"
                onUpload={(url) => setForm((f) => ({ ...f, heroImageUrl: url }))}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">və ya şəkil URL</label>
                <input
                  value={form.heroImageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, heroImageUrl: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Məzmun</label>
                <textarea
                  value={form.contentAz}
                  onChange={(e) => setForm((f) => ({ ...f, contentAz: e.target.value }))}
                  rows={10}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none resize-y"
                  placeholder="Səhifənin əsas mətni..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sıra</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none"
                  />
                </div>
                <button
                  onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
                  className={`flex items-center gap-2 self-end text-sm font-medium ${form.isPublished ? 'text-[#00b982]' : 'text-gray-400'}`}
                >
                  {form.isPublished ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {form.isPublished ? 'Dərc olunub' : 'Qaralama'}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    if (editPage) {
                      updateMutation.mutate({ id: editPage.id, ...form });
                    } else {
                      createMutation.mutate(form);
                    }
                  }}
                  disabled={!form.titleAz || !form.slug || createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-[#00b982] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#00a572] disabled:opacity-50 transition-colors"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 'Saxlanılır...' : editPage ? 'Yadda saxla' : 'Əlavə et'}
                </button>
                <button onClick={() => { setShowAdd(false); setEditPage(null); }} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Ləğv et
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
