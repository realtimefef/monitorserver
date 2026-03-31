import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  auth: boolean;
  description: string;
}

interface EndpointGroup {
  title: string;
  id: string;
  endpoints: Endpoint[];
}

const endpointGroups: EndpointGroup[] = [
  {
    title: 'Authentication',
    id: 'auth',
    endpoints: [
      { method: 'POST', path: '/auth/login', auth: false, description: 'Authenticate with email and password. Returns a JWT token and user object.' },
      { method: 'POST', path: '/auth/register', auth: false, description: 'Register a new user account. Sends a verification email.' },
      { method: 'POST', path: '/auth/forgot-password', auth: false, description: 'Request a password reset link sent to the provided email address.' },
      { method: 'POST', path: '/auth/reset-password', auth: false, description: 'Reset password using the token received from the forgot-password email.' },
      { method: 'GET', path: '/auth/verify', auth: false, description: 'Verify a user\'s email address using the token from the verification email.' },
      { method: 'POST', path: '/auth/change-password', auth: true, description: 'Change the current user\'s password. Requires current password and new password.' },
      { method: 'DELETE', path: '/auth/account', auth: true, description: 'Permanently delete the authenticated user\'s account and all associated data.' },
    ],
  },
  {
    title: 'Servers',
    id: 'servers',
    endpoints: [
      { method: 'GET', path: '/servers', auth: true, description: 'List all servers belonging to the authenticated user.' },
      { method: 'POST', path: '/servers', auth: true, description: 'Register a new server. Returns the server record including the generated agent key.' },
      { method: 'GET', path: '/servers/:id', auth: true, description: 'Get a single server by ID, including the latest metric values.' },
      { method: 'PUT', path: '/servers/:id', auth: true, description: 'Update a server\'s name, host address, OS, or description.' },
      { method: 'DELETE', path: '/servers/:id', auth: true, description: 'Delete a server and cascade-delete all metrics, alerts, and alert rules for that server.' },
      { method: 'POST', path: '/servers/:id/regenerate-key', auth: true, description: 'Regenerate the agent key for a server. The old key is immediately invalidated.' },
    ],
  },
  {
    title: 'Metrics',
    id: 'metrics',
    endpoints: [
      { method: 'GET', path: '/servers/:id/metrics?type=&start=&end=', auth: true, description: 'Retrieve historical metric data for a server. Query params: type (metric type), start and end (ISO 8601 timestamps for the time range).' },
      { method: 'GET', path: '/servers/:id/metrics/latest?type=', auth: true, description: 'Get the most recent metric value(s) for a server. Optionally filter by metric type.' },
    ],
  },
  {
    title: 'Alerts',
    id: 'alerts',
    endpoints: [
      { method: 'GET', path: '/alerts', auth: true, description: 'List all active alerts for the authenticated user. Supports optional query param serverId to filter by server.' },
      { method: 'GET', path: '/alerts/resolved', auth: true, description: 'List all resolved alerts. Supports optional query param serverId.' },
      { method: 'POST', path: '/alerts/:id/acknowledge', auth: true, description: 'Acknowledge an alert. Sets status to ACKNOWLEDGED with the current timestamp.' },
      { method: 'POST', path: '/alerts/:id/resolve', auth: true, description: 'Resolve an alert. Sets status to RESOLVED with the current timestamp.' },
    ],
  },
  {
    title: 'Alert Rules',
    id: 'alert-rules',
    endpoints: [
      { method: 'GET', path: '/alerts/rules?serverId=', auth: true, description: 'List alert rules. Optionally filter by serverId to get rules for a specific server.' },
      { method: 'POST', path: '/alerts/rules', auth: true, description: 'Create a new alert rule with metric type, operator, threshold, severity, duration, and cooldown.' },
      { method: 'PUT', path: '/alerts/rules/:id', auth: true, description: 'Update an existing alert rule\'s configuration (threshold, severity, operator, duration, cooldown, etc.).' },
      { method: 'DELETE', path: '/alerts/rules/:id', auth: true, description: 'Delete an alert rule permanently.' },
      { method: 'POST', path: '/alerts/rules/:id/toggle', auth: true, description: 'Toggle a rule\'s enabled/disabled state without deleting it.' },
    ],
  },
  {
    title: 'Metric Ingestion (Agent)',
    id: 'ingest',
    endpoints: [
      { method: 'POST', path: '/metrics/ingest', auth: false, description: 'Submit metric data from an agent. No JWT required — authentication is via the agent_key field in the request body. Accepts a JSON array of metric objects.' },
    ],
  },
];

const metricTypes = [
  { type: 'CPU_USAGE', unit: '%', description: 'CPU utilization as a percentage (0–100)' },
  { type: 'MEMORY_USAGE', unit: '%', description: 'Memory used as a percentage of total RAM' },
  { type: 'MEMORY_TOTAL', unit: 'MB', description: 'Total installed RAM in megabytes' },
  { type: 'MEMORY_AVAILABLE', unit: 'MB', description: 'Available (free + reclaimable) RAM in megabytes' },
  { type: 'DISK_USAGE', unit: '%', description: 'Root disk used as a percentage of total disk size' },
  { type: 'DISK_TOTAL', unit: 'GB', description: 'Total root disk size in gigabytes' },
  { type: 'DISK_AVAILABLE', unit: 'GB', description: 'Available root disk space in gigabytes' },
  { type: 'NETWORK_IN', unit: 'B/s', description: 'Inbound network throughput in bytes per second' },
  { type: 'NETWORK_OUT', unit: 'B/s', description: 'Outbound network throughput in bytes per second' },
  { type: 'LOAD_AVERAGE', unit: '', description: '1-minute system load average (Unix load)' },
  { type: 'PROCESS_COUNT', unit: '', description: 'Number of running processes on the system' },
  { type: 'UPTIME', unit: 'seconds', description: 'System uptime in seconds since last boot' },
];

function methodColor(method: string) {
  switch (method) {
    case 'GET':    return 'bg-blue-500/10 text-blue-500';
    case 'POST':   return 'bg-green-500/10 text-green-500';
    case 'PUT':    return 'bg-amber-500/10 text-amber-500';
    case 'PATCH':  return 'bg-amber-500/10 text-amber-500';
    case 'DELETE': return 'bg-destructive/10 text-destructive';
    default:       return 'bg-muted text-muted-foreground';
  }
}

export default function APIReference() {
  return (
    <article className="space-y-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/docs" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Docs
          </Link>
          <span className="text-muted-foreground">›</span>
          <span className="text-foreground">API Reference</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">API Reference</h1>
        <p className="text-muted-foreground">
          Complete reference for the Monitor Server REST API. The backend is a custom Spring Boot
          application. All endpoints use JSON. Authenticated endpoints require a Bearer token in the
          Authorization header.
        </p>
      </header>

      {/* Base URL */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Base URL</h2>
        <pre className="rounded-lg bg-muted px-4 py-3 text-sm overflow-x-auto">
          <code>https://api.monitorserver.io</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          Configure the base URL for your own deployment in{' '}
          <Link to="/settings" className="text-primary hover:underline">Settings</Link>{' '}
          or via the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">VITE_API_BASE_URL</code> environment variable.
        </p>
      </section>

      {/* Authentication header */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Authentication</h2>
        <p className="text-sm text-muted-foreground">
          Authenticated endpoints require a JWT bearer token obtained from{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">POST /auth/login</code>.
          Include the token in the Authorization header:
        </p>
        <pre className="rounded-lg bg-muted px-4 py-3 text-sm overflow-x-auto">
          <code>Authorization: Bearer &lt;your-jwt-token&gt;</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          The metric ingestion endpoint (<code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">POST /metrics/ingest</code>)
          does not use bearer auth — it uses the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">agent_key</code> field
          in the request body instead.
        </p>
      </section>

      {/* Endpoint groups */}
      {endpointGroups.map(group => (
        <section key={group.id} id={group.id} className="space-y-4 scroll-mt-24">
          <h2 className="font-display text-xl font-semibold text-foreground">{group.title}</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wide w-20">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wide">
                    Path
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wide w-20">
                    Auth
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wide">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {group.endpoints.map((ep, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-mono font-bold ${methodColor(ep.method)}`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground break-all">
                      {ep.path}
                    </td>
                    <td className="px-4 py-3">
                      {ep.auth ? (
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                          JWT
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium">
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{ep.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* Metric ingest payload example */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Ingest Payload Example</h2>
        <p className="text-sm text-muted-foreground">
          The agent sends a JSON array of metric objects to{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">POST /metrics/ingest</code>.
          Each object must include <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">agent_key</code>,{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">metric_type</code>, and{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">value</code>:
        </p>
        <pre className="rounded-lg bg-muted px-4 py-3 text-sm overflow-x-auto">
          <code>{`curl -X POST 'https://api.monitorserver.io/metrics/ingest' \\
  -H 'Content-Type: application/json' \\
  -d '[
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "CPU_USAGE",        "value": 42.3  },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "MEMORY_USAGE",     "value": 67.1  },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "MEMORY_TOTAL",     "value": 8192  },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "MEMORY_AVAILABLE", "value": 2700  },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "DISK_USAGE",       "value": 54.0  },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "DISK_TOTAL",       "value": 500   },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "DISK_AVAILABLE",   "value": 230   },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "NETWORK_IN",       "value": 15360 },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "NETWORK_OUT",      "value": 8192  },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "LOAD_AVERAGE",     "value": 1.25  },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "PROCESS_COUNT",    "value": 143   },
    { "agent_key": "monitor-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "metric_type": "UPTIME",           "value": 86400 }
  ]'`}</code>
        </pre>
        <p className="text-sm text-muted-foreground">
          The server responds with <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">200 OK</code> on
          success. A <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">401</code> indicates an
          invalid or missing agent key.
        </p>
      </section>

      {/* Metric types table */}
      <section className="space-y-4" id="metric-types">
        <h2 className="font-display text-xl font-semibold text-foreground">Metric Types Reference</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  metric_type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Unit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {metricTypes.map(m => (
                <tr key={m.type} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{m.type}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                    {m.unit || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Link to="/docs/core-features" className="text-sm text-primary hover:underline">
          ← Core Features
        </Link>
        <Link to="/docs/security" className="text-sm text-primary hover:underline">
          Security &amp; Compliance →
        </Link>
      </div>
    </article>
  );
}
