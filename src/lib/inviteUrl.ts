/**
 * Public origin for guest invite links.
 *
 * - DEV: always use the running Vite origin (localhost) so hosts can test
 *   the real /invite/:token page. Set VITE_PUBLIC_BASE_URL later for prod.
 * - PROD: VITE_PUBLIC_BASE_URL when set (e.g. https://dawatak.com), else
 *   https://dawatak.com.
 *
 * Each guest gets `${base}/invite/${unique_token}` — one token, one guest,
 * one event (isolation via get_invite / submit_rsvp RPCs).
 */
export function getInviteBaseUrl(): string {
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  const fromEnv = (import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined)?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return 'https://dawatak.com';
}

export function buildInviteUrl(token: string): string {
  return `${getInviteBaseUrl()}/invite/${encodeURIComponent(token)}`;
}
