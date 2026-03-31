import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Plus, FileText, Trash2, Download, Loader2, Clock, Pencil, ArrowLeft,
} from 'lucide-react';
import { reportsApi, serversApi, metricsCustomApi, type ReportTemplate, type Server } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useTimezone } from '@/contexts/TimezoneContext';

const TIME_FRAMES = [
  { value: '1h', label: 'Last 1 Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

const DISPLAY_METRICS = [
  { key: 'CPU_USAGE', label: 'CPU Usage' },
  { key: 'MEMORY_USAGE', label: 'Memory Usage (%)' },
  { key: 'DISK_USAGE', label: 'Disk Usage (%)' },
  { key: 'NETWORK_IN', label: 'Network In' },
  { key: 'NETWORK_OUT', label: 'Network Out' },
  { key: 'LOAD_AVERAGE', label: 'Load Average' },
  { key: 'PROCESS_COUNT', label: 'Process Count' },
  { key: 'UPTIME', label: 'Uptime' },
];

type FormState = {
  name: string;
  format: 'CSV' | 'PDF' | 'EXCEL' | 'JSON';
  timeframe: string;
  serverId: string;
  metricTypes: string[];
  frequency: 'MANUAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recipients: string;
};

const emptyForm: FormState = {
  name: '',
  format: 'CSV',
  timeframe: '24h',
  serverId: '',
  metricTypes: ['CPU_USAGE', 'MEMORY_USAGE', 'DISK_USAGE'],
  frequency: 'MANUAL',
  recipients: '',
};

export default function ScheduledReports() {
  const { toast } = useToast();
  const { formatDate } = useTimezone();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadTemplates = async () => {
    try {
      const data = await reportsApi.getAll();
      setTemplates(data);
    } catch {
      toast({ title: 'Failed to load reports', variant: 'destructive' });
    }
  };

  useEffect(() => {
    loadTemplates();
    serversApi.getAll().then(r => { if (r.success) setServers(r.data); }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEditDialog = (t: ReportTemplate) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      format: t.format,
      timeframe: t.timeframe,
      serverId: t.serverIds?.[0]?.toString() ?? '',
      metricTypes: [...t.metricTypes],
      frequency: t.frequency,
      recipients: t.recipients ?? '',
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.serverId) {
      toast({ title: 'Name and server are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        format: form.format,
        timeframe: form.timeframe,
        serverIds: [Number(form.serverId)],
        metricTypes: form.metricTypes,
        frequency: form.frequency,
        recipients: form.recipients || undefined,
      };

      if (editingId) {
        await reportsApi.update(editingId, payload);
        toast({ title: 'Template updated' });
      } else {
        await reportsApi.create(payload);
        toast({ title: 'Report template created' });
      }

      await loadTemplates();
      setIsOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      toast({ title: 'Save failed', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reportsApi.delete(id);
      await loadTemplates();
      toast({ title: 'Template deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const handleToggleEnabled = async (t: ReportTemplate) => {
    try {
      await reportsApi.update(t.id, { enabled: !t.enabled });
      await loadTemplates();
      toast({ title: t.enabled ? 'Report disabled' : 'Report enabled' });
    } catch {
      toast({ title: 'Toggle failed', variant: 'destructive' });
    }
  };

  const getServerName = (t: ReportTemplate): string => {
    const serverId = t.serverIds?.[0];
    if (!serverId) return 'No server';
    return servers.find(s => s.id === serverId)?.name ?? `Server ${serverId}`;
  };

  const handleGenerate = async (template: ReportTemplate) => {
    const serverId = template.serverIds?.[0];
    if (!serverId) return;
    setGeneratingId(template.id);
    try {
      const hoursMap: Record<string, number> = { '1h': 1, '6h': 6, '24h': 24, '7d': 168, '30d': 720 };
      const hours = hoursMap[template.timeframe] ?? 24;
      const from = new Date(Date.now() - hours * 3600_000);
      const to = new Date();
      const { data } = await metricsCustomApi.getHistoryRange(serverId, template.metricTypes, from, to);
      const serverName = getServerName(template);

      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        toast({ title: 'No metric data available for this period', variant: 'destructive' });
        return;
      }

      if (template.format === 'CSV') {
        const lines = [`# Report: ${template.name}`, `# Generated: ${new Date().toISOString()}`, `# Server: ${serverName}`, ''];
        lines.push('timestamp,metric_type,value,unit');
        for (const [type, metrics] of Object.entries(data)) {
          for (const m of metrics) lines.push(`${m.timestamp},${type},${m.value},${m.unit ?? ''}`);
        }
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
        downloadBlob(URL.createObjectURL(blob), `${template.name}.csv`);
      } else if (template.format === 'JSON') {
        const blob = new Blob([JSON.stringify({ template, data }, null, 2)], { type: 'application/json' });
        downloadBlob(URL.createObjectURL(blob), `${template.name}.json`);
      } else if (template.format === 'EXCEL') {
        const { utils, writeFile } = await import('xlsx');
        const wb = utils.book_new();
        const summaryData = template.metricTypes.map(type => {
          const metrics = data[type] ?? [];
          const values = metrics.map(m => m.value);
          return {
            Metric: type,
            Points: metrics.length,
            Average: values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 'N/A',
            Max: values.length ? values.reduce((a, b) => Math.max(a, b)).toFixed(2) : 'N/A',
            Min: values.length ? values.reduce((a, b) => Math.min(a, b)).toFixed(2) : 'N/A',
          };
        });
        utils.book_append_sheet(wb, utils.json_to_sheet(summaryData), 'Summary');
        for (const [type, metrics] of Object.entries(data)) {
          const ws = utils.json_to_sheet(metrics.map(m => ({ Timestamp: m.timestamp, Value: m.value, Unit: m.unit ?? '' })));
          utils.book_append_sheet(wb, ws, type.slice(0, 31));
        }
        writeFile(wb, `${template.name}.xlsx`);
      } else if (template.format === 'PDF') {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(template.name, 14, 16);
        doc.setFontSize(10);
        doc.text(`Server: ${serverName}`, 14, 24);
        doc.text(`Period: ${template.timeframe}`, 14, 30);
        doc.text(`Generated: ${formatDate(new Date(), 'full')}`, 14, 36);
        let y = 46;
        for (const [type, metrics] of Object.entries(data)) {
          if (y > 260) { doc.addPage(); y = 14; }
          doc.setFontSize(12);
          doc.text(type, 14, y);
          y += 6;
          doc.setFontSize(9);
          const values = metrics.map(m => m.value);
          const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 'N/A';
          const max = values.length ? values.reduce((a, b) => Math.max(a, b)).toFixed(2) : 'N/A';
          const min = values.length ? values.reduce((a, b) => Math.min(a, b)).toFixed(2) : 'N/A';
          doc.text(`Points: ${metrics.length} | Avg: ${avg} | Max: ${max} | Min: ${min}`, 14, y);
          y += 10;
        }
        doc.save(`${template.name}.pdf`);
      }

      toast({ title: `${template.format} report generated` });
    } catch (err) {
      toast({ title: 'Generation failed', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
    } finally {
      setGeneratingId(null);
    }
  };

  const downloadBlob = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const toggleMetric = (key: string) => {
    setForm(f => ({
      ...f,
      metricTypes: f.metricTypes.includes(key)
        ? f.metricTypes.filter(m => m !== key)
        : [...f.metricTypes, key],
    }));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">Reports</h1>
            <p className="mt-1 text-muted-foreground">Create, edit, and generate metric reports</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Report Template' : 'Create Report Template'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., Weekly CPU Report"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Server</Label>
                    <Select value={form.serverId} onValueChange={v => setForm(f => ({ ...f, serverId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select server" /></SelectTrigger>
                      <SelectContent>
                        {servers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select value={form.format} onValueChange={v => setForm(f => ({ ...f, format: v as FormState['format'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSV">CSV</SelectItem>
                        <SelectItem value="EXCEL">Excel</SelectItem>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="JSON">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time Frame</Label>
                    <Select value={form.timeframe} onValueChange={v => setForm(f => ({ ...f, timeframe: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIME_FRAMES.map(tf => <SelectItem key={tf.value} value={tf.value}>{tf.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v as FormState['frequency'] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANUAL">Manual only</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Recipients (optional)</Label>
                  <Input
                    placeholder="email1@example.com, email2@example.com"
                    value={form.recipients}
                    onChange={e => setForm(f => ({ ...f, recipients: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Metrics</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {DISPLAY_METRICS.map(m => (
                      <label key={m.key} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={form.metricTypes.includes(m.key)}
                          onCheckedChange={() => toggleMetric(m.key)}
                        />
                        <span className="text-sm text-foreground">{m.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving...</> : editingId ? 'Save Changes' : 'Create Template'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-display text-lg font-medium text-foreground">No report templates</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create a template to generate reports on demand.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map(t => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-foreground">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">{getServerName(t)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {t.format}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Time frame</span>
                    <span className="text-foreground">{TIME_FRAMES.find(f => f.value === t.timeframe)?.label ?? t.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frequency</span>
                    <span className="text-foreground capitalize">{t.frequency.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Enabled</span>
                    <Switch
                      checked={t.enabled}
                      onCheckedChange={() => handleToggleEnabled(t)}
                    />
                  </div>
                  {t.lastGenerated && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last: {formatDate(t.lastGenerated, 'short')}
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-2 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    onClick={() => handleGenerate(t)}
                    disabled={generatingId === t.id}
                    className="flex-1"
                  >
                    {generatingId === t.id ? (
                      <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Generating...</>
                    ) : (
                      <><Download className="mr-1.5 h-3.5 w-3.5" />Generate</>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(t)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete template?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the "{t.name}" template.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(t.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
