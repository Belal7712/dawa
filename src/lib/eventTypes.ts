/** Canonical event_type values ↔ Arabic labels (single source of truth for UI). */
export const EVENT_TYPES = [
  { value: 'wedding', label: 'زواج' },
  { value: 'engagement', label: 'خطوبة' },
  { value: 'graduation', label: 'تخرج' },
  { value: 'birthday', label: 'عيد ميلاد' },
  { value: 'corporate', label: 'فعالية شركات' },
  { value: 'other', label: 'أخرى' },
] as const;

export type EventTypeValue = (typeof EVENT_TYPES)[number]['value'];

const LABEL_BY_VALUE: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.label]),
);

export function eventTypeLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return LABEL_BY_VALUE[value] ?? value;
}

export function isEventTypeValue(value: string): value is EventTypeValue {
  return EVENT_TYPES.some((t) => t.value === value);
}
