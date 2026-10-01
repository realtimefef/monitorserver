# NodeVigil

We are building an AI-powered cloud monitoring and auto-alert platform with automated AI remediation. Production reliability depends on uninterrupted access to frontier models, supported by suitable capacity, monitoring, retries, and fallback strategies.

NodeVigil is for DevOps teams, SaaS startups, and platform engineers. A lightweight agent reports CPU, memory,
disk, and network metrics every five seconds, streams them to your dashboard over WebSocket, and
fires alerts the moment a threshold is crossed. AI-assisted detection and remediation are planned (see below).

> **Testing phase.** The NodeVigil website is currently in testing and access is limited to selected partners.
> To request access, contact [support@nodevigil.cloud](mailto:support@nodevigil.cloud).

## Available today and planned

| Status | Capability |
| --- | --- |
| Available | Real-time CPU, memory, disk, network, load, process, and uptime metrics from a lightweight Bash or PowerShell agent |
| Available | Per-server threshold alert rules (INFO, WARNING, CRITICAL), email and webhook notifications (Slack, Discord, generic) |
| Available | Live dashboard, metric history, data export, scheduled reports, maintenance windows, API keys, bulk import |
| Planned | AI-assisted anomaly detection |
| Planned | Alert correlation |
| Planned | Incident summaries |
| Planned | Policy-controlled remediation, with human approval for consequential changes and audit logging |
| Planned | Integrations: Azure AI Foundry, Azure gateway services, VM and vCPU workloads, supported GPU compute, Azure Monitor and Log Analytics |

Planned items are in development and not yet available. NodeVigil does not promise uninterrupted service. See the
[product overview](docs/PRODUCT_OVERVIEW.md) for details.

## Highlights (available today)

- **Live metrics** - CPU, memory, disk, and network updated every 5 seconds.
- **Lightweight agent** - a single Bash or PowerShell script, under 5 KB, no daemons or sidecars.
- **Custom alert rules** - per-server thresholds with INFO, WARNING, and CRITICAL severities.
- **Real-time dashboard** - metrics pushed over WebSocket and STOMP, no polling.
- **Secure by design** - JWT authentication, per-user data isolation, scoped agent keys.

## Contact

- Email: [support@nodevigil.cloud](mailto:support@nodevigil.cloud)
- CEO: Davinosia Pahilanipa, [davinosia.pahilanipa@nodevigil.cloud](mailto:davinosia.pahilanipa@nodevigil.cloud)
- Address: 5 Grenfell Liwene Rd, Apt 5, Didsbury, Manchester, M20 6TG, United Kingdom

## Running locally

```sh
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Building for production

```sh
npm run build
```

The production build is written to the `dist/` folder.

## Tech stack

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS

## Project layout

| Path | Purpose |
| --- | --- |
| `src/pages` | Route-level pages, including the marketing site and dashboard |
| `src/components` | Shared UI components and layout shell |
| `src/contexts` | Authentication and theme providers |
| `backend` | API service |
| `agent` | Metric collection agent scripts |
