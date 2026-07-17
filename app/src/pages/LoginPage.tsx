import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { signIn } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. تحقق من بيانات المستخدم والكلمة المرورية.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-gold-300">
        <CardHeader className="text-center">
          <CardTitle className="text-gold-900 text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>ادخل حسابك للوصول إلى لوحة التحكم</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">البريد الإلكتروني</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="border-gold-200 focus:border-gold-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">كلمة المرور</label>
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

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full btn-gold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                'دخول'
              )}
            </Button>
          </form>

          <div className="space-y-3 text-sm">
            <Link
              to="/forgot-password"
              className="block text-gold-600 hover:text-gold-700 underline text-center"
            >
              هل نسيت كلمة المرور؟
            </Link>

            <div className="text-center text-ink/60">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-gold-600 hover:text-gold-700 underline font-medium">
                إنشاء حساب
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
