import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Check, Crown, ArrowLeft } from 'lucide-react';
import { serviceCards, comparisonRows } from '../data/content';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
};

export default function Services() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* العنوان */}
        <motion.div {...fadeUp} transition={{ duration: 0.7 }} className="text-center max-w-2xl mx-auto">
          <span className="chip">خدماتنا</span>
          <h2 className="section-title mt-5">
            وش تحتاج <span className="gold-text font-display">لمناسبتك؟</span>
          </h2>
          <p className="mt-4 text-ink/55 text-lg leading-8">
            طريقتان توصل فيهما دعوتك لضيوفك — اختر ما يناسبك، أو اجمع بينهما.
          </p>
        </motion.div>

        {/* بطاقتا الخدمة */}
        <div className="mt-16 grid lg:grid-cols-2 gap-8">
          {serviceCards.map((card, idx) => {
            const isGold = card.tone === 'gold';
            return (
              <motion.div
                key={card.id}
                {...fadeUp}
                transition={{ duration: 0.7, delay: idx * 0.15 }}
                className={`card-lux relative overflow-hidden p-8 sm:p-10 ${
                  isGold
                    ? 'bg-gradient-to-br from-[#fffdf6] to-[#faf3df]'
                    : 'bg-gradient-to-br from-[#f6fffa] to-[#e8f9f0]'
                }`}
              >
                <div
                  className={`absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-30 ${
                    isGold ? 'bg-gold-300' : 'bg-emerald-300'
                  }`}
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <span
                      className={`grid place-items-center w-16 h-16 rounded-2xl shadow-lg ${
                        isGold
                          ? 'gold-grad shadow-gold-500/30'
                          : 'bg-gradient-to-br from-[#25d366] to-[#128c4b] shadow-green-500/30'
                      }`}
                    >
                      {isGold ? (
                        <Mail className="w-7 h-7 text-white" />
                      ) : (
                        <MessageCircle className="w-7 h-7 text-white" fill="currentColor" strokeWidth={0} />
                      )}
                    </span>
                    <span
                      className={`rounded-full px-4 py-1.5 text-xs font-black ${
                        isGold ? 'bg-gold-500 text-white' : 'bg-[#128c4b] text-white'
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="mt-7 text-3xl font-black text-ink">{card.title}</h3>
                  <p className="mt-3 text-ink/55 leading-7">{card.subtitle}</p>

                  <ul className="mt-7 space-y-3.5">
                    {card.points.map((p) => (
                      <li key={p} className="flex items-center gap-3 text-[15px] text-ink/75">
                        <span
                          className={`grid place-items-center w-6 h-6 rounded-full shrink-0 ${
                            isGold ? 'bg-gold-100 text-gold-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9 flex flex-wrap gap-3">
                    <Link
                      to={card.ctaPrimary.href}
                      className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 ${
                        isGold
                          ? 'btn-gold'
                          : 'bg-gradient-to-br from-[#25d366] to-[#128c4b] shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/35'
                      }`}
                    >
                      {card.ctaPrimary.label}
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </Link>
                    <Link
                      to={card.ctaSecondary.href}
                      className={`inline-flex items-center rounded-full border-2 px-6 py-[10px] text-sm font-bold transition-colors ${
                        isGold
                          ? 'border-gold-300 text-gold-700 hover:bg-gold-50'
                          : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {card.ctaSecondary.label}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ===== جدول المقارنة ===== */}
        <motion.div {...fadeUp} transition={{ duration: 0.7 }} className="mt-24">
          <h3 className="text-center text-3xl sm:text-4xl font-black text-ink">
            أيهما يناسب <span className="gold-text font-display">مناسبتك؟</span>
          </h3>

          <div className="mt-10 card-lux overflow-hidden !rounded-[28px]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-right">
                <thead>
                  <tr className="bg-gradient-to-l from-gold-50 to-cream border-b border-gold-200/70">
                    <th className="px-6 py-5 text-sm font-black text-ink/50">وجه المقارنة</th>
                    <th className="px-6 py-5">
                      <span className="inline-flex items-center gap-2 text-gold-700 font-black">
                        <Mail className="w-5 h-5" /> صفحة الدعوة الإلكترونية
                      </span>
                    </th>
                    <th className="px-6 py-5">
                      <span className="inline-flex items-center gap-2 text-[#128c4b] font-black">
                        <MessageCircle className="w-5 h-5" fill="currentColor" strokeWidth={0} /> إرسال واتساب مباشر
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.aspect} className={`border-b border-gold-100 last:border-0 transition-colors hover:bg-gold-50/50 ${i % 2 ? 'bg-cream/60' : ''}`}>
                      <td className="px-6 py-5 font-black text-ink/70 text-sm">{row.aspect}</td>
                      <td className="px-6 py-5 text-ink/70 text-[15px]">{row.einvite}</td>
                      <td className="px-6 py-5 text-ink/70 text-[15px]">{row.whatsapp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-gradient-to-l from-gold-100/80 to-gold-50 px-6 py-6 border-t border-gold-200/70">
              <Crown className="w-5 h-5 text-gold-600" />
              <p className="font-bold text-ink/75 text-center">
                تبي الاثنين معاً؟ صفحة دعوة فاخرة + إرسال واتساب باسم كل ضيف
              </p>
              <Link to="/pricing" className="font-black text-gold-700 underline decoration-gold-300 underline-offset-4 hover:text-gold-600">
                شوف كيف تجمع بينهما ←
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
