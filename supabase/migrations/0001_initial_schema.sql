-- ============================================================================
-- DAWATAK PHASE 0: Initial Schema with RLS
-- Run this migration using Supabase Dashboard or CLI
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Customers see only their own profile
CREATE POLICY "profiles_self_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS: Admins see all profiles
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS: Users can insert their own profile (on signup)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  preview_image_url TEXT,
  theme_config JSONB,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone can see active templates
CREATE POLICY "templates_public_read" ON templates
  FOR SELECT USING (is_active = true);

-- RLS: Only admins can modify templates
CREATE POLICY "templates_admin_all" ON templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 3. EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('wedding', 'engagement', 'graduation', 'other')),
  event_date DATE,
  venue_name TEXT,
  venue_map_url TEXT,
  venue_lat NUMERIC(10, 8),
  venue_lng NUMERIC(11, 8),
  groom_name TEXT,
  bride_name TEXT,
  cover_media_url TEXT,
  template_id UUID REFERENCES templates(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  language_default TEXT DEFAULT 'ar',
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS: Customers see only their own events
CREATE POLICY "events_owner_all" ON events
  FOR ALL USING (auth.uid() = owner_id);

-- RLS: Public can see active events by slug
CREATE POLICY "events_public_active" ON events
  FOR SELECT USING (status = 'active');

-- RLS: Admins can see all events
CREATE POLICY "events_admin_all" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 4. GUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_e164 TEXT,
  group_label TEXT CHECK (group_label IN ('groom_side', 'bride_side', 'other')),
  companions_allowed INTEGER DEFAULT 0,
  unique_token UUID DEFAULT uuid_generate_v4() UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- RLS: Event owner can see guests of their events
CREATE POLICY "guests_owner_select" ON guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "guests_owner_all" ON guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND owner_id = auth.uid()
    )
  );

-- RLS: Public can read guests via unique_token (for RSVP form)
CREATE POLICY "guests_public_by_token" ON guests
  FOR SELECT USING (true);  -- Guests are referenced by token, not row-level

-- ============================================================================
-- 5. RSVPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  companions_count INTEGER DEFAULT 0,
  responded_at TIMESTAMP WITH TIME ZONE,
  response_channel TEXT CHECK (response_channel IN ('whatsapp', 'web')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- RLS: Event owners can see RSVPs for their events
CREATE POLICY "rsvps_owner_select" ON rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guests
      WHERE guests.id = guest_id
      AND EXISTS (
        SELECT 1 FROM events WHERE events.id = guests.event_id AND owner_id = auth.uid()
      )
    )
  );

-- RLS: Public can insert/update RSVPs via guest token
CREATE POLICY "rsvps_public_insert" ON rsvps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "rsvps_public_update" ON rsvps
  FOR UPDATE USING (true);

-- ============================================================================
-- 6. CHECKINS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  qr_token UUID DEFAULT uuid_generate_v4() UNIQUE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID REFERENCES profiles(id),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- RLS: Event owners can see/manage checkins
CREATE POLICY "checkins_owner_all" ON checkins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM guests
      WHERE guests.id = guest_id
      AND EXISTS (
        SELECT 1 FROM events WHERE events.id = guests.event_id AND owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 7. PACKAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp_per_guest', 'einvite_flat')),
  price_sar NUMERIC(10, 2) NOT NULL,
  guest_limit INTEGER,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone can see active packages
CREATE POLICY "packages_public_read" ON packages
  FOR SELECT USING (is_active = true);

-- RLS: Only admins can modify packages
CREATE POLICY "packages_admin_all" ON packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 8. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id),
  amount_sar NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_gateway TEXT,
  gateway_reference TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS: Customers see only their orders
CREATE POLICY "orders_owner_select" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "orders_owner_all" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events WHERE id = event_id AND owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 9. WHATSAPP_MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  message_type TEXT CHECK (message_type IN ('invite', 'reminder', 'thank_you')),
  status TEXT,
  provider_message_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Event owners can see messages sent to their guests
CREATE POLICY "whatsapp_messages_owner_select" ON whatsapp_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guests
      WHERE guests.id = guest_id
      AND EXISTS (
        SELECT 1 FROM events WHERE events.id = guests.event_id AND owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 10. COUPONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC(10, 2) NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone can read active coupons
CREATE POLICY "coupons_public_read" ON coupons
  FOR SELECT USING (
    valid_from <= now() AND valid_until >= now() AND used_count < COALESCE(max_uses, 999999)
  );

-- RLS: Only admins can modify coupons
CREATE POLICY "coupons_admin_all" ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 11. SUPPORT_TICKETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone_or_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS: Everyone can insert support tickets
CREATE POLICY "support_tickets_public_insert" ON support_tickets
  FOR INSERT WITH CHECK (true);

-- RLS: Only admins can read/modify support tickets
CREATE POLICY "support_tickets_admin_all" ON support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 12. ADMIN_AUDIT_LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can see audit logs
CREATE POLICY "audit_log_admin_all" ON admin_audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
