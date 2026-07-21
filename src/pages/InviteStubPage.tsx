import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Link2,
  AlertTriangle,
  Heart,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { eventTypeLabel } from '@/lib/eventTypes';

// ─────────────────────────────────────────────────────────────────────────────
// Types from get_invite RPC response
// ─────────────────────────────────────────────────────────────────────────────
type InviteData = {
  event: {
    title: string;
    event_type: string | null;
    event_date: string | null;
    venue_name: string | null;
    venue_map_url: string | null;
  };
  guest: {
    full_name: string;
    companions_allowed: number;
  };
  rsvp: {
    status: string;
    companions_count: number;
  } | null;
  brand: {
    brand_name: string;
    logo_url: string | null;
    site_url: string | null;
  };
};

type PageError = 'not_found' | 'inactive' | 'network';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatEventDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getGreeting(eventType: string | null): string {
  switch (eventType) {
    case 'wedding':
      return 'بكل الحب والفرح، يسعدنا دعوتكم';
    case 'engagement':
      return 'بقلوب مفعمة بالفرح، يسرّنا دعوتكم';
    case 'graduation':
      return 'بكل فخر واعتزاز، ندعوكم للاحتفال';
    case 'birthday':
      return 'نشاركم لحظات الفرح، ندعوكم للاحتفال معنا';
    case 'corporate':
      return 'يسرّنا دعوتكم للمشاركة في هذا الحدث';
    default:
      return 'يسعدنا دعوتكم للاحتفال معنا';
  }
}

function getEventEmoji(eventType: string | null): string {
  switch (eventType) {
    case 'wedding': return '💍';
    case 'engagement': return '💫';
    case 'graduation': return '🎓';
    case 'birthday': return '🎂';
    case 'corporate': return '🏢';
    default: return '✨';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────────────────────
function InviteSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#fdf6e8] via-[#fff9f0] to-[#fef3db]" dir="rtl">
      <div className="w-full max-w-lg">
        <div className="rounded-[2rem] border border-gold-200/60 bg-white overflow-hidden shadow-2xl shadow-gold-900/10 animate-pulse">
          {/* header shimmer */}
          <div className="h-32 bg-gradient-to-br from-gold-100 to-gold-50" />
          <div className="p-8 space-y-4">
            <div className="h-4 w-1/3 bg-gold-100 rounded-full" />
            <div className="h-8 w-2/3 bg-gold-100 rounded-full" />
            <div className="h-4 w-1/2 bg-gold-100 rounded-full" />
            <div className="h-4 w-3/4 bg-gold-100 rounded-full" />
            <div className="pt-6 space-y-3">
              <div className="h-12 bg-gold-100 rounded-2xl" />
              <div className="h-12 bg-gold-50 rounded-2xl" />
            </div>
          </div>
        </div>
        <p className="text-center mt-4 text-sm text-gold-600/60 font-medium flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          جاري تحميل الدعوة...
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Error states
// ─────────────────────────────────────────────────────────────────────────────
function ErrorState({ type }: { type: PageError }) {
  const config = {
    not_found: {
      icon: <Link2 className="w-8 h-8 text-gold-600" />,
      title: 'دعوة غير صالحة',
      desc: 'رابط الدعوة الذي تصل إليه غير موجود أو منتهي الصلاحية. يرجى التواصل مع صاحب الدعوة للحصول على رابط صحيح.',
    },
    inactive: {
      icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
      title: 'هذه الدعوة غير متاحة حالياً',
      desc: 'المناسبة غير مفعّلة في الوقت الحالي. يرجى التواصل مع صاحب الدعوة لمزيد من المعلومات.',
    },
    network: {
      icon: <AlertTriangle className="w-8 h-8 text-maroon-600" />,
      title: 'تعذّر تحميل الدعوة',
      desc: 'حدث خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.',
    },
  };
  const { icon, title, desc } = config[type];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#fdf6e8] via-white to-[#fef3db]" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="card-lux p-10 hover:transform-none">
          <div className="mx-auto grid place-items-center w-16 h-16 rounded-3xl gold-grad-soft border border-gold-200 mb-5">
            {icon}
          </div>
          <h1 className="text-xl font-black text-ink">{title}</h1>
          <p className="mt-3 text-sm text-ink/55 leading-7 font-medium">{desc}</p>
        </div>
        <p className="mt-6 text-xs text-ink/30">بواسطة دعوتك</p>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Thank-you state
// ─────────────────────────────────────────────────────────────────────────────
function ThankYouBanner({
  status,
  companionsCount,
  onEdit,
  brandName,
}: {
  status: string;
  companionsCount: number;
  onEdit: () => void;
  brandName: string;
}) {
  const isConfirmed = status === 'confirmed';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl border p-6 text-center ${
        isConfirmed
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <div className={`mx-auto grid place-items-center w-14 h-14 rounded-3xl mb-4 ${isConfirmed ? 'bg-emerald-100' : 'bg-amber-100'}`}>
        {isConfirmed ? (
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        ) : (
          <XCircle className="w-7 h-7 text-amber-600" />
        )}
      </div>
      <p className={`text-lg font-black ${isConfirmed ? 'text-emerald-800' : 'text-amber-900'}`}>
        {isConfirmed ? 'تم تأكيد حضورك بنجاح ✅' : 'تم تسجيل اعتذارك بنجاح'}
      </p>
      {isConfirmed && companionsCount > 0 && (
        <p className={`mt-2 text-sm font-bold ${isConfirmed ? 'text-emerald-700' : 'text-amber-800'}`}>
          عدد المرافقين: {companionsCount}
        </p>
      )}
      <p className={`mt-3 text-sm font-medium leading-7 ${isConfirmed ? 'text-emerald-700/80' : 'text-amber-800/80'}`}>
        يمكنك تعديل الحالة في أي وقت عبر الضغط على «تعديل ردّي» أدناه.
      </p>
      <button
        type="button"
        onClick={onEdit}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold-300 bg-white px-5 py-2 text-sm font-bold text-ink/70 hover:border-gold-500 hover:text-ink transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        تعديل ردّي
      </button>
      <p className="mt-4 text-[11px] font-medium text-ink/35">
        هذه الخدمة مقدمة من {brandName}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function InviteStubPage() {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<PageError | null>(null);
  const [invite, setInvite] = useState<InviteData | null>(null);

  // RSVP state
  const [selectedStatus, setSelectedStatus] = useState<'confirmed' | 'declined' | null>(null);
  const [companions, setCompanions] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);
  const [finalCompanions, setFinalCompanions] = useState(0);

  const loadInvite = useCallback(async () => {
    if (!token) {
      setPageError('not_found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setPageError(null);

    try {
      const { data, error } = await supabase.rpc('get_invite', { p_token: token });
      if (error) {
        setPageError('network');
        setLoading(false);
        return;
      }
      const result = data as InviteData & { error?: string };
      if (result?.error === 'not_found') {
        setPageError('not_found');
        setLoading(false);
        return;
      }
      if (result?.error === 'inactive') {
        setPageError('inactive');
        setLoading(false);
        return;
      }
      setInvite(result as InviteData);

      // Pre-populate if already responded
      if ((result as InviteData).rsvp) {
        const rsvp = (result as InviteData).rsvp!;
        setFinalStatus(rsvp.status);
        setFinalCompanions(rsvp.companions_count ?? 0);
        setCompanions(rsvp.companions_count ?? 0);
        setSelectedStatus(rsvp.status as 'confirmed' | 'declined');
        setSubmitted(true);
      }
    } catch {
      setPageError('network');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadInvite();
  }, [loadInvite]);

  async function handleSubmit() {
    if (!selectedStatus || !token) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('submit_rsvp', {
        p_token: token,
        p_status: selectedStatus,
        p_companions: selectedStatus === 'confirmed' ? companions : 0,
      });
      if (error) {
        console.error('RPC Error:', error);
        toast.error(`خطأ: ${error.message || 'حدث خطأ أثناء إرسال ردّك'}`);
        return;
      }
      const result = data as { ok?: boolean; error?: string; status?: string; companions_count?: number };
      if (result?.error) {
        console.error('RPC Result Error:', result.error);
        toast.error(`خطأ: ${result.error}`);
        return;
      }
      setFinalStatus(result.status ?? selectedStatus);
      setFinalCompanions(result.companions_count ?? companions);
      setSubmitted(true);
      toast.success(
        selectedStatus === 'confirmed' ? 'تم تأكيد حضورك بنجاح ✅' : 'تم تسجيل اعتذارك بنجاح',
      );
    } catch {
      toast.error('حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return <InviteSkeleton />;
  if (pageError) return <ErrorState type={pageError} />;
  if (!invite) return <ErrorState type="not_found" />;

  const { event, guest, brand } = invite;
  const emoji = getEventEmoji(event.event_type);
  const greeting = getGreeting(event.event_type);
  const canSelectCompanions =
    selectedStatus === 'confirmed' && guest.companions_allowed > 0;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-[#fdf6e8] via-[#fffbf3] to-[#fef0d5] flex flex-col items-center justify-start py-10 px-4"
    >
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gold-300/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-maroon-200/10 blur-3xl" />
      </div>

      <div className="w-full max-w-lg space-y-4">

        {/* ── INVITATION CARD ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-[2rem] border border-[#ecdfc9] bg-white shadow-2xl shadow-gold-900/10"
        >
          {/* ── Brand / Letterhead ──────────────────────────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#7c3517] via-[#8f3a18] to-[#6b2a10] px-7 py-6 text-white">
            <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />
            <div className="absolute -top-16 -left-12 w-48 h-48 rounded-full bg-gold-400/15 blur-3xl pointer-events-none" />
            <div className="relative flex items-center gap-4">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.brand_name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-gold-400/40 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl gold-grad flex items-center justify-center shrink-0 border border-gold-400/20">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <p className="text-gold-300/90 text-xs font-bold tracking-wider uppercase">
                  {brand.site_url ?? 'دعوتك'}
                </p>
                <p className="text-white font-black text-lg leading-tight">
                  {brand.brand_name}
                </p>
              </div>
            </div>

            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative mt-5 text-center"
            >
              <p className="text-gold-200/80 text-sm font-bold leading-7">{greeting}</p>
            </motion.div>
          </div>

          {/* ── Event Info ─────────────────────────────────────────────── */}
          <div className="px-7 pt-6 pb-4 space-y-5">

            {/* Event type badge + emoji */}
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{emoji}</span>
              <span className="inline-flex items-center rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-xs font-black text-gold-700">
                {eventTypeLabel(event.event_type)}
              </span>
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-display text-3xl sm:text-4xl font-black text-[#17223b] leading-tight"
            >
              {event.title}
            </motion.h1>

            {/* Date */}
            {event.event_date && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 rounded-2xl bg-[#faf5ea] border border-gold-100 px-4 py-3"
              >
                <CalendarDays className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-ink/80 leading-6">
                  {formatEventDate(event.event_date)}
                </p>
              </motion.div>
            )}

            {/* Venue */}
            {event.venue_name && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-3"
              >
                <div className="flex items-center gap-3 flex-1 rounded-2xl bg-[#faf5ea] border border-gold-100 px-4 py-3">
                  <MapPin className="w-5 h-5 text-gold-600 shrink-0" />
                  <p className="text-sm font-bold text-ink/80">{event.venue_name}</p>
                </div>
                {event.venue_map_url && (
                  <a
                    href={event.venue_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-2xl border border-gold-300 bg-white px-3 py-3 text-xs font-bold text-gold-700 hover:border-gold-500 hover:bg-gold-50 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    الخريطة
                  </a>
                )}
              </motion.div>
            )}

            {/* Ornament */}
            <div className="ornament-divider text-gold-300">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-200" />
              <span className="text-base">✦</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-200" />
            </div>

            {/* Personalized guest line */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center rounded-2xl border border-maroon-500/15 bg-maroon-50/40 px-5 py-4"
            >
              <p className="text-xs font-bold text-maroon-600/60 tracking-wide mb-1">دعوة خاصة لـ</p>
              <p className="text-xl font-black text-[#7c3517]">{guest.full_name}</p>
              {guest.companions_allowed > 0 && (
                <p className="mt-1.5 text-xs font-medium text-maroon-700/50 flex items-center justify-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  يمكنك إحضار حتى {guest.companions_allowed} مرافق
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* ── RSVP SECTION ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="rounded-[2rem] border border-[#ecdfc9] bg-white p-6 shadow-xl shadow-gold-900/8 space-y-5"
        >
          <div className="text-center">
            <h2 className="text-base font-black text-ink">تأكيد الحضور أو الاعتذار</h2>
            <p className="text-xs text-ink/45 mt-1 font-medium leading-6">
              للاطلاع على تفاصيل دعوتك وتأكيد الحضور، اختر من الخيارات التالية
            </p>
          </div>

          <AnimatePresence mode="wait">
            {submitted && finalStatus ? (
              <ThankYouBanner
                key="thankyou"
                status={finalStatus}
                companionsCount={finalCompanions}
                onEdit={() => setSubmitted(false)}
                brandName={brand.brand_name || 'دعوتك'}
              />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Buttons — mirror competitor CTA labels */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('confirmed')}
                    className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 py-4 px-3 text-sm font-black transition-all duration-200 ${
                      selectedStatus === 'confirmed'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-lg shadow-emerald-500/15 scale-[1.03]'
                        : 'border-gold-200 bg-white text-ink/60 hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span className="text-2xl leading-none" aria-hidden>
                      👍
                    </span>
                    <CheckCircle2
                      className={`w-6 h-6 ${
                        selectedStatus === 'confirmed' ? 'text-emerald-600' : 'text-ink/25'
                      }`}
                    />
                    تأكيد الحضور
                    {selectedStatus === 'confirmed' && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </motion.span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('declined')}
                    className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 py-4 px-3 text-sm font-black transition-all duration-200 ${
                      selectedStatus === 'declined'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-lg shadow-amber-500/15 scale-[1.03]'
                        : 'border-gold-200 bg-white text-ink/60 hover:border-amber-400 hover:bg-amber-50/50'
                    }`}
                  >
                    <span className="text-2xl leading-none" aria-hidden>
                      🙏
                    </span>
                    <XCircle
                      className={`w-6 h-6 ${
                        selectedStatus === 'declined' ? 'text-amber-600' : 'text-ink/25'
                      }`}
                    />
                    الاعتذار عن الحضور
                    {selectedStatus === 'declined' && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </motion.span>
                    )}
                  </button>
                </div>

                {/* Companions selector */}
                <AnimatePresence>
                  {canSelectCompanions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl border border-gold-200 bg-[#faf5ea] px-4 py-4">
                        <label className="flex items-center gap-2 text-sm font-black text-ink/70 mb-3">
                          <Users className="w-4 h-4 text-gold-600" />
                          عدد المرافقين
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setCompanions((c) => Math.max(0, c - 1))}
                            disabled={companions <= 0}
                            className="w-10 h-10 rounded-xl border-2 border-gold-300 bg-white font-black text-ink text-lg flex items-center justify-center hover:border-gold-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center text-2xl font-black text-ink tabular-nums">
                            {companions}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCompanions((c) => Math.min(guest.companions_allowed, c + 1))}
                            disabled={companions >= guest.companions_allowed}
                            className="w-10 h-10 rounded-xl border-2 border-gold-300 bg-white font-black text-ink text-lg flex items-center justify-center hover:border-gold-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-xs text-ink/40 text-center mt-2 font-medium">
                          الحد الأقصى: {guest.companions_allowed} مرافق
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={!selectedStatus || submitting}
                  className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      إرسال ردّي
                    </>
                  )}
                </button>

                {!selectedStatus && (
                  <p className="text-center text-xs text-ink/35 font-medium">
                    اختر ردّك أولاً لتتمكن من الإرسال
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-ink/30 pb-6 font-medium"
        >
          تجربة الدعوة الرقمية بواسطة{' '}
          <span className="text-gold-600 font-black">دعوتك</span>
        </motion.p>
      </div>
    </div>
  );
}
