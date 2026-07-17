import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { testimonials } from '../data/content';

function Card({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <div className="card-lux w-[320px] shrink-0 p-6 mx-3 !cursor-default select-none">
      <div className="flex items-center justify-between">
        <div className="flex text-gold-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4" fill="currentColor" strokeWidth={0} />
          ))}
        </div>
        <Quote className="w-5 h-5 text-gold-300" fill="currentColor" strokeWidth={0} />
      </div>
      <p className="mt-4 text-ink/70 leading-8 text-[15px] min-h-[88px]">"{t.text}"</p>
      <div className="mt-4 pt-4 border-t border-gold-100 flex items-center gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-full gold-grad-soft border border-gold-300 font-black text-gold-700">
          {t.initial}
        </span>
        <span className="font-black text-ink text-sm">{t.name}</span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const rowA = testimonials.slice(0, 8);
  const rowB = testimonials.slice(8);

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pattern-bg opacity-40" />
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto px-6"
        >
          <span className="chip">قصص نجاح</span>
          <h2 className="section-title mt-5">
            عملاء شاركونا <span className="gold-text font-display">فرحتهم ووثقوا فينا</span>
          </h2>
        </motion.div>

        <div className="mt-16 space-y-6 [mask-image:linear-gradient(to_left,transparent,black_8%,black_92%,transparent)]">
          {/* الصف الأول */}
          <div className="overflow-hidden" dir="ltr">
            <div className="marquee-track">
              {[...rowA, ...rowA].map((t, i) => (
                <div dir="rtl" key={`${t.name}-${i}`}>
                  <Card t={t} />
                </div>
              ))}
            </div>
          </div>
          {/* الصف الثاني — اتجاه معاكس */}
          <div className="overflow-hidden" dir="ltr">
            <div className="marquee-track" style={{ animationDirection: 'reverse', animationDuration: '70s' }}>
              {[...rowB, ...rowB].map((t, i) => (
                <div dir="rtl" key={`${t.name}-${i}`}>
                  <Card t={t} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
