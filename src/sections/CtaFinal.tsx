import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { WHATSAPP_LINK } from '../data/content';

export default function CtaFinal() {
  return (
    <section className="relative py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[40px] bg-gradient-to-br from-maroon-700 via-maroon-800 to-[#2a0d10] px-8 py-20 text-center shadow-[0_40px_100px_-30px_rgba(87,30,36,0.6)]"
      >
        {/* زخارف */}
        <div className="absolute inset-0 pattern-bg opacity-10" />
        <div className="absolute -top-24 -right-24 w-80 h-80 glow-gold" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 glow-gold" />
        <span className="absolute top-10 right-12 text-gold-400/60 text-2xl sparkle">✦</span>
        <span className="absolute bottom-12 left-16 text-gold-400/50 text-xl sparkle">✧</span>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-white/5 px-5 py-2 text-sm font-bold text-gold-200 backdrop-blur">
            <Sparkles className="w-4 h-4" />
            مناسبتك القادمة تستاهل الأفضل
          </span>
          <h2 className="mt-7 font-display text-4xl sm:text-6xl font-bold leading-[1.35] text-white">
            جاهز تبهر <span className="gold-text">ضيوفك؟</span>
          </h2>
          <p className="mt-5 text-white/65 text-lg leading-9 max-w-xl mx-auto">
            ابدأ الآن وخلّ دعوتك أول انطباع لا يُنسى —
            صمّمها بنفسك أو خلّنا نرسلها باسم كل ضيف.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo" className="btn-gold group px-9 py-4 text-base">
              جرّب الدعوة التجريبية
              <ArrowLeft className="inline-block w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            </Link>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-9 py-[14px] font-bold text-white transition-all hover:bg-white/10 hover:border-white/40"
            >
              <MessageCircle className="w-5 h-5" />
              كلمنا واتساب
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
