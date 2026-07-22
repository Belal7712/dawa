import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  MapPin,
  MessageSquareText,
  Pencil,
  Plus,
  Power,
  Search,
  Send,
  Trash2,
  Upload,
  Users,
  XCircle,
  Clock3,
  LayoutTemplate,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { eventTypeLabel } from '@/lib/eventTypes';
import { GROUP_LABELS, groupLabelLabel, isGroupLabelValue } from '@/lib/groupLabels';
import { buildInviteUrl } from '@/lib/inviteUrl';
import {
  buildWaMeUrl,
  buildWhatsAppMessage,
  DEFAULT_WHATSAPP_TEMPLATE,
  loadWhatsAppTemplate,
  saveWhatsAppTemplate,
} from '@/lib/whatsapp';
import {
  buildExportCSV,
  downloadStringAsFile,
  type ExportGuest,
} from '@/lib/guestIO';
import { buildAndDownloadPDF } from '@/lib/exportPDF';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import GuestImportDialog from '@/components/GuestImportDialog';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type EventRow = Tables<'events'>;
type GuestRow = Tables<'guests'>;

type RsvpEmbed = {
  id: string;
  guest_id: string;
  status: string | null;
  companions_count: number | null;
};

type GuestWithRsvp = GuestRow & {
  rsvps: RsvpEmbed | RsvpEmbed[] | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  active: 'نشطة',
};

const RSVP_STATUS_OPTIONS = [
  { value: 'all', label: 'كل حالات الرد' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'declined', label: 'معتذر' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'none', label: 'لم يرد' },
] as const;

const PHONE_E164_RE = /^\+[1-9]\d{7,14}$/;

type GuestFormState = {
  full_name: string;
  phone_e164: string;
  group_label: string;
  companions_allowed: string;
};

const EMPTY_GUEST_FORM: GuestFormState = {
  full_name: '',
  phone_e164: '',
  group_label: 'other',
  companions_allowed: '0',
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
  rsvps: GuestWithRsvp['rsvps'],
): RsvpEmbed | null {
  if (!rsvps) return null;
  return Array.isArray(rsvps) ? rsvps[0] ?? null : rsvps;
}

function rsvpStatusMeta(status: string | null | undefined, hasRsvp: boolean) {
  if (!hasRsvp || !status) {
    return {
      key: 'none' as const,
      label: 'لم يرد',
      className: 'bg-cream text-ink/55 border-gold-200',
    };
  }
  if (status === 'confirmed') {
    return {
      key: 'confirmed' as const,
      label: 'مؤكد',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }
  if (status === 'declined') {
    return {
      key: 'declined' as const,
      label: 'معتذر',
      className: 'bg-maroon-500/10 text-maroon-800 border-maroon-500/25',
    };
  }
  if (status === 'pending') {
    return {
      key: 'pending' as const,
      label: 'قيد الانتظار',
      className: 'bg-amber-50 text-amber-900 border-amber-200',
    };
  }
  // unknown status → treat as waiting
  return {
    key: 'pending' as const,
    label: 'قيد الانتظار',
    className: 'bg-amber-50 text-amber-900 border-amber-200',
  };
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function EventDetailPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [guests, setGuests] = useState<GuestWithRsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Filters (draft → applied on "تطبيق الفلتر")
  const [searchDraft, setSearchDraft] = useState('');
  const [groupDraft, setGroupDraft] = useState('all');
  const [rsvpDraft, setRsvpDraft] = useState('all');
  const [searchApplied, setSearchApplied] = useState('');
  const [groupApplied, setGroupApplied] = useState('all');
  const [rsvpApplied, setRsvpApplied] = useState('all');

  // Guest modal
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestWithRsvp | null>(null);
  const [guestForm, setGuestForm] = useState<GuestFormState>(EMPTY_GUEST_FORM);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [savingGuest, setSavingGuest] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<GuestWithRsvp | null>(null);
  const [deleting, setDeleting] = useState(false);

  // WhatsApp
  const [waTemplate, setWaTemplate] = useState(DEFAULT_WHATSAPP_TEMPLATE);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateDraft, setTemplateDraft] = useState(DEFAULT_WHATSAPP_TEMPLATE);
  const [bulkSendOpen, setBulkSendOpen] = useState(false);
  const [bulkIndex, setBulkIndex] = useState(0);

  // Import / Export
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);

  // Site settings (for PDF letterhead)
  const { settings: siteSettings } = useSiteSettings();

  const loadEventAndGuests = useCallback(async () => {
    if (!id || !user?.id) return;
    setLoading(true);

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (eventError || !eventData) {
      toast.error('المناسبة غير موجودة أو غير مصرح لك بعرضها');
      navigate('/dashboard/events', { replace: true });
      return;
    }

    setEvent(eventData as EventRow);
    setWaTemplate(loadWhatsAppTemplate((eventData as EventRow).id));

    const { data: guestsData, error: guestsError } = await supabase
      .from('guests')
      .select(
        `
        id,
        event_id,
        full_name,
        phone_e164,
        group_label,
        companions_allowed,
        unique_token,
        created_at,
        rsvps (
          id,
          guest_id,
          status,
          companions_count
        )
      `,
      )
      .eq('event_id', id)
      .order('created_at', { ascending: false });

    if (guestsError) {
      toast.error(guestsError.message || 'تعذّر تحميل الضيوف');
      setGuests([]);
    } else {
      setGuests((guestsData ?? []) as GuestWithRsvp[]);
    }

    setLoading(false);
  }, [id, navigate, user?.id]);

  useEffect(() => {
    void loadEventAndGuests();
  }, [loadEventAndGuests]);

  const rsvpStats = useMemo(() => {
    let confirmed = 0;
    let declined = 0;
    let pending = 0;
    let companionsSum = 0;

    for (const guest of guests) {
      const rsvp = unwrapRsvp(guest.rsvps);
      if (!rsvp || !rsvp.status || rsvp.status === 'pending') {
        pending += 1;
      } else if (rsvp.status === 'confirmed') {
        confirmed += 1;
      } else if (rsvp.status === 'declined') {
        declined += 1;
      } else {
        pending += 1;
      }
      if (rsvp?.companions_count != null) {
        companionsSum += rsvp.companions_count;
      }
    }

    const total = guests.length;
    const confirmedPct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

    return { confirmed, declined, pending, total, companionsSum, confirmedPct };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    const q = searchApplied.trim().toLowerCase();
    return guests.filter((guest) => {
      if (q) {
        const name = (guest.full_name ?? '').toLowerCase();
        const phone = (guest.phone_e164 ?? '').toLowerCase();
        if (!name.includes(q) && !phone.includes(q)) return false;
      }
      if (groupApplied !== 'all' && (guest.group_label ?? '') !== groupApplied) {
        return false;
      }
      if (rsvpApplied !== 'all') {
        const rsvp = unwrapRsvp(guest.rsvps);
        const meta = rsvpStatusMeta(rsvp?.status, !!rsvp);
        if (rsvpApplied === 'none') {
          if (rsvp) return false;
        } else if (rsvpApplied === 'pending') {
          // pending status OR no reply counts as waiting in filters when selecting pending?
          // Spec: filter by RSVP status — "لم يرد" is separate. So pending = status pending only.
          if (!rsvp || rsvp.status !== 'pending') return false;
        } else if (meta.key !== rsvpApplied) {
          return false;
        }
      }
      return true;
    });
  }, [guests, searchApplied, groupApplied, rsvpApplied]);

  function applyFilters() {
    setSearchApplied(searchDraft);
    setGroupApplied(groupDraft);
    setRsvpApplied(rsvpDraft);
  }

  async function toggleEventStatus() {
    if (!event) return;
    const next = event.status === 'active' ? 'draft' : 'active';
    setTogglingStatus(true);
    const { error } = await supabase
      .from('events')
      .update({ status: next })
      .eq('id', event.id);

    setTogglingStatus(false);

    if (error) {
      toast.error(error.message || 'فشل تحديث الحالة');
      return;
    }

    setEvent({ ...event, status: next });
    toast.success(next === 'active' ? 'تم تفعيل المناسبة' : 'تم تحويل المناسبة إلى مسودة');
  }

  function openAddGuest() {
    setEditingGuest(null);
    setGuestForm(EMPTY_GUEST_FORM);
    setPhoneError(null);
    setGuestModalOpen(true);
  }

  function openEditGuest(guest: GuestWithRsvp) {
    setEditingGuest(guest);
    setGuestForm({
      full_name: guest.full_name ?? '',
      phone_e164: guest.phone_e164 ?? '',
      group_label: isGroupLabelValue(guest.group_label ?? '')
        ? guest.group_label!
        : 'other',
      companions_allowed: String(guest.companions_allowed ?? 0),
    });
    setPhoneError(null);
    setGuestModalOpen(true);
  }

  async function saveGuest(e: FormEvent) {
    e.preventDefault();
    if (!event) return;

    const full_name = guestForm.full_name.trim();
    if (!full_name) {
      toast.error('اسم الضيف مطلوب');
      return;
    }

    const phoneRaw = guestForm.phone_e164.trim();
    if (phoneRaw && !PHONE_E164_RE.test(phoneRaw)) {
      setPhoneError('رقم الجوال غير صالح. استخدم الصيغة الدولية مثل +9665XXXXXXX');
      return;
    }
    setPhoneError(null);

    const companions = Number(guestForm.companions_allowed);
    if (!Number.isFinite(companions) || companions < 0 || !Number.isInteger(companions)) {
      toast.error('عدد المرافقين يجب أن يكون عدداً صحيحاً ≥ 0');
      return;
    }

    const group_label = isGroupLabelValue(guestForm.group_label)
      ? guestForm.group_label
      : 'other';

    setSavingGuest(true);
    try {
      if (editingGuest) {
        const { error } = await supabase
          .from('guests')
          .update({
            full_name,
            phone_e164: phoneRaw || null,
            group_label,
            companions_allowed: companions,
          })
          .eq('id', editingGuest.id);

        if (error) {
          toast.error(error.message || 'فشل تحديث الضيف');
          return;
        }
        toast.success('تم تحديث بيانات الضيف');
      } else {
        const { error } = await supabase.from('guests').insert({
          event_id: event.id,
          full_name,
          phone_e164: phoneRaw || null,
          group_label,
          companions_allowed: companions,
          unique_token: crypto.randomUUID(),
        });

        if (error) {
          toast.error(error.message || 'فشل إضافة الضيف');
          return;
        }
        toast.success('تمت إضافة الضيف');
      }

      setGuestModalOpen(false);
      setEditingGuest(null);
      setGuestForm(EMPTY_GUEST_FORM);
      await loadEventAndGuests();
    } finally {
      setSavingGuest(false);
    }
  }

  async function confirmDeleteGuest() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('guests').delete().eq('id', deleteTarget.id);
    setDeleting(false);

    if (error) {
      toast.error(error.message || 'فشل حذف الضيف');
      return;
    }

    toast.success('تم حذف الضيف');
    setDeleteTarget(null);
    setGuests((prev) => prev.filter((g) => g.id !== deleteTarget.id));
  }

  async function copyInviteLink(guest: GuestWithRsvp) {
    const token = guest.unique_token;
    if (!token) {
      toast.error('لا يوجد رمز دعوة لهذا الضيف');
      return;
    }
    try {
      await navigator.clipboard.writeText(buildInviteUrl(token));
      toast.success('تم نسخ رابط الدعوة');
    } catch {
      toast.error('تعذّر النسخ — انسخ الرابط يدوياً');
    }
  }

  function openInvitePreview(guest: GuestWithRsvp) {
    const token = guest.unique_token;
    if (!token) {
      toast.error('لا يوجد رمز دعوة لهذا الضيف');
      return;
    }
    window.open(buildInviteUrl(token), '_blank', 'noopener,noreferrer');
  }

  function openWhatsAppForGuest(guest: GuestWithRsvp) {
    if (!event || !guest.phone_e164) return;
    const text = buildWhatsAppMessage(guest, event, waTemplate, siteSettings);
    window.open(buildWaMeUrl(guest.phone_e164, text), '_blank', 'noopener,noreferrer');
  }

  function openTemplateDialog() {
    setTemplateDraft(waTemplate);
    setTemplateOpen(true);
  }

  function saveTemplateDialog() {
    if (!event) return;
    saveWhatsAppTemplate(event.id, templateDraft);
    setWaTemplate(templateDraft);
    setTemplateOpen(false);
    toast.success('تم حفظ قالب الرسالة');
  }

  const bulkSendQueue = useMemo(
    () => guests.filter((g) => !!g.phone_e164?.trim()),
    [guests],
  );

  function openBulkSend() {
    if (bulkSendQueue.length === 0) {
      toast.error('لا يوجد ضيوف لديهم رقم جوال');
      return;
    }
    setBulkIndex(0);
    setBulkSendOpen(true);
  }

  // --- Existing phones set for dedupe ---
  const existingPhones = useMemo(
    () => new Set(guests.map((g) => g.phone_e164).filter((p): p is string => !!p)),
    [guests],
  );

  // --- Export Excel (CSV with BOM) ---
  function handleExport() {
    if (guests.length === 0) {
      toast.error('لا يوجد ضيوف للتصدير');
      return;
    }

    const rsvpByGuestId: Record<string, string | null> = {};
    const guestIds: string[] = [];
    const exportGuests: ExportGuest[] = [];

    for (const g of guests) {
      guestIds.push(g.id);
      exportGuests.push({
        full_name: g.full_name,
        phone_e164: g.phone_e164,
        group_label: g.group_label,
        companions_allowed: g.companions_allowed,
      });
      const rsvp = unwrapRsvp(g.rsvps);
      rsvpByGuestId[g.id] = rsvp?.status ?? null;
    }

    const csv = buildExportCSV(exportGuests, rsvpByGuestId, guestIds);
    const slug = event?.slug || event?.title || 'guests';
    downloadStringAsFile(csv, `${slug}_ضيوف.csv`);
    toast.success('تم تصدير القائمة Excel');
  }

  // --- Export PDF ---
  async function handleExportPDF() {
    if (guests.length === 0) {
      toast.error('لا يوجد ضيوف للتصدير');
      return;
    }
    if (!event) return;

    setPdfExporting(true);
    try {
      const rsvpByGuestId: Record<string, string | null> = {};
      const pdfGuests: (ExportGuest & { id: string })[] = [];

      for (const g of guests) {
        pdfGuests.push({
          id: g.id,
          full_name: g.full_name,
          phone_e164: g.phone_e164,
          group_label: g.group_label,
          companions_allowed: g.companions_allowed,
        });
        const rsvp = unwrapRsvp(g.rsvps);
        rsvpByGuestId[g.id] = rsvp?.status ?? null;
      }

      await buildAndDownloadPDF({
        guests: pdfGuests,
        rsvpByGuestId,
        event,
        settings: siteSettings,
      });
      toast.success('تم تصدير القائمة PDF ✓');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('فشل تصدير PDF — تحقق من إعدادات الشبكة CORS');
    } finally {
      setPdfExporting(false);
    }
  }

  if (loading || !event) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-56 w-full rounded-[2rem] bg-gold-100" />
        <div className="grid sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-3xl bg-gold-100" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-3xl bg-gold-100" />
      </div>
    );
  }

  const isActive = event.status === 'active';

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link
        to="/dashboard/events"
        className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-ink"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للمناسبات
      </Link>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-gold-200/80 min-h-[220px]"
      >
        {event.cover_media_url ? (
          <img
            src={event.cover_media_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-l from-maroon-900 via-maroon-800 to-maroon-700" />
        )}
        <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/85 via-maroon-900/45 to-transparent" />
        <div className="relative p-6 sm:p-8 text-white">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-black rounded-full px-2.5 py-0.5 border bg-white/10 text-gold-100 border-gold-300/40">
              {eventTypeLabel(event.event_type)}
            </span>
            {event.venue_name && (
              <span className="text-[11px] font-black rounded-full px-2.5 py-0.5 border bg-white/10 text-white/90 border-white/20 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.venue_name}
              </span>
            )}
            <span className="text-[11px] font-black rounded-full px-2.5 py-0.5 border bg-white/10 text-white/90 border-white/20 inline-flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formatEventDate(event.event_date)}
            </span>
            <span
              className={`text-[11px] font-black rounded-full px-2.5 py-0.5 border ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-100 border-emerald-300/40'
                  : 'bg-gold-400/20 text-gold-100 border-gold-300/40'
              }`}
            >
              {STATUS_LABELS[event.status ?? ''] ?? event.status ?? '—'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{event.title}</h1>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to={`/dashboard/events/${event.id}/edit`}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              تعديل التفاصيل
            </Link>
            <button
              type="button"
              disabled={togglingStatus}
              onClick={() => void toggleEventStatus()}
              className="inline-flex items-center gap-2 rounded-full border border-gold-300/50 bg-gold-500/20 px-4 py-2.5 text-sm font-bold text-gold-50 hover:bg-gold-500/30 disabled:opacity-60 transition-colors"
            >
              {togglingStatus ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Power className="w-3.5 h-3.5" />
              )}
              {isActive ? 'تحويل إلى مسودة' : 'تفعيل المناسبة'}
            </button>
            <button
              type="button"
              disabled
              title="قريباً"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/45 cursor-not-allowed"
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              تصميم الدعوة
              <span className="text-[10px] font-black rounded-full bg-white/10 px-2 py-0.5">
                قريباً
              </span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* RSVP card */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card-lux p-5 sm:p-6 hover:transform-none"
      >
        <h2 className="text-lg font-black text-ink mb-4">حالة الردود</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatChip
            icon={CheckCircle2}
            label="مؤكد"
            value={rsvpStats.confirmed}
            tone="emerald"
          />
          <StatChip
            icon={XCircle}
            label="معتذر"
            value={rsvpStats.declined}
            tone="maroon"
          />
          <StatChip
            icon={Clock3}
            label="قيد الانتظار"
            value={rsvpStats.pending}
            tone="amber"
          />
          <StatChip
            icon={Users}
            label="إجمالي المدعوين"
            value={rsvpStats.total}
            tone="gold"
          />
          <StatChip
            icon={Users}
            label="مجموع المرافقين"
            value={rsvpStats.companionsSum}
            tone="gold"
          />
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-bold text-ink/50 mb-2">
            <span>نسبة التأكيد</span>
            <span className="tabular-nums">{rsvpStats.confirmedPct}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gold-100 overflow-hidden">
            <div
              className="h-full rounded-full gold-grad transition-all duration-500"
              style={{ width: `${rsvpStats.confirmedPct}%` }}
            />
          </div>
        </div>
      </motion.section>

      {/* Guests */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-black text-ink">قائمة الضيوف</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setImportDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-gold-300 bg-white px-4 py-2.5 text-sm font-bold text-ink/80 hover:border-gold-500 transition-colors"
            >
              <Upload className="w-4 h-4 text-gold-700" />
              استيراد إكسل/CSV
            </button>
            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={guests.length === 0 || pdfExporting}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-gold-300 bg-white px-4 py-2.5 text-sm font-bold text-ink/80 hover:border-gold-500 disabled:opacity-50 transition-colors"
                >
                  {pdfExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold-700" />
                  ) : (
                    <Download className="w-4 h-4 text-gold-700" />
                  )}
                  تصدير القائمة
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-right [direction:rtl]">
                <DropdownMenuItem
                  onClick={handleExport}
                  className="gap-2 font-bold cursor-pointer"
                >
                  <Download className="w-4 h-4 text-gold-700" />
                  تصدير Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void handleExportPDF()}
                  disabled={pdfExporting}
                  className="gap-2 font-bold cursor-pointer"
                >
                  {pdfExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-maroon-700" />
                  )}
                  تصدير PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              onClick={openTemplateDialog}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-gold-300 bg-white px-4 py-2.5 text-sm font-bold text-ink/80 hover:border-gold-500 transition-colors"
            >
              <MessageSquareText className="w-4 h-4 text-gold-700" />
              تخصيص رسالة الدعوة
            </button>
            <button
              type="button"
              onClick={openBulkSend}
              disabled={guests.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-emerald-600/40 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              إرسال للجميع عبر واتساب
            </button>
            <button
              type="button"
              onClick={openAddGuest}
              className="btn-gold inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm"
            >
              <Plus className="w-4 h-4" />
              إضافة ضيف
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card-lux p-4 sm:p-5 hover:transform-none space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="بحث بالاسم أو الجوال"
                className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 pr-10 pl-4 py-2.5 text-sm outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10"
              />
            </div>
            <select
              value={groupDraft}
              onChange={(e) => setGroupDraft(e.target.value)}
              className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-4 py-2.5 text-sm font-bold outline-none focus:border-gold-500"
            >
              <option value="all">كل الأطراف</option>
              {GROUP_LABELS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={rsvpDraft}
              onChange={(e) => setRsvpDraft(e.target.value)}
              className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-4 py-2.5 text-sm font-bold outline-none focus:border-gold-500"
            >
              {RSVP_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="inline-flex items-center gap-2 rounded-full border-2 border-gold-300 bg-white px-5 py-2 text-sm font-bold text-ink/80 hover:border-gold-500"
          >
            تطبيق الفلتر
          </button>
        </div>

        {guests.length === 0 ? (
          <div className="card-lux p-12 text-center hover:transform-none">
            <Users className="w-10 h-10 text-gold-600 mx-auto" />
            <p className="mt-4 font-black text-ink">لا يوجد ضيوف بعد</p>
            <p className="mt-2 text-sm text-ink/45">أضف أول ضيف لبدء إرسال الدعوات ومتابعة الردود.</p>
            <button
              type="button"
              onClick={openAddGuest}
              className="btn-gold mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm"
            >
              <Plus className="w-4 h-4" />
              إضافة ضيف
            </button>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="card-lux p-10 text-center hover:transform-none">
            <Search className="w-8 h-8 text-gold-600 mx-auto" />
            <p className="mt-4 font-black text-ink">لا نتائج مطابقة للفلتر</p>
            <p className="mt-2 text-sm text-ink/45">عدّل البحث أو الفلاتر ثم اضغط «تطبيق الفلتر».</p>
          </div>
        ) : (
          <div className="card-lux overflow-hidden hover:transform-none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold-200/80 bg-cream/50 text-ink/55">
                    <th className="text-right font-black px-4 py-3 whitespace-nowrap">الاسم</th>
                    <th className="text-right font-black px-4 py-3 whitespace-nowrap">الاتصال</th>
                    <th className="text-right font-black px-4 py-3 whitespace-nowrap">من طرف</th>
                    <th className="text-right font-black px-4 py-3 whitespace-nowrap">المرافقون</th>
                    <th className="text-right font-black px-4 py-3 whitespace-nowrap">حالة الرد</th>
                    <th className="text-right font-black px-4 py-3 whitespace-nowrap">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => {
                    const rsvp = unwrapRsvp(guest.rsvps);
                    const meta = rsvpStatusMeta(rsvp?.status, !!rsvp);
                    return (
                      <tr
                        key={guest.id}
                        className="border-b border-gold-100 last:border-0 hover:bg-gold-50/40"
                      >
                        <td className="px-4 py-3 font-bold text-ink whitespace-nowrap">
                          {guest.full_name}
                        </td>
                        <td className="px-4 py-3 text-ink/65 font-mono text-xs whitespace-nowrap">
                          <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>
                            {guest.phone_e164 || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                          {groupLabelLabel(guest.group_label)}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-ink/70">
                          {(() => {
                            const rsvp = unwrapRsvp(guest.rsvps);
                            if (rsvp && rsvp.status === 'confirmed') {
                              return (
                                <span title={`الحد الأقصى: ${guest.companions_allowed ?? 0}`}>
                                  {rsvp.companions_count ?? 0}
                                  <span className="text-ink/30 text-[10px] mr-1">/ {guest.companions_allowed ?? 0}</span>
                                </span>
                              );
                            }
                            return (
                              <span className="text-ink/40" title="الحد الأقصى المسموح به">
                                — <span className="text-[10px]">(حد: {guest.companions_allowed ?? 0})</span>
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[11px] font-black rounded-full px-2.5 py-0.5 border whitespace-nowrap ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {guest.phone_e164 ? (
                              <button
                                type="button"
                                onClick={() => openWhatsAppForGuest(guest)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#1ebe57]"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                                إرسال عبر واتساب
                              </button>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <button
                                      type="button"
                                      disabled
                                      className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/40 px-3 py-1.5 text-xs font-bold text-white cursor-not-allowed"
                                    >
                                      <WhatsAppIcon className="w-3.5 h-3.5" />
                                      إرسال عبر واتساب
                                    </button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" dir="rtl">
                                  لا يوجد رقم جوال
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <button
                              type="button"
                              onClick={() => void copyInviteLink(guest)}
                              className="inline-flex items-center justify-center rounded-full border border-gold-200 bg-white p-1.5 text-ink/55 hover:border-gold-400 hover:text-ink/80"
                              title="نسخ رابط الدعوة"
                              aria-label="نسخ رابط الدعوة"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openInvitePreview(guest)}
                              className="inline-flex items-center justify-center rounded-full border border-gold-200 bg-white p-1.5 text-ink/55 hover:border-gold-400 hover:text-ink/80"
                              title="فتح دعوة هذا الضيف"
                              aria-label="فتح دعوة هذا الضيف"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditGuest(guest)}
                              className="inline-flex items-center gap-1 rounded-full border border-gold-200 bg-white px-2.5 py-1.5 text-xs font-bold text-ink/70 hover:border-gold-400"
                            >
                              <Pencil className="w-3 h-3" />
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(guest)}
                              className="inline-flex items-center gap-1 rounded-full border border-maroon-500/25 bg-white px-2.5 py-1.5 text-xs font-bold text-maroon-700 hover:bg-maroon-500/5"
                            >
                              <Trash2 className="w-3 h-3" />
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Add / Edit guest dialog */}
      <Dialog
        open={guestModalOpen}
        onOpenChange={(open) => {
          if (!open && !savingGuest) {
            setGuestModalOpen(false);
            setEditingGuest(null);
            setPhoneError(null);
          }
        }}
      >
        <DialogContent className="rounded-3xl border-gold-200 sm:max-w-md" dir="rtl">
          <DialogHeader className="sm:text-right">
            <DialogTitle className="font-black text-ink">
              {editingGuest ? 'تعديل ضيف' : 'إضافة ضيف'}
            </DialogTitle>
            <DialogDescription className="text-ink/55">
              أدخل بيانات الضيف — رقم الجوال بالصيغة الدولية إن وُجد.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => void saveGuest(e)} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-ink/70 mb-2">
                الاسم <span className="text-maroon-600">*</span>
              </label>
              <input
                required
                value={guestForm.full_name}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, full_name: e.target.value }))
                }
                disabled={savingGuest}
                className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-4 py-3 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-ink/70 mb-2">الجوال (E.164)</label>
              <input
                value={guestForm.phone_e164}
                onChange={(e) => {
                  setGuestForm((prev) => ({ ...prev, phone_e164: e.target.value }));
                  setPhoneError(null);
                }}
                disabled={savingGuest}
                placeholder="+9665XXXXXXXX"
                dir="ltr"
                className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-4 py-3 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60 font-mono text-sm"
              />
              {phoneError && (
                <p className="mt-1.5 text-xs font-bold text-maroon-700">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-black text-ink/70 mb-2">من طرف</label>
              <select
                value={guestForm.group_label}
                onChange={(e) =>
                  setGuestForm((prev) => ({ ...prev, group_label: e.target.value }))
                }
                disabled={savingGuest}
                className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-4 py-3 outline-none focus:border-gold-500 font-bold disabled:opacity-60"
              >
                {GROUP_LABELS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-ink/70 mb-2">المرافقون المسموحون</label>
              <input
                type="number"
                min={0}
                step={1}
                value={guestForm.companions_allowed}
                onChange={(e) =>
                  setGuestForm((prev) => ({
                    ...prev,
                    companions_allowed: e.target.value,
                  }))
                }
                disabled={savingGuest}
                className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-4 py-3 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 disabled:opacity-60"
                dir="ltr"
              />
            </div>

            <DialogFooter className="sm:flex-row-reverse gap-2 pt-2">
              <button
                type="submit"
                disabled={savingGuest}
                className="btn-gold inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
              >
                {savingGuest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingGuest ? (
                  <Pencil className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {editingGuest ? 'حفظ التعديلات' : 'إضافة'}
              </button>
              <button
                type="button"
                disabled={savingGuest}
                onClick={() => setGuestModalOpen(false)}
                className="rounded-full border border-gold-200 px-5 py-2.5 text-sm font-bold text-ink/70"
              >
                إلغاء
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete guest */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl border-gold-200" dir="rtl">
          <AlertDialogHeader className="sm:text-right">
            <AlertDialogTitle className="font-black text-ink">حذف الضيف؟</AlertDialogTitle>
            <AlertDialogDescription className="text-ink/55 leading-7">
              سيتم حذف «{deleteTarget?.full_name}» نهائياً من قائمة الضيوف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-row-reverse gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => void confirmDeleteGuest()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-maroon-700 text-white px-5 py-2.5 text-sm font-bold hover:bg-maroon-800 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              حذف
            </button>
            <AlertDialogCancel disabled={deleting} className="rounded-full border-gold-200 font-bold">
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Customize WhatsApp template */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="rounded-3xl border-gold-200 sm:max-w-lg" dir="rtl">
          <DialogHeader className="sm:text-right">
            <DialogTitle className="font-black text-ink">تخصيص رسالة الدعوة</DialogTitle>
            <DialogDescription className="text-ink/55 leading-7">
              استخدم المتغيرات: {'{name}'} {'{eventGreeting}'} {'{eventTitle}'} {'{date}'}{' '}
              {'{time}'} {'{venue}'} {'{inviteUrl}'} {'{brandName}'}
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={templateDraft}
            onChange={(e) => setTemplateDraft(e.target.value)}
            rows={8}
            className="w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-4 py-3 text-sm outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 leading-7"
          />
          <div className="rounded-2xl border border-gold-200 bg-cream/40 p-3">
            <p className="text-[11px] font-black text-ink/45 mb-2">معاينة مباشرة</p>
            <pre className="whitespace-pre-wrap text-sm text-ink/80 font-medium leading-7">
              {buildWhatsAppMessage(
                guests[0] ?? { full_name: 'ضيف تجريبي', unique_token: 'preview-token' },
                event,
                templateDraft,
                siteSettings
              )}
            </pre>
          </div>
          <DialogFooter className="sm:flex-row-reverse gap-2">
            <button
              type="button"
              onClick={saveTemplateDialog}
              className="btn-gold px-5 py-2.5 text-sm"
            >
              حفظ القالب
            </button>
            <button
              type="button"
              onClick={() => {
                setTemplateDraft(DEFAULT_WHATSAPP_TEMPLATE);
              }}
              className="rounded-full border border-gold-200 px-5 py-2.5 text-sm font-bold text-ink/70"
            >
              استعادة الافتراضي
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guided bulk WhatsApp send */}
      <Dialog open={bulkSendOpen} onOpenChange={setBulkSendOpen}>
        <DialogContent className="rounded-3xl border-gold-200 sm:max-w-md" dir="rtl">
          <DialogHeader className="sm:text-right">
            <DialogTitle className="font-black text-ink">إرسال للجميع عبر واتساب</DialogTitle>
            <DialogDescription className="text-ink/55">
              افتح واتساب لكل ضيف على حدة — المتصفحات تمنع فتح عدة نوافذ دفعة واحدة.
            </DialogDescription>
          </DialogHeader>
          {bulkSendQueue.length === 0 ? (
            <p className="text-sm font-bold text-ink/55">لا يوجد ضيوف برقم جوال.</p>
          ) : (
            (() => {
              const current = bulkSendQueue[Math.min(bulkIndex, bulkSendQueue.length - 1)];
              const step = Math.min(bulkIndex + 1, bulkSendQueue.length);
              return (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-ink/50 tabular-nums">
                    {step} / {bulkSendQueue.length}
                  </p>
                  <div className="rounded-2xl border border-gold-200 bg-cream/50 p-4">
                    <p className="font-black text-ink text-lg">{current.full_name}</p>
                    <p className="mt-1 font-mono text-sm text-ink/60" dir="ltr">
                      {current.phone_e164}
                    </p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gold-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${(step / bulkSendQueue.length) * 100}%` }}
                    />
                  </div>
                  <DialogFooter className="sm:flex-row-reverse gap-2">
                    <button
                      type="button"
                      onClick={() => openWhatsAppForGuest(current)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1ebe57]"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      إرسال
                    </button>
                    {bulkIndex < bulkSendQueue.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setBulkIndex((i) => i + 1)}
                        className="rounded-full border border-gold-200 px-5 py-2.5 text-sm font-bold text-ink/70"
                      >
                        التالي
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setBulkSendOpen(false)}
                        className="rounded-full border border-gold-200 px-5 py-2.5 text-sm font-bold text-ink/70"
                      >
                        إنهاء
                      </button>
                    )}
                  </DialogFooter>
                </div>
              );
            })()
          )}
        </DialogContent>
      </Dialog>

      {/* Guest Import Dialog */}
      <GuestImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        eventId={event.id}
        existingPhones={existingPhones}
        onImported={() => void loadEventAndGuests()}
      />
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone: 'emerald' | 'maroon' | 'amber' | 'gold';
}) {
  const toneClass = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    maroon: 'text-maroon-700 bg-maroon-500/10 border-maroon-500/25',
    amber: 'text-amber-800 bg-amber-50 border-amber-200',
    gold: 'text-gold-800 bg-gold-50 border-gold-200',
  }[tone];

  return (
    <div className={`rounded-2xl border px-3 py-3 ${toneClass}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-black opacity-80">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}
