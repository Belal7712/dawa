import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Features from '../sections/Features';
import HowItWorks from '../sections/HowItWorks';
import CtaFinal from '../sections/CtaFinal';
import { faqs } from '../data/content';

function FaqItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(i === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.07, duration: 0.5 }}
      className={`card-lux overflow-hidden ${open ? '!border-gold-400' : ''}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-7 py-5 text-right"
      >
        <span className="font-black text-ink text-lg">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className={`grid place-items-center w-9 h-9 rounded-full shrink-0 transition-colors ${
            open ? 'gold-grad text-white' : 'bg-gold-100 text-gold-700'
          }`}
        >
          <ChevronDown className="w-4 h-4" strokeWidth={3} />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="overflow-hidden"
      >
        <p className="px-7 pb-6 text-ink/60 leading-8">{a}</p>
      </motion.div>
    </motion.div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <div className="pt-24" />
      <Features />
      <HowItWorks />

      {/* الأسئلة الشائعة */}
      <section id="faq" className="relative py-24">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="chip">الأسئلة الشائعة</span>
            <h2 className="section-title mt-5">
              عندك سؤال؟ <span className="gold-text font-display">عندنا الجواب</span>
            </h2>
          </motion.div>
          <div className="mt-12 space-y-4">
            {faqs.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} i={i} />
            ))}
          </div>
        </div>
      </section>

      <CtaFinal />
    </>
  );
}
