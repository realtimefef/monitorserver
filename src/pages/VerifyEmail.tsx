import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { authApi } from '@/lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token') ?? '';

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No confirmation token was found in the URL.');
      return;
    }

    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((err: Error) => {
        setStatus('error');
      setMessage(err.message || 'Confirmation failed. The link may be expired or invalid.');
      });
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors self-start">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <MonitorLogo className="h-6 w-6 text-primary-foreground" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Account Confirmation</h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-lg text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <p className="text-muted-foreground">Confirming your email address…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground text-lg">Email confirmed!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your account is active. Taking you to the login page shortly…
                </p>
              </div>
              <Link to="/login">
                <Button className="w-full">Continue to Login</Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground text-lg">Confirmation Failed</p>
                <p className="mt-1 text-sm text-muted-foreground">{message}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/email-sent">
                  <Button variant="outline" className="w-full">Resend Confirmation Email</Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">Return to Login</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
