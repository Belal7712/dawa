-- ═══════════════════════════════════════════════════════════════════════
-- Migration 0003: Normalize events.event_type to canonical English slugs
-- Ground truth (2026-07-19):
--   DISTINCT event_type observed via REST: 'wedding' (2 rows)
--   Supabase MCP unavailable at apply time — run via MCP execute_sql / apply_migration
-- Canonical set: wedding, engagement, graduation, birthday, corporate, other
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- Map Arabic / synonyms → canonical slugs (covers known + likely free-text values)
UPDATE public.events
SET event_type = 'wedding'
WHERE event_type IS NULL
   OR lower(trim(event_type)) IN (
     'wedding', 'زواج', 'زفاف', 'زواج وزفاف', 'حفل زواج', 'حفل زفاف'
   );

UPDATE public.events
SET event_type = 'engagement'
WHERE lower(trim(event_type)) IN (
  'engagement', 'خطوبة', 'خطبه', 'حفلة خطوبة'
);

UPDATE public.events
SET event_type = 'graduation'
WHERE lower(trim(event_type)) IN (
  'graduation', 'تخرج', 'حفل تخرج'
);

UPDATE public.events
SET event_type = 'birthday'
WHERE lower(trim(event_type)) IN (
  'birthday', 'عيد ميلاد', 'ميلاد', 'حفلة عيد ميلاد'
);

UPDATE public.events
SET event_type = 'corporate'
WHERE lower(trim(event_type)) IN (
  'corporate', 'فعالية شركات', 'شركات', 'شركة', 'مؤتمر', 'عمل'
);

-- Anything still outside the canonical set → other
UPDATE public.events
SET event_type = 'other'
WHERE event_type IS NULL
   OR event_type NOT IN (
     'wedding', 'engagement', 'graduation', 'birthday', 'corporate', 'other'
   );

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_event_type_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_event_type_check
  CHECK (
    event_type IN (
      'wedding',
      'engagement',
      'graduation',
      'birthday',
      'corporate',
      'other'
    )
  );

COMMIT;
