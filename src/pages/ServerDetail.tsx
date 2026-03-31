import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTimezone } from '@/contexts/TimezoneContext';
import { StatusBadge } from '@/components/StatusBadge';
import { MetricCard } from '@/components/MetricCard';
import { AlertCard } from '@/components/AlertCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Server,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Cpu,
  HardDrive,
  MemoryStick,
  Activity,
  Terminal,
  Network,
  BarChart3,
  Download,
  ChevronDown,
} from 'lucide-react';
import {
  serversApi, alertsApi, metricsApi, maintenanceApi,
  type Server as ServerType, type Alert, type Metric, type TimeRange, type MaintenanceWindowItem
} from '@/lib/api';
import { getApiUrl } from '@/lib/apiClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePolling } from '@/hooks/use-realtime';
import { cn } from '@/lib/utils';
import {
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  ResponsiveContainer,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

type ChartType = 'line' | 'area' | 'bar';
type AvgWindow = '15m' | '1h' | '6h' | '24h';
type MetricMap = Record<string, Metric[]>;
type MetricLatestMap = Record<string, Metric>;

// ── Constants ─────────────────────────────────────────────────────────────────

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '1H', value: '1h' },
  { label: '6H', value: '6h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
];

const WINDOW_MINUTES: Record<AvgWindow, number> = {
  '15m': 15,
  '1h': 60,
  '6h': 360,
  '24h': 1440,
};

const CHART_METRICS = ['CPU_USAGE', 'MEMORY_USAGE', 'DISK_USAGE', 'NETWORK_IN', 'NETWORK_OUT', 'PROCESS_COUNT'];

// ── Formatters ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB/s`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB/s`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB/s`;
  return `${bytes.toFixed(0)} B/s`;
}

function formatSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ── MetricChart ───────────────────────────────────────────────────────────────

function MetricChart({
  title,
  data,
  color,
  unit,
  domain,
  formatValue,
  chartType,
}: {
  title: string;
  data: { time: string; value: number }[];
  color: string;
  unit?: string;
  domain?: [number, number];
  formatValue?: (v: number) => string;
  chartType: ChartType;
}) {
  if (data.length === 0) return null;

  const gradId = `grad-${color.replace(/[^a-z0-9]/gi, '')}`;

  const sharedTooltip = (
    <Tooltip
      contentStyle={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        fontSize: '12px',
      }}
      formatter={(value: number) => [
        formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ''}`,
        title,
      ]}
    />
  );

  const sharedAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
      <YAxis
        stroke="hsl(var(--muted-foreground))"
        fontSize={11}
        tickLine={false}
        domain={domain}
        tickFormatter={formatValue}
      />
      {sharedTooltip}
    </>
  );

  const renderContent = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={data}>
          {sharedAxes}
          <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      );
    }
    if (chartType === 'line') {
      return (
        <LineChart data={data}>
          {sharedAxes}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      );
    }
    // area (default)
    return (
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {sharedAxes}
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={`url(#${gradId})`}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    );
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {renderContent()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── NetworkChart ──────────────────────────────────────────────────────────────

function NetworkChart({
  inData,
  outData,
  chartType,
}: {
  inData: { time: string; value: number }[];
  outData: { time: string; value: number }[];
  chartType: ChartType;
}) {
  if (inData.length === 0 && outData.length === 0) return null;

  const merged = inData.map((item, i) => ({
    time: item.time,
    in: item.value,
    out: outData[i]?.value ?? 0,
  }));

  const sharedAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
      <YAxis
        stroke="hsl(var(--muted-foreground))"
        fontSize={11}
        tickLine={false}
        tickFormatter={(v) => formatBytes(v)}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          fontSize: '12px',
        }}
        formatter={(value: number, name: string) => [
          formatBytes(value),
          name === 'in' ? 'Network In' : 'Network Out',
        ]}
      />
      <Legend formatter={(value) => (value === 'in' ? 'Network In' : 'Network Out')} />
    </>
  );

  const renderContent = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={merged}>
          {sharedAxes}
          <Bar dataKey="in" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          <Bar dataKey="out" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
        </BarChart>
      );
    }
    if (chartType === 'line') {
      return (
        <LineChart data={merged}>
          {sharedAxes}
          <Line type="monotone" dataKey="in" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="out" stroke="#8b5cf6" strokeWidth={2} dot={false} />
        </LineChart>
      );
    }
    // area (default)
    return (
      <AreaChart data={merged}>
        <defs>
          <linearGradient id="netIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="netOut" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        {sharedAxes}
        <Area type="monotone" dataKey="in" stroke="#3b82f6" fill="url(#netIn)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="out" stroke="#8b5cf6" fill="url(#netOut)" strokeWidth={2} dot={false} />
      </AreaChart>
    );
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Network className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Network I/O</h3>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {renderContent()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── ServerDetail page ─────────────────────────────────────────────────────────

export default function ServerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatDate, timezone } = useTimezone();

  const [server, setServer] = useState<ServerType | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<MetricMap>({});
  const [latestMetrics, setLatestMetrics] = useState<MetricLatestMap>({});
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [avgWindow, setAvgWindow] = useState<AvgWindow>('1h');
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Maintenance windows
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindowItem[]>([]);
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [maintReason, setMaintReason] = useState('');
  const [maintStart, setMaintStart] = useState('');
  const [maintEnd, setMaintEnd] = useState('');
  const [isCreatingMaint, setIsCreatingMaint] = useState(false);

  const serverId = id ? Number(id) : null;

  // ── Computed metric stats for the Averages panel ───────────────────────────

  const metricStats = useMemo(() => {
    const cutoff = Date.now() - WINDOW_MINUTES[avgWindow] * 60_000;
    const computeStats = (type: string) => {
      const values = (metrics[type] || [])
        .filter(m => new Date(m.timestamp).getTime() >= cutoff)
        .map(m => m.value);
      if (values.length === 0) return null;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { avg, max: Math.max(...values), min: Math.min(...values) };
    };
    return {
      CPU: computeStats('CPU_USAGE'),
      Memory: computeStats('MEMORY_USAGE'),
      Disk: computeStats('DISK_USAGE'),
    };
  }, [metrics, avgWindow]);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!serverId) return;
    try {
      const [serverRes, alertsRes, metricsData, latestArr, maintData] = await Promise.all([
        serversApi.getById(serverId),
        alertsApi.getByServer(serverId),
        metricsApi.getHistoryMultiple(serverId, CHART_METRICS, timeRange),
        metricsApi.getLatestAll(serverId),
        maintenanceApi.getByServer(serverId).catch(() => [] as MaintenanceWindowItem[]),
      ]);

      if (serverRes.success) setServer(serverRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data.filter(a => a.status !== 'RESOLVED'));

      setMetrics(metricsData);
      setMaintenanceWindows(maintData);

      const latestMap: MetricLatestMap = {};
      (latestArr as Metric[]).forEach(m => { latestMap[m.metricType] = m; });
      setLatestMetrics(latestMap);
    } catch (error) {
      toast({
        title: 'Failed to fetch server details',
        description: error instanceof Error ? error.message : 'Could not load server',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [serverId, toast, timeRange]);

  // Initial fetch + re-fetch whenever fetchData changes (e.g. timeRange changes)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll every 10 seconds for real-time updates
  usePolling(fetchData, { interval: 5_000, enabled: !!serverId });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const copyAgentKey = () => {
    if (server?.agentKey) {
      navigator.clipboard.writeText(server.agentKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const regenerateKey = async () => {
    if (!server) return;
    setIsRegenerating(true);
    try {
      const response = await serversApi.regenerateKey(server.id);
      if (response.agentKey) {
        setServer({ ...server, agentKey: response.agentKey });
        toast({ title: 'Agent key regenerated' });
      }
    } catch {
      toast({ title: 'Failed to regenerate key', variant: 'destructive' });
    } finally {
      setIsRegenerating(false);
    }
  };

  const deleteServer = async () => {
    if (!server) return;
    try {
      await serversApi.delete(server.id);
      toast({ title: 'Server deleted' });
      navigate('/servers');
    } catch {
      toast({ title: 'Failed to delete server', variant: 'destructive' });
    }
  };

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

  // Export handlers ────────────────────────────────────────────────────────────

  const handleExportMetricsCsv = () => {
    if (!serverId) return;
    let exported = 0;
    Object.entries(metrics).forEach(([type, data]) => {
      if (data.length > 0) {
        metricsApi.exportCsv(serverId, type, data);
        exported++;
      }
    });
    toast({ title: exported > 0 ? `Metrics CSV exported (${exported} types)` : 'No metric data to export' });
  };

  const handleExportAlertsCsv = () => {
    alertsApi.exportCsv(alerts);
    toast({ title: alerts.length > 0 ? 'Alerts CSV exported' : 'No alerts to export' });
  };

  const handleExportJson = () => {
    const json = JSON.stringify(metrics, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${server?.name ?? serverId}-${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'JSON exported' });
  };

  // ── Loading / not found guards ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!server) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="font-display text-xl font-semibold">Server not found</h2>
          <Button className="mt-4" onClick={() => navigate('/servers')}>
            Back to Servers
          </Button>
        </div>
      </MainLayout>
    );
  }

  // ── Derived display values ─────────────────────────────────────────────────

  const toChartData = (type: string) =>
    (metrics[type] || []).map(m => ({
      time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: timezone }),
      value: m.value,
    }));

  const memoryTotal = latestMetrics['MEMORY_TOTAL']?.value ?? 0;
  const memoryAvailable = latestMetrics['MEMORY_AVAILABLE']?.value ?? 0;
  const memoryUsed = memoryTotal - memoryAvailable;
  const diskTotal = latestMetrics['DISK_TOTAL']?.value ?? 0;
  const diskAvailable = latestMetrics['DISK_AVAILABLE']?.value ?? 0;
  const diskUsed = diskTotal - diskAvailable;

  const apiUrl = getApiUrl();
  const bashInstallCmd = [
    `curl -fsSL "${apiUrl}/agent/monitor-agent.sh" -o monitor-agent.sh && chmod +x monitor-agent.sh`,
    `MONITOR_API_URL="${apiUrl}" AGENT_KEY="${server.agentKey}" ./monitor-agent.sh`,
  ].join('\n');
  const psInstallCmd = [
    `Invoke-WebRequest -Uri "${apiUrl}/agent/monitor-agent.ps1" -OutFile monitor-agent.ps1`,
    `.\\monitor-agent.ps1 -ApiUrl "${apiUrl}" -AgentKey "${server.agentKey}"`,
  ].join('\n');
  const isWindows = server.operatingSystem?.toLowerCase().includes('windows');
  const agentInstallCmd = isWindows ? psInstallCmd : bashInstallCmd;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <MainLayout>
      <div className="space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/servers')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Servers
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                <Server className="h-7 w-7 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl font-bold text-foreground">{server.name}</h1>
                  <StatusBadge status={server.status} />
                </div>
                <p className="text-muted-foreground">{server.hostAddress}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Data Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportMetricsCsv}>
                  Export Metrics CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAlertsCsv}>
                  Export Alerts CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJson}>
                  Export JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Server */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Server?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {server.name} and all its metrics and alerts.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteServer}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* ── Agent Installation (shown when OFFLINE) ── */}
        {server.status === 'OFFLINE' && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Agent Installation</CardTitle>
              </div>
              <CardDescription>
                Paste this command on your server to download and start the monitoring agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {isWindows ? 'PowerShell (Windows)' : 'Bash (Linux / macOS)'}
                </p>
                <div className="relative rounded-md bg-muted p-4 pr-12 font-mono text-sm max-w-full overflow-x-auto">
                  <p className="whitespace-pre-wrap break-all">{agentInstallCmd}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 bg-background/50 hover:bg-background"
                    onClick={() => {
                      navigator.clipboard.writeText(agentInstallCmd);
                      toast({ title: 'Command copied!' });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Show the other OS option too */}
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  {isWindows ? 'Show Linux / macOS command' : 'Show Windows (PowerShell) command'}
                </summary>
                <div className="relative mt-2 rounded-md bg-muted p-4 pr-12 font-mono text-sm max-w-full overflow-x-auto">
                  <p className="whitespace-pre-wrap break-all">{isWindows ? bashInstallCmd : psInstallCmd}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 bg-background/50 hover:bg-background"
                    onClick={() => {
                      navigator.clipboard.writeText(isWindows ? bashInstallCmd : psInstallCmd);
                      toast({ title: 'Command copied!' });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </details>
            </CardContent>
          </Card>
        )}

        {/* ── Live Metrics Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="CPU Usage"
            value={latestMetrics['CPU_USAGE']?.value?.toFixed(1) ?? '--'}
            unit="%"
            icon={<Cpu className="h-5 w-5" />}
            status={
              (latestMetrics['CPU_USAGE']?.value ?? 0) > 90 ? 'critical' :
              (latestMetrics['CPU_USAGE']?.value ?? 0) > 70 ? 'warning' : 'normal'
            }
          />
          <MetricCard
            title="Memory Usage"
            value={latestMetrics['MEMORY_USAGE']?.value?.toFixed(1) ?? '--'}
            unit="%"
            icon={<MemoryStick className="h-5 w-5" />}
            status={
              (latestMetrics['MEMORY_USAGE']?.value ?? 0) > 90 ? 'critical' :
              (latestMetrics['MEMORY_USAGE']?.value ?? 0) > 70 ? 'warning' : 'normal'
            }
          />
          <MetricCard
            title="Disk Usage"
            value={latestMetrics['DISK_USAGE']?.value?.toFixed(1) ?? '--'}
            unit="%"
            icon={<HardDrive className="h-5 w-5" />}
            status={
              (latestMetrics['DISK_USAGE']?.value ?? 0) > 90 ? 'critical' :
              (latestMetrics['DISK_USAGE']?.value ?? 0) > 80 ? 'warning' : 'normal'
            }
          />
          <MetricCard
            title="Load Average"
            value={latestMetrics['LOAD_AVERAGE']?.value?.toFixed(2) ?? '--'}
            icon={<Activity className="h-5 w-5" />}
          />
        </div>

        {/* ── Network / Process / Uptime Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Network In"
            value={latestMetrics['NETWORK_IN'] ? formatBytes(latestMetrics['NETWORK_IN'].value) : '--'}
            icon={<Network className="h-5 w-5" />}
          />
          <MetricCard
            title="Network Out"
            value={latestMetrics['NETWORK_OUT'] ? formatBytes(latestMetrics['NETWORK_OUT'].value) : '--'}
            icon={<Network className="h-5 w-5" />}
          />
          <MetricCard
            title="Processes"
            value={latestMetrics['PROCESS_COUNT']?.value?.toFixed(0) ?? '--'}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <MetricCard
            title="Uptime"
            value={latestMetrics['UPTIME'] ? formatUptime(latestMetrics['UPTIME'].value) : '--'}
            icon={<Activity className="h-5 w-5" />}
            status="normal"
          />
        </div>

        {/* ── Time Range + Chart Type Selector ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-display text-xl font-semibold text-foreground">Metric History</h2>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Chart type switcher */}
            <div className="flex rounded-lg border border-border overflow-hidden text-sm">
              {(['line', 'area', 'bar'] as ChartType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={cn(
                    'px-3 py-1.5 transition-colors capitalize',
                    chartType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <span className="text-sm text-muted-foreground">Range:</span>
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <TabsList>
                {TIME_RANGES.map((r) => (
                  <TabsTrigger key={r.value} value={r.value}>{r.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* ── Charts Grid ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <MetricChart
            title="CPU Usage"
            data={toChartData('CPU_USAGE')}
            color="hsl(var(--primary))"
            unit="%"
            domain={[0, 100]}
            chartType={chartType}
          />
          <MetricChart
            title="Memory Usage"
            data={toChartData('MEMORY_USAGE')}
            color="#10b981"
            unit="%"
            domain={[0, 100]}
            chartType={chartType}
          />
          <MetricChart
            title="Disk Usage"
            data={toChartData('DISK_USAGE')}
            color="#f59e0b"
            unit="%"
            domain={[0, 100]}
            chartType={chartType}
          />
          <NetworkChart
            inData={toChartData('NETWORK_IN')}
            outData={toChartData('NETWORK_OUT')}
            chartType={chartType}
          />
          <MetricChart
            title="Process Count"
            data={toChartData('PROCESS_COUNT')}
            color="#8b5cf6"
            formatValue={(v) => `${v}`}
            chartType={chartType}
          />
        </div>

        {/* ── Metric Averages Panel ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle>Metric Averages</CardTitle>
              {/* Window selector */}
              <div className="flex rounded-lg border border-border overflow-hidden text-sm">
                {(['15m', '1h', '6h', '24h'] as AvgWindow[]).map(w => (
                  <button
                    key={w}
                    onClick={() => setAvgWindow(w)}
                    className={cn(
                      'px-3 py-1.5 transition-colors',
                      avgWindow === w
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <CardDescription>
              Average, maximum, and minimum values over the selected time window, calculated from loaded history data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {(Object.entries(metricStats) as [string, { avg: number; max: number; min: number } | null][]).map(
                ([name, stats]) => (
                  <div key={name} className="rounded-lg border border-border bg-card p-4 space-y-3">
                    <h4 className="font-semibold text-sm text-foreground">{name} Usage</h4>
                    {stats ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Average</span>
                          <span className="font-medium text-foreground">{stats.avg.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Maximum</span>
                          <span className="font-medium text-warning">{stats.max.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Minimum</span>
                          <span className="font-medium text-success">{stats.min.toFixed(1)}%</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No data for this window</p>
                    )}
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Disk & Memory Info ── */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MemoryStick className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold text-foreground">Memory Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">{formatSize(memoryTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Used</span>
                <span className="font-semibold text-warning">{formatSize(memoryUsed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Available</span>
                <span className="font-semibold text-success">{formatSize(memoryAvailable)}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {memoryTotal > 0 ? `${((memoryUsed / memoryTotal) * 100).toFixed(1)}% used` : ''}
              </p>
            </div>
          </div>

          <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold text-foreground">Disk Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">{formatSize(diskTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Used</span>
                <span className="font-semibold text-warning">{formatSize(diskUsed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Available</span>
                <span className="font-semibold text-success">{formatSize(diskAvailable)}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {diskTotal > 0 ? `${((diskUsed / diskTotal) * 100).toFixed(1)}% used` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* ── System Info + Alerts ── */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground">CPU & System</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Operating System', value: server.operatingSystem || 'N/A' },
                  { label: 'Current CPU Usage', value: `${latestMetrics['CPU_USAGE']?.value?.toFixed(1) ?? '--'}%` },
                  { label: 'Load Average', value: latestMetrics['LOAD_AVERAGE']?.value?.toFixed(2) ?? '--' },
                  { label: 'Process Count', value: latestMetrics['PROCESS_COUNT']?.value?.toFixed(0) ?? '--' },
                  { label: 'Uptime', value: latestMetrics['UPTIME'] ? formatUptime(latestMetrics['UPTIME'].value) : '--' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Server Information</h3>
              <div className="space-y-3">
                {[
                  { label: 'Host Address', value: server.hostAddress },
                  { label: 'Operating System', value: server.operatingSystem },
                  { label: 'Created', value: formatDate(server.createdAt, 'relative') },
                  {
                    label: 'Last Heartbeat',
                    value: server.lastHeartbeat
                      ? formatDate(server.lastHeartbeat, 'relative')
                      : 'Never',
                  },
                  { label: 'Active Alerts', value: String(server.activeAlerts ?? 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Agent Key</h3>
              <div className="flex gap-2">
                <Input value={server.agentKey} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={copyAgentKey}>
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={regenerateKey} disabled={isRegenerating}>
                  <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this key to configure the monitoring agent on your server.
              </p>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Active Alerts ({alerts.length})
            </h3>
            {alerts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                <Check className="mx-auto h-8 w-8 text-success" />
                <p className="mt-2 text-sm text-muted-foreground">No active alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
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

          {/* Maintenance Windows */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Maintenance Windows
              </h3>
              <Button variant="outline" size="sm" onClick={() => setShowMaintForm(p => !p)}>
                {showMaintForm ? 'Cancel' : 'Schedule Maintenance'}
              </Button>
            </div>

            {showMaintForm && serverId && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Reason</label>
                    <Input placeholder="e.g. Planned OS update" value={maintReason} onChange={e => setMaintReason(e.target.value)} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Start Time</label>
                      <Input type="datetime-local" value={maintStart} onChange={e => setMaintStart(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">End Time</label>
                      <Input type="datetime-local" value={maintEnd} onChange={e => setMaintEnd(e.target.value)} />
                    </div>
                  </div>
                  <Button size="sm" disabled={isCreatingMaint || !maintReason || !maintStart || !maintEnd} onClick={async () => {
                    setIsCreatingMaint(true);
                    try {
                      const created = await maintenanceApi.create(serverId, { reason: maintReason, startTime: maintStart, endTime: maintEnd });
                      setMaintenanceWindows(prev => [created, ...prev]);
                      setMaintReason(''); setMaintStart(''); setMaintEnd('');
                      setShowMaintForm(false);
                      toast({ title: 'Maintenance window scheduled' });
                    } catch (error) {
                      toast({ title: 'Failed to schedule', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
                    } finally { setIsCreatingMaint(false); }
                  }}>
                    {isCreatingMaint ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Schedule
                  </Button>
                </CardContent>
              </Card>
            )}

            {maintenanceWindows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">No maintenance windows scheduled</p>
              </div>
            ) : (
              <div className="space-y-2">
                {maintenanceWindows.map(mw => {
                  const now = new Date();
                  const start = new Date(mw.startTime);
                  const end = new Date(mw.endTime);
                  const isActive = mw.active && now >= start && now <= end;
                  const isUpcoming = mw.active && now < start;
                  const isPast = now > end || !mw.active;

                  return (
                    <div key={mw.id} className={cn('flex items-center justify-between rounded-lg border p-3', isActive && 'border-amber-500/50 bg-amber-500/5')}>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{mw.reason}</p>
                          {isActive && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">In Progress</span>}
                          {isUpcoming && <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600">Upcoming</span>}
                          {isPast && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{mw.active ? 'Ended' : 'Cancelled'}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(start, 'datetime')} — {formatDate(end, 'datetime')}
                        </p>
                      </div>
                      {mw.active && !isPast && serverId && (
                        <Button variant="ghost" size="sm" className="text-xs shrink-0 ml-2" onClick={async () => {
                          try {
                            await maintenanceApi.cancel(serverId, mw.id);
                            setMaintenanceWindows(prev => prev.map(w => w.id === mw.id ? { ...w, active: false } : w));
                            toast({ title: 'Maintenance cancelled' });
                          } catch { toast({ title: 'Failed to cancel', variant: 'destructive' }); }
                        }}>Cancel</Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
