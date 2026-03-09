import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, FlaskConical, Stethoscope, Users, Image,
  Calendar, MessageSquare, Settings, LogOut, Menu, X, FileText,
  ChevronRight, Bell, Shield
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/laboratory', label: 'Laboratoriya', icon: FlaskConical },
  { href: '/admin/diagnostics', label: 'Diaqnostika', icon: Stethoscope },
  { href: '/admin/doctors', label: 'Həkimlər', icon: Users },
  { href: '/admin/gallery', label: 'Qalereya', icon: Image },
  { href: '/admin/pages', label: 'Səhifələr', icon: FileText },
  { href: '/admin/appointments', label: 'Qəbullar', icon: Calendar },
  { href: '/admin/feedback', label: 'Mesajlar', icon: MessageSquare },
  { href: '/admin/settings', label: 'Tənzimləmələr', icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { retry: false });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = '/'; },
  });

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#1a365d] text-white z-50 transform transition-transform duration-300
        lg:relative lg:translate-x-0 lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#00b982] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">DIALAB</div>
              <div className="text-xs text-white/60">Admin Panel</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              const badge = item.href === '/admin/appointments' && stats?.newAppointments
                ? stats.newAppointments
                : item.href === '/admin/feedback' && stats?.unreadMessages
                ? stats.unreadMessages
                : null;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? 'bg-[#00b982] text-white shadow-lg shadow-[#00b982]/30'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {badge ? (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    ) : active ? (
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıxış</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a365d]">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {(stats?.newAppointments || stats?.unreadMessages) ? (
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              </div>
            ) : null}
            <Link
              href="/"
              className="text-sm text-[#00b982] hover:underline font-medium"
            >
              ← Sayta qayıt
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
