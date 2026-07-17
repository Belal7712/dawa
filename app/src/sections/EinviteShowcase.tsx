import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Mail, Globe, Timer, MapPin, MousePointerClick, ArrowLeft } from 'lucide-react';

const perks = [
  { icon: <Globe className="w-5 h-5" />, title: 'رابط واحد بلغتين', desc: 'عربي وإنجليزي في نفس الصفحة' },
  { icon: <Timer className="w-5 h-5" />, title: 'عدّاد تنازلي حي', desc: 'يعدّ اللحظات حتى ليلة الفرح' },
  { icon: <MapPin className="w-5 h-5" />, title: 'خريطة الموقع', desc: 'زر واحد يوصل ضيفك للقاعة' },
  { icon: <MousePointerClick className="w-5 h-5" />, title: 'تأكيد بضغطة', desc: 'الردود تصلك لحظياً بلوحة واحدة' },
];

export default function EinviteShowcase() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cream to-gold-50/60" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* معاينة بصرية */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative mx-auto max-w-md">
              {/* البطاقة الرئيسية */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="relative z-10 rounded-[28px] bg-gradient-to-br from-maroon-600 to-maroon-900 p-8 shadow-2xl shadow-maroon-800/40 border border-gold-400/30"
              >
                <div className="text-center">
                  <p className="font-display text-gold-200 text-sm">يتشرّفان بدعوتكم</p>
                  <p className="mt-3 font-display text-4xl font-bold text-white">عبدالله ونورة</p>
                  <div className="mt-4 flex items-center justify-center gap-3 text-gold-300 text-xs">
                    <span className="w-10 h-px bg-gold-400/50" />
                    الجمعة · 15 يناير 2027
                    <span className="w-10 h-px bg-gold-400/50" />
                  </div>
                  <div className="mt-6 grid grid-cols-4 gap-2">
                    {['182', '16', '45', '15'].map((v, i) => (
                      <div key={i} className="rounded-xl bg-white/10 border border-gold-300/20 py-2.5 backdrop-blur">
                        <div className="text-lg font-black text-gold-200 tabular-nums">{v}</div>
                        <div className="text-[10px] text-white/50">{['يوم', 'ساعة', 'دقيقة', 'ثانية'][i]}</div>
                      </div>
                    ))}
                  </div>
                  <span className="mt-6 inline-block rounded-full gold-grad px-8 py-2.5 text-sm font-bold text-white shadow-lg">
                    تأكيد الحضور
                  </span>
                </div>
              </motion.div>

              {/* بطاقات خلفية */}
              <div className="absolute -top-6 -right-6 w-full h-full rounded-[28px] bg-gold-200/60 border border-gold-300 rotate-3" />
              <div className="absolute -top-3 -right-3 w-full h-full rounded-[28px] bg-gold-100/70 border border-gold-200 rotate-1" />

              {/* شريط الرابط */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-white px-5 py-3 shadow-xl border border-gold-200 whitespace-nowrap"
              >
                <Globe className="w-4 h-4 text-gold-600" />
                <span className="text-sm font-bold text-ink/70" dir="ltr">da3wa.online/e/your-event</span>
              </motion.div>
            </div>
          </motion.div>

          {/* النص */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <span className="chip">
              <Mail className="w-4 h-4" />
              صفحة الدعوة الإلكترونية
            </span>
            <h2 className="section-title mt-5">
              صفحة دعوة أنيقة <span className="gold-text font-display">برابط خاص بك</span>
            </h2>
            <p className="mt-5 text-lg text-ink/55 leading-9">
              مظروف يُفتح بحركة ساحرة، عدّاد يشتعل حماساً، وخريطة توصل ضيوفك
              للقاعة بدون اتصال واحد — كل هذا في صفحة واحدة تشاركها أينما تريد.
            </p>

            <div className="mt-9 grid sm:grid-cols-2 gap-5">
              {perks.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-gold-100 text-gold-700 border border-gold-200 shrink-0">
                    {p.icon}
                  </span>
                  <div>
                    <div className="font-black text-ink">{p.title}</div>
                    <div className="text-sm text-ink/50 mt-0.5">{p.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/demo" className="btn-gold group px-8 py-3.5">
                جرّب الدعوة التجريبية
                <ArrowLeft className="inline-block w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                to="/pricing"
                className="rounded-full border-2 border-gold-300 px-8 py-3 font-bold text-gold-700 transition-colors hover:bg-gold-50"
              >
                تصفح القوالب
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
