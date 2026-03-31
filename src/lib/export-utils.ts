import type { Metric } from './api';

// Neutralize spreadsheet formula injection
export function csvSafe(value: unknown): string {
  const str = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(str)) return `'${str}`;
  if (str.includes('"')) return `"${str.replace(/"/g, '""')}"`;
  if (str.includes(',') || str.includes('\n')) return `"${str}"`;
  return str;
}

// Download helper
export function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export metrics as CSV
export function exportMetricsCsv(
  metrics: Record<string, Metric[]>,
  serverName: string,
  timeRange: string
): void {
  const lines = [`# Server: ${csvSafe(serverName)}`, `# Time Range: ${timeRange}`, `# Generated: ${new Date().toISOString()}`, ''];
  lines.push('timestamp,metric_type,value,unit');
  for (const [type, data] of Object.entries(metrics)) {
    for (const m of data) {
      lines.push([csvSafe(m.timestamp), csvSafe(type), csvSafe(m.value), csvSafe(m.unit ?? '')].join(','));
    }
  }
  downloadFile(lines.join('\n'), `metrics-${serverName}-${timeRange}.csv`, 'text/csv;charset=utf-8;');
}

// Export metrics as JSON (with metadata)
export function exportMetricsJson(
  metrics: Record<string, Metric[]>,
  serverName: string,
  timeRange: string
): void {
  const stats: Record<string, object> = {};
  for (const [type, data] of Object.entries(metrics)) {
    if (data.length === 0) continue;
    const values = data.map(m => m.value);
    stats[type] = {
      count: data.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
    };
  }
  const output = {
    export_info: { server: serverName, timeRange, generatedAt: new Date().toISOString() },
    statistics: stats,
    data: metrics,
  };
  downloadFile(JSON.stringify(output, null, 2), `metrics-${serverName}-${timeRange}.json`, 'application/json');
}

// Export metrics as Excel (xlsx) - async dynamic import
export async function exportMetricsExcel(
  metrics: Record<string, Metric[]>,
  serverName: string,
  timeRange: string
): Promise<void> {
  const { utils, writeFile } = await import('xlsx');
  const wb = utils.book_new();

  // Summary sheet
  const summaryData = Object.entries(metrics).map(([type, data]) => {
    const values = data.map(m => m.value);
    return {
      Metric: type,
      'Data Points': data.length,
      Average: values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '–',
      Maximum: values.length ? Math.max(...values).toFixed(2) : '–',
      Minimum: values.length ? Math.min(...values).toFixed(2) : '–',
    };
  });
  utils.book_append_sheet(wb, utils.json_to_sheet(summaryData), 'Summary');

  // One sheet per metric type
  for (const [type, data] of Object.entries(metrics)) {
    if (data.length === 0) continue;
    const ws = utils.json_to_sheet(data.map(m => ({
      Timestamp: m.timestamp,
      Value: m.value,
      Unit: m.unit ?? '',
    })));
    utils.book_append_sheet(wb, ws, type.slice(0, 31));
  }

  writeFile(wb, `metrics-${serverName}-${timeRange}.xlsx`);
}

// Export metrics as PDF - async dynamic import
export async function exportMetricsPdf(
  metrics: Record<string, Metric[]>,
  serverName: string,
  timeRange: string
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Metrics Report', 14, 20);
  doc.setFontSize(11);
  doc.text(`Server: ${serverName}`, 14, 30);
  doc.text(`Time Range: ${timeRange}`, 14, 37);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 48, 196, 48);

  let y = 56;
  for (const [type, data] of Object.entries(metrics)) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.text(type.replace(/_/g, ' '), 14, y);
    y += 7;
    doc.setFontSize(9);
    if (data.length === 0) {
      doc.text('No data available', 14, y);
    } else {
      const values = data.map(m => m.value);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      doc.text(`Points: ${data.length}  |  Avg: ${avg.toFixed(2)}  |  Max: ${Math.max(...values).toFixed(2)}  |  Min: ${Math.min(...values).toFixed(2)}`, 14, y);
    }
    y += 10;
  }

  doc.save(`metrics-${serverName}-${timeRange}.pdf`);
}

// Export chart as image using html2canvas
export async function exportChartImage(
  element: HTMLElement,
  filename: string,
  format: 'png' | 'jpg' = 'png'
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const url = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.95 : undefined);
  downloadFile(url, `${filename}.${format}`, '');
}
