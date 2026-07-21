import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPlaceholder() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 pattern-bg opacity-40" />
      <div className="relative mx-auto max-w-lg px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-lux p-10 text-center"
        >
          <h1 className="text-3xl font-black text-ink">
            لوحة الأدمن — <span className="gold-text font-display">قريباً</span>
          </h1>
          <p className="mt-4 text-sm font-bold text-ink/70" dir="ltr">
            {user?.email}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
