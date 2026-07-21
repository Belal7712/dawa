import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="relative pt-[130px] pb-24 overflow-hidden" dir="rtl">
      <div className="absolute inset-0 pattern-bg opacity-50" />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] glow-gold" />

      <div className="relative mx-auto max-w-3xl px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-ink mb-8"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          العودة للرئيسية
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-lux p-8 sm:p-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gold-100 text-gold-700">
              <Shield className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-3xl font-black text-ink">سياسة الخصوصية</h1>
              <p className="text-sm text-ink/45 mt-1">نسخة أولية — دعوتك / dawatak.com</p>
            </div>
          </div>

          <div className="space-y-6 text-ink/70 leading-9 text-[15px]">
            <p>
              نحن في <strong className="text-ink">دعوتك</strong> نحترم خصوصيتك. توضح هذه الصفحة
              بشكل مختصر ما نجمعه وكيف نستخدمه.
            </p>

            <section>
              <h2 className="text-lg font-black text-ink mb-2">ما البيانات التي نجمعها؟</h2>
              <ul className="list-disc pr-6 space-y-1">
                <li>الاسم الكامل</li>
                <li>رقم الجوال</li>
                <li>البريد الإلكتروني</li>
              </ul>
              <p className="mt-2">
                وقد نجمع محتوى رسائل التواصل (مثل طلبات الدعم) عندما ترسلها عبر النموذج أو القنوات الرسمية.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-ink mb-2">لماذا نجمعها؟</h2>
              <p>
                لإنشاء حسابك وتشغيل الخدمة (الدعوات، إدارة المناسبات، الدعم)، والتواصل معك بشأن طلباتك،
                وتحسين تجربة المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-ink mb-2">أين تُخزَّن؟</h2>
              <p>
                تُخزَّن البيانات لدى مزوّد البنية التحتية{' '}
                <strong className="text-ink">Supabase</strong> وفق إعدادات الأمان والصلاحيات المعتمدة
                للمشروع.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-ink mb-2">مدة الاحتفاظ</h2>
              <p>
                نحتفظ بالبيانات طالما كان حسابك نشطاً، أو حتى يطلب مالك الحساب حذفها — ما لم يفرض القانون
                مدة أطول لبعض السجلات.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-ink mb-2">الإطار النظامي</h2>
              <p>
                نسعى للامتثال لنظام حماية البيانات الشخصية في المملكة العربية السعودية (PDPL) والأنظمة
                ذات الصلة.
              </p>
            </section>

            <div className="rounded-2xl border border-gold-300 bg-gold-50 px-5 py-4 text-sm font-bold text-ink/75">
              نسخة أولية ستُراجع قانونياً قبل الإطلاق.
            </div>

            <p className="text-sm text-ink/45">
              للاستفسارات حول الخصوصية:{' '}
              <a href="mailto:hello@dawatak.com" className="text-gold-700 hover:underline" dir="ltr">
                hello@dawatak.com
              </a>
            </p>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
