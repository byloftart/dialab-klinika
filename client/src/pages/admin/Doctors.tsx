import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import { trpc } from '@/lib/trpc';
import { Plus, Pencil, Trash2, Users, Loader2, ToggleLeft, ToggleRight, UserCircle } from 'lucide-react';

type Doctor = {
  id: number;
  nameAz: string;
  specialtyAz: string;
  bioAz: string | null;
  photoUrl: string | null;
  experienceYears: number | null;
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

export default function Doctors() {
  const utils = trpc.useUtils();
  const { data: doctors, isLoading } = trpc.admin.doctors.list.useQuery(undefined, { retry: false });

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Doctor | null>(null);
  const [form, setForm] = useState({ nameAz: '', specialtyAz: '', bioAz: '', photoUrl: '', experienceYears: 0, order: 0, isActive: true });

  const createMutation = trpc.admin.doctors.create.useMutation({
    onSuccess: () => { utils.admin.doctors.list.invalidate(); setShowAdd(false); setForm({ nameAz: '', specialtyAz: '', bioAz: '', photoUrl: '', experienceYears: 0, order: 0, isActive: true }); },
  });
  const updateMutation = trpc.admin.doctors.update.useMutation({
    onSuccess: () => { utils.admin.doctors.list.invalidate(); setEditItem(null); },
  });
  const deleteMutation = trpc.admin.doctors.delete.useMutation({
    onSuccess: () => utils.admin.doctors.list.invalidate(),
  });

  const openEdit = (doc: Doctor) => {
    setEditItem(doc);
    setForm({ nameAz: doc.nameAz, specialtyAz: doc.specialtyAz, bioAz: doc.bioAz ?? '', photoUrl: doc.photoUrl ?? '', experienceYears: doc.experienceYears ?? 0, order: doc.order ?? 0, isActive: doc.isActive });
  };

  return (
    <AdminGuard>
      <AdminLayout title="Həkimlər">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">Klinika komandası</p>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-[#00b982] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#00a572] transition-colors">
            <Plus className="w-4 h-4" /> Həkim əlavə et
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#00b982] animate-spin" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(doctors ?? []).map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {doc.photoUrl ? (
                    <img src={doc.photoUrl} alt={doc.nameAz} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircle className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {doc.isActive ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#1a365d] text-sm">{doc.nameAz}</h3>
                  <p className="text-xs text-[#00b982] font-medium mt-0.5">{doc.specialtyAz}</p>
                  {doc.experienceYears ? <p className="text-xs text-gray-400 mt-1">{doc.experienceYears} il təcrübə</p> : null}
                  {doc.bioAz && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{doc.bioAz}</p>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEdit(doc as Doctor)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-[#00b982] hover:text-[#00b982] transition-all">
                      <Pencil className="w-3.5 h-3.5" /> Redaktə
                    </button>
                    <button onClick={() => { if (confirm('Bu həkimi silmək istədiyinizə əminsiniz?')) deleteMutation.mutate({ id: doc.id }); }} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:border-red-300 hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {(doctors ?? []).length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Hələ həkim əlavə edilməyib</p>
              </div>
            )}
          </div>
        )}

        {(showAdd || editItem) && (
          <Modal title={editItem ? 'Həkimi redaktə et' : 'Yeni həkim'} onClose={() => { setShowAdd(false); setEditItem(null); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                <input value={form.nameAz} onChange={e => setForm(f => ({ ...f, nameAz: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" placeholder="məs. Dr. Əli Həsənov" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İxtisas *</label>
                <input value={form.specialtyAz} onChange={e => setForm(f => ({ ...f, specialtyAz: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" placeholder="məs. Kardioloq" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto URL</label>
                <input value={form.photoUrl} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={form.bioAz} onChange={e => setForm(f => ({ ...f, bioAz: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none resize-none" placeholder="Qısa tərcümeyi-hal..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Təcrübə (il)</label>
                  <input type="number" value={form.experienceYears} onChange={e => setForm(f => ({ ...f, experienceYears: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" />
                </div>
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
                <button onClick={() => { if (editItem) updateMutation.mutate({ id: editItem.id, ...form }); else createMutation.mutate(form); }} disabled={!form.nameAz || !form.specialtyAz} className="flex-1 bg-[#00b982] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#00a572] disabled:opacity-50 transition-colors">
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
