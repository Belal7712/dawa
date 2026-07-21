import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import AccountMenu from '@/components/AccountMenu';
import { Loader2 } from 'lucide-react';

type AuthNavProps = {
  /** Mobile stacked layout */
  stacked?: boolean;
};

export default function AuthNav({ stacked = false }: AuthNavProps) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className={stacked ? 'flex justify-center py-2' : 'flex items-center px-2'}>
        <Loader2 className="w-5 h-5 animate-spin text-gold-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className={stacked ? 'mt-2' : ''}>
        <AccountMenu />
      </div>
    );
  }

  if (stacked) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <Link
          to="/login"
          className="block px-4 py-3 rounded-2xl text-center font-bold text-ink/75 border border-gold-200 bg-white/60"
        >
          تسجيل الدخول
        </Link>
        <Link to="/register" className="btn-gold px-6 py-3.5 text-center">
          إنشاء حساب
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className="px-5 py-2.5 rounded-full text-sm font-bold text-ink/70 hover:text-ink transition-colors"
      >
        تسجيل الدخول
      </Link>
      <Link to="/register" className="btn-gold px-6 py-2.5 text-sm">
        إنشاء حساب
      </Link>
    </div>
  );
}
