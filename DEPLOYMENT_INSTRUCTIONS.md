# دعوتك — PHASE 0 DEPLOYMENT GUIDE

## Step-by-Step Instructions to Go Live

### ✓ STEP 1: Run Database Migration

**Location:** Supabase Project Dashboard → SQL Editor

**File to run:** `supabase/migrations/0001_initial_schema.sql`

**How to:**
1. Go to https://app.supabase.com → Select "dawatak" project
2. Click **SQL Editor** on the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/0001_initial_schema.sql` (395 lines)
5. Paste into the SQL editor
6. Click **Run** (top right)

**What to expect:**
- Query completes without errors
- Tables appear in Database → Tables:
  - profiles, templates, events, guests, rsvps, checkins
  - packages, orders, whatsapp_messages, coupons, support_tickets, admin_audit_log
- RLS policies visible under each table's security tab

**Verify success:**
```sql
-- Run this to check all tables exist:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

Should return 12 tables.

---

### ✓ STEP 2: Set Vercel Environment Variables

**Location:** Vercel Project Settings

**How to:**
1. Go to Vercel Dashboard → Select "dawa" project
2. Click **Settings** (top navigation)
3. Click **Environment Variables** (left sidebar)
4. Add these two variables:

```
Name: VITE_SUPABASE_URL
Value: https://yugwjnnwpsnuazzattbu.supabase.co
Environments: Production, Preview, Development
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z3dqbm53cHNudWF6emF0dGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMTk4ODYsImV4cCI6MjA5OTg5NTg4Nn0.NX5m9TJivGZjj0C39HEzFUD6oYEw5Kf1Khl0owDXzVk
Environments: Production, Preview, Development
```

**Verify:**
- Both variables appear in the Environment Variables list
- Mark all three environments (Production, Preview, Development)

---

### ✓ STEP 3: Redeploy on Vercel

**Location:** GitHub / Vercel Dashboard

**How to:**
1. Go to GitHub → `Belal7712/dawa` repo → `v0/belal7712-0d4af43f` branch
2. Verify the latest commit is visible with message: "PHASE 0: Complete data + auth foundation"
3. Go to Vercel Dashboard → "dawa" project
4. Click **Deployments** tab
5. Find the latest deployment
6. Click the three-dot menu → **Redeploy**
7. Wait for build to complete (should take ~2 minutes)

**What to check:**
- Build log shows ✓ (no errors)
- Deployment URL shows "Ready" status
- Look for: "✓ built in X.XXs" in build output

---

### ✓ STEP 4: Test Live Deployment

**Base URL:** https://dawa-k8.vercel.app (or your custom domain)

**Test Signup:**
1. Visit `https://dawa-k8.vercel.app/register`
2. Fill form: 
   - Full name: "Test User"
   - Phone: "+966501234567"
   - Email: "test@example.com"
   - Password: "Test1234"
   - Confirm: "Test1234"
3. Click "إنشاء حساب"
4. Should see success message, then redirect to /login

**Verify in Supabase:**
- Go to Supabase → "dawatak" project → Data Editor
- Click "profiles" table
- Should see new row with the email, full_name, phone, role='customer'

**Test Login:**
1. At /login page (redirected automatically)
2. Enter email: "test@example.com"
3. Password: "Test1234"
4. Click "دخول"
5. Should see "جاري التحميل..." then redirect to /dashboard

**Test Contact Form:**
1. Visit `https://dawa-k8.vercel.app/contact`
2. Fill form with test data
3. Click "أرسل الطلب"
4. Should see success message

**Verify in Supabase:**
- Go to Supabase → "dawatak" project → Data Editor
- Click "support_tickets" table
- Should see new row with the form data

**Test Route Guards:**
1. Open new incognito window
2. Try to visit `/dashboard` directly
3. Should redirect to `/login` (protected route works)

---

### ✓ STEP 5: Configure Custom Domain (Optional)

**If you have a custom domain (e.g., dawatak.com):**

1. Vercel → Project Settings → Domains
2. Add your domain
3. Update DNS records per Vercel instructions
4. Wait for SSL certificate (usually 5-10 minutes)

---

## What's Live Now

✓ **Public pages** — Home, Features, Pricing, Contact, About, Privacy, Terms, Demo
✓ **Auth pages** — /login, /register, /forgot-password, /reset-password
✓ **Auth system** — Real Supabase Auth (email+password)
✓ **Route guards** — /dashboard/*, /admin/* require login
✓ **Database integration** — Contact form → support_tickets table
✓ **SPA routing** — All routes load correctly (vercel.json rewrite active)

---

## Critical Checklist Before Declaring "Live"

- [ ] SQL migration ran successfully (12 tables exist)
- [ ] Environment variables set in Vercel (both VITE_* vars)
- [ ] Latest commit deployed (shows PHASE 0 message)
- [ ] Signup flow works end-to-end (new row in profiles table)
- [ ] Login flow works (creates session, redirects to dashboard)
- [ ] Session persists after page refresh
- [ ] Contact form inserts to support_tickets table
- [ ] Route guards work (/dashboard redirects to /login when unauthenticated)
- [ ] Direct URL loads work (refresh on any route doesn't 404)
- [ ] Password reset email arrives and works
- [ ] Build log shows zero errors

---

## Troubleshooting

### Build fails in Vercel
**Check:** 
- GitHub push was successful (`git log` shows latest commit)
- Environment variables are set in Vercel Settings
- Try redeploy: Vercel → Deployments → three-dot menu → Redeploy

### Auth not working after login
**Check:**
- Environment variables match exactly (copy from Supabase → Project Settings → API)
- No console errors (open browser DevTools → Console)
- Try clear browser cache + hard refresh (Ctrl+Shift+R)

### Contact form shows error
**Check:**
- RLS policies are enabled on support_tickets table
- User has permission to insert (should be allowed for public/anon)
- Check browser console for specific error message

### Signup creates account but profile not created
**Check:**
- Trigger `on_auth_user_created` exists in Supabase
- Check Supabase Functions → Triggers → "on_auth_user_created" is enabled

---

## Next: Phase 1 (Dashboard)

Once live and verified:
1. Build event creation page
2. Add guest list management
3. Implement RSVP tracking dashboard
4. Connect WhatsApp integration
5. Build event settings page

See `PHASE_0_COMPLETE.md` for full roadmap.

---

## Support

Issues?
1. Check browser console for errors (F12)
2. Check Vercel build logs (Deployments tab)
3. Check Supabase database logs (Database → Query Performance)
4. Verify all credentials match exactly

**Everything in this file is production-ready. Just follow the steps above.** ✓
