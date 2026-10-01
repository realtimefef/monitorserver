import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

type Status = 'Available' | 'Planned';

function StatusPill({ status }: { status: Status }) {
  const styles =
    status === 'Available'
      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      : 'bg-violet-500/10 text-violet-500 border-violet-500/20';
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles}`}>
      {status}
    </span>
  );
}

const available = [
  'Real-time CPU, memory, disk, network, load, process, and uptime metrics from a lightweight Bash or PowerShell agent',
  'Threshold alert rules per server and metric, with INFO, WARNING, and CRITICAL severities, duration, and cooldown',
  'Email notifications and webhook notifications (Slack, Discord, generic)',
  'Live dashboard, metric history, data export, and scheduled reports',
  'Maintenance windows, API keys, bulk server import, and per-user data isolation',
];

const aiCapabilities = [
  {
    title: 'AI-assisted anomaly detection',
    desc: 'Learns each server\'s normal behaviour and flags unusual patterns before a static threshold is crossed.',
  },
  {
    title: 'Alert correlation',
    desc: 'Groups related alerts across servers and services into a single incident to reduce notification noise.',
  },
  {
    title: 'Incident summaries',
    desc: 'Plain-language summaries of what changed, what is affected, and what was tried.',
  },
  {
    title: 'Policy-controlled remediation',
    desc: 'Automated actions that run only inside policies you define. Consequential changes require human approval.',
  },
];

const safeguards = [
  { title: 'Human approval', desc: 'Consequential changes need explicit approval from an authorised person before they run.' },
  { title: 'Policy controls', desc: 'You define which actions are allowed, on which servers, and under what conditions.' },
  { title: 'Audit logging', desc: 'Every AI recommendation, approval, and action is recorded so it can be reviewed later.' },
];

const integrations: { name: string; purpose: string; status: Status }[] = [
  { name: 'Slack, Discord, and generic webhooks', purpose: 'Alert notifications', status: 'Available' },
  { name: 'Azure AI Foundry', purpose: 'Frontier model access for detection, correlation, and summaries', status: 'Planned' },
  { name: 'Azure gateway services', purpose: 'Gateway layer in front of model endpoints for routing, capacity management, and fallback', status: 'Planned' },
  { name: 'VM and vCPU workloads', purpose: 'Visibility into VM and vCPU-based workloads and the capacity the platform depends on', status: 'Planned' },
  { name: 'Supported GPU compute', purpose: 'GPU-backed compute for model training and inference, where supported', status: 'Planned' },
  { name: 'Azure Monitor and Log Analytics', purpose: 'Platform metrics and logs to enrich detection and correlation', status: 'Planned' },
];

export default function ProductOverview() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/docs" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Docs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Product Overview</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Product Overview</h1>
        <p className="text-muted-foreground">
          What NodeVigil is, what is available today, and what is planned.
        </p>
      </header>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-2">
        <h2 className="font-display text-lg font-semibold text-foreground">What NodeVigil is</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We are building an AI-powered cloud monitoring and auto-alert platform with automated AI remediation.
          Production reliability depends on uninterrupted access to frontier models, supported by suitable capacity,
          monitoring, retries, and fallback strategies.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Available today</h2>
          <StatusPill status="Available" />
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground leading-relaxed">
          {available.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-foreground">AI capabilities</h2>
          <StatusPill status="Planned" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These capabilities are in development and are not yet available.
        </p>
        <dl className="space-y-3">
          {aiCapabilities.map((item) => (
            <div key={item.title}>
              <dt className="text-sm font-semibold text-foreground">{item.title}</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">{item.desc}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Safeguards for remediation</h2>
          <StatusPill status="Planned" />
        </div>
        <dl className="space-y-3">
          {safeguards.map((item) => (
            <div key={item.title}>
              <dt className="text-sm font-semibold text-foreground">{item.title}</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">{item.desc}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Reliability of AI access</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Production reliability depends on uninterrupted access to frontier models. The plan is to support it with
          suitable capacity, monitoring of model access, retries, and fallback strategies. No cloud or model service
          can promise uninterrupted availability, and NodeVigil does not promise uninterrupted service.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Integrations</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Azure and GPU integrations are planned and not generally available. Availability will depend on partner
          testing, capacity, and quotas.
        </p>
        <ul className="divide-y divide-border">
          {integrations.map((item) => (
            <li key={item.name} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{item.name}</div>
                <div className="text-sm text-muted-foreground">{item.purpose}</div>
              </div>
              <StatusPill status={item.status} />
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Access and contact</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This website is currently in testing and access is limited to selected partners. To request access, contact
          us at{' '}
          <a href="mailto:support@nodevigil.cloud" className="text-primary hover:underline">support@nodevigil.cloud</a>.
        </p>
        <address className="text-sm not-italic text-muted-foreground leading-relaxed">
          NodeVigil, 5 Grenfell Liwene Rd, Apt 5, Didsbury, Manchester, M20 6TG, United Kingdom
        </address>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Link to="/docs" className="text-sm text-primary hover:underline">← Documentation</Link>
        <Link to="/docs/getting-started" className="flex items-center gap-1 text-sm text-primary hover:underline">
          Getting Started <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
