import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { generateEventSlug } from '@/lib/slug';
import { EVENT_TYPES, isEventTypeValue } from '@/lib/eventTypes';
import type { Tables } from '@/types/database.types';

type EventRow = Tables<'events'>;

type FormState = {
  title: string;
  event_date: string;
  venue_name: string;
  venue_map_url: string;
  status: string;
  event_type: string;
};

const EMPTY_FORM: FormState = {
  title: '',
  event_date: '',
  venue_name: '',
  venue_map_url: '',
  status: 'draft',
  event_type: 'wedding',
};

const STATUS_OPTIONS = [
  { value: 'draft', label: 'مسودة' },
  { value: 'active', label: 'نشطة' },
] as const;

/** Convert DB timestamptz → datetime-local value */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert datetime-local → ISO for DB (or null) */
function fromDatetimeLocal(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user?.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setLoadError(error.message);
        setLoading(false);
        return;
      }
      if (!data) {
        setLoadError('المناسبة غير موجودة');
        setLoading(false);
        return;
      }

      const row = data as EventRow;
      setForm({
        title: row.title ?? '',
        event_date: toDatetimeLocal(row.event_date),
        venue_name: row.venue_name ?? '',
        venue_map_url: row.venue_map_url ?? '',
        status: row.status ?? 'draft',
        event_type:
          row.event_type && isEventTypeValue(row.event_type) ? row.event_type : 'wedding',
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    const title = form.title.trim();
    if (!title) {
      toast.error('عنوان المناسبة مطلوب');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && id) {
        const { error } = await supabase
          .from('events')
          .update({
            title,
            event_date: fromDatetimeLocal(form.event_date),
            venue_name: form.venue_name.trim() || null,
            venue_map_url: form.venue_map_url.trim() || null,
            status: form.status || 'draft',
            event_type: isEventTypeValue(form.event_type) ? form.event_type : 'wedding',
          })
          .eq('id', id)
          .eq('owner_id', user?.id);

        if (error) {
          toast.error(error.message || 'فشل تحديث المناسبة');
          return;
        }
        toast.success('تم حفظ التعديلات');
        navigate('/dashboard/events', { replace: true });
        return;
      }

      const slug = generateEventSlug(title);
      const { error } = await supabase.from('events').insert({
        title,
        slug,
        owner_id: user.id,
        status: form.status || 'draft',
        event_date: fromDatetimeLocal(form.event_date),
        venue_name: form.venue_name.trim() || null,
        venue_map_url: form.venue_map_url.trim() || null,
        event_type: isEventTypeValue(form.event_type) ? form.event_type : 'wedding',
      });

      if (error) {
        toast.error(error.message || 'فشل إنشاء المناسبة');
        return;
      }

      toast.success('تم إنشاء المناسبة');
      navigate('/dashboard/events', { replace: true });
    } catch {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl card-lux p-16 flex flex-col items-center gap-3 text-ink/50">
        <Loader2 className="w-8 h-8 animate-spin text-gold-600" />
        <p className="text-sm font-bold">جاري التحميل...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl card-lux p-10 text-center">
        <AlertCircle className="w-10 h-10 text-maroon-600 mx-auto" />
        <p className="mt-4 font-black text-ink">{loadError}</p>
        <Link
          to="/dashboard/events"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-gold-700 hover:underline"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمناسبات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        to="/dashboard/events"
        className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-ink mb-6"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للمناسبات
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-lux p-6 sm:p-8 hover:transform-none"
      >
        <h1 className="text-2xl font-black text-ink">
          {isEdit ? (
            <>
              تعديل <span className="gold-text font-display">المناسبة</span>
            </>
          ) : (
            <>
              مناسبة <span className="gold-text font-display">جديدة</span>
            </>
          )}
        </h1>
        <p className="mt-1 text-sm text-ink/45">
          {isEdit ? 'حدّث تفاصيل مناسبتك' : 'أدخل تفاصيل المناسبة — سيتم إنشاء رابط فريد تلقائياً'}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-black text-ink/70 mb-2">
              عنوان المناسبة <span className="text-maroon-600">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              disabled={submitting}
              placeholder="حفل زفاف أحمد وسارة"
              className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-ink/70 mb-2">تاريخ المناسبة</label>
            <input
              type="datetime-local"
              value={form.event_date}
              onChange={(e) => updateField('event_date', e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-ink/70 mb-2">المكان / القاعة</label>
            <input
              value={form.venue_name}
              onChange={(e) => updateField('venue_name', e.target.value)}
              disabled={submitting}
              placeholder="قاعة الفخامة — الرياض"
              className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-ink/70 mb-2">رابط الخريطة</label>
            <input
              type="url"
              value={form.venue_map_url}
              onChange={(e) => updateField('venue_map_url', e.target.value)}
              disabled={submitting}
              placeholder="https://maps.google.com/..."
              className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-ink/70 mb-2">نوع المناسبة</label>
            <select
              value={form.event_type}
              onChange={(e) => updateField('event_type', e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60 font-bold"
            >
              {EVENT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-black text-ink/70 mb-2">الحالة</label>
            <select
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
              disabled={submitting}
              className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-5 py-3.5 outline-none transition-all focus:border-gold-500 focus:bg-white focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60 font-bold"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold w-full py-4 text-lg disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEdit ? 'حفظ التعديلات' : 'إنشاء المناسبة'}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
