import { motion } from 'framer-motion';
import { Palette, Send, BarChart3 } from 'lucide-react';
import { steps } from '../data/content';

const icons: Record<string, React.ReactNode> = {
  palette: <Palette className="w-8 h-8" />,
  send: <Send className="w-8 h-8" />,
  chart: <BarChart3 className="w-8 h-8" />,
};

export default function HowItWorks() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-gold-50/50 to-cream" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="chip">كيف تشتغل؟</span>
          <h2 className="section-title mt-5">
            ثلاث خطوات.. <span className="gold-text font-display">ومناسبتك جاهزة</span>
          </h2>
        </motion.div>

        <div className="relative mt-20">
          {/* الخط الواصل */}
          <div className="hidden md:block absolute top-12 right-[16%] left-[16%] h-[2px] bg-gradient-to-l from-gold-200 via-gold-400 to-gold-200" />

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: i * 0.18 }}
                className="relative text-center group"
              >
                <div className="relative inline-block">
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`relative z-10 grid place-items-center w-24 h-24 mx-auto rounded-full text-gold-600 transition-all duration-500 ${
                      i === 1
                        ? 'gold-grad text-white shadow-2xl shadow-gold-500/40 scale-110'
                        : 'bg-white border-2 border-gold-300 shadow-xl shadow-gold-500/15 group-hover:border-gold-500'
                    }`}
                  >
                    {icons[step.icon]}
                  </motion.div>
                  <span className="absolute -top-1 -right-1 z-20 grid place-items-center w-8 h-8 rounded-full bg-ink text-gold-300 text-sm font-black shadow-lg">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-7 text-2xl font-black text-ink">{step.title}</h3>
                <p className="mt-3 text-ink/55 leading-8 max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
