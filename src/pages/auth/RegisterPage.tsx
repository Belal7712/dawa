import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, User, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const ALREADY_REGISTERED_RE = /already registered|already exists|user already/i;
const ALREADY_REGISTERED_MSG =
  'هذا البريد الإلكتروني مسجّل مسبقاً. سجّل الدخول بدلاً من ذلك.';

function isAlreadyRegisteredError(message: string | undefined): boolean {
  return Boolean(message && ALREADY_REGISTERED_RE.test(message));
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  if (!authLoading && isAuthenticated && !needsConfirm) {
    return <Navigate to="/dashboard" replace />;
  }

  function showAlreadyRegistered() {
    setAlreadyRegistered(true);
    toast.error(ALREADY_REGISTERED_MSG);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setSubmitting(true);
    setAlreadyRegistered(false);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        if (isAlreadyRegisteredError(error.message)) {
          showAlreadyRegistered();
          return;
        }
        toast.error(error.message || 'فشل إنشاء الحساب');
        return;
      }

      // Confirmation-enabled duplicate: user returned with empty identities
      if (data.user?.identities?.length === 0) {
        showAlreadyRegistered();
        return;
      }

      // If email confirmation is ON, session is null for a genuinely new user
      if (!data.session) {
        setNeedsConfirm(true);
        toast.success('تفقّد بريدك للتأكيد');
        return;
      }

      toast.success('تم إنشاء الحساب بنجاح');
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  }

  if (needsConfirm) {
    return (
      <div className="min-h-screen bg-cream grid place-items-center px-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-lux p-10 max-w-md w-full text-center"
        >
          <CheckCircle2 className="w-14 h-14 text-gold-600 mx-auto" />
          <h1 className="mt-5 text-2xl font-black text-ink">تفقّد بريدك للتأكيد</h1>
          <p className="mt-3 text-ink/55 leading-8">
            أرسلنا رابط تأكيد إلى <span className="font-bold text-ink" dir="ltr">{email}</span>.
            بعد التأكيد يمكنك تسجيل الدخول.
          </p>
          <Link to="/login" className="btn-gold mt-8 inline-flex px-8 py-3">
            الذهاب لتسجيل الدخول
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 pattern-bg opacity-40" />
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] glow-gold" />

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
            إنشاء <span className="gold-text font-display">حساب</span>
          </h1>
          <p className="mt-2 text-ink/50 text-sm">انضم إلى دعوتك وابدأ مناسبتك</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-black text-ink/70 mb-2">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
                <input
                  required
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={submitting}
                  placeholder="عبدالله محمد"
                  className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 pr-11 pl-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
                />
              </div>
            </div>

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
              <label className="block text-sm font-black text-ink/70 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  placeholder="6 أحرف على الأقل"
                  minLength={6}
                  className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 pr-11 pl-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
                  dir="ltr"
                />
              </div>
            </div>

            {alreadyRegistered && (
              <div className="rounded-2xl border border-maroon-500/25 bg-maroon-500/5 px-4 py-3 text-sm text-maroon-800 leading-7">
                {ALREADY_REGISTERED_MSG}{' '}
                <Link to="/login" className="font-black text-gold-700 hover:underline">
                  سجّل الدخول
                </Link>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-gold w-full py-4 text-lg disabled:opacity-60">
              {submitting ? (
                <>
                  <Loader2 className="inline-block w-5 h-5 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء الحساب'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/50">
            لديك حساب؟{' '}
            <Link to="/login" className="font-black text-gold-700 hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
