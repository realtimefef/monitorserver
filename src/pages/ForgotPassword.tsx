import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { authApi } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSubmitted(true);
      // Start 60s cooldown
      setCooldown(60);
      const tick = () => {
        setCooldown(prev => {
          if (prev <= 1) return 0;
          setTimeout(tick, 1000);
          return prev - 1;
        });
      };
      setTimeout(tick, 1000);
    } catch {
      // Intentionally vague to prevent user enumeration
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <MonitorLogo className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Forgot Password?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {submitted
                ? 'A recovery link is on its way'
                : 'Enter your email and we\'ll help you regain access'}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div>
                <p className="text-foreground font-medium">Recovery email sent</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  If an account with <strong>{email}</strong> exists, we've sent instructions to reset your password.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                disabled={cooldown > 0 || isLoading}
                onClick={() => {
                  setSubmitted(false);
                }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Send Again'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</>
                ) : (
                  'Send Recovery Link'
                )}
              </Button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
