import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  FilePlus2,
  ArrowLeft,
  Server,
  HardDrive,
  AlertTriangle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { serversApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 500;
const MAX_FIELD_LENGTH = 255;

type RowStatus = 'pending' | 'importing' | 'success' | 'error';

interface ImportRow {
  name: string;
  hostAddress: string;
  operatingSystem: string;
  description?: string;
  status: RowStatus;
  error?: string;
}

const COLUMN_ALIASES: Record<string, string> = {
  name: 'name',
  'server name': 'name',
  host: 'hostAddress',
  ip: 'hostAddress',
  address: 'hostAddress',
  'host address': 'hostAddress',
  os: 'operatingSystem',
  'operating system': 'operatingSystem',
  description: 'description',
  notes: 'description',
};

function parseCSV(raw: string): ImportRow[] {
  // Strip BOM if present
  const text = raw.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  // Parse quoted fields
  const parseLine = (line: string): string[] => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current);
    return fields;
  };

  const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
  const colMap: Record<number, string> = {};
  headers.forEach((h, i) => {
    const canonical = COLUMN_ALIASES[h];
    if (canonical) colMap[i] = canonical;
  });

  return lines.slice(1, MAX_ROWS + 1).map(line => {
    const cells = parseLine(line);
    const row: Record<string, string> & { status: RowStatus } = { status: 'pending' } as any;
    Object.entries(colMap).forEach(([idx, key]) => {
      row[key] = (cells[Number(idx)] ?? '').trim().slice(0, MAX_FIELD_LENGTH);
    });
    return row as unknown as ImportRow;
  }).filter(r => r.name || r.hostAddress);
}

function downloadTemplate() {
  const csv = 'name,host address,os,description\nMy Server,192.168.1.10,Linux,Production web server\nDB Server,10.0.0.5,Linux,Database host\n';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'servers-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function BulkImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: 'File too large', description: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`, variant: 'destructive' });
      return;
    }
    if (file.type && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      toast({ title: 'Invalid file type', description: 'Please upload a CSV file.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        toast({ title: 'No rows found', description: 'The CSV file has no valid data rows.', variant: 'destructive' });
        return;
      }
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) handleFile(file);
  };

  const runImport = async () => {
    if (rows.length === 0) return;
    setIsImporting(true);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.status === 'success') continue;

      if (!row.name?.trim() || !row.hostAddress?.trim()) {
        setRows(prev => prev.map((r, idx) =>
          idx === i ? { ...r, status: 'error', error: 'Name and host address are required' } : r
        ));
        continue;
      }

      setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'importing' } : r));

      try {
        await serversApi.create({
          name: row.name.trim(),
          hostAddress: row.hostAddress.trim(),
          operatingSystem: row.operatingSystem?.trim() || 'Linux',
          description: row.description?.trim(),
        });
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'success' } : r));
      } catch (err) {
        setRows(prev => prev.map((r, idx) =>
          idx === i ? { ...r, status: 'error', error: err instanceof Error ? err.message : 'Failed' } : r
        ));
      }
    }

    setIsImporting(false);
  };

  const successCount = rows.filter(r => r.status === 'success').length;
  const errorCount = rows.filter(r => r.status === 'error').length;
  const pendingCount = rows.filter(r => r.status === 'pending').length;
  const totalProcessed = successCount + errorCount;
  const progressPct = rows.length > 0 ? Math.round((totalProcessed / rows.length) * 100) : 0;

  return (
    <MainLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Navigation & title */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/servers">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg shadow-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-primary" />
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Server Fleet Import</h1>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Provision multiple servers from a single CSV file — up to {MAX_ROWS} at a time
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={downloadTemplate}>
            <Download className="h-4 w-4" />
            CSV Template
          </Button>
        </div>

        {rows.length === 0 ? (
          /* Upload area */
          <div className="grid gap-6 md:grid-cols-3">
            {/* Drop zone — spans 2 cols */}
            <div
              className={cn(
                'md:col-span-2 relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer group',
                isDragging
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : 'border-border bg-gradient-to-b from-card to-muted/20 hover:border-primary/60 hover:shadow-md'
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Upload className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Drag & drop your CSV
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                or click anywhere in this area to browse files
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground shadow-sm">
                <FilePlus2 className="h-3.5 w-3.5" />
                CSV up to {MAX_FILE_SIZE / 1024 / 1024} MB
              </div>
            </div>

            {/* Side info card */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Expected Columns</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { col: 'name', hint: 'Server display name', required: true },
                  { col: 'host / ip', hint: 'Hostname or IP address', required: true },
                  { col: 'os', hint: 'Operating system', required: false },
                  { col: 'description', hint: 'Optional notes', required: false },
                ].map(({ col, hint, required }) => (
                  <li key={col} className="flex items-start gap-2">
                    <span className={cn(
                      'mt-0.5 inline-block h-2 w-2 rounded-full shrink-0',
                      required ? 'bg-primary' : 'bg-muted-foreground/30'
                    )} />
                    <div>
                      <span className="font-mono text-xs text-foreground">{col}</span>
                      {required && <span className="ml-1 text-[10px] text-primary font-medium">REQ</span>}
                      <p className="text-xs text-muted-foreground leading-tight">{hint}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Column headers are flexible — we recognize aliases like <span className="font-mono">address</span>, <span className="font-mono">operating system</span>, <span className="font-mono">notes</span>, etc.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Import workspace */
          <div className="space-y-5">
            {/* Progress & controls */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {/* Progress bar */}
              {isImporting && (
                <div className="h-1 bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(progressPct, 2)}%` }}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
                {/* Stat pills */}
                <div className="flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">{rows.length}</span>
                  <span className="text-muted-foreground">total</span>
                </div>

                {pendingCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/40" />
                    <span className="font-semibold text-foreground">{pendingCount}</span>
                    <span className="text-muted-foreground">queued</span>
                  </div>
                )}

                {successCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-foreground">{successCount}</span>
                    <span className="text-muted-foreground">done</span>
                  </div>
                )}

                {errorCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold text-foreground">{errorCount}</span>
                    <span className="text-muted-foreground">failed</span>
                  </div>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {errorCount > 0 && !isImporting && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setRows(prev => prev.map(r => r.status === 'error' ? { ...r, status: 'pending', error: undefined } : r));
                      }}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retry Failed
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setRows([])} disabled={isImporting}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 min-w-[140px]"
                    onClick={runImport}
                    disabled={isImporting || pendingCount === 0}
                  >
                    {isImporting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Processing…</>
                    ) : pendingCount === 0 ? (
                      <><CheckCircle2 className="h-4 w-4" />All Done</>
                    ) : (
                      <><Upload className="h-4 w-4" />Import {pendingCount} Server{pendingCount !== 1 ? 's' : ''}</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Data table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="w-12 px-4 py-3 text-center text-[11px] font-semibold text-muted-foreground tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground tracking-wider">SERVER NAME</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground tracking-wider">HOST / IP</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground tracking-wider">PLATFORM</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground tracking-wider">NOTES</th>
                      <th className="w-20 px-4 py-3 text-center text-[11px] font-semibold text-muted-foreground tracking-wider">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={cn(
                          'transition-colors duration-150',
                          row.status === 'success' && 'bg-emerald-500/5',
                          row.status === 'error' && 'bg-amber-500/5',
                          row.status === 'importing' && 'bg-primary/5',
                        )}
                      >
                        <td className="px-4 py-2.5 text-center text-xs text-muted-foreground tabular-nums">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground">
                          {row.name || <span className="text-destructive text-xs italic">Required</span>}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                          {row.hostAddress || <span className="text-destructive italic">Required</span>}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.operatingSystem || 'Linux'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground max-w-[200px] truncate">{row.description || '—'}</td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {row.status === 'pending' && <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30" />}
                            {row.status === 'importing' && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                            {row.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                            {row.status === 'error' && (
                              <span className="group relative">
                                <XCircle className="h-3.5 w-3.5 text-amber-500 cursor-help" />
                                {row.error && (
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-popover text-popover-foreground border border-border px-2 py-1 text-[10px] shadow-md z-10">
                                    {row.error}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
