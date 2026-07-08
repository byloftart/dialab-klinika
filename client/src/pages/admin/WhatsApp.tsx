import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import { trpc } from '@/lib/trpc';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
  MessageCircle,
  Send,
  Trash2,
  UserRound,
} from 'lucide-react';

type WhatsAppConversation = {
  id: number;
  waId: string;
  displayName: string | null;
  phoneNumber: string | null;
  lastUserMessage: string | null;
  lastAssistantMessage: string | null;
  status: string;
  isRead: boolean;
  needsOperator: boolean;
  updatedAt: string | Date | null;
};

type WhatsAppMessage = {
  id: number;
  waId: string;
  role: 'user' | 'assistant' | 'admin';
  content: string;
  createdAt: string | Date | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'Yeni', color: 'bg-blue-100 text-blue-700' },
  open: { label: 'Açıq', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Həll edildi', color: 'bg-green-100 text-green-700' },
};

function formatDate(value: string | Date | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ConversationModal({
  conversation,
  onClose,
}: {
  conversation: WhatsAppConversation;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [replyText, setReplyText] = useState('');
  const { data, isLoading } = trpc.admin.whatsapp.getByWaId.useQuery(
    { waId: conversation.waId },
    { retry: false }
  );
  const updateMutation = trpc.admin.whatsapp.updateStatus.useMutation({
    onSuccess: () => {
      utils.admin.whatsapp.list.invalidate();
      utils.admin.whatsapp.getByWaId.invalidate({ waId: conversation.waId });
      utils.admin.stats.invalidate();
    },
  });
  const replyMutation = trpc.admin.whatsapp.reply.useMutation({
    onSuccess: () => {
      setReplyText('');
      utils.admin.whatsapp.list.invalidate();
      utils.admin.whatsapp.getByWaId.invalidate({ waId: conversation.waId });
      utils.admin.stats.invalidate();
    },
  });

  const messages = (data?.messages ?? []) as WhatsAppMessage[];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[#1a365d] truncate">
                {conversation.displayName || conversation.phoneNumber || conversation.waId}
              </h3>
              <p className="text-sm text-gray-500">{conversation.phoneNumber || conversation.waId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <button
              key={key}
              onClick={() => updateMutation.mutate({
                waId: conversation.waId,
                status: key as 'new' | 'open' | 'resolved',
                isRead: true,
                needsOperator: key === 'resolved' ? false : conversation.needsOperator,
              })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${conversation.status === key ? val.color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {val.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-7 h-7 text-[#00b982] animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              Mesaj tarixi yoxdur
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const own = message.role === 'assistant' || message.role === 'admin';
                return (
                  <div key={message.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${own ? 'bg-[#00b982] text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-[11px] mt-2 ${own ? 'text-white/70' : 'text-gray-400'}`}>
                        {message.role === 'admin' ? 'Admin' : message.role === 'assistant' ? 'Dr. Dia' : 'Pasient'} · {formatDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form
          className="p-5 border-t border-gray-100 bg-white"
          onSubmit={(event) => {
            event.preventDefault();
            const text = replyText.trim();
            if (!text) return;
            replyMutation.mutate({ waId: conversation.waId, text });
          }}
        >
          <div className="flex gap-3">
            <textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              placeholder="WhatsApp cavabı yazın..."
              className="flex-1 min-h-[48px] max-h-32 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b982]/30 focus:border-[#00b982]"
            />
            <button
              type="submit"
              disabled={replyMutation.isPending || !replyText.trim()}
              className="self-end inline-flex items-center gap-2 bg-[#00b982] text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#00a675] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Göndər
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WhatsApp() {
  const utils = trpc.useUtils();
  const { data: conversations, isLoading } = trpc.admin.whatsapp.list.useQuery(undefined, { retry: false });
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<WhatsAppConversation | null>(null);
  const updateMutation = trpc.admin.whatsapp.updateStatus.useMutation({
    onSuccess: () => {
      utils.admin.whatsapp.list.invalidate();
      utils.admin.stats.invalidate();
    },
  });
  const deleteMutation = trpc.admin.whatsapp.delete.useMutation({
    onSuccess: () => {
      utils.admin.whatsapp.list.invalidate();
      utils.admin.stats.invalidate();
    },
  });

  const items = (conversations ?? []) as WhatsAppConversation[];
  const filtered = filterStatus ? items.filter((item) => item.status === filterStatus) : items;

  const handleOpen = (conversation: WhatsAppConversation) => {
    setSelected(conversation);
    if (!conversation.isRead) {
      updateMutation.mutate({
        waId: conversation.waId,
        status: conversation.status as 'new' | 'open' | 'resolved',
        isRead: true,
      });
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="WhatsApp">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterStatus ? 'bg-[#00b982] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Hamısı ({items.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => {
            const count = items.filter((item) => item.status === key).length;
            return (
              <button key={key} onClick={() => setFilterStatus(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === key ? val.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {val.label} ({count})
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#00b982] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            WhatsApp müraciəti yoxdur
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((conversation) => {
              const cfg = STATUS_CONFIG[conversation.status] ?? STATUS_CONFIG.new;
              return (
                <div key={conversation.waId} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${!conversation.isRead ? 'border-green-200 bg-green-50/20' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${conversation.needsOperator ? 'bg-amber-100' : !conversation.isRead ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {conversation.needsOperator ? <UserRound className="w-5 h-5 text-amber-600" /> : !conversation.isRead ? <AlertCircle className="w-5 h-5 text-green-600" /> : <CheckCircle className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1a365d] text-sm truncate">
                          {conversation.displayName || conversation.phoneNumber || conversation.waId}
                        </p>
                        {!conversation.isRead && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {conversation.lastUserMessage || conversation.lastAssistantMessage || '—'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 hidden md:block">{formatDate(conversation.updatedAt)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color} flex-shrink-0`}>{cfg.label}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpen(conversation)} className="p-1.5 text-gray-400 hover:text-[#00b982] hover:bg-[#00b982]/10 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm('Bu WhatsApp müraciətini silmək istədiyinizə əminsiniz?')) deleteMutation.mutate({ waId: conversation.waId }); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
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
          <ConversationModal
            conversation={selected}
            onClose={() => {
              setSelected(null);
              utils.admin.whatsapp.list.invalidate();
            }}
          />
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
