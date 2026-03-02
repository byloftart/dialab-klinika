import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import { trpc } from '@/lib/trpc';
import { MessageSquare, Loader2, Trash2, Eye, CheckCircle, AlertCircle, Mail } from 'lucide-react';

type FeedbackMsg = {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  isRead: boolean;
  createdAt: string | Date | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'Yeni', color: 'bg-blue-100 text-blue-700' },
  read: { label: 'Oxundu', color: 'bg-gray-100 text-gray-600' },
  replied: { label: 'Cavablandı', color: 'bg-green-100 text-green-700' },
};

function DetailModal({ msg, onClose, onMarkRead }: { msg: FeedbackMsg; onClose: () => void; onMarkRead: (id: number, status: string) => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-[#1a365d]">Mesaj məlumatları</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-[#1a365d]">{msg.fullName}</p>
              {msg.email && <p className="text-sm text-gray-500">{msg.email}</p>}
              {msg.phone && <p className="text-sm text-gray-500">{msg.phone}</p>}
            </div>
          </div>
          {msg.subject && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Mövzu</p>
              <p className="text-sm font-medium text-[#1a365d]">{msg.subject}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Mesaj</p>
            <p className="text-sm text-gray-700 leading-relaxed">{msg.message}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">Status dəyişdir</p>
            <div className="flex gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <button key={key} onClick={() => onMarkRead(msg.id, key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${msg.status === key ? val.color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {val.label}
                </button>
              ))}
            </div>
          </div>
          {msg.email && (
            <a href={`mailto:${msg.email}`} className="flex items-center gap-2 w-full bg-[#1a365d] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a365d]/90 transition-colors justify-center">
              <Mail className="w-4 h-4" /> E-mail ilə cavabla
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Feedback() {
  const utils = trpc.useUtils();
  const { data: messages, isLoading } = trpc.admin.feedback.list.useQuery(undefined, { retry: false });
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<FeedbackMsg | null>(null);

  const updateMutation = trpc.admin.feedback.markRead.useMutation({
    onSuccess: () => { utils.admin.feedback.list.invalidate(); utils.admin.stats.invalidate(); },
  });
  const deleteMutation = trpc.admin.feedback.delete.useMutation({
    onSuccess: () => { utils.admin.feedback.list.invalidate(); utils.admin.stats.invalidate(); },
  });

  const handleOpen = (msg: FeedbackMsg) => {
    setSelected(msg);
    if (!msg.isRead) updateMutation.mutate({ id: msg.id, isRead: true, status: 'read' });
  };

  const filtered = filterStatus ? (messages ?? []).filter(m => m.status === filterStatus) : (messages ?? []);

  return (
    <AdminGuard>
      <AdminLayout title="Mesajlar">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterStatus ? 'bg-[#00b982] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Hamısı ({(messages ?? []).length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => {
            const count = (messages ?? []).filter(m => m.status === key).length;
            return (
              <button key={key} onClick={() => setFilterStatus(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === key ? val.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {val.label} ({count})
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-[#00b982] animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Mesaj yoxdur</p>
              </div>
            ) : filtered.map((msg) => {
              const cfg = STATUS_CONFIG[msg.status] ?? STATUS_CONFIG.new;
              return (
                <div key={msg.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${!msg.isRead ? 'border-blue-200 bg-blue-50/20' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!msg.isRead ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {!msg.isRead ? <AlertCircle className="w-5 h-5 text-blue-500" /> : <CheckCircle className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1a365d] text-sm">{msg.fullName}</p>
                        {!msg.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{msg.subject ?? msg.message.slice(0, 60)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color} flex-shrink-0`}>{cfg.label}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpen(msg as FeedbackMsg)} className="p-1.5 text-gray-400 hover:text-[#00b982] hover:bg-[#00b982]/10 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm('Bu mesajı silmək istədiyinizə əminsiniz?')) deleteMutation.mutate({ id: msg.id }); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selected && (
          <DetailModal
            msg={selected}
            onClose={() => setSelected(null)}
            onMarkRead={(id, status) => {
              updateMutation.mutate({ id, isRead: true, status: status as any });
              setSelected(prev => prev ? { ...prev, status, isRead: true } : null);
            }}
          />
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
