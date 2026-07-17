import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail, MessageCircle, Sparkles } from 'lucide-react';
import { navLinks, footerLinks, WHATSAPP_LINK } from '../data/content';

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <span className="relative grid place-items-center w-11 h-11 rounded-2xl gold-grad shadow-lg shadow-gold-600/30 transition-transform duration-500 group-hover:rotate-6">
        <Mail className="w-5 h-5 text-white" strokeWidth={2.2} />
        <Sparkles className="w-3 h-3 text-gold-100 absolute -top-1 -left-1 sparkle" />
      </span>
      <span className="leading-tight">
        <span className={`block text-xl font-black tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
          <span className="gold-text">دعوتك</span>
        </span>
        <span className={`block text-[10px] font-medium ${dark ? 'text-gold-200/70' : 'text-gold-700/70'}`}>
          منصة الدعوات الفاخرة
        </span>
      </span>
    </Link>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-cream/85 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(120,90,30,0.18)] border-b border-gold-200/60'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-[76px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.href}
                to={l.href}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-full text-[15px] font-bold transition-colors duration-300 ${
                    isActive ? 'text-gold-700' : 'text-ink/70 hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-gold-100 border border-gold-200"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-full text-sm font-bold text-ink/70 hover:text-ink transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link to="/pricing" className="btn-gold px-6 py-2.5 text-sm">
              ابدأ الآن
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden grid place-items-center w-11 h-11 rounded-xl border border-gold-200 bg-white/70 text-ink"
            aria-label="القائمة"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="lg:hidden overflow-hidden bg-cream/95 backdrop-blur-xl border-b border-gold-200"
          >
            <div className="px-6 py-6 flex flex-col gap-2">
              {navLinks.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <NavLink
                    to={l.href}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-2xl font-bold ${
                        isActive ? 'bg-gold-100 text-gold-700' : 'text-ink/75'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              <Link to="/pricing" className="btn-gold mt-3 px-6 py-3.5 text-center">
                ابدأ الآن مجاناً
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#101a30] text-white">
      <div className="absolute inset-0 pattern-bg opacity-[0.06]" />
      <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] glow-gold" />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-10">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo dark />
            <p className="mt-6 max-w-sm text-white/60 leading-8">
              نجعل تخطيط المناسبات بسيطاً وأنيقاً وخالياً من التوتر — دعوات تليق
              بضيوفكم، وتنظيم يليق بفرحكم.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#1fbf5f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#23d168] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                كلمنا واتساب
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-gold-300 font-black mb-5">دعوتك</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-white/60 hover:text-gold-300 transition-colors text-[15px]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gold-300 font-black mb-5">الشركة</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-white/60 hover:text-gold-300 transition-colors text-[15px]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <p>© 2026 دعوتك. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-2">
            صُنع بحُب في السعودية
            <span className="text-gold-400">✦</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  return (
    <motion.a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل واتساب"
      className="fixed bottom-6 left-6 z-50 grid place-items-center w-[60px] h-[60px] rounded-full bg-[#25d366] text-white shadow-2xl shadow-green-600/40 animate-pulse-ring"
      whileHover={{ scale: 1.1, rotate: 8 }}
      whileTap={{ scale: 0.94 }}
    >
      <MessageCircle className="w-7 h-7" fill="currentColor" strokeWidth={0} />
    </motion.a>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
