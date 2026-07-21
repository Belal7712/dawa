import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message || 'فشل إرسال رابط الاستعادة');
        return;
      }
      setSent(true);
      toast.success('تم إرسال رابط الاستعادة إن وُجد الحساب');
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
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="w-14 h-14 text-gold-600 mx-auto" />
              <h1 className="mt-5 text-2xl font-black text-ink">تفقّد بريدك</h1>
              <p className="mt-3 text-ink/55 leading-8">
                إن وُجد حساب مرتبط بهذا البريد، أرسلنا رابطاً لإعادة تعيين كلمة المرور.
              </p>
              <Link to="/login" className="btn-gold mt-8 inline-flex px-8 py-3">
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black text-ink">
                نسيت <span className="gold-text font-display">كلمة المرور؟</span>
              </h1>
              <p className="mt-2 text-ink/50 text-sm">أدخل بريدك وسنرسل رابط الاستعادة</p>

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

                <button type="submit" disabled={submitting} className="btn-gold w-full py-4 text-lg disabled:opacity-60">
                  {submitting ? (
                    <>
                      <Loader2 className="inline-block w-5 h-5 ml-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال رابط الاستعادة'
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
