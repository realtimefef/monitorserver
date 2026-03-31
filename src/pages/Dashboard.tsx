// Dashboard - Main monitoring overview page
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTimezone } from '@/contexts/TimezoneContext';
import { MetricCard } from '@/components/MetricCard';
import { ServerCard } from '@/components/ServerCard';
import { AlertCard } from '@/components/AlertCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import {
  Server,
  AlertTriangle,
  Activity,
  Shield,
  Plus,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Wifi,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';
import { serversApi, alertsApi, metricsApi, Server as ServerType, Alert } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { usePolling } from '@/hooks/use-realtime';

function getHealthScore(servers: ServerType[], alerts: Alert[]): { score: number; label: string; color: string } {
  if (servers.length === 0) return { score: 100, label: 'No Data', color: 'text-muted-foreground' };

  const onlineRatio = servers.filter(s => s.status === 'ONLINE').length / servers.length;
  const criticalPenalty = alerts.filter(a => a.severity === 'CRITICAL').length * 15;
  const warningPenalty = alerts.filter(a => a.severity === 'WARNING').length * 5;

  const score = Math.max(0, Math.min(100, Math.round(onlineRatio * 100 - criticalPenalty - warningPenalty)));

  if (score >= 90) return { score, label: 'Excellent', color: 'text-emerald-500' };
  if (score >= 70) return { score, label: 'Good', color: 'text-green-500' };
  if (score >= 50) return { score, label: 'Warning', color: 'text-amber-500' };
  return { score, label: 'Critical', color: 'text-red-500' };
}

function StatusDot({ status }: { status: ServerType['status'] }) {
  const colors: Record<ServerType['status'], string> = {
    ONLINE: 'bg-emerald-500',
    OFFLINE: 'bg-red-500',
    WARNING: 'bg-amber-500',
    CRITICAL: 'bg-red-600',
    UNKNOWN: 'bg-muted-foreground',
  };
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[status]} ${status === 'ONLINE' ? 'animate-pulse' : ''}`} />
  );
}

function computeTrend(current: number, prev: number | undefined): { trend: 'up' | 'down' | 'stable'; delta: string } {
  if (prev === undefined) return { trend: 'stable', delta: '' };
  const diff = current - prev;
  if (diff === 0) return { trend: 'stable', delta: '0' };
  return { trend: diff > 0 ? 'up' : 'down', delta: `${diff > 0 ? '+' : ''}${diff}` };
}

export default function Dashboard() {
  const [servers, setServers] = useState<ServerType[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [networkStats, setNetworkStats] = useState<{ totalIn: number; totalOut: number }>({ totalIn: 0, totalOut: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const prevStatsRef = useRef<{ totalServers: number; onlineServers: number; activeAlerts: number; criticalAlerts: number } | undefined>(undefined);

  const fetchNetworkStats = useCallback(async (serverList: ServerType[]) => {
    if (serverList.length === 0) return;
    let totalIn = 0;
    let totalOut = 0;
    await Promise.allSettled(
      serverList.map(async (s) => {
        const [inRes, outRes] = await Promise.all([
          metricsApi.getLatest(s.id, 'NETWORK_IN'),
          metricsApi.getLatest(s.id, 'NETWORK_OUT'),
        ]);
        if (inRes) totalIn += inRes.value;
        if (outRes) totalOut += outRes.value;
      })
    );
    setNetworkStats({ totalIn, totalOut });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [serversRes, alertsRes] = await Promise.all([
        serversApi.getAll(),
        alertsApi.getActive(),
      ]);
      if (serversRes.success) {
        setServers(serversRes.data);
        fetchNetworkStats(serversRes.data);
      }
      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (error) {
      toast({
        title: 'Failed to fetch data',
        description: error instanceof Error ? error.message : 'Could not load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchNetworkStats]);

  usePolling(() => fetchData(), { interval: 5000 });

  const handleAcknowledge = async (alertId: number) => {
    try {
      await alertsApi.acknowledge(alertId);
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const } : a));
      toast({ title: 'Alert acknowledged' });
    } catch {
      toast({ title: 'Failed to acknowledge alert', variant: 'destructive' });
    }
  };

  const handleResolve = async (alertId: number) => {
    try {
      await alertsApi.resolve(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
      toast({ title: 'Alert resolved' });
    } catch {
      toast({ title: 'Failed to resolve alert', variant: 'destructive' });
    }
  };

  const stats = useMemo(() => ({
    totalServers: servers.length,
    onlineServers: servers.filter(s => s.status === 'ONLINE').length,
    offlineServers: servers.filter(s => s.status === 'OFFLINE').length,
    warningServers: servers.filter(s => s.status === 'WARNING' || s.status === 'CRITICAL').length,
    activeAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL').length,
    warningAlerts: alerts.filter(a => a.severity === 'WARNING').length,
  }), [servers, alerts]);

  // Compute trends by comparing to previous snapshot
  const totalServersTrend = computeTrend(stats.totalServers, prevStatsRef.current?.totalServers);
  const onlineServersTrend = computeTrend(stats.onlineServers, prevStatsRef.current?.onlineServers);
  const activeAlertsTrend = computeTrend(stats.activeAlerts, prevStatsRef.current?.activeAlerts);
  const criticalAlertsTrend = computeTrend(stats.criticalAlerts, prevStatsRef.current?.criticalAlerts);

  // Save current stats for next comparison
  useEffect(() => {
    if (!isLoading) {
      prevStatsRef.current = {
        totalServers: stats.totalServers,
        onlineServers: stats.onlineServers,
        activeAlerts: stats.activeAlerts,
        criticalAlerts: stats.criticalAlerts,
      };
    }
  }, [stats.totalServers, stats.onlineServers, stats.activeAlerts, stats.criticalAlerts, isLoading]);

  const health = getHealthScore(servers, alerts);
  const { formatDate } = useTimezone();

  const formatBytes = (bytes: number) => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB/s`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB/s`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB/s`;
    return `${bytes.toFixed(0)} B/s`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Monitor your infrastructure at a glance
            </p>
          </div>
          <Link to="/servers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Server
            </Button>
          </Link>
        </div>

        {/* System Health Banner */}
        {servers.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/20">
                  <span className={`font-display text-xl font-bold ${health.color}`}>{health.score}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">System Health</p>
                  <p className={`font-display text-2xl font-bold ${health.color}`}>{health.label}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 md:gap-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Online</p>
                    <p className="font-semibold text-foreground">{stats.onlineServers} servers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Offline</p>
                    <p className="font-semibold text-foreground">{stats.offlineServers} servers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Network In</p>
                    <p className="font-semibold text-foreground">{formatBytes(networkStats.totalIn)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Network Out</p>
                    <p className="font-semibold text-foreground">{formatBytes(networkStats.totalOut)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Servers"
            value={stats.totalServers}
            icon={<Server className="h-5 w-5" />}
            trend={totalServersTrend.trend}
            delta={totalServersTrend.delta}
          />
          <MetricCard
            title="Online Servers"
            value={stats.onlineServers}
            unit={`/ ${stats.totalServers}`}
            icon={<Activity className="h-5 w-5" />}
            status={stats.onlineServers === stats.totalServers ? 'normal' : 'warning'}
            trend={onlineServersTrend.trend}
            delta={onlineServersTrend.delta}
          />
          <MetricCard
            title="Active Alerts"
            value={stats.activeAlerts}
            icon={<AlertTriangle className="h-5 w-5" />}
            status={stats.criticalAlerts > 0 ? 'critical' : stats.activeAlerts > 0 ? 'warning' : 'normal'}
            trend={activeAlertsTrend.trend}
            delta={activeAlertsTrend.delta}
            trendInverted
          />
          <MetricCard
            title="Critical Alerts"
            value={stats.criticalAlerts}
            icon={<Shield className="h-5 w-5" />}
            status={stats.criticalAlerts > 0 ? 'critical' : 'normal'}
            trend={criticalAlertsTrend.trend}
            delta={criticalAlertsTrend.delta}
            trendInverted
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Servers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">Servers</h2>
              <Link to="/servers" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {servers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                <Server className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 font-medium text-foreground">No servers yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first server to start monitoring
                </p>
                <Link to="/servers/new">
                  <Button className="mt-4" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Server
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {servers.slice(0, 4).map((server) => (
                  <ServerCard key={server.id} server={server} />
                ))}
              </div>
            )}
          </div>

          {/* Alerts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">Active Alerts</h2>
              <Link to="/alerts" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {alerts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                <Shield className="mx-auto h-10 w-10 text-success" />
                <h3 className="mt-4 font-medium text-foreground">All clear!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No active alerts at the moment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Server Status Overview — Charts */}
        {servers.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Server Status Overview</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pie Chart — Server Status Distribution */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Status Distribution</h3>
                <div className="h-[250px] flex items-center justify-center">
                  <ChartContainer
                    config={{
                      online: { label: 'Online', color: '#10b981' },
                      warning: { label: 'Warning', color: '#f59e0b' },
                      critical: { label: 'Critical', color: '#dc2626' },
                      offline: { label: 'Offline', color: '#6b7280' },
                    }}
                    className="w-full h-full"
                  >
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Online', value: stats.onlineServers, fill: '#10b981' },
                          { name: 'Warning', value: stats.warningServers, fill: '#f59e0b' },
                          { name: 'Offline', value: stats.offlineServers, fill: '#6b7280' },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {[
                          { name: 'Online', value: stats.onlineServers, fill: '#10b981' },
                          { name: 'Warning', value: stats.warningServers, fill: '#f59e0b' },
                          { name: 'Offline', value: stats.offlineServers, fill: '#6b7280' },
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-2xl font-bold">
                        {stats.totalServers}
                      </text>
                      <text x="50%" y="58%" textAnchor="middle" className="fill-muted-foreground text-xs">
                        Total
                      </text>
                    </PieChart>
                  </ChartContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Online ({stats.onlineServers})
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> Warning ({stats.warningServers})
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-500 inline-block" /> Offline ({stats.offlineServers})
                  </span>
                </div>
              </div>

              {/* Bar Chart — Alert Severity Breakdown */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Alert Severity Breakdown</h3>
                <div className="h-[250px]">
                  <ChartContainer
                    config={{
                      critical: { label: 'Critical', color: '#dc2626' },
                      warning: { label: 'Warning', color: '#f59e0b' },
                      info: { label: 'Info', color: '#3b82f6' },
                    }}
                    className="w-full h-full"
                  >
                    <BarChart
                      data={[
                        { name: 'Critical', count: stats.criticalAlerts, fill: '#dc2626' },
                        { name: 'Warning', count: stats.warningAlerts, fill: '#f59e0b' },
                        { name: 'Info', count: alerts.filter(a => a.severity === 'INFO').length, fill: '#3b82f6' },
                      ]}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {[
                          { fill: '#dc2626' },
                          { fill: '#f59e0b' },
                          { fill: '#3b82f6' },
                        ].map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" /> Critical ({stats.criticalAlerts})
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> Warning ({stats.warningAlerts})
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" /> Info ({alerts.filter(a => a.severity === 'INFO').length})
                  </span>
                </div>
              </div>
            </div>

            {/* Server List */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {servers.map((server) => (
                <Link key={server.id} to={`/servers/${server.id}`}>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <StatusDot status={server.status} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{server.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{server.hostAddress}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {server.activeAlerts > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                          {server.activeAlerts}
                        </Badge>
                      )}
                      {server.lastHeartbeat && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(server.lastHeartbeat, 'relative')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link to="/rules">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Alert Rules</p>
                <p className="text-xs text-muted-foreground">Configure thresholds</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </div>
          </Link>

          <Link to="/servers/new">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Add Server</p>
                <p className="text-xs text-muted-foreground">Register new server</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </div>
          </Link>

          <Link to="/settings">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Settings</p>
                <p className="text-xs text-muted-foreground">Notifications & prefs</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
