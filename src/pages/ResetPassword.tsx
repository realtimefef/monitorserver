import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, Lock, ArrowLeft } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'Minimum 8 characters needed';
  if (!/[A-Z]/.test(pw)) return 'Add at least one uppercase letter';
  if (!/[a-z]/.test(pw)) return 'Add at least one lowercase letter';
  if (!/[0-9]/.test(pw)) return 'Add at least one number';
  if (!/[^a-zA-Z0-9]/.test(pw)) return 'Add at least one special character';
  return null;
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Link Expired</h1>
            <p className="mt-2 text-muted-foreground">
              This password recovery link is no longer valid.
            </p>
          </div>
          <Link to="/forgot-password">
            <Button className="w-full">Request a new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pwError = validatePassword(newPassword);
    if (pwError) { toast({ title: pwError, variant: 'destructive' }); return; }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords don\'t match', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast({
        title: 'Unable to reset password',
        description: err instanceof Error ? err.message : 'Something went wrong, please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors self-start">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <MonitorLogo className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Choose a New Password</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pick a strong, unique password for your account</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
          {success ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground">All set!</p>
                <p className="mt-1 text-sm text-muted-foreground">Your password has been updated. Redirecting to login…</p>
              </div>
              <Link to="/login">
                <Button className="w-full">Continue to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  8+ chars with uppercase, lowercase, number, and symbol
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                ) : 'Save New Password'}
              </Button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
