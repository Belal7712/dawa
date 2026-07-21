/** Build a URL-safe slug from a title + short random suffix. */
export function generateEventSlug(title: string): string {
  const base =
    title
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'event';

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
