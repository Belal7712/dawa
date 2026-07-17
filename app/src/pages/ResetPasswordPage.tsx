import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { updatePassword } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const type = searchParams.get('type');

  // Verify user has a valid reset session
  if (type !== 'recovery') {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-cream py-12 px-4">
        <Card className="w-full max-w-md border-gold-300">
          <CardContent className="pt-6">
            <Alert variant="destructive" className="bg-red-50 border-red-200 mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>رابط إعادة التعيين غير صحيح أو انتهى. طلب جديد.</AlertDescription>
            </Alert>
            <Link to="/forgot-password" className="btn-gold w-full block text-center">
              طلب رابط جديد
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'فشل تعيين كلمة المرور. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-gold-300">
        <CardHeader className="text-center">
          <CardTitle className="text-gold-900 text-2xl">إعادة تعيين كلمة المرور</CardTitle>
          <CardDescription>أدخل كلمة المرور الجديدة</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                <AlertDescription className="text-green-800">
                  تم تعيين كلمة المرور بنجاح! جاري التحويل إلى صفحة تسجيل الدخول...
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-ink">كلمة المرور الجديدة</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="border-gold-200 focus:border-gold-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-ink">تأكيد كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="border-gold-200 focus:border-gold-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full btn-gold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري التعيين...
                    </>
                  ) : (
                    'تعيين كلمة المرور'
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-ink/60">
                <Link to="/login" className="text-gold-600 hover:text-gold-700 underline font-medium">
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
