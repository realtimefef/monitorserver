import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye, EyeOff, Loader2, Shield, CheckCircle2, Circle,
  ArrowRight, Server, Bell, Cpu, HardDrive, Wifi, BarChart3,
  Lock, Zap, Terminal, ArrowLeft, UserPlus
} from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

const PW_RULES = [
  { key: 'len', test: (p: string) => p.length >= 8, label: '8 or more characters' },
  { key: 'mix', test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p), label: 'Mixed case (a-z & A-Z)' },
  { key: 'num', test: (p: string) => /\d/.test(p), label: 'Contains a number' },
  { key: 'sym', test: (p: string) => /[^a-zA-Z0-9]/.test(p), label: 'Has a symbol (!@#…)' },
] as const;

function getStrengthInfo(pw: string) {
  if (!pw) return { pct: 0, label: '', color: '' };
  const passed = PW_RULES.filter(r => r.test(pw)).length;
  if (passed <= 1) return { pct: 25, label: 'Too simple', color: 'bg-red-500 text-red-500' };
  if (passed === 2) return { pct: 50, label: 'Getting there', color: 'bg-orange-500 text-orange-500' };
  if (passed === 3) return { pct: 75, label: 'Almost there', color: 'bg-sky-500 text-sky-500' };
  return { pct: 100, label: 'Great choice', color: 'bg-emerald-500 text-emerald-500' };
}

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const strength = useMemo(() => getStrengthInfo(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'The passwords you entered do not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    const failing = PW_RULES.find(r => !r.test(password));
    if (failing) {
      toast({ title: failing.label, variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register(username, email, password);

      // No email confirmation required - sign the user straight in.
      try {
        const session = await authApi.login(email, password);
        login(session.token, session.user);
        toast({
          title: 'Welcome to NodeVigil',
          description: 'Your account is ready — let\'s add your first server.',
        });
        navigate('/dashboard');
      } catch {
        toast({
          title: 'Account created',
          description: 'Sign in with your new credentials to continue.',
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: 'Could not create account',
        description: error instanceof Error ? error.message : 'Something went wrong, please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-primary/[0.06] via-background to-muted/40 border-r border-border p-12 xl:p-16 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-primary/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] bg-accent/[0.05] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-lg w-full relative z-10">
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <MonitorLogo className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-3">
            Real-Time Server Monitoring, Built for Engineers
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            NodeVigil is a real-time monitoring platform built with Spring Boot 3 and React 18.
            Install a lightweight agent, stream 12 metric types every 5 seconds, and gain full visibility into your infrastructure.
          </p>

          {/* Architecture */}
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 mb-8">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Tech Stack</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Cpu, label: 'Spring Boot 3', desc: 'Java 21 REST API' },
                { icon: BarChart3, label: 'React 18', desc: 'TypeScript SPA' },
                { icon: HardDrive, label: 'PostgreSQL', desc: 'Reliable data store' },
                { icon: Wifi, label: 'WebSocket', desc: 'Live push updates' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg bg-muted/30 border border-border px-3 py-2.5">
                  <item.icon className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-foreground">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works mini */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">How It Works</h3>
            {[
              { num: '1', title: 'Create account', desc: 'Instant access — no email confirmation', icon: UserPlus },
              { num: '2', title: 'Add your server', desc: 'Get a unique 64-char agent key', icon: Server },
              { num: '3', title: 'Run the agent', desc: 'One command — metrics flow in 5s', icon: Terminal },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-card/50 border border-border p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-display text-sm font-bold text-primary">{step.num}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Metrics collected */}
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 mb-8">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">12 Metric Types Collected</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                'CPU Usage', 'Memory Usage', 'Memory Total', 'Memory Available',
                'Disk Usage', 'Disk Total', 'Disk Available', 'Network In',
                'Network Out', 'Load Average', 'Process Count', 'Uptime',
              ].map((metric) => (
                <span key={metric} className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {metric}
                </span>
              ))}
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: Cpu, label: 'CPU & Load' },
              { icon: HardDrive, label: 'Memory & Disk' },
              { icon: Wifi, label: 'Network I/O' },
              { icon: Bell, label: 'Alert Rules' },
              { icon: BarChart3, label: 'Live Dashboard' },
              { icon: Lock, label: 'JWT Security' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg bg-card/30 border border-border px-3 py-2.5">
                <item.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom trust line */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Start monitoring in under a minute — no credit card, no email confirmation
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center px-6 sm:px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                <MonitorLogo className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold">NodeVigil</span>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-muted-foreground">
            Instant access — no email confirmation required
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Pick a display name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Password strength - ring meter */}
              {password && (
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="relative h-10 w-10 shrink-0">
                    <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                      <circle
                        cx="18" cy="18" r="15.5" fill="none" strokeWidth="3"
                        strokeDasharray={`${strength.pct} 100`}
                        strokeLinecap="round"
                        className={strength.color.split(' ')[0].replace('bg-', 'text-')}
                      />
                    </svg>
                    <Shield className="absolute inset-0 m-auto h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${strength.color.split(' ')[1]}`}>{strength.label}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      {PW_RULES.map(rule => (
                        <span key={rule.key} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          {rule.test(password) ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                          {rule.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-destructive">Passwords don't match</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>

          {/* About NodeVigil - below form */}
          <div className="mt-10 pt-8 border-t border-border">
            {/* Project summary */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-foreground mb-2">About NodeVigil</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A real-time server monitoring platform. The backend runs on Spring Boot 3 (Java 21)
                with PostgreSQL, and the frontend is a React 18 TypeScript SPA. Install a Bash or PowerShell agent
                on each server to stream 12 metric types every 5 seconds — then set threshold-based alert rules
                and receive notifications when something needs attention.
              </p>
            </div>

            {/* What's included */}
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">What You Get</h4>
              {[
                { label: 'Instant sign-up', desc: 'No email confirmation — straight to your dashboard' },
                { label: 'Live metrics dashboard', desc: 'CPU, memory, disk & network at a glance' },
                { label: 'Custom alert rules', desc: 'Severity levels, comparison operators & cooldowns' },
                { label: 'CSV / PDF / Excel export', desc: 'Download and share historical reports' },
                { label: 'Per-user data isolation', desc: 'JWT auth — you only see your own servers' },
                { label: 'Free tier included', desc: 'Unlimited servers, upgrade for AI features' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">— {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-[11px] text-muted-foreground mb-4">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            {/* Footer links */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-4 border-t border-border">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <span>·</span>
              <Link to="/help" className="hover:text-foreground transition-colors">Help</Link>
              <span>·</span>
              <Link to="/status" className="hover:text-foreground transition-colors">Status</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
