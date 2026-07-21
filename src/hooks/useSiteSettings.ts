/**
 * useSiteSettings — fetches the singleton public.site_settings row.
 *
 * Caches the result in module-level memory so subsequent consumers in the
 * same page-load don't each fire a separate DB query.
 * Fallbacks are returned when the row is missing or on fetch error.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';

export type SiteSettings = Tables<'site_settings'>;

// ---- Fallback values ----
export const SETTINGS_FALLBACK: SiteSettings = {
  id: true,
  brand_name: 'دعوتك',
  logo_url: null,
  site_url: null,
  contact_phone: null,
  contact_email: 'hello@dawatak.com',
  whatsapp: null,
  address: null,
  updated_at: null,
};

// ---- Module-level cache (survives re-renders, resets on page-reload) ----
let cachedSettings: SiteSettings | null = null;
let fetchPromise: Promise<SiteSettings> | null = null;

async function fetchSiteSettings(): Promise<SiteSettings> {
  if (cachedSettings !== null) return cachedSettings;

  // Deduplicate concurrent callers
  if (!fetchPromise) {
    fetchPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', true)
          .maybeSingle();

        if (error || !data) {
          console.warn('[useSiteSettings] Row missing or error — using fallback.', error?.message);
          cachedSettings = { ...SETTINGS_FALLBACK };
        } else {
          // Merge with fallback so any null columns fall back to defaults
          cachedSettings = {
            ...SETTINGS_FALLBACK,
            ...data,
            brand_name: data.brand_name ?? SETTINGS_FALLBACK.brand_name,
            contact_email: data.contact_email ?? SETTINGS_FALLBACK.contact_email,
          };
        }
      } catch (err) {
        console.warn('[useSiteSettings] Exception — using fallback.', err);
        cachedSettings = { ...SETTINGS_FALLBACK };
      }
      fetchPromise = null;
      return cachedSettings!;
    })();
  }

  return fetchPromise;
}

/** Invalidate the cache so the next consumer re-fetches (call after saving settings). */
export function invalidateSiteSettingsCache() {
  cachedSettings = null;
  fetchPromise = null;
}

// ---- Hook ----
export function useSiteSettings(): { settings: SiteSettings; loading: boolean } {
  const [settings, setSettings] = useState<SiteSettings>(
    cachedSettings ?? SETTINGS_FALLBACK,
  );
  const [loading, setLoading] = useState(cachedSettings === null);

  useEffect(() => {
    if (cachedSettings !== null) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    let cancelled = false;

    void fetchSiteSettings().then((s) => {
      if (!cancelled) {
        setSettings(s);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}
