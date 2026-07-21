import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message || 'فشل تسجيل الدخول');
        return;
      }
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 pattern-bg opacity-40" />
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] glow-gold" />

      <div className="relative mx-auto max-w-md px-6 pt-16 pb-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-ink mb-10">
          <ArrowLeft className="w-4 h-4 rotate-180" />
          العودة للرئيسية
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-lux p-8 sm:p-10"
        >
          <h1 className="text-3xl font-black text-ink">
            تسجيل <span className="gold-text font-display">الدخول</span>
          </h1>
          <p className="mt-2 text-ink/50 text-sm">مرحباً بعودتك إلى دعوتك</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-black text-ink/70 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 pr-11 pl-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-black text-ink/70">كلمة المرور</label>
                <Link to="/forgot-password" className="text-xs font-bold text-gold-700 hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 pr-11 pl-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
                  dir="ltr"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-gold w-full py-4 text-lg disabled:opacity-60">
              {submitting ? (
                <>
                  <Loader2 className="inline-block w-5 h-5 ml-2 animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/50">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="font-black text-gold-700 hover:underline">
              إنشاء حساب
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
