import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Users,
  CheckCircle2,
  Clock3,
  Plus,
  LayoutTemplate,
  AlertCircle,
  RefreshCw,
  MapPin,
  Bell,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { eventTypeLabel } from '@/lib/eventTypes';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tables } from '@/types/database.types';

type EventRow = Tables<'events'>;

type GuestEmbed = {
  id: string;
  rsvps: { status: string | null } | { status: string | null }[] | null;
};

type EventWithGuests = EventRow & {
  guests: GuestEmbed[] | null;
};

type DashboardStats = {
  eventsCount: number;
  guestsCount: number;
  confirmedCount: number;
  pendingCount: number;
};

type Reminder = {
  id: string;
  message: string;
  href: string;
};

type RecentEvent = {
  id: string;
  title: string;
  event_type: string | null;
  venue_name: string | null;
  event_date: string | null;
  status: string | null;
  guestCount: number;
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  active: 'نشطة',
};

function formatEventDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function unwrapRsvp(
  rsvps: GuestEmbed['rsvps'],
): { status: string | null } | null {
  if (!rsvps) return null;
  return Array.isArray(rsvps) ? rsvps[0] ?? null : rsvps;
}

function computeFromEvents(rows: EventWithGuests[]): {
  stats: DashboardStats;
  recent: RecentEvent[];
  reminders: Reminder[];
} {
  let guestsCount = 0;
  let confirmedCount = 0;
  let pendingCount = 0;
  const reminders: Reminder[] = [];

  for (const event of rows) {
    const guests = event.guests ?? [];
    guestsCount += guests.length;

    for (const guest of guests) {
      const rsvp = unwrapRsvp(guest.rsvps);
      if (!rsvp || rsvp.status === 'pending') {
        pendingCount += 1;
      } else if (rsvp.status === 'confirmed') {
        confirmedCount += 1;
      }
    }

    if (guests.length === 0) {
      reminders.push({
        id: `no-guests-${event.id}`,
        message: `أضف ضيوفاً إلى «${event.title}»`,
        href: `/dashboard/events/${event.id}`,
      });
    }
    if (event.status === 'draft') {
      reminders.push({
        id: `draft-${event.id}`,
        message: `فعّل مناسبتك «${event.title}»`,
        href: `/dashboard/events/${event.id}`,
      });
    }
  }

  const recent: RecentEvent[] = rows.slice(0, 5).map((event) => ({
    id: event.id,
    title: event.title,
    event_type: event.event_type,
    venue_name: event.venue_name,
    event_date: event.event_date,
    status: event.status,
    guestCount: (event.guests ?? []).length,
  }));

  return {
    stats: {
      eventsCount: rows.length,
      guestsCount,
      confirmedCount,
      pendingCount,
    },
    recent,
    reminders: reminders.slice(0, 6),
  };
}

export default function DashboardHomePage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    eventsCount: 0,
    guestsCount: 0,
    confirmedCount: 0,
    pendingCount: 0,
  });
  const [recent, setRecent] = useState<RecentEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const greetName = profile?.full_name?.trim() || user?.email || 'مرحباً';

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('events')
      .select(
        `
        id,
        title,
        event_type,
        venue_name,
        event_date,
        status,
        created_at,
        guests (
          id,
          rsvps ( status )
        )
      `,
      )
      .eq('owner_id', user?.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setStats({ eventsCount: 0, guestsCount: 0, confirmedCount: 0, pendingCount: 0 });
      setRecent([]);
      setReminders([]);
      setLoading(false);
      return;
    }

    const computed = computeFromEvents((data ?? []) as EventWithGuests[]);
    setStats(computed.stats);
    setRecent(computed.recent);
    setReminders(computed.reminders);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const statCards = [
    {
      key: 'events',
      label: 'إجمالي المناسبات',
      value: stats.eventsCount,
      icon: CalendarDays,
      hint: 'من جدول المناسبات',
    },
    {
      key: 'guests',
      label: 'إجمالي الضيوف',
      value: stats.guestsCount,
      icon: Users,
      hint: 'عبر مناسباتك',
    },
    {
      key: 'confirmed',
      label: 'ردود مؤكدة',
      value: stats.confirmedCount,
      icon: CheckCircle2,
      hint: "status = 'confirmed'",
    },
    {
      key: 'pending',
      label: 'ردود معلقة',
      value: stats.pendingCount,
      icon: Clock3,
      hint: 'معلق أو بلا رد',
    },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-gold-200/80 bg-gradient-to-l from-maroon-900 via-maroon-800 to-maroon-700 p-6 sm:p-8 text-white"
      >
        <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />
        <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full bg-gold-400/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-sm font-bold text-gold-200/90">
            مرحباً، <span className="text-gold-100">{greetName}</span>
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">لوحة التحكم</h1>
          <p className="mt-2 text-sm sm:text-base text-white/70 font-medium max-w-xl">
            خطط ورتب وأدر مناسباتك بسهولة
          </p>
        </div>
      </motion.div>

      {error && (
        <div className="card-lux p-8 text-center hover:transform-none">
          <AlertCircle className="w-10 h-10 text-maroon-600 mx-auto" />
          <p className="mt-4 font-black text-ink">تعذّر تحميل لوحة التحكم</p>
          <p className="mt-2 text-sm text-ink/50">{error}</p>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-gold-300 bg-white px-6 py-2.5 font-bold text-ink/80 hover:border-gold-500"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-lux p-5 hover:transform-none">
                <Skeleton className="h-9 w-9 rounded-2xl bg-gold-100" />
                <Skeleton className="mt-4 h-8 w-16 bg-gold-100" />
                <Skeleton className="mt-2 h-4 w-24 bg-gold-100" />
              </div>
            ))
          : !error &&
            statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-lux p-5 hover:transform-none hover:shadow-[0_8px_28px_-10px_rgba(120,90,30,0.14)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid place-items-center w-10 h-10 rounded-2xl gold-grad-soft border border-gold-200">
                      <Icon className="w-5 h-5 text-gold-700" />
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-black text-ink tabular-nums">{card.value}</p>
                  <p className="mt-1 text-sm font-black text-ink/75">{card.label}</p>
                  <p className="mt-1 text-[11px] text-ink/35 font-medium">{card.hint}</p>
                </motion.div>
              );
            })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent events */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-ink">أحدث المناسبات</h2>
            <Link
              to="/dashboard/events"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-gold-700 hover:underline"
            >
              عرض الكل
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-lux p-5 hover:transform-none">
                  <Skeleton className="h-5 w-2/3 bg-gold-100" />
                  <Skeleton className="mt-3 h-4 w-1/2 bg-gold-100" />
                  <Skeleton className="mt-2 h-4 w-1/3 bg-gold-100" />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && recent.length === 0 && (
            <div className="card-lux p-10 text-center hover:transform-none">
              <CalendarDays className="w-10 h-10 text-gold-600 mx-auto" />
              <p className="mt-4 font-black text-ink">لا توجد مناسبات بعد</p>
              <p className="mt-2 text-sm text-ink/45">أنشئ أول مناسبة لبدء الإحصائيات والتذكيرات.</p>
              <Link
                to="/dashboard/events/new"
                className="btn-gold mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm"
              >
                <Plus className="w-4 h-4" />
                إنشاء مناسبة جديدة
              </Link>
            </div>
          )}

          {!loading && !error && recent.length > 0 && (
            <ul className="space-y-3">
              {recent.map((event, i) => (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/dashboard/events/${event.id}`}
                    className="card-lux block p-5 hover:transform-none hover:shadow-[0_8px_28px_-10px_rgba(120,90,30,0.14)] transition-shadow"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-ink truncate">{event.title}</h3>
                      <span
                        className={`text-[11px] font-black rounded-full px-2.5 py-0.5 border ${
                          event.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-gold-50 text-gold-800 border-gold-200'
                        }`}
                      >
                        {STATUS_LABELS[event.status ?? ''] ?? event.status ?? '—'}
                      </span>
                      <span className="text-[11px] font-black rounded-full px-2.5 py-0.5 border bg-cream text-ink/70 border-gold-200">
                        {eventTypeLabel(event.event_type)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink/55 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-gold-600" />
                        {formatEventDate(event.event_date)}
                      </span>
                      {event.venue_name && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gold-600" />
                          {event.venue_name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gold-600" />
                        {event.guestCount} ضيف
                      </span>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        {/* Side column: quick actions + reminders */}
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-black text-ink mb-4">إجراءات سريعة</h2>
            <div className="space-y-3">
              <Link
                to="/dashboard/events/new"
                className="card-lux flex items-center gap-3 p-4 hover:transform-none hover:border-gold-400 transition-colors"
              >
                <span className="grid place-items-center w-11 h-11 rounded-2xl gold-grad text-white shadow-md shadow-gold-600/20">
                  <Plus className="w-5 h-5" />
                </span>
                <span>
                  <span className="block font-black text-ink">إنشاء مناسبة جديدة</span>
                  <span className="block text-xs text-ink/45 mt-0.5">ابدأ الدعوة خلال دقائق</span>
                </span>
              </Link>

              <div
                className="card-lux flex items-center gap-3 p-4 opacity-60 cursor-not-allowed hover:transform-none"
                title="قريباً"
              >
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gold-50 border border-gold-200 text-gold-700">
                  <LayoutTemplate className="w-5 h-5" />
                </span>
                <span className="flex-1">
                  <span className="block font-black text-ink">تصفّح القوالب</span>
                  <span className="block text-xs text-ink/45 mt-0.5">اختر تصميماً لمناسبتك</span>
                </span>
                <span className="text-[10px] font-black rounded-full bg-gold-100 text-gold-700/80 px-2 py-0.5">
                  قريباً
                </span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-black text-ink mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gold-700" />
              تذكيرات
            </h2>

            {loading && (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-2xl bg-gold-100" />
                ))}
              </div>
            )}

            {!loading && !error && reminders.length === 0 && (
              <div className="card-lux p-6 text-center hover:transform-none">
                <Sparkles className="w-7 h-7 text-gold-600 mx-auto" />
                <p className="mt-3 text-sm font-bold text-ink/60">لا توجد تذكيرات حالياً</p>
              </div>
            )}

            {!loading && !error && reminders.length > 0 && (
              <ul className="space-y-2">
                {reminders.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.href}
                      className="block rounded-2xl border border-gold-200/80 bg-white/80 px-4 py-3 text-sm font-bold text-ink/80 hover:border-gold-400 hover:bg-gold-50/50 transition-colors"
                    >
                      {item.message}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
