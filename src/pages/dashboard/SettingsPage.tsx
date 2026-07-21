/**
 * SettingsPage — Admin-managed site settings.
 *
 * - All logged-in users can VIEW this page (read-only).
 * - Only admins (profile.role === 'admin') can EDIT and SAVE.
 * - Saves via upsert on public.site_settings WHERE id = true.
 * - RLS on DB side also enforces admin-only writes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Lock,
  Save,
  Settings,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Image,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings, invalidateSiteSettingsCache } from '@/hooks/useSiteSettings';
import type { SiteSettings } from '@/hooks/useSiteSettings';
import { Skeleton } from '@/components/ui/skeleton';

// ---- Validation helpers ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_E164_RE = /^\+[1-9]\d{7,14}$/;

function validateEmail(v: string) {
  if (!v) return null; // empty is allowed
  return EMAIL_RE.test(v) ? null : 'بريد إلكتروني غير صالح';
}

function validatePhone(v: string) {
  if (!v) return null;
  return PHONE_E164_RE.test(v) ? null : 'رقم غير صالح — استخدم الصيغة الدولية مثل +9665XXXXXXXX';
}

// ---- Field component ----
interface FieldProps {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}

function Field({ label, icon, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-black text-ink">
        <span className="text-gold-700">{icon}</span>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink/45">{hint}</p>}
      {error && <p className="text-xs text-maroon-700 font-bold">{error}</p>}
    </div>
  );
}

const INPUT_CLS =
  'w-full rounded-2xl border-2 border-gold-200 bg-cream/60 px-4 py-2.5 text-sm font-bold text-ink placeholder:text-ink/30 outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

// ---- Main page ----
export default function SettingsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading } = useSiteSettings();

  const [form, setForm] = useState<Omit<SiteSettings, 'id' | 'updated_at'>>({
    brand_name: null,
    logo_url: null,
    site_url: null,
    contact_phone: null,
    contact_email: null,
    whatsapp: null,
    address: null,
  });

  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [waPhoneError, setWaPhoneError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  // Sync form from loaded settings
  useEffect(() => {
    if (!settingsLoading) {
      setForm({
        brand_name: settings.brand_name,
        logo_url: settings.logo_url,
        site_url: settings.site_url,
        contact_phone: settings.contact_phone,
        contact_email: settings.contact_email,
        whatsapp: settings.whatsapp,
        address: settings.address,
      });
    }
  }, [settingsLoading, settings]);

  const set = useCallback(
    (key: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value || null }));
      },
    [],
  );

  // ---- Logo upload to Supabase Storage ----
  const handleLogoUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار ملف صورة');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `logos/brand_logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        toast.error(`فشل رفع الصورة: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage.from('logos').getPublicUrl(path);
      setForm((prev) => ({ ...prev, logo_url: data.publicUrl }));
      toast.success('تم رفع الشعار');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الرفع');
    } finally {
      setUploading(false);
    }
  }, []);

  // ---- Save ----
  const handleSave = useCallback(async () => {
    // Validate
    const eErr = validateEmail(form.contact_email ?? '');
    const pErr = validatePhone(form.contact_phone ?? '');
    const wErr = validatePhone(form.whatsapp ?? '');

    setEmailError(eErr);
    setPhoneError(pErr);
    setWaPhoneError(wErr);

    if (eErr || pErr || wErr) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ id: true, ...form }, { onConflict: 'id' });

      if (error) {
        toast.error(error.message || 'فشل حفظ الإعدادات');
        return;
      }

      invalidateSiteSettingsCache();
      toast.success('تم حفظ الإعدادات بنجاح ✓');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }, [form]);

  // ---- Loading state ----
  if (authLoading || settingsLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-10 w-48 rounded-2xl bg-gold-100" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl bg-gold-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <span className="grid place-items-center w-10 h-10 rounded-2xl gold-grad shadow-lg shadow-gold-600/25">
          <Settings className="w-5 h-5 text-white" />
        </span>
        <div>
          <h1 className="text-2xl font-black text-ink">إعدادات الموقع</h1>
          <p className="text-sm text-ink/50">بيانات العلامة التجارية تظهر في الترويسة عند التصدير</p>
        </div>
      </motion.div>

      {/* Non-admin locked state */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-lux p-10 text-center hover:transform-none"
        >
          <Lock className="w-12 h-12 text-gold-600 mx-auto" />
          <h2 className="mt-4 text-xl font-black text-ink">غير مصرّح لك</h2>
          <p className="mt-2 text-sm text-ink/55">
            تعديل إعدادات الموقع متاح للمسؤولين فقط.
          </p>
        </motion.div>
      )}

      {/* Admin form */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-lux p-6 sm:p-8 hover:transform-none space-y-6"
        >
          {/* Brand name */}
          <Field
            label="اسم الموقع"
            icon={<Globe className="w-4 h-4" />}
            hint="الاسم الذي يظهر في ترويسة PDF وأماكن أخرى"
          >
            <input
              value={form.brand_name ?? ''}
              onChange={set('brand_name')}
              placeholder="دعوتك"
              className={INPUT_CLS}
              maxLength={100}
            />
          </Field>

          {/* Logo URL */}
          <Field
            label="رابط الشعار"
            icon={<Image className="w-4 h-4" />}
            hint="الصق رابطاً مباشراً للصورة، أو ارفع صورة من جهازك"
          >
            <div className="flex gap-2">
              <input
                value={form.logo_url ?? ''}
                onChange={set('logo_url')}
                placeholder="https://example.com/logo.png"
                className={INPUT_CLS + ' flex-1'}
                dir="ltr"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => logoFileRef.current?.click()}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl border-2 border-gold-300 bg-white px-4 py-2.5 text-sm font-bold text-ink/80 hover:border-gold-500 disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-gold-700" />
                )}
                رفع صورة
              </button>
              <input
                ref={logoFileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleLogoUpload(f);
                  e.target.value = '';
                }}
              />
            </div>
            {/* Logo preview */}
            {form.logo_url && (
              <img
                src={form.logo_url}
                alt="معاينة الشعار"
                className="mt-2 h-16 w-auto object-contain rounded-xl border border-gold-200 p-2 bg-white"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </Field>

          {/* Site URL */}
          <Field
            label="رابط الموقع"
            icon={<Globe className="w-4 h-4" />}
          >
            <input
              value={form.site_url ?? ''}
              onChange={set('site_url')}
              placeholder="https://dawatak.com"
              className={INPUT_CLS}
              dir="ltr"
            />
          </Field>

          {/* Separator */}
          <div className="border-t border-gold-100" />

          {/* Contact phone */}
          <Field
            label="رقم التواصل"
            icon={<Phone className="w-4 h-4" />}
            hint="يجب أن يكون بالصيغة الدولية مثل +9665XXXXXXXX"
            error={phoneError}
          >
            <input
              value={form.contact_phone ?? ''}
              onChange={(e) => {
                setPhoneError(null);
                set('contact_phone')(e);
              }}
              placeholder="+9665XXXXXXXX"
              className={INPUT_CLS}
              dir="ltr"
            />
          </Field>

          {/* Email */}
          <Field
            label="البريد الإلكتروني"
            icon={<Mail className="w-4 h-4" />}
            error={emailError}
          >
            <input
              value={form.contact_email ?? ''}
              onChange={(e) => {
                setEmailError(null);
                set('contact_email')(e);
              }}
              placeholder="hello@dawatak.com"
              className={INPUT_CLS}
              dir="ltr"
              type="email"
            />
          </Field>

          {/* WhatsApp */}
          <Field
            label="واتساب"
            icon={<MessageSquare className="w-4 h-4" />}
            hint="رقم واتساب للتواصل — صيغة دولية +966…"
            error={waPhoneError}
          >
            <input
              value={form.whatsapp ?? ''}
              onChange={(e) => {
                setWaPhoneError(null);
                set('whatsapp')(e);
              }}
              placeholder="+9665XXXXXXXX"
              className={INPUT_CLS}
              dir="ltr"
            />
          </Field>

          {/* Address */}
          <Field
            label="العنوان"
            icon={<MapPin className="w-4 h-4" />}
          >
            <input
              value={form.address ?? ''}
              onChange={set('address')}
              placeholder="الرياض، المملكة العربية السعودية"
              className={INPUT_CLS}
            />
          </Field>

          {/* Save button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={saving || uploading}
              onClick={() => void handleSave()}
              className="btn-gold inline-flex items-center gap-2 px-7 py-3 text-sm disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              حفظ الإعدادات
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
