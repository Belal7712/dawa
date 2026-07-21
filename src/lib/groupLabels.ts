/** Canonical guests.group_label values ↔ Arabic labels (single source of truth for UI). */
export const GROUP_LABELS = [
  { value: 'groom', label: 'العريس' },
  { value: 'bride', label: 'العروس' },
  { value: 'other', label: 'أخرى' },
] as const;

export type GroupLabelValue = (typeof GROUP_LABELS)[number]['value'];

const LABEL_BY_VALUE: Record<string, string> = Object.fromEntries(
  GROUP_LABELS.map((t) => [t.value, t.label]),
);

export function groupLabelLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return LABEL_BY_VALUE[value] ?? value;
}

export function isGroupLabelValue(value: string): value is GroupLabelValue {
  return GROUP_LABELS.some((t) => t.value === value);
}
