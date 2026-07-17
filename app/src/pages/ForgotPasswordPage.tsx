import { useState } from 'react';
import { Link } from 'react-router';
import { resetPassword } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'فشل إرسال رابط إعادة تعيين كلمة المرور.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-gold-300">
        <CardHeader className="text-center">
          <CardTitle className="text-gold-900 text-2xl">إعادة تعيين كلمة المرور</CardTitle>
          <CardDescription>أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                <AlertDescription className="text-green-800">
                  تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني. تحقق من صندوق البريد.
                </AlertDescription>
              </Alert>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full btn-gold"
              >
                <ArrowRight className="h-4 w-4" />
                عودة إلى تسجيل الدخول
              </Link>
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

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full btn-gold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال رابط التعيين'
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-ink/60">
                تذكرت كلمة المرور؟{' '}
                <Link to="/login" className="text-gold-600 hover:text-gold-700 underline font-medium">
                  تسجيل الدخول
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
