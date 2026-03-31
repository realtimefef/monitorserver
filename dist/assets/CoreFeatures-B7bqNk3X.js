import{j as e}from"./vendor-query-B3_EaVO5.js";import{L as r}from"./vendor-react-7tr2a94F.js";import{A as a}from"./arrow-left-DUR_eGs0.js";import{C as s}from"./chevron-right-BsCSE-8H.js";import"./index-BIy1Qyhm.js";import"./vendor-charts-CKBrSVQ9.js";const o=[{id:"realtime-monitoring",title:"1. Real-time Monitoring Dashboard",content:`The Dashboard gives you an at-a-glance view of your entire server fleet. Key elements include:

- Fleet summary bar: total servers, online/offline count, and active alert count.
- Active alerts panel: the most recent unresolved alerts across all servers, with quick links to acknowledge or resolve.
- CPU history chart: aggregate CPU usage across all your servers over the last hour.
- Quick-access links: jump directly to Servers, Alert Rules, History, or add a new server.

The Server Detail page provides a deeper view for a single server with 8 live metric cards (CPU, Memory, Disk, Load Average, Network In/Out, Process Count, Uptime), five real-time line charts with switchable chart types (line, area, bar) and color themes, a memory/disk breakdown panel, and the server's active alerts list.

Data is fetched by polling the REST API at regular intervals (configurable) so the dashboard stays current without requiring a WebSocket connection.`},{id:"multi-server",title:"2. Multi-Server Management",content:`Monitor Server is designed to handle fleets of any size:

- The Servers page lists all your registered servers with status indicators (ONLINE/OFFLINE), last-seen timestamp, and quick links to the Server Detail page or alert rules.
- Each server is isolated by user account — you only see your own servers.
- You can edit a server's name, host address, OS, or description from the Server Detail page at any time.
- Servers can be individually deleted (with cascade deletion of all associated metrics, alerts, and rules), or imported in bulk via CSV.
- Each server has its own unique agent key for secure metric ingestion.`},{id:"alert-rules",title:"3. Threshold-based Alert Rules",content:`Alert rules let you define automated conditions that trigger alerts when metric values cross a threshold.

Each rule contains:
- Server — which server the rule applies to.
- Metric Type — one of the 12 supported metric types (CPU_USAGE, MEMORY_USAGE, DISK_USAGE, etc.).
- Operator — greater than (>), less than (<), greater-than-or-equal (>=), less-than-or-equal (<=), or equal (==).
- Threshold — the numeric value to compare against.
- Severity — INFO, WARNING, or CRITICAL.
- Duration (optional) — the number of seconds the condition must be continuously true before an alert fires. Useful for avoiding false positives from transient spikes.
- Cooldown — the minimum number of minutes that must elapse before the same rule can fire again.
- Enabled toggle — quickly enable or disable a rule without deleting it.

Built-in rule templates are available for the most common scenarios: High CPU (>90%), Low Available Memory (<10%), Critical Disk Usage (>95%), High Load Average, and more. Apply a template with one click and adjust the threshold as needed.`},{id:"alert-management",title:"4. Alert Management",content:`The Alerts page is your incident management hub. Features include:

- View active alerts and resolved alerts in separate tabs.
- Filter by server, severity (INFO/WARNING/CRITICAL), and status (ACTIVE/ACKNOWLEDGED/RESOLVED).
- Search alerts by server name or metric type.
- Acknowledge an alert individually or select multiple alerts for bulk acknowledgement.
- Resolve an alert individually or in bulk — resolved alerts move to the Resolved tab.
- Export all currently visible alerts to CSV for reporting or external ticketing systems.

An ACKNOWLEDGED alert means someone has seen it; a RESOLVED alert means the underlying issue has been addressed. Both transitions are tracked with a timestamp.`},{id:"history-export",title:"5. Historical Metrics & Data Export",content:`The History page provides time-series charts for any server and time range. You can:

- Select any registered server from the dropdown.
- Choose a preset time range: Last 1 Hour, 6 Hours, 24 Hours, 7 Days, 30 Days — or pick a custom date range using the calendar picker.
- Switch between metric categories: CPU, Memory, Disk, or Network.
- Toggle between chart types: Line, Area, or Bar.
- Enable Overlay mode to display all selected metrics on a single chart for side-by-side comparison.
- Export data in multiple formats:
  - CSV — raw data table, importable into Excel or any analytics tool.
  - JSON — structured data for programmatic use.
  - Excel (.xlsx) — formatted spreadsheet.
  - PDF — printable report with embedded chart.
  - PNG / JPG — chart image download.

Data is retained for as long as your account exists. See the`,link:{label:"History page",to:"/history"},contentAfterLink:" to access your historical data."},{id:"scheduled-reports",title:"6. Scheduled Reports",content:`Scheduled Reports let you define reusable report templates. Each template specifies:

- Server — which server to report on.
- Metrics — which metric types to include.
- Time frame — how far back the report covers (e.g. last 24 hours, last 7 days).
- Format — PDF, CSV, or Excel.

Once a template is created, click "Generate" to instantly download a report with the latest data matching that template. Reports are assembled entirely in the browser with no server-side processing required.

Use templates to standardize weekly infrastructure summaries, share with team members, or archive alongside incidents.`},{id:"bulk-import",title:"7. Bulk Server Import (CSV)",content:`Register many servers at once using the Bulk Import feature. Navigate to Servers → Bulk Import and upload a CSV file.

Required CSV columns:
- name — display name for the server (e.g. "web-prod-01")
- host — IP address or hostname (e.g. "192.168.1.10" or "db.example.com")
- os — operating system string (e.g. "Linux", "Windows")

Optional column:
- description — free-text description

A CSV template is available to download from the Bulk Import page so you start with the correct format. The import runs sequentially and displays per-row status (success, skipped, or error with the reason). After import, each successfully registered server gets its own agent key, visible in the results table and on the Server Detail page.`},{id:"role-based-navigation",title:"8. Role-based Navigation",content:`Monitor Server supports user roles that influence navigation and available actions:

- Admin — full access to all pages and management functions, including account deletion and server bulk operations.
- User — standard access to their own servers, metrics, alerts, history, and reports.

The sidebar and navbar adapt based on the authenticated user's role. Role is encoded in the JWT token issued at login and decoded client-side to conditionally render navigation items and action buttons.

Role assignment is managed by the backend. By default, newly registered users receive the "User" role.`},{id:"dark-light-theme",title:"9. Dark/Light Theme",content:`Monitor Server supports both dark and light color themes. Toggle between them using the theme button in the top navigation bar, or via the command palette (Ctrl+K → "Toggle theme").

Your theme preference is persisted in local storage so it is remembered across sessions. The theme applies to all pages — dashboard, docs, public pages, and modals.

The color system is built on CSS custom properties (Tailwind CSS + shadcn/ui design tokens), ensuring consistent contrast and readability in both modes.`}];function h(){return e.jsxs("article",{className:"space-y-10",children:[e.jsxs("header",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm text-muted-foreground mb-2",children:[e.jsxs(r,{to:"/docs",className:"hover:text-foreground transition-colors inline-flex items-center gap-1",children:[e.jsx(a,{className:"h-3.5 w-3.5"})," Docs"]}),e.jsx("span",{className:"text-muted-foreground",children:"›"}),e.jsx("span",{className:"text-foreground",children:"Core Features"})]}),e.jsx("h1",{className:"font-display text-3xl font-bold text-foreground",children:"Core Features"}),e.jsx("p",{className:"text-muted-foreground",children:"A complete overview of everything Monitor Server can do."})]}),e.jsx("div",{className:"space-y-6",children:o.map(t=>e.jsxs("div",{id:t.id,className:"rounded-xl border border-border bg-card p-6 space-y-3 scroll-mt-24",children:[e.jsx("h2",{className:"font-display text-lg font-semibold text-foreground",children:t.title}),e.jsxs("p",{className:"text-sm text-muted-foreground leading-relaxed whitespace-pre-line",children:[t.content,t.link&&e.jsxs(e.Fragment,{children:[e.jsx(r,{to:t.link.to,className:"text-primary hover:underline",children:t.link.label}),t.contentAfterLink]})]})]},t.id))}),e.jsxs("div",{className:"flex items-center justify-between pt-6 border-t border-border",children:[e.jsx(r,{to:"/docs/getting-started",className:"text-sm text-primary hover:underline",children:"← Getting Started"}),e.jsxs(r,{to:"/docs/api-reference",className:"flex items-center gap-1 text-sm text-primary hover:underline",children:["API Reference ",e.jsx(s,{className:"h-3.5 w-3.5"})]})]})]})}export{h as default};
