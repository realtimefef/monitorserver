import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  RefreshCw, CheckCircle2, XCircle, AlertTriangle, Loader2, Clock, ArrowLeft,
} from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { getApiUrl, getToken } from '@/lib/apiClient';
import { useTimezone } from '@/contexts/TimezoneContext';
import { cn } from '@/lib/utils';

interface ServiceStatus {
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'outage' | 'checking';
  responseTime?: number;
  checkedAt?: Date;
  error?: string;
}

async function probe(url: string, options?: RequestInit): Promise<{ ok: boolean; ms: number; error?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
    return { ok: res.ok || res.status < 500, ms: Math.round(performance.now() - start) };
  } catch (e) {
    return { ok: false, ms: Math.round(performance.now() - start), error: (e as Error).message };
  }
}

export default function Status() {
  const { formatDate } = useTimezone();
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Server', description: 'REST API server responding', status: 'checking' },
    { name: 'Authentication', description: 'Auth endpoint reachable', status: 'checking' },
    { name: 'Server Monitoring', description: 'Metrics ingestion endpoint', status: 'checking' },
    { name: 'Data Access', description: 'Servers API authenticated access', status: 'checking' },
  ]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const checkServices = useCallback(async () => {
    setIsChecking(true);
    const base = getApiUrl();
    const token = getToken();
    const results: ServiceStatus[] = [];

    // 1. API Server — simple health check
    {
      const r = await probe(`${base}/health`);
      results.push({
        name: 'API Server',
        description: 'REST API server responding',
        status: r.ok ? 'operational' : 'outage',
        responseTime: r.ms,
        checkedAt: new Date(),
        error: r.ok ? undefined : (r.error ?? 'No response'),
      });
    }

    // 2. Authentication — POST to login with empty body → 400/422 = service up, network error = down
    {
      const r = await probe(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      results.push({
        name: 'Authentication',
        description: 'Auth endpoint reachable',
        status: r.ok ? 'operational' : (r.error ? 'outage' : 'operational'), // 400 = service is up
        responseTime: r.ms,
        checkedAt: new Date(),
        error: r.ok ? undefined : r.error,
      });
    }

    // 3. Metrics ingestion — POST to /metrics/ingest with agent_key (no auth)
    {
      const r = await probe(`${base}/metrics/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentKey: 'health-check' }),
      });
      results.push({
        name: 'Server Monitoring',
        description: 'Metrics ingestion endpoint',
        status: r.ok ? 'operational' : (r.error ? 'outage' : 'operational'),
        responseTime: r.ms,
        checkedAt: new Date(),
        error: r.ok ? undefined : r.error,
      });
    }

    // 4. Data access — GET /servers with JWT (if available)
    {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const r = await probe(`${base}/servers`, { headers });
      results.push({
        name: 'Data Access',
        description: token ? 'Servers API (authenticated)' : 'Servers API (unauthenticated)',
        status: r.ok ? 'operational' : (r.error ? 'outage' : 'degraded'),
        responseTime: r.ms,
        checkedAt: new Date(),
        error: r.ok ? undefined : r.error,
      });
    }

    setServices(results);
    setLastChecked(new Date());
    setIsChecking(false);
    setCountdown(60);
  }, []);

  // Initial check + auto-refresh countdown
  useEffect(() => {
    checkServices();
  }, [checkServices]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { checkServices(); return 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [checkServices]);

  const overallStatus = (() => {
    if (services.some(s => s.status === 'checking')) return 'checking';
    if (services.every(s => s.status === 'operational')) return 'ALL_OPERATIONAL';
    if (services.some(s => s.status === 'outage')) return 'MAJOR_OUTAGE';
    return 'PARTIAL_OUTAGE';
  })();

  const overallColors = {
    checking: 'border-border bg-muted',
    ALL_OPERATIONAL: 'border-green-500/30 bg-green-500/5',
    MAJOR_OUTAGE: 'border-destructive/30 bg-destructive/5',
    PARTIAL_OUTAGE: 'border-warning/30 bg-warning/5',
  };

  const statusIcon = (s: ServiceStatus['status']) => {
    switch (s) {
      case 'operational': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'outage': return <XCircle className="h-5 w-5 text-destructive" />;
      default: return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    }
  };

  const statusDot = (s: ServiceStatus['status']) => cn(
    'h-3 w-3 rounded-full',
    s === 'operational' && 'bg-green-500 animate-pulse',
    s === 'degraded' && 'bg-warning',
    s === 'outage' && 'bg-destructive',
    s === 'checking' && 'bg-muted-foreground'
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Monitor</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">Dashboard</Button>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        {/* Overall status banner */}
        <div className={cn('rounded-2xl border p-8 text-center', overallColors[overallStatus])}>
          {overallStatus === 'checking' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground mb-4" />
              <h1 className="font-display text-2xl font-bold text-foreground">Checking services…</h1>
            </>
          )}
          {overallStatus === 'ALL_OPERATIONAL' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">All Systems Operational</h1>
              <p className="mt-2 text-muted-foreground">All Monitor Server services are running normally.</p>
            </>
          )}
          {overallStatus === 'MAJOR_OUTAGE' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Major Outage Detected</h1>
              <p className="mt-2 text-muted-foreground">One or more services are not responding.</p>
            </>
          )}
          {overallStatus === 'PARTIAL_OUTAGE' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
                <AlertTriangle className="h-10 w-10 text-warning" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Partial Outage</h1>
              <p className="mt-2 text-muted-foreground">Some services may be experiencing issues.</p>
            </>
          )}
        </div>

        {/* Service list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Service Status</h2>
            <div className="flex items-center gap-3">
              {lastChecked && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(lastChecked, 'relative')}
                  {' · '}refreshes in {countdown}s
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={checkServices}
                disabled={isChecking}
              >
                <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', isChecking && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {services.map((service, idx) => (
              <div
                key={service.name}
                className={cn(
                  'flex items-center justify-between px-5 py-4',
                  idx < services.length - 1 && 'border-b border-border'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={statusDot(service.status)} />
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {service.responseTime !== undefined && (
                    <span className="text-xs text-muted-foreground">{service.responseTime}ms</span>
                  )}
                  {statusIcon(service.status)}
                </div>
              </div>
            ))}
          </div>

          {services.some(s => s.error) && (
            <div className="space-y-2">
              {services.filter(s => s.error).map(s => (
                <p key={s.name} className="text-xs text-destructive">
                  {s.name}: {s.error}
                </p>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          API base: <code className="bg-muted px-1 rounded">{getApiUrl()}</code>
          {' · '}
          <Link to="/settings" className="hover:text-foreground transition-colors">Configure in Settings</Link>
        </p>
      </main>

      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Monitor Server.</p>
          <nav className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
