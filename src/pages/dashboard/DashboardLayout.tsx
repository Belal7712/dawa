import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import {
  CalendarDays,
  Users,
  Settings,
  Menu,
  X,
  Mail,
  Sparkles,
  Home,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AccountMenu from '@/components/AccountMenu';

const navItems = [
  {
    to: '/dashboard',
    label: 'الرئيسية',
    icon: Home,
    disabled: false,
    end: true,
  },
  {
    to: '/dashboard/events',
    label: 'المناسبات',
    icon: CalendarDays,
    disabled: false,
    end: false,
  },
  {
    to: '/dashboard/guests',
    label: 'الضيوف',
    icon: Users,
    disabled: true,
    badge: 'قريباً',
    end: false,
  },
  {
    to: '/dashboard/settings',
    label: 'الإعدادات',
    icon: Settings,
    disabled: false,
    end: false,
  },
] as const;

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1.5 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.disabled) {
          return (
            <div
              key={item.to}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-ink/35 cursor-not-allowed"
              title="قريباً"
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-bold flex-1">{item.label}</span>
              <span className="text-[10px] font-black rounded-full bg-gold-100 text-gold-700/70 px-2 py-0.5">
                {item.badge}
              </span>
            </div>
          );
        }
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-colors ${
                isActive
                  ? 'bg-gold-100 text-gold-800 border border-gold-200'
                  : 'text-ink/70 hover:bg-gold-50 hover:text-ink'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout() {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const greetName = profile?.full_name?.trim() || user?.email || 'مرحباً';

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <div className="absolute inset-0 pattern-bg opacity-30 pointer-events-none" />

      <div className="relative flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-l border-gold-200/80 bg-white/80 backdrop-blur-xl">
          <div className="px-5 py-6 border-b border-gold-100">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="relative grid place-items-center w-10 h-10 rounded-2xl gold-grad shadow-lg shadow-gold-600/25">
                <Mail className="w-4 h-4 text-white" strokeWidth={2.2} />
                <Sparkles className="w-2.5 h-2.5 text-gold-100 absolute -top-0.5 -left-0.5" />
              </span>
              <span>
                <span className="block text-lg font-black gold-text">دعوتك</span>
                <span className="block text-[10px] font-medium text-gold-700/60">لوحة التحكم</span>
              </span>
            </Link>
          </div>
          <SideNav />
          <div className="mt-auto p-4 border-t border-gold-100">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-ink/50 hover:text-ink hover:bg-gold-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              العودة للموقع
            </Link>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 border-b border-gold-200/70 bg-cream/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  className="lg:hidden grid place-items-center w-10 h-10 rounded-xl border border-gold-200 bg-white/70 text-ink"
                  onClick={() => setMobileOpen(true)}
                  aria-label="القائمة"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-black text-ink truncate">
                    مرحباً، <span className="gold-text">{greetName}</span>
                  </p>
                  {profile?.full_name && user?.email && (
                    <p className="text-xs text-ink/45 truncate" dir="ltr">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <AccountMenu compact />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="إغلاق"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 w-[280px] bg-cream shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-gold-100">
              <span className="text-lg font-black gold-text">دعوتك</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid place-items-center w-9 h-9 rounded-xl border border-gold-200"
                aria-label="إغلاق القائمة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SideNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
