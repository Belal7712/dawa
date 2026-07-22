import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  CalendarDays,
  MapPin,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { eventTypeLabel } from '@/lib/eventTypes';
import type { Tables } from '@/types/database.types';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type EventRow = Tables<'events'>;

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

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setEvents([]);
    } else {
      setEvents(data ?? []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  async function handleDelete() {
    if (!deleteTarget) return;
    if (confirmText.trim() !== deleteTarget.title.trim()) {
      toast.error('اكتب عنوان المناسبة للتأكيد');
      return;
    }

    setDeleting(true);
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', deleteTarget.id);

    setDeleting(false);

    if (deleteError) {
      toast.error(deleteError.message || 'فشل حذف المناسبة');
      return;
    }

    toast.success('تم حذف المناسبة');
    setDeleteTarget(null);
    setConfirmText('');
    setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink">
            المناسبات
          </h1>
          <p className="mt-1 text-sm text-ink/50 font-medium">
            أنشئ وأدر مناسباتك من مكان واحد
          </p>
        </div>
        <Link to="/dashboard/events/new" className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3 text-sm">
          <Plus className="w-4 h-4" />
          مناسبة جديدة
        </Link>
      </div>

      {loading && (
        <div className="card-lux p-16 flex flex-col items-center gap-3 text-ink/50">
          <Loader2 className="w-8 h-8 animate-spin text-gold-600" />
          <p className="text-sm font-bold">جاري تحميل المناسبات...</p>
        </div>
      )}

      {!loading && error && (
        <div className="card-lux p-10 text-center">
          <AlertCircle className="w-10 h-10 text-maroon-600 mx-auto" />
          <p className="mt-4 font-black text-ink">تعذّر تحميل المناسبات</p>
          <p className="mt-2 text-sm text-ink/50">{error}</p>
          <button
            type="button"
            onClick={() => void loadEvents()}
            className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-gold-300 bg-white px-6 py-2.5 font-bold text-ink/80 hover:border-gold-500"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-lux p-12 sm:p-16 text-center"
        >
          <div className="mx-auto grid place-items-center w-16 h-16 rounded-3xl gold-grad-soft border border-gold-200">
            <CalendarDays className="w-7 h-7 text-gold-700" />
          </div>
          <p className="mt-6 text-lg font-black text-ink">
            لا توجد مناسبات بعد — أنشئ أول مناسبة
          </p>
          <p className="mt-2 text-sm text-ink/45 max-w-sm mx-auto">
            ابدأ بإنشاء مناسبة، ثم أضف الضيوف لاحقاً من لوحة التحكم.
          </p>
          <Link
            to="/dashboard/events/new"
            className="btn-gold mt-8 inline-flex items-center gap-2 px-7 py-3.5"
          >
            <Plus className="w-4 h-4" />
            إنشاء مناسبة
          </Link>
        </motion.div>
      )}

      {!loading && !error && events.length > 0 && (
        <ul className="space-y-4">
          {events.map((event, i) => (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-lux p-5 sm:p-6 hover:transform-none hover:shadow-[0_8px_28px_-10px_rgba(120,90,30,0.14)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/dashboard/events/${event.id}`}
                      className="text-lg font-black text-ink truncate hover:text-gold-800 transition-colors"
                    >
                      {event.title}
                    </Link>
                    <span
                      className={`text-[11px] font-black rounded-full px-2.5 py-0.5 border ${
                        event.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-gold-50 text-gold-800 border-gold-200'
                      }`}
                    >
                      {STATUS_LABELS[event.status ?? ''] ?? event.status ?? '—'}
                    </span>
                    {event.event_type && (
                      <span className="text-[11px] font-black rounded-full px-2.5 py-0.5 border bg-cream text-ink/70 border-gold-200">
                        {eventTypeLabel(event.event_type)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-ink/55 font-medium">
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
                  </div>
                  {event.slug && (
                    <p className="mt-2 text-xs text-ink/35 font-mono truncate" dir="ltr">
                      /{event.slug}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/dashboard/events/${event.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold-200 bg-white px-4 py-2 text-sm font-bold text-ink/75 hover:border-gold-400 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    عرض
                  </Link>
                  <Link
                    to={`/dashboard/events/${event.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold-200 bg-white px-4 py-2 text-sm font-bold text-ink/75 hover:border-gold-400 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    تعديل
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget(event);
                      setConfirmText('');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-maroon-500/25 bg-white px-4 py-2 text-sm font-bold text-maroon-700 hover:bg-maroon-500/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setConfirmText('');
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl border-gold-200" dir="rtl">
          <AlertDialogHeader className="sm:text-right">
            <AlertDialogTitle className="font-black text-ink">حذف المناسبة؟</AlertDialogTitle>
            <AlertDialogDescription className="text-ink/55 leading-7">
              سيتم حذف «{deleteTarget?.title}» نهائياً. للتأكيد، اكتب عنوان المناسبة بالضبط أدناه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={deleteTarget?.title}
            disabled={deleting}
            className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-4 py-3 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
          />
          <AlertDialogFooter className="sm:flex-row-reverse gap-2">
            <button
              type="button"
              disabled={deleting || confirmText.trim() !== (deleteTarget?.title.trim() ?? '')}
              onClick={() => void handleDelete()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-maroon-700 text-white px-5 py-2.5 text-sm font-bold hover:bg-maroon-800 disabled:opacity-50 transition-colors"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              حذف نهائياً
            </button>
            <AlertDialogCancel
              disabled={deleting}
              className="rounded-full border-gold-200 font-bold"
            >
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
