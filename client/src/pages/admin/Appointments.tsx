import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import { trpc } from '@/lib/trpc';
import { Calendar, Loader2, Phone, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Eye } from 'lucide-react';

type Appointment = {
  id: number;
  fullName: string;
  phone: string;
  appointmentDate: string | null;
  appointmentTime: string | null;
  serviceType: string | null;
  notes: string | null;
  status: string;
  isRead: boolean;
  createdAt: string | Date | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: 'Yeni', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  confirmed: { label: 'Təsdiqləndi', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  completed: { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-600', icon: CheckCircle },
  cancelled: { label: 'Ləğv edildi', color: 'bg-red-100 text-red-600', icon: XCircle },
};

function DetailModal({ apt, onClose, onStatusChange }: { apt: Appointment; onClose: () => void; onStatusChange: (id: number, status: string) => void }) {
  const cfg = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.new;
  const Icon = cfg.icon;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-[#1a365d]">Qəbul məlumatları</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#00b982]/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#00b982]" />
            </div>
            <div>
              <p className="font-bold text-[#1a365d]">{apt.fullName}</p>
              <p className="text-sm text-gray-500">{apt.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Tarix</p>
              <p className="text-sm font-medium text-[#1a365d]">{apt.appointmentDate ?? '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Saat</p>
              <p className="text-sm font-medium text-[#1a365d]">{apt.appointmentTime ?? '—'}</p>
            </div>
          </div>
          {apt.serviceType && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Xidmət növü</p>
              <p className="text-sm font-medium text-[#1a365d]">{apt.serviceType}</p>
            </div>
          )}
          {apt.notes && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Qeydlər</p>
              <p className="text-sm text-gray-600">{apt.notes}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 mb-2">Status dəyişdir</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => onStatusChange(apt.id, key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${apt.status === key ? val.color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Appointments() {
  const utils = trpc.useUtils();
  const { data: appointments, isLoading } = trpc.admin.appointments.list.useQuery(undefined, { retry: false });
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);

  const updateMutation = trpc.admin.appointments.updateStatus.useMutation({
    onSuccess: () => { utils.admin.appointments.list.invalidate(); utils.admin.stats.invalidate(); },
  });
  const deleteMutation = trpc.admin.appointments.delete.useMutation({
    onSuccess: () => { utils.admin.appointments.list.invalidate(); utils.admin.stats.invalidate(); },
  });

  const handleOpen = (apt: Appointment) => {
    setSelected(apt);
    if (!apt.isRead) updateMutation.mutate({ id: apt.id, status: apt.status as any, isRead: true });
  };

  const filtered = filterStatus ? (appointments ?? []).filter(a => a.status === filterStatus) : (appointments ?? []);

  return (
    <AdminGuard>
      <AdminLayout title="Qəbullar">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterStatus ? 'bg-[#00b982] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Hamısı ({(appointments ?? []).length})
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => {
              const count = (appointments ?? []).filter(a => a.status === key).length;
              return (
                <button key={key} onClick={() => setFilterStatus(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === key ? val.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {val.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#00b982] animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Qəbul yoxdur</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ad Soyad</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Telefon</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Tarix / Saat</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((apt) => {
                    const cfg = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.new;
                    const Icon = cfg.icon;
                    return (
                      <tr key={apt.id} className={`hover:bg-gray-50 transition-colors ${!apt.isRead ? 'bg-blue-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {!apt.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                            <span className="font-medium text-sm text-[#1a365d]">{apt.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-500 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />{apt.phone}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {apt.appointmentDate ?? '—'} {apt.appointmentTime ? `· ${apt.appointmentTime}` : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                            <Icon className="w-3.5 h-3.5" />{cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => handleOpen(apt as Appointment)} className="p-1.5 text-gray-400 hover:text-[#00b982] hover:bg-[#00b982]/10 rounded-lg transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if (confirm('Bu qəbulu silmək istədiyinizə əminsiniz?')) deleteMutation.mutate({ id: apt.id }); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {selected && (
          <DetailModal
            apt={selected}
            onClose={() => setSelected(null)}
            onStatusChange={(id, status) => {
              updateMutation.mutate({ id, status: status as any, isRead: true });
              setSelected(prev => prev ? { ...prev, status } : null);
            }}
          />
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
