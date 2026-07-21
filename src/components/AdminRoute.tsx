import { useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRoute() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const toasted = useRef(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin && !toasted.current) {
      toasted.current = true;
      toast.error('هذه الصفحة للأدمن فقط');
    }
  }, [loading, isAuthenticated, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream grid place-items-center" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-ink/60">
          <Loader2 className="w-8 h-8 animate-spin text-gold-600" />
          <p className="text-sm font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
