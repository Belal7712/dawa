import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, QrCode, ChevronDown } from 'lucide-react';

const TARGET = new Date('2027-01-15T19:00:00');

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, TARGET.getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** دعوة مصغّرة حيّة داخل إطار هاتف — مظروف ينفتح ثم محتوى يتمرر */
export default function PhoneMockup() {
  const [opened, setOpened] = useState(false);
  const { days, hours, minutes, seconds } = useCountdown();

  return (
    <div className="relative mx-auto w-[300px] sm:w-[330px]">
      {/* توهج خلفي */}
      <div className="absolute -inset-10 glow-gold rounded-full" />

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[44px] border-[10px] border-[#1b2438] bg-[#1b2438] shadow-[0_50px_100px_-20px_rgba(23,34,59,0.5)]"
      >
        {/* نوتش */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#1b2438] rounded-b-2xl z-20" />

        <div className="relative h-[600px] rounded-[34px] overflow-hidden bg-gradient-to-b from-maroon-700 via-maroon-800 to-maroon-900">
          {/* نجوم/قلوب زخرفية */}
          {[...Array(14)].map((_, i) => (
            <Heart
              key={i}
              className="absolute text-gold-300/25 float-heart"
              style={{
                right: `${(i * 37) % 100}%`,
                width: `${8 + ((i * 7) % 10)}px`,
                animationDuration: `${9 + (i % 5) * 3}s`,
                animationDelay: `${i * 1.3}s`,
              }}
              fill="currentColor"
            />
          ))}

          {!opened ? (
            /* ===== غلاف المظروف ===== */
            <motion.button
              onClick={() => setOpened(true)}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 cursor-pointer"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                className="relative w-44 h-32"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gold-200 to-gold-400 shadow-2xl shadow-black/40" />
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-gold-300 to-gold-500 origin-top rounded-t-lg shadow-md"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                />
                <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gold-100/95 rounded-b-lg flex items-end justify-center pb-3"
                  style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 30%, 50% 0, 0 30%)' }}
                >
                  <span className="font-display text-maroon-700 text-lg font-bold">افتح الدعوة</span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-maroon-600 border-2 border-gold-200 grid place-items-center shadow-lg">
                  <Heart className="w-4 h-4 text-gold-200" fill="currentColor" />
                </div>
              </motion.div>
              <p className="text-gold-100/80 text-sm font-bold flex items-center gap-2">
                <ChevronDown className="w-4 h-4 animate-bounce" />
                اضغط لفتح المظروف
              </p>
            </motion.button>
          ) : (
            /* ===== محتوى الدعوة ===== */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <div className="min-h-full flex flex-col items-center justify-center text-center px-6 py-14">
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-gold-200/90 text-sm"
                >
                  بسم الله الرحمن الرحيم
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-4 text-white/85 text-[13px] leading-6"
                >
                  يتشرّفان بدعوتكم لحضور
                  <br />
                  حفل زفافهما
                </motion.p>
                <motion.h3
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55, type: 'spring', stiffness: 120 }}
                  className="mt-4 font-display text-4xl font-bold text-white leading-[1.5]"
                >
                  عبدالله <span className="gold-text">و</span> نورة
                </motion.h3>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.75 }}
                  className="mt-3 flex items-center gap-3 text-gold-300 text-xs"
                >
                  <span className="w-8 h-px bg-gold-400/50" />
                  15 / 01 / 2027
                  <span className="w-8 h-px bg-gold-400/50" />
                </motion.div>

                {/* عدّاد */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mt-6 grid grid-cols-4 gap-2 w-full max-w-[240px]"
                >
                  {[
                    { v: days, l: 'يوم' },
                    { v: hours, l: 'ساعة' },
                    { v: minutes, l: 'دقيقة' },
                    { v: seconds, l: 'ثانية' },
                  ].map((u) => (
                    <div key={u.l} className="rounded-xl bg-white/[0.07] border border-gold-300/20 py-2 backdrop-blur-sm">
                      <div className="text-lg font-black text-gold-200 tabular-nums">{String(u.v).padStart(2, '0')}</div>
                      <div className="text-[10px] text-white/50">{u.l}</div>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.05 }}
                  className="mt-6 w-full max-w-[240px] space-y-2.5"
                >
                  <span className="flex items-center justify-center gap-1.5 rounded-full border border-gold-300/30 py-2 text-[11px] text-gold-100/90">
                    <MapPin className="w-3 h-3" /> قاعة المملكة — الرياض
                  </span>
                  <span className="btn-gold flex items-center justify-center gap-2 rounded-full py-2.5 text-xs">
                    تأكيد الحضور
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-5 flex items-center gap-2 text-white/40 text-[10px]"
                >
                  <QrCode className="w-8 h-8 text-gold-300/70" />
                  بطاقة دخول بالباركود
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* شارة عائمة */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="absolute -left-8 top-24 z-20 rounded-2xl bg-white/95 backdrop-blur px-4 py-3 shadow-xl border border-gold-200"
      >
        <div className="text-[11px] text-ink/60 font-bold">تأكيد حضور</div>
        <div className="text-sm font-black text-emerald-600">+128 مؤكد ✓</div>
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
        className="absolute -right-6 bottom-28 z-20 rounded-2xl bg-white/95 backdrop-blur px-4 py-3 shadow-xl border border-gold-200"
      >
        <div className="text-[11px] text-ink/60 font-bold">واتساب</div>
        <div className="text-sm font-black text-ink">أُرسلت لـ 350 ضيف</div>
      </motion.div>
    </div>
  );
}
