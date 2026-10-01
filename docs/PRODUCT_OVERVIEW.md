# NodeVigil product overview

We are building an AI-powered cloud monitoring and auto-alert platform with automated AI remediation. Production reliability depends on uninterrupted access to frontier models, supported by suitable capacity, monitoring, retries, and fallback strategies.

> **Testing phase.** The NodeVigil website is currently in testing and access is limited to selected partners.
> To request access, contact [support@nodevigil.cloud](mailto:support@nodevigil.cloud).

Also available in the app at `/docs/product-overview`.

## Available today

- Real-time CPU, memory, disk, network, load, process, and uptime metrics from a lightweight Bash or PowerShell agent.
- Threshold alert rules per server and metric, with INFO, WARNING, and CRITICAL severities, duration, and cooldown.
- Email notifications and webhook notifications (Slack, Discord, generic).
- Live dashboard, metric history, data export, and scheduled reports.
- Maintenance windows, API keys, bulk server import, and per-user data isolation.

## Planned: AI capabilities

These capabilities are in development and are not yet available.

| Capability | What it will do |
| --- | --- |
| AI-assisted anomaly detection | Learns each server's normal behaviour and flags unusual patterns before a static threshold is crossed. |
| Alert correlation | Groups related alerts across servers and services into a single incident to reduce notification noise. |
| Incident summaries | Plain-language summaries of what changed, what is affected, and what was tried. |
| Policy-controlled remediation | Automated actions that run only inside policies you define. Consequential changes require human approval. |

## Planned: safeguards for remediation

- **Human approval** - consequential changes need explicit approval from an authorised person before they run.
- **Policy controls** - you define which actions are allowed, on which servers, and under what conditions.
- **Audit logging** - every AI recommendation, approval, and action is recorded so it can be reviewed later.

## Reliability of AI access

Production reliability depends on uninterrupted access to frontier models. The plan is to support it with suitable capacity, monitoring of model access, retries, and fallback strategies. No cloud or model service can promise uninterrupted availability, and NodeVigil does not promise uninterrupted service.

## Integrations

Azure and GPU integrations are planned and not generally available. Availability will depend on partner testing, capacity, and quotas.

| Integration | Purpose | Status |
| --- | --- | --- |
| Slack, Discord, and generic webhooks | Alert notifications | Available |
| Azure AI Foundry | Frontier model access for detection, correlation, and summaries | Planned |
| Azure gateway services | Gateway layer in front of model endpoints for routing, capacity management, and fallback | Planned |
| VM and vCPU workloads | Visibility into VM and vCPU-based workloads and the capacity the platform depends on | Planned |
| Supported GPU compute | GPU-backed compute for model training and inference, where supported | Planned |
| Azure Monitor and Log Analytics | Platform metrics and logs to enrich detection and correlation | Planned |

## Contact

- Email: [support@nodevigil.cloud](mailto:support@nodevigil.cloud)
- CEO: Davinosia Pahilanipa, [davinosia.pahilanipa@nodevigil.cloud](mailto:davinosia.pahilanipa@nodevigil.cloud)
- Address: 5 Grenfell Liwene Rd, Apt 5, Didsbury, Manchester, M20 6TG, United Kingdom
