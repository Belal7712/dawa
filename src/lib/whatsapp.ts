import { eventTypeLabel } from '@/lib/eventTypes';
import { buildInviteUrl } from '@/lib/inviteUrl';

/**
 * Default WhatsApp invitation — competitor-inspired Arabic flow
 * (greeting → event phrase → title → details → link CTA → soft “buttons” as text).
 *
 * True interactive WhatsApp buttons require the Business Cloud API;
 * with wa.me we mirror that UX via a clear CTA + the per-guest invite link.
 *
 * Placeholders: {name} {eventGreeting} {eventTitle} {eventType} {date} {time}
 * {venue} {inviteUrl} {brandName} {siteUrl}
 */
export const DEFAULT_WHATSAPP_TEMPLATE = `أهلاً {name}،

{eventGreeting}
«{eventTitle}»

🗓 {date}
🕗 {time}
📍 {venue}

للاطلاع على تفاصيل دعوتك وتأكيد الحضور، يرجى فتح الرابط:
{inviteUrl}

👍 تأكيد الحضور أو الاعتذار عبر صفحة الدعوة
📋 تفاصيل الدعوة والمناسبة في نفس الرابط

مع أطيب التحيات،
{brandName}`;

export type WhatsAppGuestFields = {
  full_name: string;
  unique_token: string | null;
};

export type WhatsAppEventFields = {
  title: string;
  event_type: string | null;
  event_date: string | null;
  venue_name: string | null;
};

export type WhatsAppBrandFields = {
  brand_name?: string | null;
  site_url?: string | null;
};

/** Hijri long date (مثل ١٧ صفر ١٤٤٨ هـ) for WhatsApp elegance. */
function formatArabicDateFull(value: string | null): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
    return `${hijri} هـ`;
  } catch {
    try {
      return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'long' }).format(new Date(value));
    } catch {
      return value;
    }
  }
}

function formatArabicTime(value: string | null): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getEventGreeting(eventType: string | null): string {
  switch (eventType) {
    case 'wedding':
      return 'يسرّنا ويشرّفنا دعوتكم لحضور حفل زفاف';
    case 'engagement':
      return 'يسرّنا ويشرّفنا دعوتكم لحضور حفل خطوبة';
    case 'graduation':
      return 'يسرّنا ويشرّفنا دعوتكم لحضور حفل تخرّج';
    case 'corporate':
      return 'يسرّنا دعوتكم لحضور فعاليتنا';
    default:
      return 'يسعدنا ويشرّفنا دعوتكم لحضور مناسبتنا';
  }
}

function resolveBrand(brand?: string | WhatsAppBrandFields | null): {
  brandName: string;
  siteUrl: string;
} {
  if (brand && typeof brand === 'object') {
    return {
      brandName: brand.brand_name?.trim() || 'دعوتك',
      siteUrl: brand.site_url?.trim() || '',
    };
  }
  if (typeof brand === 'string' && brand.trim()) {
    return { brandName: brand.trim(), siteUrl: '' };
  }
  return { brandName: 'دعوتك', siteUrl: '' };
}

export function buildWhatsAppMessage(
  guest: WhatsAppGuestFields,
  event: WhatsAppEventFields,
  template: string = DEFAULT_WHATSAPP_TEMPLATE,
  brand?: string | WhatsAppBrandFields | null
): string {
  const inviteUrl = guest.unique_token
    ? buildInviteUrl(guest.unique_token)
    : '—';
  const { brandName, siteUrl } = resolveBrand(brand);

  return template
    .replaceAll('{name}', guest.full_name || 'ضيفنا')
    .replaceAll('{eventTitle}', event.title || '')
    .replaceAll('{eventGreeting}', getEventGreeting(event.event_type))
    .replaceAll('{eventType}', eventTypeLabel(event.event_type))
    .replaceAll('{date}', formatArabicDateFull(event.event_date))
    .replaceAll('{time}', formatArabicTime(event.event_date))
    .replaceAll('{venue}', event.venue_name?.trim() || '—')
    .replaceAll('{inviteUrl}', inviteUrl)
    .replaceAll('{brandName}', brandName)
    .replaceAll('{siteUrl}', siteUrl);
}

/** Digits-only phone for wa.me (no +). */
export function buildWaMeUrl(phone_e164: string, text: string): string {
  const digits = phone_e164.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Bumped key so hosts get the new elegant default (old custom templates stay recoverable via editor). */
export function whatsappTemplateStorageKey(eventId: string): string {
  return `dawatak:wa-template:v2:${eventId}`;
}

export function loadWhatsAppTemplate(eventId: string): string {
  try {
    const raw = localStorage.getItem(whatsappTemplateStorageKey(eventId));
    if (raw && raw.trim()) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_WHATSAPP_TEMPLATE;
}

export function saveWhatsAppTemplate(eventId: string, template: string): void {
  try {
    localStorage.setItem(whatsappTemplateStorageKey(eventId), template);
  } catch {
    /* ignore */
  }
}
