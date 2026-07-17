import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  Mail, MessageCircle, Bell, BarChart3, ShieldCheck, Users, ArrowLeft,
} from 'lucide-react';
import { features } from '../data/content';

const iconMap: Record<string, React.ReactNode> = {
  mail: <Mail className="w-6 h-6" />,
  whatsapp: <MessageCircle className="w-6 h-6" fill="currentColor" strokeWidth={0} />,
  bell: <Bell className="w-6 h-6" />,
  chart: <BarChart3 className="w-6 h-6" />,
  shield: <ShieldCheck className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
};

export default function Features() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="chip">المميزات</span>
          <h2 className="section-title mt-5">
            كل ما تحتاجه <span className="gold-text font-display">لاستضافة المناسبة المثالية</span>
          </h2>
          <p className="mt-4 text-ink/55 text-lg leading-8">
            أدوات قوية صُممت لجعل تخطيط المناسبات سهلاً ومريحاً.
          </p>
        </motion.div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.12 }}
              className="card-lux group relative overflow-hidden p-8"
            >
              <div
                className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                style={{ background: f.tone }}
              />
              {f.badge && (
                <span className="absolute top-5 left-5 rounded-full bg-gold-500 text-white text-[11px] font-black px-3 py-1">
                  {f.badge}
                </span>
              )}
              <div
                className="grid place-items-center w-14 h-14 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                style={{ background: `${f.tone}1a`, color: f.tone }}
              >
                {iconMap[f.icon]}
              </div>
              <h3 className="mt-6 text-xl font-black text-ink">{f.title}</h3>
              <p className="mt-3 text-ink/55 leading-8 text-[15px]">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-14 text-center"
        >
          <Link to="/pricing" className="btn-gold group inline-flex items-center gap-2 px-9 py-4">
            اصنع مناسبتك الآن
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
