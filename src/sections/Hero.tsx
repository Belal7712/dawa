import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { MessageCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import PhoneMockup from '../components/PhoneMockup';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-[120px] pb-20 lg:pt-[150px] lg:pb-28">
      {/* خلفيات زخرفية */}
      <div className="absolute inset-0 pattern-bg opacity-60" />
      <div className="absolute -top-32 -right-32 w-[560px] h-[560px] glow-gold" />
      <div className="absolute top-1/3 -left-40 w-[480px] h-[480px] glow-gold opacity-70" />
      <motion.div
        className="absolute top-28 right-[12%] text-gold-400 text-2xl sparkle"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
      >
        ✦
      </motion.div>
      <div className="absolute bottom-24 left-[8%] text-gold-300 text-xl sparkle">✧</div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ===== النص ===== */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="chip"
            >
              <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
              الخيار الأول للمناسبات في السعودية والخليج
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-7 text-[42px] leading-[1.2] sm:text-6xl lg:text-[64px] font-black text-ink"
            >
              دعوة واتساب
              <br />
              <span className="text-ink">باسم كل ضيف</span>
              <br />
              <span className="gold-text font-display text-[52px] sm:text-7xl lg:text-[80px]">أو صفحة دعوة برابط أنيق</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-7 text-lg leading-9 text-ink/60 max-w-xl mx-auto lg:mx-0"
            >
              نرسل دعوتك عبر واتساب لكل ضيف باسمه مع تأكيد حضور وباركود،
              أو صمّم صفحة دعوتك بنفسك وشارك رابطها أينما تريد —
              وكل الردود توصلك في لوحة واحدة.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link to="/demo" className="btn-gold group px-8 py-4 text-base w-full sm:w-auto text-center">
                صمم دعوتك الآن
                <ArrowLeft className="inline-block w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                to="/pricing"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border-2 border-[#25d366]/60 bg-white px-8 py-[14px] font-bold text-[#128c4b] transition-all duration-300 hover:bg-[#25d366] hover:text-white hover:border-[#25d366] hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5" />
                أرسل دعوتك بالواتساب
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-6 text-sm"
            >
              <Link to="/pricing" className="text-gold-700 font-bold underline decoration-gold-300 underline-offset-4 hover:text-gold-600">
                وتقدر تجمع بينهما: صفحة دعوة + إرسال واتساب ←
              </Link>
            </motion.div>

            {/* ثقة */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75 }}
              className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-black text-ink">منصة جديدة — كن من أوائل عملائنا</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-ink/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                جاهزة خلال دقائق
              </div>
            </motion.div>
          </div>

          {/* ===== الهاتف ===== */}
          <div className="order-1 lg:order-2">
            <PhoneMockup />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-8 text-center"
            >
              <Link to="/demo" className="text-sm font-bold text-gold-700 underline decoration-gold-300 underline-offset-4 hover:text-gold-600">
                شاهد الدعوة التجريبية كاملة ←
              </Link>
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
