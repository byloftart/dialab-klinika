import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import { trpc } from '@/lib/trpc';
import {
  Calendar, MessageSquare, FlaskConical, Stethoscope,
  Users, Image, TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { Link } from 'wouter';

function StatCard({ icon: Icon, label, value, color, href }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  href?: string;
}) {
  const content = (
    <div className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('[#', '[#').replace(']', '/10]')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

function QuickActionCard({ href, icon: Icon, label, description, color }: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-[#1a365d] text-sm group-hover:text-[#00b982] transition-colors">{label}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { retry: false });
  const { data: appointments } = trpc.admin.appointments.list.useQuery(undefined, { retry: false });
  const { data: feedback } = trpc.admin.feedback.list.useQuery(undefined, { retry: false });

  const recentAppointments = appointments?.slice(0, 5) ?? [];
  const recentMessages = feedback?.slice(0, 5) ?? [];

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  const statusLabels: Record<string, string> = {
    new: 'Yeni',
    confirmed: 'Təsdiqləndi',
    completed: 'Tamamlandı',
    cancelled: 'Ləğv edildi',
  };

  return (
    <AdminGuard>
      <AdminLayout title="Dashboard">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Calendar}
            label="Yeni qəbullar"
            value={stats?.newAppointments ?? 0}
            color="text-[#00b982]"
            href="/admin/appointments"
          />
          <StatCard
            icon={MessageSquare}
            label="Oxunmamış mesajlar"
            value={stats?.unreadMessages ?? 0}
            color="text-blue-600"
            href="/admin/feedback"
          />
          <StatCard
            icon={Users}
            label="Cəmi qəbullar"
            value={appointments?.length ?? 0}
            color="text-purple-600"
            href="/admin/appointments"
          />
          <StatCard
            icon={MessageSquare}
            label="Cəmi mesajlar"
            value={feedback?.length ?? 0}
            color="text-orange-500"
            href="/admin/feedback"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-[#1a365d] mb-4">Sürətli keçidlər</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <QuickActionCard href="/admin/laboratory" icon={FlaskConical} label="Laboratoriya" description="Analiz növləri" color="bg-[#00b982]" />
            <QuickActionCard href="/admin/diagnostics" icon={Stethoscope} label="Diaqnostika" description="Xidmət növləri" color="bg-[#1a365d]" />
            <QuickActionCard href="/admin/doctors" icon={Users} label="Həkimlər" description="Komanda" color="bg-purple-500" />
            <QuickActionCard href="/admin/gallery" icon={Image} label="Qalereya" description="Şəkillər" color="bg-orange-500" />
            <QuickActionCard href="/admin/appointments" icon={Calendar} label="Qəbullar" description="Pasient qeydləri" color="bg-blue-500" />
            <QuickActionCard href="/admin/settings" icon={TrendingUp} label="Tənzimləmələr" description="Sayt məlumatları" color="bg-gray-600" />
          </div>
        </div>

        {/* Recent data */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#1a365d] text-sm">Son qəbullar</h2>
              <Link href="/admin/appointments" className="text-xs text-[#00b982] hover:underline">Hamısı →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentAppointments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Hələ qəbul yoxdur
                </div>
              ) : recentAppointments.map((apt) => (
                <div key={apt.id} className="px-6 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00b982]/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#00b982]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a365d] truncate">{apt.fullName}</p>
                    <p className="text-xs text-gray-400">{apt.phone} · {apt.appointmentDate ?? '—'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[apt.status]}`}>
                    {statusLabels[apt.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#1a365d] text-sm">Son mesajlar</h2>
              <Link href="/admin/feedback" className="text-xs text-[#00b982] hover:underline">Hamısı →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentMessages.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Hələ mesaj yoxdur
                </div>
              ) : recentMessages.map((msg) => (
                <div key={msg.id} className="px-6 py-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                    {msg.isRead
                      ? <CheckCircle className="w-4 h-4 text-gray-400" />
                      : <AlertCircle className="w-4 h-4 text-blue-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a365d] truncate">{msg.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{msg.subject ?? msg.message.slice(0, 40)}</p>
                  </div>
                  {!msg.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
