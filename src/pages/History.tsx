import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTimezone } from '@/contexts/TimezoneContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Download, RefreshCw, Loader2, BarChart2, TrendingUp, Server, Calendar as CalendarIcon, Palette, ArrowLeft,
} from 'lucide-react';
import { serversApi, metricsApi, metricsCustomApi, type Server as ServerType, type Metric, type TimeRange } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { subHours, subDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

const DEFAULT_COLORS: Record<string, string> = {
  CPU_USAGE: '#6366f1',
  MEMORY_USAGE: '#8b5cf6',
  DISK_USAGE: '#f59e0b',
  NETWORK_IN: '#10b981',
};

const COLORS_KEY = 'monitor_chart_colors';
function loadColors(): Record<string, string> {
  try { return { ...DEFAULT_COLORS, ...JSON.parse(localStorage.getItem(COLORS_KEY) ?? '{}') }; }
  catch { return { ...DEFAULT_COLORS }; }
}
function saveColors(c: Record<string, string>) { localStorage.setItem(COLORS_KEY, JSON.stringify(c)); }

const CHART_METRICS_BASE = [
  { key: 'CPU_USAGE', label: 'CPU Usage', unit: '%' },
  { key: 'MEMORY_USAGE', label: 'Memory Usage', unit: '%' },
  { key: 'DISK_USAGE', label: 'Disk Usage', unit: '%' },
  { key: 'NETWORK_IN', label: 'Network In', unit: 'B/s' },
];

const TIME_FRAMES: { label: string; value: TimeRange | 'custom' | '30d' }[] = [
  { label: '1 Hour', value: '1h' },
  { label: '6 Hours', value: '6h' },
  { label: '24 Hours', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: 'Custom', value: 'custom' },
];

const CHART_TYPES = ['line', 'area', 'bar'] as const;
type ChartType = typeof CHART_TYPES[number];

function buildChartData(metricData: Record<string, Metric[]>, tz?: string) {
  const bucketMap = new Map<number, Record<string, number>>();
  const fmt = new Intl.DateTimeFormat(undefined, {
    timeZone: tz || undefined,
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  for (const [type, metrics] of Object.entries(metricData)) {
    for (const m of metrics) {
      const ts = new Date(m.timestamp).getTime();
      const bucket = Math.floor(ts / 60_000) * 60_000; // 1-minute buckets
      if (!bucketMap.has(bucket)) bucketMap.set(bucket, { ts: bucket });
      const existing = bucketMap.get(bucket)!;
      existing[type] = m.value;
    }
  }

  return Array.from(bucketMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => ({ ...v, time: fmt.format(new Date(v.ts)) }));
}

function computeStats(metrics: Metric[]) {
  if (!metrics.length) return { current: 0, avg: 0, max: 0, min: 0 };
  const values = metrics.map(m => m.value);
  return {
    current: values[values.length - 1],
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    max: values.reduce((a, b) => Math.max(a, b)),
    min: values.reduce((a, b) => Math.min(a, b)),
  };
}

export default function History() {
  const { toast } = useToast();
  const { timezone, formatDate } = useTimezone();
  const chartRef = useRef<HTMLDivElement>(null);

  const [servers, setServers] = useState<ServerType[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [timeFrame, setTimeFrame] = useState<TimeRange | 'custom' | '30d'>('24h');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [calOpen, setCalOpen] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('area');
  const [overlay, setOverlay] = useState(false);
  const [metricData, setMetricData] = useState<Record<string, Metric[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [colors, setColors] = useState<Record<string, string>>(loadColors);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const CHART_METRICS = useMemo(
    () => CHART_METRICS_BASE.map(m => ({ ...m, color: colors[m.key] ?? DEFAULT_COLORS[m.key] })),
    [colors]
  );

  const updateColor = (key: string, color: string) => {
    const next = { ...colors, [key]: color };
    setColors(next);
    saveColors(next);
  };

  const resetColors = () => {
    setColors({ ...DEFAULT_COLORS });
    localStorage.removeItem(COLORS_KEY);
  };

  useEffect(() => {
    serversApi.getAll().then(r => {
      if (r.success && r.data.length) {
        setServers(r.data);
        setSelectedServer(r.data[0].id.toString());
      }
    });
  }, []);

  const toastRef = useRef(toast);
  toastRef.current = toast;

  const fetchData = useCallback(async () => {
    if (!selectedServer) return;
    setIsLoading(true);
    try {
      let data: Record<string, Metric[]>;
      const types = CHART_METRICS_BASE.map(m => m.key);

      if (timeFrame === 'custom' && dateRange?.from && dateRange?.to) {
        const res = await metricsCustomApi.getHistoryRange(Number(selectedServer), types, dateRange.from, dateRange.to);
        data = res.data;
      } else {
        const since = timeFrame === '30d'
          ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() - ({ '1h': 1, '6h': 6, '24h': 24, '7d': 168 }[timeFrame as TimeRange] ?? 24) * 60 * 60 * 1000);
        const res = await metricsCustomApi.getHistoryRange(Number(selectedServer), types, since, new Date());
        data = res.data;
      }
      setMetricData(data);
    } catch {
      toastRef.current({ title: 'Failed to load metrics', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer, timeFrame, dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartData = useMemo(() => buildChartData(metricData, timezone), [metricData, timezone]);

  // Export helpers
  const exportCSV = () => {
    const rows = ['timestamp,' + CHART_METRICS.map(m => m.key).join(',')];
    for (const row of chartData) {
      rows.push([row.time, ...CHART_METRICS.map(m => (row[m.key] ?? '').toString())].join(','));
    }
    download(rows.join('\n'), 'metrics.csv', 'text/csv');
  };

  const exportJSON = () => {
    download(JSON.stringify(metricData, null, 2), 'metrics.json', 'application/json');
  };

  const exportExcel = async () => {
    const { utils, writeFile } = await import('xlsx');
    const wb = utils.book_new();
    for (const [type, metrics] of Object.entries(metricData)) {
      const ws = utils.json_to_sheet(metrics.map(m => ({ Timestamp: m.timestamp, Value: m.value, Unit: m.unit })));
      utils.book_append_sheet(wb, ws, type.slice(0, 31));
    }
    writeFile(wb, 'metrics.xlsx');
  };

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.text('Metrics Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Server: ${servers.find(s => s.id.toString() === selectedServer)?.name ?? selectedServer}`, 14, 24);
    doc.text(`Generated: ${formatDate(new Date(), 'full')}`, 14, 30);
    let y = 40;
    for (const [type, metrics] of Object.entries(metricData)) {
      if (y > 260) { doc.addPage(); y = 14; }
      doc.setFontSize(12);
      doc.text(type, 14, y);
      y += 6;
      doc.setFontSize(9);
      const stats = computeStats(metrics);
      doc.text(`Avg: ${stats.avg.toFixed(2)}, Max: ${stats.max.toFixed(2)}, Min: ${stats.min.toFixed(2)}, Current: ${stats.current.toFixed(2)}`, 14, y);
      y += 10;
    }
    doc.save('metrics.pdf');
  };

  const exportImage = async (type: 'png' | 'jpg') => {
    if (!chartRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(chartRef.current);
    const url = canvas.toDataURL(`image/${type}`);
    download(url, `chart.${type}`, '');
  };

  const download = (content: string, filename: string, mime: string) => {
    const a = document.createElement('a');
    if (mime) {
      const blob = new Blob([content], { type: mime });
      a.href = URL.createObjectURL(blob);
    } else {
      a.href = content;
    }
    a.download = filename;
    a.click();
    if (mime) setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const renderChart = (metricKey: string, color: string, label: string) => {
    const props = {
      data: chartData,
      margin: { top: 5, right: 10, bottom: 5, left: 0 },
    };
    const commonChildren = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
      </>
    );

    if (chartType === 'bar') return (
      <BarChart {...props}>
        {commonChildren}
        <Bar dataKey={metricKey} name={label} fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    );
    if (chartType === 'line') return (
      <LineChart {...props}>
        {commonChildren}
        <Line type="monotone" dataKey={metricKey} name={label} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    );
    return (
      <AreaChart {...props}>
        {commonChildren}
        <defs>
          <linearGradient id={`g-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={metricKey} name={label} stroke={color} fill={`url(#g-${metricKey})`} strokeWidth={2} dot={false} />
      </AreaChart>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">History</h1>
            <p className="mt-1 text-muted-foreground">Historical metric charts and data exports</p>
          </div>

          {/* Export dropdown */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>CSV</Button>
            <Button variant="outline" size="sm" onClick={exportJSON}>JSON</Button>
            <Button variant="outline" size="sm" onClick={exportExcel}>Excel</Button>
            <Button variant="outline" size="sm" onClick={exportPDF}>PDF</Button>
            <Button variant="outline" size="sm" onClick={() => exportImage('png')}>PNG</Button>
            <Button variant="outline" size="sm" onClick={() => exportImage('jpg')}>JPG</Button>
            <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Server selector */}
          <Select value={selectedServer} onValueChange={setSelectedServer}>
            <SelectTrigger className="w-[200px]">
              <Server className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select server" />
            </SelectTrigger>
            <SelectContent>
              {servers.map(s => (
                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Time frame */}
          <div className="flex rounded-lg border border-border overflow-hidden text-sm">
            {TIME_FRAMES.map(tf => (
              <button
                key={tf.value}
                onClick={() => setTimeFrame(tf.value)}
                className={cn(
                  'px-3 py-1.5 transition-colors',
                  timeFrame === tf.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Custom date range picker */}
          {timeFrame === 'custom' && (
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from
                    ? dateRange.to
                      ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d')}`
                      : format(dateRange.from, 'MMM d, yyyy')
                    : 'Pick dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    if (range?.from && range?.to) setCalOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Chart type toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            {CHART_TYPES.map(ct => (
              <Button
                key={ct}
                variant={chartType === ct ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2"
                onClick={() => setChartType(ct)}
              >
                {ct === 'line' ? <TrendingUp className="h-3.5 w-3.5" /> : <BarChart2 className="h-3.5 w-3.5" />}
                <span className="ml-1 capitalize">{ct}</span>
              </Button>
            ))}
          </div>

          {/* Overlay mode */}
          <Button
            variant={overlay ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOverlay(v => !v)}
          >
            Overlay
          </Button>

          {/* Color picker toggle */}
          <Button
            variant={showColorPicker ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowColorPicker(v => !v)}
          >
            <Palette className="mr-1 h-3.5 w-3.5" /> Colors
          </Button>
        </div>

        {/* Color picker panel */}
        {showColorPicker && (
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-3">
            {CHART_METRICS.map(m => (
              <div key={m.key} className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">{m.label}</Label>
                <input
                  type="color"
                  value={m.color}
                  onChange={e => updateColor(m.key, e.target.value)}
                  className="h-7 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                />
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={resetColors} className="text-xs">
              Reset
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
            <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium text-foreground">No metric data for this range</p>
            <p className="mt-1 text-sm text-muted-foreground">Make sure the agent is running and sending data.</p>
          </div>
        ) : (
          <div ref={chartRef} className="space-y-4">
            {overlay ? (
              /* Overlay: all metrics on one chart */
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-medium text-foreground mb-4">All Metrics (Overlay)</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                    <Legend />
                    {CHART_METRICS.map(m => (
                      <Line key={m.key} type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2} dot={false} name={m.label} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* Individual charts per metric */
              <div className="grid gap-4 lg:grid-cols-2">
                {CHART_METRICS.map(m => {
                  const metrics = metricData[m.key] ?? [];
                  const stats = computeStats(metrics);
                  return (
                    <div key={m.key} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-foreground">{m.label}</h3>
                        <span className="text-xs text-muted-foreground">{metrics.length} points</span>
                      </div>
                      {/* Stats bar */}
                      <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                        {[['Avg', stats.avg], ['Max', stats.max], ['Min', stats.min], ['CUR', stats.current]].map(([l, v]) => (
                          <div key={l as string} className="flex flex-col">
                            <span className="text-muted-foreground">{l}</span>
                            <span className="font-medium text-foreground">{Number(v).toFixed(1)}{m.unit}</span>
                          </div>
                        ))}
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        {renderChart(m.key, m.color, m.label)}
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
