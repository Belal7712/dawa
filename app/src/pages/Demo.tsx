import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Heart, MapPin, CalendarDays, Clock, ChevronDown, Check, X,
  Music, UtensilsCrossed, Sparkles, Users, QrCode, Share2, ArrowRight,
} from 'lucide-react';

const WEDDING_DATE = new Date('2027-01-15T19:00:00');

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, WEDDING_DATE.getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/* ================= المظروف الافتتاحي ================= */
function Envelope({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    setOpening(true);
    setTimeout(onOpen, 1400);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-b from-maroon-800 via-maroon-900 to-[#200a0d] overflow-hidden"
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {[...Array(18)].map((_, i) => (
        <Heart
          key={i}
          className="absolute text-gold-300/20 float-heart"
          style={{
            right: `${(i * 53) % 100}%`,
            width: `${10 + ((i * 11) % 14)}px`,
            animationDuration: `${8 + (i % 6) * 3}s`,
            animationDelay: `${i * 0.9}s`,
          }}
          fill="currentColor"
        />
      ))}

      <div className="relative text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-gold-200/90 text-lg"
        >
          وصلتكم دعوة من القلب
        </motion.p>

        {/* المظروف */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: opening ? 1.04 : 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-10 w-[320px] h-[220px] sm:w-[380px] sm:h-[260px]"
          style={{ perspective: 900 }}
        >
          {/* جسم المظروف */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-100 to-gold-300 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border border-gold-400/40" />
          {/* البطاقة الداخلية */}
          <motion.div
            animate={opening ? { y: -110 } : { y: 0 }}
            transition={{ delay: opening ? 0.55 : 0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-6 top-4 bottom-10 rounded-lg bg-[#fffdf6] shadow-lg flex flex-col items-center justify-center border border-gold-200"
          >
            <Heart className="w-6 h-6 text-maroon-500 mb-2" fill="currentColor" strokeWidth={0} />
            <p className="font-display text-maroon-700 text-2xl font-bold">عبدالله ونورة</p>
            <p className="text-gold-700 text-xs mt-1 tracking-widest">15 · 01 · 2027</p>
          </motion.div>
          {/* الجيوب الجانبية */}
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gold-200/90 rounded-l-xl" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }} />
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gold-200/90 rounded-r-xl" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }} />
          {/* الجيب السفلي */}
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-gold-300 to-gold-200 rounded-b-xl" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 25%, 50% 0, 0 25%)' }} />
          {/* الغطاء */}
          <motion.div
            animate={opening ? { rotateX: -178, zIndex: 0 } : { rotateX: 0 }}
            transition={{ duration: 0.7, ease: [0.45, 0, 0.55, 1] }}
            style={{ transformOrigin: 'top', transformStyle: 'preserve-3d' }}
            className="absolute inset-x-0 top-0 h-[52%] z-10"
          >
            <div className="w-full h-full bg-gradient-to-b from-gold-300 to-gold-500 rounded-t-xl shadow-md border-b border-gold-600/20" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            {/* ختم الشمع */}
            <motion.div
              animate={opening ? { opacity: 0, scale: 0.6 } : { opacity: 1 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-14 h-14 rounded-full bg-maroon-600 border-4 border-maroon-700 grid place-items-center shadow-xl"
            >
              <span className="font-display text-gold-200 text-xl font-bold">ع</span>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.button
          onClick={handleOpen}
          disabled={opening}
          initial={{ opacity: 0 }}
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{ delay: 0.9 }}
          className="btn-gold mx-auto mt-14 px-10 py-4 text-lg"
        >
          افتح الدعوة
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ================= قسم عام داخل الدعوة ================= */
function InviteSection({
  id, kicker, title, children, light = false,
}: {
  id: string; kicker: string; title: string; children: React.ReactNode; light?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <section id={id} ref={ref} className={`relative py-24 px-6 overflow-hidden ${light ? 'bg-[#faf5ea]' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <span className={`font-display text-lg ${light ? 'text-maroon-500/70' : 'text-gold-300/80'}`}>{kicker}</span>
        <h2 className={`mt-2 font-display text-4xl sm:text-5xl font-bold ${light ? 'text-maroon-700' : 'text-white'}`}>
          {title}
        </h2>
        <div className="ornament-divider mt-5">
          <span className={`w-12 h-px ${light ? 'bg-maroon-300' : 'bg-gold-400/60'}`} />
          <span className="text-xl">✦</span>
          <span className={`w-12 h-px ${light ? 'bg-maroon-300' : 'bg-gold-400/60'}`} />
        </div>
        <div className="mt-10">{children}</div>
      </motion.div>
    </section>
  );
}

/* ================= صفحة الدعوة ================= */
export default function Demo() {
  const [opened, setOpened] = useState(false);
  const [rsvp, setRsvp] = useState<'none' | 'yes' | 'no'>('none');
  const [guestsCount, setGuestsCount] = useState(2);
  const { days, hours, minutes, seconds } = useCountdown();

  const navItems = useMemo(
    () => [
      { id: 'start', label: 'البداية' },
      { id: 'countdown', label: 'العد التنازلي' },
      { id: 'story', label: 'قصتنا' },
      { id: 'details', label: 'التفاصيل' },
      { id: 'location', label: 'الموقع' },
      { id: 'program', label: 'البرنامج' },
      { id: 'rsvp', label: 'تأكيد الحضور' },
    ],
    []
  );
  const [active, setActive] = useState('start');

  useEffect(() => {
    if (!opened) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    navItems.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [opened, navItems]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="bg-maroon-900 min-h-screen">
      <AnimatePresence>{!opened && <Envelope onOpen={() => setOpened(true)} />}</AnimatePresence>

      {/* شريط تنقل جانبي */}
      <AnimatePresence>
        {opened && (
          <motion.nav
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3"
          >
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="group relative flex items-center"
                aria-label={n.label}
              >
                <span className={`absolute left-6 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition-all duration-300 ${
                  active === n.id ? 'opacity-100 bg-gold-500 text-white' : 'opacity-0 group-hover:opacity-100 bg-white/90 text-maroon-800'
                }`}>
                  {n.label}
                </span>
                <span className={`block rounded-full transition-all duration-300 ${
                  active === n.id ? 'w-3.5 h-3.5 bg-gold-400 shadow-lg shadow-gold-500/50' : 'w-2.5 h-2.5 bg-white/40 group-hover:bg-white/70'
                }`} />
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* زر العودة */}
      {opened && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="fixed top-5 right-5 z-40">
          <Link to="/" className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-gold-300/30 px-4 py-2 text-sm font-bold text-gold-100 hover:bg-white/20 transition-colors">
            <ArrowRight className="w-4 h-4" />
            دعوتك
          </Link>
        </motion.div>
      )}

      {/* ===== البداية ===== */}
      <section id="start" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-maroon-700 via-maroon-800 to-maroon-900">
        {[...Array(16)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-gold-300/20 float-heart"
            style={{
              right: `${(i * 61) % 100}%`,
              width: `${9 + ((i * 13) % 13)}px`,
              animationDuration: `${9 + (i % 5) * 4}s`,
              animationDelay: `${i * 1.1}s`,
            }}
            fill="currentColor"
          />
        ))}
        <div className="absolute inset-0 pattern-bg opacity-[0.07]" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 glow-gold" />

        {opened && (
          <div className="relative text-center px-6 py-28">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-display text-gold-200 text-xl">
              بسم الله الرحمن الرحيم
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="ornament-divider mt-8">
              <span className="w-16 h-px bg-gold-400/60" /><span className="text-2xl">✦</span><span className="w-16 h-px bg-gold-400/60" />
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-8 text-white/85 text-lg leading-9">
              يتشرّفان بدعوتكم لحضور حفل زفافهما
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 80, damping: 14 }}
              className="mt-6 font-display text-6xl sm:text-8xl font-bold text-white leading-[1.4]"
            >
              عبدالله <span className="gold-text">و</span> نورة
            </motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }} className="mt-6 flex items-center justify-center gap-4 text-gold-200 text-lg tracking-[0.3em]">
              <span className="w-12 h-px bg-gold-400/60" />
              15 / 01 / 2027
              <span className="w-12 h-px bg-gold-400/60" />
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              onClick={() => scrollTo('countdown')}
              className="mt-16 inline-flex flex-col items-center gap-2 text-gold-200/80 hover:text-gold-200 transition-colors"
            >
              <span className="text-sm font-bold">اسحب للتفاصيل</span>
              <ChevronDown className="w-6 h-6 animate-bounce" />
            </motion.button>
          </div>
        )}
      </section>

      {/* ===== العد التنازلي ===== */}
      <InviteSection id="countdown" kicker="نعدّ اللحظات" title="حتى نلقاكم">
        <div className="grid grid-cols-4 gap-3 sm:gap-5 max-w-xl mx-auto">
          {[
            { v: days, l: 'يوم' },
            { v: hours, l: 'ساعة' },
            { v: minutes, l: 'دقيقة' },
            { v: seconds, l: 'ثانية' },
          ].map((u, i) => (
            <motion.div
              key={u.l}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl bg-white/[0.07] border border-gold-300/25 py-6 backdrop-blur-sm"
            >
              <div className="text-3xl sm:text-5xl font-black text-gold-200 tabular-nums">{String(u.v).padStart(2, '0')}</div>
              <div className="mt-1 text-sm text-white/50">{u.l}</div>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 text-white/55 flex items-center justify-center gap-2">
          <CalendarDays className="w-5 h-5 text-gold-300" />
          الجمعة 15 يناير 2027 — قاعة المملكة الكبرى، الرياض
        </p>
      </InviteSection>

      {/* ===== قصتنا ===== */}
      <InviteSection id="story" kicker="كيف بدأت" title="قصتنا" light>
        <div className="relative max-w-xl mx-auto text-right">
          <div className="absolute top-0 bottom-0 right-[19px] w-px bg-gradient-to-b from-maroon-300 via-gold-400 to-maroon-300" />
          {[
            { icon: <Sparkles className="w-4 h-4" />, title: 'اللقاء الأول', text: 'التقينا في مناسبة عائلية جامعة، وكانت البداية حديثاً قصيراً تحوّل إلى صداقة جميلة.' },
            { icon: <Heart className="w-4 h-4" />, title: 'الخطوبة', text: 'بعد عامين، تقدّم عبدالله لخطبة نورة وسط فرحة العائلتين — وكانت أجمل ليلة.' },
            { icon: <Users className="w-4 h-4" />, title: 'اليوم الموعود', text: 'واليوم نكمل الحكاية معكم — أهلنا وأحبابنا — في ليلة ننتظرها منذ زمن.' },
          ].map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="relative flex gap-6 pb-12 last:pb-0"
            >
              <span className="relative z-10 grid place-items-center w-10 h-10 rounded-full gold-grad text-white shadow-lg shadow-gold-500/30 shrink-0">
                {s.icon}
              </span>
              <div className="rounded-3xl bg-white border border-gold-200 p-6 shadow-sm flex-1">
                <h4 className="font-black text-maroon-700 text-lg">{s.title}</h4>
                <p className="mt-2 text-ink/60 leading-8">{s.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </InviteSection>

      {/* ===== التفاصيل ===== */}
      <InviteSection id="details" kicker="تفاصيل الحفل" title="كل ما تحتاج معرفته">
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto text-right">
          {[
            { icon: <CalendarDays className="w-6 h-6" />, title: 'التاريخ', text: 'الجمعة 15 يناير 2027' },
            { icon: <Clock className="w-6 h-6" />, title: 'الوقت', text: 'الاستقبال 7:00 مساءً — العشاء 9:30 مساءً' },
            { icon: <MapPin className="w-6 h-6" />, title: 'المكان', text: 'قاعة المملكة الكبرى — طريق الملك فهد، الرياض' },
            { icon: <Users className="w-6 h-6" />, title: 'الزي', text: 'رسمي — ألوان هادئة تليق بالمناسبة' },
          ].map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl bg-white/[0.07] border border-gold-300/25 p-6 backdrop-blur-sm hover:bg-white/[0.12] transition-colors"
            >
              <span className="grid place-items-center w-12 h-12 rounded-2xl gold-grad text-white shadow-lg">{d.icon}</span>
              <h4 className="mt-4 font-black text-gold-200">{d.title}</h4>
              <p className="mt-1.5 text-white/65 leading-7 text-[15px]">{d.text}</p>
            </motion.div>
          ))}
        </div>
      </InviteSection>

      {/* ===== الموقع ===== */}
      <InviteSection id="location" kicker="وصلناكم أسهل" title="موقع القاعة" light>
        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-[32px] border border-gold-300 shadow-xl">
            {/* خريطة توضيحية أنيقة */}
            <div className="relative h-64 bg-gradient-to-br from-[#efe7d3] to-[#e0d3b4]">
              <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: 'linear-gradient(#c8b98d 1px, transparent 1px), linear-gradient(90deg, #c8b98d 1px, transparent 1px)',
                backgroundSize: '34px 34px',
              }} />
              <div className="absolute top-1/3 right-0 left-0 h-2.5 bg-white/80 rotate-[-4deg] shadow-sm" />
              <div className="absolute top-0 bottom-0 right-1/3 w-2 bg-white/70 rotate-[8deg] shadow-sm" />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-[38%] right-[52%]"
              >
                <span className="relative grid place-items-center w-12 h-12 rounded-full bg-maroon-600 text-white shadow-xl shadow-maroon-800/40">
                  <MapPin className="w-6 h-6" />
                  <span className="absolute -bottom-1 w-3 h-3 bg-maroon-600 rotate-45" />
                </span>
              </motion.div>
              <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-maroon-700 shadow">
                قاعة المملكة الكبرى
              </span>
            </div>
          </div>
          <a
            href="https://maps.google.com/?q=Riyadh"
            target="_blank"
            rel="noreferrer"
            className="btn-gold mt-8 inline-flex items-center gap-2 px-8 py-3.5"
          >
            <MapPin className="w-5 h-5" />
            افتح الموقع في الخرائط
          </a>
        </div>
      </InviteSection>

      {/* ===== البرنامج ===== */}
      <InviteSection id="program" kicker="برنامج الليلة" title="لحظات نعيشها معاً">
        <div className="max-w-xl mx-auto space-y-4">
          {[
            { time: '7:00', icon: <Users className="w-5 h-5" />, title: 'استقبال الضيوف', desc: 'قهوة عربية وضيافة ترحيبية' },
            { time: '8:00', icon: <Sparkles className="w-5 h-5" />, title: 'دخول العروسين', desc: 'الزفة والترحيب بالعروسين' },
            { time: '9:30', icon: <UtensilsCrossed className="w-5 h-5" />, title: 'وليمة العشاء', desc: 'بوفيه مفتوح على شرف الضيوف' },
            { time: '11:00', icon: <Music className="w-5 h-5" />, title: 'ختام الحفل', desc: 'كلمات شكر وتوديع العروسين' },
          ].map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-5 rounded-3xl bg-white/[0.07] border border-gold-300/25 p-5 backdrop-blur-sm text-right"
            >
              <span className="grid place-items-center w-16 h-16 rounded-2xl bg-white/[0.08] border border-gold-300/25 text-gold-200 font-black text-lg shrink-0 tabular-nums">
                {p.time}
              </span>
              <div className="flex-1">
                <h4 className="font-black text-white flex items-center gap-2">
                  <span className="text-gold-300">{p.icon}</span>
                  {p.title}
                </h4>
                <p className="text-white/55 text-sm mt-1">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </InviteSection>

      {/* ===== تأكيد الحضور ===== */}
      <InviteSection id="rsvp" kicker="شرّفونا بحضوركم" title="تأكيد الحضور" light>
        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {rsvp === 'none' ? (
              <motion.div key="form" exit={{ opacity: 0, y: -20 }} className="rounded-[32px] bg-white border border-gold-200 p-8 shadow-xl">
                <p className="text-ink/60 leading-8">يسعدنا تأكيد حضوركم قبل 1 يناير 2027</p>
                <div className="mt-6">
                  <label className="block text-right text-sm font-black text-ink/70 mb-2">عدد الحضور</label>
                  <div className="flex items-center justify-center gap-4">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setGuestsCount(n)}
                        className={`w-12 h-12 rounded-2xl font-black text-lg transition-all ${
                          guestsCount === n
                            ? 'gold-grad text-white shadow-lg scale-110'
                            : 'bg-cream border border-gold-200 text-ink/60 hover:border-gold-400'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button onClick={() => setRsvp('yes')} className="btn-gold py-4 text-lg">
                    <Check className="inline w-5 h-5 ml-1" />
                    نعم، بحضور
                  </button>
                  <button
                    onClick={() => setRsvp('no')}
                    className="rounded-full border-2 border-maroon-200 py-4 font-bold text-maroon-600 hover:bg-maroon-50 transition-colors"
                  >
                    <X className="inline w-5 h-5 ml-1" />
                    أعتذر عن الحضور
                  </button>
                </div>
              </motion.div>
            ) : rsvp === 'yes' ? (
              <motion.div
                key="yes"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[32px] bg-white border-2 border-gold-400 p-8 shadow-2xl text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                  className="mx-auto grid place-items-center w-20 h-20 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30"
                >
                  <Check className="w-10 h-10" strokeWidth={3} />
                </motion.div>
                <h3 className="mt-5 font-display text-3xl font-bold text-maroon-700">أهلاً وسهلاً بكم!</h3>
                <p className="mt-2 text-ink/55">تم تسجيل حضوركم ({guestsCount} أشخاص) — هذه بطاقة دخولكم:</p>
                {/* بطاقة الباركود */}
                <div className="mt-6 rounded-3xl border-2 border-dashed border-gold-400 bg-cream p-6">
                  <QrCode className="mx-auto w-28 h-28 text-ink" strokeWidth={1.2} />
                  <p className="mt-3 font-black text-ink tracking-[0.3em]" dir="ltr">DAWATAK-2027-0847</p>
                  <p className="text-xs text-ink/45 mt-1">أظهروا الباركود عند الباب — الدخول خلال ثوانٍ</p>
                </div>
                <button className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-gold-300 px-6 py-2.5 font-bold text-gold-700 hover:bg-gold-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  إضافة إلى المحفظة
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="no"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[32px] bg-white border border-gold-200 p-10 shadow-xl text-center"
              >
                <Heart className="mx-auto w-14 h-14 text-maroon-300" fill="currentColor" strokeWidth={0} />
                <h3 className="mt-4 font-display text-2xl font-bold text-maroon-700">تشرّفنا بدعوتكم</h3>
                <p className="mt-2 text-ink/55 leading-8">نشكر لطفكم، ونتمنى لكم التوفيق — ستصلكم رسالة شكر عبر واتساب.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </InviteSection>

      {/* ===== الختام ===== */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-maroon-900 to-[#200a0d]" />
        {[...Array(10)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-gold-300/15 float-heart"
            style={{ right: `${(i * 97) % 100}%`, width: `${10 + i * 2}px`, animationDuration: `${10 + i * 2}s`, animationDelay: `${i * 1.4}s` }}
            fill="currentColor"
          />
        ))}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="ornament-divider">
              <span className="w-16 h-px bg-gold-400/60" /><span className="text-2xl">✦</span><span className="w-16 h-px bg-gold-400/60" />
            </div>
            <p className="mt-8 font-display text-3xl sm:text-5xl font-bold text-white leading-[1.6]">
              بحضوركم تكتمل <span className="gold-text">فرحتنا</span>
            </p>
            <p className="mt-6 text-white/50">عبدالله ونورة — 15 يناير 2027</p>
            <Link to="/pricing" className="btn-gold mt-12 inline-flex px-9 py-4">
              اصنع دعوتك بهذه الفخامة
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
