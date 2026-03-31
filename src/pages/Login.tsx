import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye, EyeOff, Loader2, Shield, BarChart3,
  Cpu, HardDrive, Wifi, CheckCircle2, ArrowRight, Lock, Zap, Clock,
  ArrowLeft
} from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login(username, password);
      login(response.token, response.user);
      toast({
        title: 'Signed in successfully',
        description: 'Your monitoring dashboard is ready.',
      });
      navigate('/dashboard');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Invalid credentials';
      const isUnverified = msg.toLowerCase().includes('verify') || msg.toLowerCase().includes('email') || msg.toLowerCase().includes('confirmed');
      toast({
        title: 'Unable to sign in',
        description: isUnverified ? 'Please confirm your email address first.' : msg,
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

      {/* Left side - Form + info */}
      <div className="flex w-full flex-col justify-center px-6 sm:px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                <MonitorLogo className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold">Monitor Server</span>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-muted-foreground">
            Log in to access your server monitoring dashboard
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12"
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
            </div>

            <Button type="submit" className="w-full h-12 shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Log in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Get started free
            </Link>
          </p>

          {/* About Monitor Server — below form */}
          <div className="mt-10 pt-8 border-t border-border">
            {/* Project overview */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-foreground mb-2">About Monitor Server</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Monitor Server is an AI-powered server monitoring platform built with
                Spring Boot 3 and React 18, deployed on AWS cloud. Install a lightweight agent on any server and
                get real-time CPU, memory, disk, and network metrics streamed to your dashboard every 5 seconds.
              </p>
            </div>

            {/* Tech stack */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: Cpu, label: 'Spring Boot 3', desc: 'Java 21 backend' },
                { icon: BarChart3, label: 'React 18', desc: 'TypeScript frontend' },
                { icon: HardDrive, label: 'PostgreSQL', desc: 'Reliable data store' },
                { icon: Wifi, label: 'REST + WebSocket', desc: 'Real-time updates' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                  <item.icon className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-foreground">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* What you get */}
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">What You Get</h4>
              {[
                { label: 'Live metrics dashboard', desc: 'CPU, memory, disk & network at a glance' },
                { label: 'Threshold-based alerts', desc: 'Custom rules with severity levels & cooldowns' },
                { label: 'Email notifications', desc: 'Branded HTML alerts when thresholds are breached' },
                { label: 'Historical data & reports', desc: 'Export metrics in CSV, PDF, or Excel' },
                { label: 'Per-user data isolation', desc: 'JWT auth ensures you only see your own servers' },
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

            {/* Metrics collected */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 mb-6">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Metrics Collected</h4>
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

      {/* Right side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-muted/40 via-background to-primary/[0.06] border-l border-border p-12 xl:p-16 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] bg-indigo-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-lg w-full relative z-10">
          {/* Icon + heading */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <MonitorLogo className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-3">
            Built for Engineers Who Care About Uptime
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Monitor Server gives you full-stack infrastructure visibility — CPU, memory, disk, and network —
            streamed in real time to a single dashboard. Built with Spring Boot 3, React 18, and PostgreSQL.
          </p>

          {/* Architecture overview */}
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 mb-8">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Architecture</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Agent', desc: 'Bash / PowerShell script on every server', icon: Cpu },
                { label: 'API', desc: 'Spring Boot 3 REST + WebSocket backend', icon: BarChart3 },
                { label: 'Dashboard', desc: 'React 18 SPA with live metric graphs', icon: Wifi },
              ].map((item, i) => (
                <div key={i} className="rounded-lg bg-muted/30 border border-border p-3 text-center">
                  <item.icon className="h-4 w-4 text-primary mx-auto mb-2" />
                  <div className="text-xs font-medium text-foreground mb-0.5">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row — factual capabilities */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { value: '5s', label: 'Polling', icon: Clock },
              { value: 'JWT', label: 'Auth', icon: Lock },
              { value: '12', label: 'Metric Types', icon: Zap },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl bg-card/50 border border-border p-4 text-center">
                <stat.icon className="h-4 w-4 text-primary mx-auto mb-2" />
                <div className="font-display text-xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Mini dashboard preview */}
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-foreground">Live Preview</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground">Live</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Cpu, label: 'CPU', value: '24%', color: 'text-emerald-500' },
                { icon: HardDrive, label: 'RAM', value: '61%', color: 'text-blue-500' },
                { icon: BarChart3, label: 'Disk', value: '43%', color: 'text-amber-500' },
                { icon: Wifi, label: 'Net', value: '2.4G', color: 'text-violet-500' },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <m.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${m.color}`} />
                  <div className="text-sm font-bold text-foreground">{m.value}</div>
                  <div className="text-[10px] text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature list */}
          <div className="space-y-3 mb-8">
            {[
              'CPU, memory, disk & network collected every 5 seconds',
              'Custom alert rules with severity levels and cooldowns',
              'Email notifications on threshold breaches',
              'Export historical data as CSV, PDF, or Excel',
              'Per-user data isolation with JWT authentication',
              'Built on NVIDIA GPU & AWS Cloud infrastructure',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 mb-8">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">How It Works</h3>
            <div className="space-y-3">
              {[
                { num: '1', text: 'Sign up and add your server to get a unique agent key' },
                { num: '2', text: 'Run the Bash or PowerShell agent script on your server' },
                { num: '3', text: 'View live metrics on your dashboard in under 30 seconds' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{step.num}</span>
                  </div>
                  <span className="text-xs text-foreground/80">{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal preview */}
          <div className="rounded-xl border border-border bg-[#0c0f1a] overflow-hidden mb-8">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-[#0f1326]">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500/70" />
                <div className="h-2 w-2 rounded-full bg-yellow-500/70" />
                <div className="h-2 w-2 rounded-full bg-green-500/70" />
              </div>
              <span className="ml-2 text-[10px] text-gray-500 font-mono">terminal</span>
            </div>
            <div className="p-4 font-mono text-xs text-gray-400 space-y-1">
              <div><span className="text-emerald-400">$</span> ./monitor-agent.sh</div>
              <div><span className="text-gray-500">[info]</span> Connecting to API...</div>
              <div className="text-emerald-400">[ok] Streaming metrics every 5s.</div>
              <div><span className="text-gray-500">[metric]</span> cpu=12% mem=58% disk=41%</div>
            </div>
          </div>

          {/* Bottom trust */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Built on AWS Cloud & NVIDIA GPU
          </div>
        </div>
      </div>
    </div>
  );
}
