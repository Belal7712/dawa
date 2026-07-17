import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { signUp } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.phone || !formData.email || !formData.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone
      );

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-gold-300">
        <CardHeader className="text-center">
          <CardTitle className="text-gold-900 text-2xl">إنشاء حساب</CardTitle>
          <CardDescription>انضم إلى دعوتك اليوم</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              <AlertDescription className="text-green-800">
                تم إنشاء الحساب بنجاح! جاري التحويل إلى صفحة تسجيل الدخول...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">الاسم الكامل</label>
              <Input
                type="text"
                placeholder="أحمد محمد"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={loading}
                className="border-gold-200 focus:border-gold-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">رقم الهاتف</label>
              <Input
                type="tel"
                placeholder="+966501234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={loading}
                className="border-gold-200 focus:border-gold-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">البريد الإلكتروني</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                className="border-gold-200 focus:border-gold-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">كلمة المرور</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                className="border-gold-200 focus:border-gold-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">تأكيد كلمة المرور</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
                className="border-gold-200 focus:border-gold-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-gold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء حساب'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-ink/60">
            هل لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-gold-600 hover:text-gold-700 underline font-medium">
              تسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
