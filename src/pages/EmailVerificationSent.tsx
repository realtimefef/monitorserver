import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EmailVerificationSent() {
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState((location.state as any)?.email ?? '');
  const [isResending, setIsResending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const handleResend = useCallback(async () => {
    if (!email.trim()) {
      toast({ title: 'Enter your email address first', variant: 'destructive' });
      return;
    }
    setIsResending(true);
    try {
      await authApi.resendVerification(email.trim());
      setSentCount(c => c + 1);
      toast({ title: 'Confirmation email sent!' });
    } catch (err) {
      toast({
        title: 'Could not resend',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  }, [email, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Monitor Server</span>
          </Link>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
          {/* Top accent strip */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />

          <div className="p-8 sm:p-10 space-y-6">
            {/* Icon + heading */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                {sentCount > 0 && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    {sentCount}
                  </div>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Confirm Your Email</h1>
              <p className="text-muted-foreground max-w-sm">
                We sent a confirmation link to{' '}
                <strong className="text-foreground">{email || 'your email'}</strong>.
                Open it to activate your account.
              </p>
            </div>

            {/* Tips */}
            <div className="rounded-xl bg-muted/40 p-4 space-y-2">
              <p className="text-xs font-medium text-foreground">Can't find the email?</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Look in your spam, junk, or promotions folder
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Make sure <strong className="text-foreground">{email || 'the email'}</strong> is correct
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Allow a minute or two for delivery
                </li>
              </ul>
            </div>

            {/* Resend section */}
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending}
                className="shrink-0 gap-1.5"
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Resend
              </Button>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Already confirmed? Continue to login
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
