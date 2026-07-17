import { motion } from 'framer-motion';

export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <section className="relative pt-[130px] pb-24 min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pattern-bg opacity-50" />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] glow-gold" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-5xl sm:text-6xl font-black text-ink">
            {title}
          </h1>
          <p className="mt-5 text-lg text-ink/55 leading-9">
            هذه الصفحة قريباً جداً — شكراً لصبرك!
          </p>
          <div className="mt-10">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-gold-600 px-8 py-3.5 text-white font-bold hover:bg-gold-700 transition-colors"
            >
              العودة للرئيسية
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
