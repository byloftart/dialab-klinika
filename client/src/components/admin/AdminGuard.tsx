import { trpc } from '@/lib/trpc';
import { Shield, Loader2, Lock } from 'lucide-react';
import { Link } from 'wouter';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#00b982] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-[#00b982]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#00b982]" />
          </div>
          <h2 className="text-xl font-bold text-[#1a365d] mb-2">Giriş tələb olunur</h2>
          <p className="text-gray-500 text-sm mb-6">
            Admin panelinə daxil olmaq üçün hesabınıza giriş edin.
          </p>
          <a
            href="/login"
            className="block w-full bg-[#00b982] text-white py-3 rounded-xl font-semibold hover:bg-[#00a572] transition-colors"
          >
            Daxil ol
          </a>
          <Link href="/" className="block mt-3 text-sm text-gray-400 hover:text-gray-600">
            Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1a365d] mb-2">İcazə yoxdur</h2>
          <p className="text-gray-500 text-sm mb-6">
            Bu bölməyə yalnız administratorlar daxil ola bilər.
          </p>
          <Link
            href="/"
            className="block w-full bg-[#1a365d] text-white py-3 rounded-xl font-semibold hover:bg-[#1a365d]/90 transition-colors"
          >
            Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
