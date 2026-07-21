-- ═══════════════════════════════════════════════════════════════════════
-- Migration 0002: Security Hardening
-- Applied on top of 0001 (already live on project yugwjnnwpsnuazzattbu)
-- ═══════════════════════════════════════════════════════════════════════
-- This migration:
--   1. Revokes direct anon access to rsvps and guests writes
--   2. Creates SECURITY DEFINER functions for safe RSVP submission
--   3. Adds role escalation prevention trigger on profiles
--   4. Locks down checkins to Edge Function only
--   5. Creates storage buckets with proper policies
--   6. Adds rsvps to Realtime publication
--   7. Adds WhatsApp opt-out column to guests
--   8. Ensures ON DELETE CASCADE on all relevant FKs
--   9. Adds account deletion function (PDPL right-to-erasure)
--  10. Adds payment webhook idempotency column
--  11. Adds E.164 phone format constraint
--  12. Ensures anon can insert support_tickets
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- 1. RSVP: Revoke direct anon/authenticated write access
-- ─────────────────────────────────────────────────────────────────────

REVOKE ALL ON public.rsvps FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.guests FROM anon;

-- Drop any existing anon INSERT policies on rsvps that 0001 may have created
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'rsvps'
      AND (policyname ILIKE '%anon%insert%' OR policyname ILIKE '%public%insert%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.rsvps', pol.policyname);
  END LOOP;
END $$;

-- Drop any existing anon INSERT policies on guests
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guests'
      AND (policyname ILIKE '%anon%insert%' OR policyname ILIKE '%public%insert%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.guests', pol.policyname);
  END LOOP;
END $$;


-- ─────────────────────────────────────────────────────────────────────
-- 2. SECURITY DEFINER: Token-based RSVP (guest has a personalized link)
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.submit_rsvp(
  p_guest_token uuid,
  p_status      text,
  p_companions  int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_guest  guests%ROWTYPE;
  v_event  events%ROWTYPE;
BEGIN
  -- Validate status against allowed set
  IF p_status NOT IN ('confirmed', 'declined', 'pending') THEN
    RETURN jsonb_build_object('error', 'invalid_status');
  END IF;

  -- Look up guest by unique token
  SELECT * INTO v_guest FROM guests WHERE unique_token = p_guest_token;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'guest_not_found');
  END IF;

  -- Verify the guest's event is active
  SELECT * INTO v_event FROM events WHERE id = v_guest.event_id;
  IF v_event.status != 'active' THEN
    RETURN jsonb_build_object('error', 'event_not_active');
  END IF;

  -- Validate companions count
  IF p_companions < 0 OR p_companions > v_guest.companions_allowed THEN
    RETURN jsonb_build_object(
      'error', 'companions_exceeded',
      'max_allowed', v_guest.companions_allowed
    );
  END IF;

  -- Upsert RSVP (insert or update if guest already responded)
  INSERT INTO rsvps (guest_id, status, companions_count, responded_at, response_channel)
  VALUES (v_guest.id, p_status, p_companions, now(), 'web')
  ON CONFLICT (guest_id)
  DO UPDATE SET
    status           = EXCLUDED.status,
    companions_count = EXCLUDED.companions_count,
    responded_at     = now(),
    response_channel = 'web';

  RETURN jsonb_build_object(
    'ok',         true,
    'guest_name', v_guest.full_name,
    'event_id',   v_guest.event_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_rsvp(uuid, text, int) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────
-- 3. SECURITY DEFINER: Public RSVP (no token — general share link)
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.submit_public_rsvp(
  p_event_slug  text,
  p_guest_name  text,
  p_phone       text    DEFAULT NULL,
  p_status      text    DEFAULT 'confirmed',
  p_companions  int     DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event    events%ROWTYPE;
  v_guest_id uuid;
BEGIN
  -- Validate status
  IF p_status NOT IN ('confirmed', 'declined', 'pending') THEN
    RETURN jsonb_build_object('error', 'invalid_status');
  END IF;

  -- Validate guest name is not empty
  IF trim(p_guest_name) = '' OR p_guest_name IS NULL THEN
    RETURN jsonb_build_object('error', 'name_required');
  END IF;

  -- Find active event by slug
  SELECT * INTO v_event
  FROM events
  WHERE slug = p_event_slug AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'event_not_found');
  END IF;

  -- Sanitize companions
  IF p_companions < 0 THEN
    p_companions := 0;
  END IF;

  -- Create lightweight guest record
  -- Phone is only stored if it matches E.164 format (constraint will enforce)
  INSERT INTO guests (
    event_id, full_name, phone_e164,
    group_label, companions_allowed, unique_token
  )
  VALUES (
    v_event.id,
    trim(p_guest_name),
    CASE WHEN p_phone ~ '^\+[1-9]\d{7,14}$' THEN p_phone ELSE NULL END,
    'other',
    GREATEST(p_companions, 0),
    gen_random_uuid()
  )
  RETURNING id INTO v_guest_id;

  -- Create RSVP record
  INSERT INTO rsvps (guest_id, status, companions_count, responded_at, response_channel)
  VALUES (v_guest_id, p_status, GREATEST(p_companions, 0), now(), 'web');

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_public_rsvp(text, text, text, text, int) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────
-- 4. Role escalation prevention trigger on profiles
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  -- If role hasn't changed, allow the update
  IF NEW.role = OLD.role THEN
    RETURN NEW;
  END IF;

  -- Check if the caller is an admin
  SELECT role INTO caller_role
  FROM profiles
  WHERE id = auth.uid();

  -- If caller is not admin, silently revert the role change
  IF caller_role IS DISTINCT FROM 'admin' THEN
    NEW.role := OLD.role;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop if exists to make migration re-runnable
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;

CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();


-- ─────────────────────────────────────────────────────────────────────
-- 5. Checkins: No direct write access for anon or authenticated
--    All check-ins go through the qr-validate Edge Function (service_role)
-- ─────────────────────────────────────────────────────────────────────

REVOKE INSERT, UPDATE, DELETE ON public.checkins FROM anon;
REVOKE INSERT, UPDATE ON public.checkins FROM authenticated;
-- authenticated retains SELECT (to display QR status in their dashboard)
-- via existing RLS SELECT policy chained through event owner_id


-- ─────────────────────────────────────────────────────────────────────
-- 6. Storage buckets and policies
-- ─────────────────────────────────────────────────────────────────────

-- PUBLIC bucket: event cover images, invitation media
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-media', 'event-media', true)
ON CONFLICT (id) DO NOTHING;

-- Owner-folder upload: users upload to their own UID folder
CREATE POLICY "owner_upload_event_media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "owner_update_event_media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "owner_delete_event_media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- PRIVATE bucket: payment receipts (bank transfer proof)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Upload: authenticated users into their own UID folder
CREATE POLICY "owner_upload_receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: owner can read their own; admins can read all
CREATE POLICY "owner_or_admin_read_receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );


-- ─────────────────────────────────────────────────────────────────────
-- 7. Realtime: add rsvps to publication
-- ─────────────────────────────────────────────────────────────────────
-- RLS still applies to Realtime subscriptions. Customers will only
-- receive realtime events for RSVPs on their own events.

ALTER PUBLICATION supabase_realtime ADD TABLE rsvps;


-- ─────────────────────────────────────────────────────────────────────
-- 8. WhatsApp opt-out column
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS whatsapp_opt_out boolean NOT NULL DEFAULT false;


-- ─────────────────────────────────────────────────────────────────────
-- 9. ON DELETE CASCADE on all relevant foreign keys
--    (Ensures PDPL right-to-erasure: deleting a user cascades cleanly)
-- ─────────────────────────────────────────────────────────────────────

-- events.owner_id → profiles.id
ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_owner_id_fkey;
ALTER TABLE public.events
  ADD CONSTRAINT events_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- guests.event_id → events.id
ALTER TABLE public.guests
  DROP CONSTRAINT IF EXISTS guests_event_id_fkey;
ALTER TABLE public.guests
  ADD CONSTRAINT guests_event_id_fkey
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

-- rsvps.guest_id → guests.id
ALTER TABLE public.rsvps
  DROP CONSTRAINT IF EXISTS rsvps_guest_id_fkey;
ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_guest_id_fkey
  FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;

-- checkins.guest_id → guests.id
ALTER TABLE public.checkins
  DROP CONSTRAINT IF EXISTS checkins_guest_id_fkey;
ALTER TABLE public.checkins
  ADD CONSTRAINT checkins_guest_id_fkey
  FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;

-- checkins.checked_in_by → profiles.id (SET NULL — preserve audit trail)
ALTER TABLE public.checkins
  DROP CONSTRAINT IF EXISTS checkins_checked_in_by_fkey;
ALTER TABLE public.checkins
  ADD CONSTRAINT checkins_checked_in_by_fkey
  FOREIGN KEY (checked_in_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- orders.event_id → events.id
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_event_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_event_id_fkey
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

-- whatsapp_messages.guest_id → guests.id
ALTER TABLE public.whatsapp_messages
  DROP CONSTRAINT IF EXISTS whatsapp_messages_guest_id_fkey;
ALTER TABLE public.whatsapp_messages
  ADD CONSTRAINT whatsapp_messages_guest_id_fkey
  FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


-- ─────────────────────────────────────────────────────────────────────
-- 10. Account deletion function (PDPL right-to-erasure)
-- ─────────────────────────────────────────────────────────────────────
-- Deletes the caller's profile and ALL dependent data (via CASCADE).
-- The auth.users row should be deleted separately via an Edge Function
-- (since auth schema is not directly writable by SECURITY DEFINER
--  functions running as the table owner).

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  -- Delete profile → CASCADE removes:
  --   events → guests → rsvps, checkins, whatsapp_messages
  --   events → orders
  DELETE FROM public.profiles WHERE id = v_uid;

  -- Also clean up any storage files owned by this user
  DELETE FROM storage.objects
  WHERE bucket_id IN ('event-media', 'receipts')
    AND (storage.foldername(name))[1] = v_uid::text;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;


-- ─────────────────────────────────────────────────────────────────────
-- 11. Payment webhook idempotency
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS gateway_event_id text;

-- Partial unique index: only enforced when not null
CREATE UNIQUE INDEX IF NOT EXISTS orders_gateway_event_id_unique
  ON public.orders (gateway_event_id)
  WHERE gateway_event_id IS NOT NULL;


-- ─────────────────────────────────────────────────────────────────────
-- 12. E.164 phone format constraint on guests
-- ─────────────────────────────────────────────────────────────────────
-- Allows NULL (some guests may not have a phone), but if set, must be E.164

ALTER TABLE public.guests
  DROP CONSTRAINT IF EXISTS phone_e164_format;

ALTER TABLE public.guests
  ADD CONSTRAINT phone_e164_format
  CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{7,14}$');


-- ─────────────────────────────────────────────────────────────────────
-- 13. Support tickets: ensure anon can INSERT (Contact form)
-- ─────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_tickets'
      AND policyname = 'anon_insert_support_tickets'
  ) THEN
    CREATE POLICY anon_insert_support_tickets
      ON public.support_tickets
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════
-- FIRST ADMIN CREATION (documentation — NOT auto-executed)
-- ═══════════════════════════════════════════════════════════════════════
-- The first admin MUST be created manually via the Supabase SQL Editor
-- using the service_role connection (Dashboard → SQL Editor). This
-- bypasses the prevent_role_self_escalation trigger because the SQL
-- Editor runs as the postgres superuser.
--
-- Steps:
--   1. Sign up as a normal user via the app
--   2. Find your auth.users UUID in Authentication → Users
--   3. Run:
--        UPDATE public.profiles
--        SET role = 'admin'
--        WHERE id = 'YOUR-AUTH-USER-UUID-HERE';
--
-- NEVER expose an admin-creation endpoint in client-callable code.
-- ═══════════════════════════════════════════════════════════════════════

COMMIT;
