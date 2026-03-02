import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import { trpc } from '@/lib/trpc';
import { Plus, Trash2, Image, Loader2, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';

type GalleryImage = {
  id: number;
  imageUrl: string;
  titleAz: string | null;
  descriptionAz: string | null;
  category: string | null;
  order: number | null;
  isActive: boolean;
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-[#1a365d]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const CATEGORIES = ['Klinika', 'Laboratoriya', 'Diaqnostika', 'Komanda', 'Avadanlıq', 'Digər'];

export default function Gallery() {
  const utils = trpc.useUtils();
  const { data: images, isLoading } = trpc.admin.gallery.list.useQuery(undefined, { retry: false });

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<GalleryImage | null>(null);
  const [form, setForm] = useState({ imageUrl: '', titleAz: '', descriptionAz: '', category: '', order: 0, isActive: true });
  const [filterCategory, setFilterCategory] = useState('');

  const createMutation = trpc.admin.gallery.create.useMutation({
    onSuccess: () => { utils.admin.gallery.list.invalidate(); setShowAdd(false); setForm({ imageUrl: '', titleAz: '', descriptionAz: '', category: '', order: 0, isActive: true }); },
  });
  const updateMutation = trpc.admin.gallery.update.useMutation({
    onSuccess: () => { utils.admin.gallery.list.invalidate(); setEditItem(null); },
  });
  const deleteMutation = trpc.admin.gallery.delete.useMutation({
    onSuccess: () => utils.admin.gallery.list.invalidate(),
  });

  const openEdit = (img: GalleryImage) => {
    setEditItem(img);
    setForm({ imageUrl: img.imageUrl, titleAz: img.titleAz ?? '', descriptionAz: img.descriptionAz ?? '', category: img.category ?? '', order: img.order ?? 0, isActive: img.isActive });
  };

  const filtered = filterCategory ? (images ?? []).filter(img => img.category === filterCategory) : (images ?? []);

  return (
    <AdminGuard>
      <AdminLayout title="Qalereya">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilterCategory('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterCategory ? 'bg-[#00b982] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Hamısı ({(images ?? []).length})
            </button>
            {CATEGORIES.map(cat => {
              const count = (images ?? []).filter(img => img.category === cat).length;
              if (!count) return null;
              return (
                <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCategory === cat ? 'bg-[#00b982] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat} ({count})
                </button>
              );
            })}
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-[#00b982] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#00a572] transition-colors">
            <Plus className="w-4 h-4" /> Şəkil əlavə et
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#00b982] animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((img) => (
              <div key={img.id} className={`bg-white rounded-2xl border overflow-hidden group hover:shadow-md transition-all ${!img.isActive ? 'opacity-60' : 'border-gray-100'}`}>
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img src={img.imageUrl} alt={img.titleAz ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image'; }} />
                  {!img.isActive && (
                    <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                      <span className="text-white text-xs font-medium bg-gray-800/80 px-2 py-1 rounded-lg">Deaktiv</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(img as GalleryImage)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-[#00b982] hover:text-white transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if (confirm('Bu şəkili silmək istədiyinizə əminsiniz?')) deleteMutation.mutate({ id: img.id }); }} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  {img.titleAz && <p className="text-xs font-semibold text-[#1a365d] truncate">{img.titleAz}</p>}
                  {img.category && <span className="text-xs text-[#00b982] font-medium">{img.category}</span>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Şəkil yoxdur</p>
              </div>
            )}
          </div>
        )}

        {(showAdd || editItem) && (
          <Modal title={editItem ? 'Şəkili redaktə et' : 'Yeni şəkil əlavə et'} onClose={() => { setShowAdd(false); setEditItem(null); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şəkil URL *</label>
                <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" placeholder="https://..." />
                {form.imageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden h-32 bg-gray-100">
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlıq</label>
                <input value={form.titleAz} onChange={e => setForm(f => ({ ...f, titleAz: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" placeholder="Şəkil başlığı..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kateqoriya</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none bg-white">
                  <option value="">Seçin...</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sıra</label>
                  <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" />
                </div>
              </div>
              <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`flex items-center gap-2 text-sm font-medium ${form.isActive ? 'text-[#00b982]' : 'text-gray-400'}`}>
                {form.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {form.isActive ? 'Aktiv' : 'Deaktiv'}
              </button>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { if (editItem) updateMutation.mutate({ id: editItem.id, ...form }); else createMutation.mutate(form); }} disabled={!form.imageUrl} className="flex-1 bg-[#00b982] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#00a572] disabled:opacity-50 transition-colors">
                  {editItem ? 'Yadda saxla' : 'Əlavə et'}
                </button>
                <button onClick={() => { setShowAdd(false); setEditItem(null); }} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Ləğv et</button>
              </div>
            </div>
          </Modal>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
