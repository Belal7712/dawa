import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Recovery link lands with a session via detectSessionInUrl
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        setReady(true);
      } else {
        toast.error('رابط الاستعادة غير صالح أو منتهٍ');
      }
      setChecking(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (password !== confirm) {
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message || 'فشل تحديث كلمة المرور');
        return;
      }
      toast.success('تم تحديث كلمة المرور بنجاح');
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
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] glow-gold" />

      <div className="relative mx-auto max-w-md px-6 pt-16 pb-20">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-ink mb-10">
          <ArrowLeft className="w-4 h-4 rotate-180" />
          العودة لتسجيل الدخول
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-lux p-8 sm:p-10"
        >
          <h1 className="text-3xl font-black text-ink">
            تعيين <span className="gold-text font-display">كلمة مرور جديدة</span>
          </h1>
          <p className="mt-2 text-ink/50 text-sm">أدخل كلمة المرور الجديدة لحسابك</p>

          {checking ? (
            <div className="mt-10 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gold-600" />
            </div>
          ) : !ready ? (
            <div className="mt-8 text-center space-y-4">
              <p className="text-ink/55">الرابط غير صالح. اطلب رابطاً جديداً.</p>
              <Link to="/forgot-password" className="btn-gold inline-flex px-6 py-3">
                طلب رابط جديد
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-black text-ink/70 mb-2">كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    minLength={6}
                    placeholder="6 أحرف على الأقل"
                    className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 pr-11 pl-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-ink/70 mb-2">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={submitting}
                    minLength={6}
                    placeholder="أعد كتابة كلمة المرور"
                    className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 pr-11 pl-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
                    dir="ltr"
                  />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-gold w-full py-4 text-lg disabled:opacity-60">
                {submitting ? (
                  <>
                    <Loader2 className="inline-block w-5 h-5 ml-2 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  'تحديث كلمة المرور'
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
