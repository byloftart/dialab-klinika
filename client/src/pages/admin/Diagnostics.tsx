import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import ImageUpload from '@/components/admin/ImageUpload';
import { trpc } from '@/lib/trpc';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Stethoscope, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';

type DiagService = {
  id: number;
  titleAz: string;
  descriptionAz: string;
  imageUrl: string | null;
  icon: string | null;
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

export default function Diagnostics() {
  const utils = trpc.useUtils();
  const { data: services, isLoading } = trpc.admin.diagnostics.list.useQuery(undefined, { retry: false });

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<DiagService | null>(null);
  const [showAddSub, setShowAddSub] = useState<number | null>(null);

  const [form, setForm] = useState({ titleAz: '', descriptionAz: '', imageUrl: '', icon: '', order: 0, isActive: true });
  const [subForm, setSubForm] = useState({ titleAz: '', descriptionAz: '', order: 0 });

  const createMutation = trpc.admin.diagnostics.create.useMutation({
    onSuccess: () => { utils.admin.diagnostics.list.invalidate(); setShowAdd(false); setForm({ titleAz: '', descriptionAz: '', imageUrl: '', icon: '', order: 0, isActive: true }); },
  });
  const updateMutation = trpc.admin.diagnostics.update.useMutation({
    onSuccess: () => { utils.admin.diagnostics.list.invalidate(); setEditItem(null); },
  });
  const deleteMutation = trpc.admin.diagnostics.delete.useMutation({
    onSuccess: () => utils.admin.diagnostics.list.invalidate(),
  });
  const createSubMutation = trpc.admin.diagnostics.createSubService.useMutation({
    onSuccess: () => { utils.admin.diagnostics.list.invalidate(); setShowAddSub(null); setSubForm({ titleAz: '', descriptionAz: '', order: 0 }); },
  });
  const deleteSubMutation = trpc.admin.diagnostics.deleteSubService.useMutation({
    onSuccess: () => utils.admin.diagnostics.list.invalidate(),
  });

  const { data: selectedService } = trpc.admin.diagnostics.getById.useQuery(
    { id: expandedId! },
    { enabled: expandedId !== null, retry: false }
  );

  return (
    <AdminGuard>
      <AdminLayout title="Diaqnostika Xidmətləri">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">Diaqnostika xidmət növlərini idarə edin</p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-[#00b982] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#00a572] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni xidmət əlavə et
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#00b982] animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {(services ?? []).map((svc) => (
              <div key={svc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <button
                    onClick={() => setExpandedId(expandedId === svc.id ? null : svc.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-4 h-4 text-[#1a365d]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1a365d] text-sm">{svc.titleAz}</p>
                      <p className="text-xs text-gray-400 truncate">{svc.descriptionAz}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {svc.isActive ? 'Aktiv' : 'Deaktiv'}
                    </span>
                    {expandedId === svc.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditItem(svc as DiagService); setForm({ titleAz: svc.titleAz, descriptionAz: svc.descriptionAz, imageUrl: svc.imageUrl ?? '', icon: svc.icon ?? '', order: svc.order ?? 0, isActive: svc.isActive }); }}
                      className="p-2 text-gray-400 hover:text-[#00b982] hover:bg-[#00b982]/10 rounded-lg transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Bu xidməti silmək istədiyinizə əminsiniz?')) deleteMutation.mutate({ id: svc.id }); }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedId === svc.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alt xidmətlər</p>
                      <button onClick={() => setShowAddSub(svc.id)} className="flex items-center gap-1 text-xs text-[#00b982] hover:underline">
                        <Plus className="w-3 h-3" /> Əlavə et
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(selectedService?.subServices ?? []).map((sub) => (
                        <div key={sub.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-gray-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1a365d]" />
                          <span className="text-sm text-[#1a365d] flex-1">{sub.titleAz}</span>
                          <button onClick={() => { if (confirm('Silmək istədiyinizə əminsiniz?')) deleteSubMutation.mutate({ id: sub.id }); }} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {(selectedService?.subServices ?? []).length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-3">Alt xidmət yoxdur</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {(services ?? []).length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Hələ diaqnostika xidməti yoxdur</p>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAdd || editItem) && (
          <Modal title={editItem ? 'Xidməti redaktə et' : 'Yeni diaqnostika xidməti'} onClose={() => { setShowAdd(false); setEditItem(null); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
                <input value={form.titleAz} onChange={e => setForm(f => ({ ...f, titleAz: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" placeholder="məs. Ultrasəs Müayinəsi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Təsvir *</label>
                <textarea value={form.descriptionAz} onChange={e => setForm(f => ({ ...f, descriptionAz: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none resize-none" />
              </div>
              <ImageUpload
                label="Bölmə şəkli"
                currentImage={form.imageUrl}
                category="diagnostics"
                onUpload={(url) => setForm(f => ({ ...f, imageUrl: url }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">və ya şəkil URL</label>
                <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İkon</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" placeholder="stethoscope" />
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
                <button onClick={() => { if (editItem) updateMutation.mutate({ id: editItem.id, ...form }); else createMutation.mutate(form); }} disabled={!form.titleAz || !form.descriptionAz} className="flex-1 bg-[#00b982] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#00a572] disabled:opacity-50 transition-colors">
                  {editItem ? 'Yadda saxla' : 'Əlavə et'}
                </button>
                <button onClick={() => { setShowAdd(false); setEditItem(null); }} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Ləğv et</button>
              </div>
            </div>
          </Modal>
        )}

        {/* Add Sub Modal */}
        {showAddSub !== null && (
          <Modal title="Alt xidmət əlavə et" onClose={() => setShowAddSub(null)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xidmət adı *</label>
                <input value={subForm.titleAz} onChange={e => setSubForm(f => ({ ...f, titleAz: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" placeholder="məs. Daxili orqanların USM-i" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Təsvir</label>
                <input value={subForm.descriptionAz} onChange={e => setSubForm(f => ({ ...f, descriptionAz: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#00b982] focus:ring-2 focus:ring-[#00b982]/20 outline-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => createSubMutation.mutate({ diagnosticServiceId: showAddSub, ...subForm })} disabled={!subForm.titleAz} className="flex-1 bg-[#00b982] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#00a572] disabled:opacity-50 transition-colors">Əlavə et</button>
                <button onClick={() => setShowAddSub(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Ləğv et</button>
              </div>
            </div>
          </Modal>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
