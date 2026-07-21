import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, MapPin, Clock, Send, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { WHATSAPP_LINK } from '../data/content';
import { supabase } from '@/lib/supabase';

const channels = [
  {
    icon: <MessageCircle className="w-6 h-6" fill="currentColor" strokeWidth={0} />,
    title: 'واتساب',
    value: '[رقم تجريبي — يُحدّث قريباً]',
    desc: 'أسرع طريقة — نرد خلال دقائق',
    tone: '#25d366',
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'البريد الإلكتروني',
    value: 'hello@dawatak.com',
    desc: 'للاستفسارات والشراكات',
    tone: '#c9a24b',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'المقر',
    value: 'الرياض، المملكة العربية السعودية',
    desc: 'نخدم جميع مدن المملكة والخليج',
    tone: '#8b5cf6',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'ساعات العمل',
    value: 'على مدار الساعة',
    desc: 'حتى في ليلة مناسبتك — معك خطوة بخطوة',
    tone: '#0ea5e9',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', type: 'زواج', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const messageBody =
        form.message.trim().length > 0
          ? form.message.trim()
          : `طلب استشارة — نوع المناسبة: ${form.type}`;

      const { error } = await supabase.from('support_tickets').insert({
        name: form.name.trim(),
        phone_or_email: form.phone.trim(),
        subject: `استشارة — ${form.type}`,
        message: messageBody,
        status: 'new',
      });

      if (error) {
        toast.error(error.message || 'فشل إرسال الطلب — حاول مرة أخرى');
        return;
      }

      toast.success('تم إرسال طلبك بنجاح — سنرد عليك قريباً');
      setForm({ name: '', phone: '', type: 'زواج', message: '' });
    } catch {
      toast.error('حدث خطأ غير متوقع — حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative pt-[130px] pb-24 overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-50" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] glow-gold" />

        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="chip">تواصل معنا</span>
            <h1 className="mt-5 text-5xl sm:text-6xl font-black text-ink">
              خلّنا نخطط <span className="gold-text font-display">لمناسبتك معاً</span>
            </h1>
            <p className="mt-5 text-lg text-ink/55 leading-9">
              فريقنا جاهز يجاوب على كل أسئلتك ويساعدك تختار الأنسب لفرحك.
            </p>
          </motion.div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {channels.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="card-lux p-7 text-center"
              >
                <span
                  className="mx-auto grid place-items-center w-14 h-14 rounded-2xl"
                  style={{ background: `${c.tone}1a`, color: c.tone }}
                >
                  {c.icon}
                </span>
                <h3 className="mt-4 font-black text-ink">{c.title}</h3>
                <p className="mt-1 font-bold text-ink/70 text-sm" dir="auto">{c.value}</p>
                <p className="mt-1 text-xs text-ink/45">{c.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 grid lg:grid-cols-5 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-3 card-lux p-8 sm:p-10"
            >
              <form onSubmit={(e) => void submit(e)} className="space-y-6">
                <h2 className="text-2xl font-black text-ink">احجز استشارتك المجانية</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-black text-ink/70 mb-2">الاسم الكريم</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={submitting}
                      placeholder="مثال: عبدالله محمد"
                      className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-ink/70 mb-2">رقم الجوال</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      disabled={submitting}
                      placeholder="05xxxxxxxx"
                      className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-ink/70 mb-2">نوع المناسبة</label>
                  <div className="flex flex-wrap gap-3">
                    {['زواج', 'تخرج', 'ملكة', 'عيد ميلاد', 'افتتاح', 'أخرى'].map((t) => (
                      <button
                        type="button"
                        key={t}
                        disabled={submitting}
                        onClick={() => setForm({ ...form, type: t })}
                        className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-60 ${
                          form.type === t
                            ? 'gold-grad text-white shadow-lg shadow-gold-500/25'
                            : 'bg-cream border border-gold-200 text-ink/60 hover:border-gold-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-ink/70 mb-2">تفاصيل إضافية (اختياري)</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    disabled={submitting}
                    placeholder="عدد الضيوف المتوقع، التاريخ، أي طلبات خاصة..."
                    className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 resize-none disabled:opacity-60"
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn-gold w-full py-4 text-lg disabled:opacity-60">
                  {submitting ? (
                    <>
                      <Loader2 className="inline-block w-5 h-5 ml-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="inline-block w-5 h-5 ml-2 -scale-x-100" />
                      أرسل الطلب
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#128c4b] to-[#0a6b38] p-8 text-white shadow-2xl shadow-green-700/30">
                <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
                <MessageCircle className="w-12 h-12" fill="currentColor" strokeWidth={0} />
                <h3 className="mt-4 text-2xl font-black">تبي رد أسرع؟</h3>
                <p className="mt-2 text-white/80 leading-8">
                  كلمنا واتساب مباشرة — فريقنا متصل الآن ويرد خلال دقائق.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-black text-[#128c4b] shadow-lg transition-transform hover:-translate-y-1"
                >
                  <MessageCircle className="w-5 h-5" fill="currentColor" strokeWidth={0} />
                  ابدأ المحادثة
                </a>
              </div>

              <div className="card-lux p-8">
                <h3 className="font-black text-ink text-lg">ليش العملاء يختارونا؟</h3>
                <ul className="mt-5 space-y-4">
                  {[
                    'رد خلال دقائق — حتى في ليلة المناسبة',
                    'تجربة مجانية قبل أي التزام',
                    'أسعار واضحة بدون رسوم خفية',
                    'منصة جديدة — كن من أوائل عملائنا',
                  ].map((p) => (
                    <li key={p} className="flex items-center gap-3 text-ink/70 text-[15px]">
                      <span className="grid place-items-center w-6 h-6 rounded-full bg-gold-100 text-gold-700 shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
