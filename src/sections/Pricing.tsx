import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Check, MessageCircle, Mail, Gem, Crown, Sparkles } from 'lucide-react';
import { whatsappPlans, einvitePlans } from '../data/content';

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

/** حاسبة السعر التفاعلية */
export function PriceCalculator() {
  const [guests, setGuests] = useState(150);
  const gold = useMemo(() => guests * 3, [guests]);
  const diamond = useMemo(() => guests * 7.5, [guests]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
      className="card-lux relative overflow-hidden p-8 sm:p-10 !rounded-[32px]"
    >
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gold-200/40 blur-3xl" />
      <div className="relative">
        <h3 className="text-2xl sm:text-3xl font-black text-ink text-center">
          كم بتكلف <span className="gold-text font-display">مناسبتك؟</span>
        </h3>
        <p className="mt-3 text-center text-ink/55">حرّك المؤشر على عدد ضيوفك وقارن بين الطريقتين.</p>

        <div className="mt-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="font-black text-ink">عدد الضيوف</span>
            <motion.span
              key={guests}
              initial={{ scale: 1.25 }}
              animate={{ scale: 1 }}
              className="grid place-items-center min-w-[84px] rounded-2xl gold-grad px-4 py-2 text-2xl font-black text-white shadow-lg shadow-gold-500/30 tabular-nums"
            >
              {guests}
            </motion.span>
          </div>
          <input
            type="range"
            min={20}
            max={1000}
            step={10}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer accent-gold-600 bg-gradient-to-l from-gold-200 to-gold-400"
            dir="ltr"
          />
          <div className="mt-2 flex justify-between text-xs font-bold text-ink/40" dir="ltr">
            <span>20</span>
            <span>1000</span>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {/* واتساب */}
          <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-[#f6fffa] to-[#e8f9f0] p-7">
            <div className="flex items-center gap-2 font-black text-[#128c4b]">
              <MessageCircle className="w-5 h-5" fill="currentColor" strokeWidth={0} />
              إرسال واتساب مباشر
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black text-ink">الذهبية</div>
                  <div className="text-xs text-ink/45">3.00 ر.س × {guests}</div>
                </div>
                <motion.div key={gold} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-2xl font-black text-emerald-600 tabular-nums">
                  {fmt(gold)} <span className="text-sm">ر.س</span>
                </motion.div>
              </div>
              <div className="h-px bg-emerald-200/70" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black text-ink flex items-center gap-1.5">
                    الماسية <Gem className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-xs text-ink/45">7.50 ر.س × {guests}</div>
                </div>
                <motion.div key={diamond} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-2xl font-black text-emerald-600 tabular-nums">
                  {fmt(diamond)} <span className="text-sm">ر.س</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* صفحة الدعوة */}
          <div className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-[#fbf8ff] to-[#f1eaff] p-7">
            <div className="flex items-center gap-2 font-black text-violet-700">
              <Mail className="w-5 h-5" />
              صفحة الدعوة الإلكترونية
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <div className="font-black text-ink">الدعوة الإلكترونية برو</div>
                <div className="text-xs text-ink/45 max-w-[200px]">سعر ثابت مهما كان عدد الضيوف (حتى 500 دعوة)</div>
              </div>
              <div className="text-3xl font-black text-violet-600 tabular-nums">
                99 <span className="text-sm">ر.س</span>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-violet-100/70 px-4 py-3 text-[13px] font-bold text-violet-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              تقدر تضيف الإرسال عبر واتساب لصفحة دعوتك في أي وقت
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PlanCard({
  name, price, unit, tagline, features, featured, tone, limit,
}: {
  name: string; price: number; unit: string; tagline?: string;
  features: string[]; featured: boolean; tone: 'green' | 'violet'; limit?: string;
}) {
  const isGreen = tone === 'green';
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className={`card-lux relative flex flex-col p-8 ${
        featured
          ? isGreen
            ? '!border-[#25d366]/60 ring-4 ring-[#25d366]/10'
            : '!border-violet-400/60 ring-4 ring-violet-400/10'
          : ''
      }`}
    >
      {featured && (
        <span className={`absolute -top-4 right-8 rounded-full px-4 py-1.5 text-xs font-black text-white shadow-lg ${
          isGreen ? 'bg-gradient-to-l from-[#25d366] to-[#128c4b]' : 'bg-gradient-to-l from-violet-500 to-violet-700'
        }`}>
          <Crown className="inline w-3.5 h-3.5 ml-1" />
          الأكثر طلباً
        </span>
      )}
      <h4 className="text-xl font-black text-ink">{name}</h4>
      {tagline && <p className="mt-2 text-sm text-ink/50">{tagline}</p>}
      <div className="mt-5 flex items-end gap-2">
        <span className="text-sm text-ink/45 mb-2">ابتداءً من</span>
        <span className={`text-5xl font-black tabular-nums ${isGreen ? 'text-[#128c4b]' : 'text-violet-600'}`}>
          {price % 1 ? price.toFixed(2) : price}
        </span>
        <span className="text-sm text-ink/45 mb-2">{unit}</span>
      </div>
      {limit && <p className="mt-1 text-sm font-bold text-ink/60">{limit}</p>}
      <ul className="mt-6 space-y-3 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[15px] text-ink/70">
            <span className={`mt-0.5 grid place-items-center w-5 h-5 rounded-full shrink-0 ${
              isGreen ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'
            }`}>
              <Check className="w-3 h-3" strokeWidth={3.5} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/contact"
        className={`mt-8 block rounded-full py-3.5 text-center font-bold text-white transition-all hover:-translate-y-0.5 ${
          isGreen
            ? 'bg-gradient-to-l from-[#25d366] to-[#128c4b] shadow-lg shadow-green-500/25 hover:shadow-xl'
            : 'bg-gradient-to-l from-violet-500 to-violet-700 shadow-lg shadow-violet-500/25 hover:shadow-xl'
        }`}
      >
        اختر الباقة
      </Link>
    </motion.div>
  );
}

export default function Pricing() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-[#f8f3e6] to-cream" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="chip">الباقات</span>
          <h2 className="section-title mt-5">
            باقات تناسب <span className="gold-text font-display">الجميع</span>
          </h2>
          <p className="mt-4 text-ink/55 text-lg">استثمر في راحتك واختر الباقة التي تناسبك.</p>
        </motion.div>

        <div className="mt-14">
          <PriceCalculator />
        </div>

        {/* باقات الواتساب */}
        <div className="mt-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25d366] to-[#128c4b] text-white shadow-lg shadow-green-500/25">
              <MessageCircle className="w-6 h-6" fill="currentColor" strokeWidth={0} />
            </span>
            <div>
              <h3 className="text-2xl font-black text-ink">إرسال واتساب مباشر</h3>
              <p className="text-ink/50 text-sm">نرسل دعوات مخصصة لكل ضيف باسمه — السعر لكل ضيف.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            {whatsappPlans.map((p) => (
              <PlanCard key={p.name} {...p} tone="green" />
            ))}
          </div>
        </div>

        {/* باقات الدعوة الإلكترونية */}
        <div className="mt-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/25">
              <Mail className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-2xl font-black text-ink flex items-center gap-2">
                صفحة الدعوة الإلكترونية
                <span className="rounded-full bg-violet-600 text-white text-[11px] font-black px-3 py-0.5">جديد</span>
              </h3>
              <p className="text-ink/50 text-sm">سعر ثابت واحد بدون رسوم لكل ضيف — شارك الرابط أينما تريد.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            {einvitePlans.map((p) => (
              <PlanCard key={p.name} {...p} tone="violet" />
            ))}
          </div>
        </div>

        {/* إضافات + الجمع */}
        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-lux p-7 flex items-center justify-between gap-4"
          >
            <div>
              <h4 className="font-black text-ink">إضافات اختيارية</h4>
              <p className="mt-1 text-sm text-ink/55">بطاقات دخول بالباركود لضيوف صفحة الدعوة</p>
            </div>
            <span className="rounded-2xl bg-gold-100 border border-gold-300 px-5 py-2.5 font-black text-gold-700 whitespace-nowrap">
              +99 ر.س
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card-lux p-7 !bg-gradient-to-l !from-gold-600 !to-gold-800 !border-gold-500 text-white"
          >
            <h4 className="font-black flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold-200" />
              اجمع بينهما ووفّر
            </h4>
            <p className="mt-2 text-sm text-white/80 leading-7">
              صفحة دعوة فاخرة برابط خاص + إرسال واتساب باسم كل ضيف — كل الردود في لوحة واحدة.
            </p>
          </motion.div>
        </div>

        {/* وسائل الدفع */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-sm font-bold text-ink/40 mb-5">وسائل دفع آمنة</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['VISA', 'Mastercard', 'mada', 'Apple Pay', 'STC Pay'].map((p) => (
              <span key={p} className="rounded-xl border border-gold-200 bg-white px-6 py-3 font-black text-ink/60 text-sm shadow-sm tracking-wide">
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
