import{j as e}from"./vendor-query-B3_EaVO5.js";import{L as t}from"./vendor-react-7tr2a94F.js";import{C as s}from"./chevron-right-CeMFdbaY.js";import"./index-CS5aM8Lx.js";import"./vendor-charts-DsZZkpFU.js";function l(){return e.jsxs("article",{className:"space-y-10",children:[e.jsxs("header",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm text-muted-foreground mb-2",children:[e.jsx(t,{to:"/docs",className:"hover:text-foreground transition-colors",children:"Docs"}),e.jsx(s,{className:"h-3.5 w-3.5"}),e.jsx("span",{className:"text-foreground",children:"Getting Started"})]}),e.jsx("h1",{className:"font-display text-3xl font-bold text-foreground",children:"Getting Started"}),e.jsx("p",{className:"text-muted-foreground",children:"Set up Monitor Server, add your first server, and start collecting metrics in minutes."})]}),e.jsxs("section",{className:"space-y-4",children:[e.jsx("h2",{className:"font-display text-xl font-semibold text-foreground",children:"1. Prerequisites"}),e.jsx("p",{className:"text-muted-foreground",children:"Before you begin, make sure you have the following in place:"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"rounded-xl border border-border bg-card p-5 space-y-2",children:[e.jsx("h3",{className:"font-semibold text-foreground text-sm",children:"Frontend (React Dashboard)"}),e.jsxs("ul",{className:"space-y-1 text-sm text-muted-foreground list-disc list-inside",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Node.js 18+"})," — required to run the Vite dev server and build the app. Download from"," ",e.jsx("a",{href:"https://nodejs.org",target:"_blank",rel:"noopener noreferrer",className:"text-primary hover:underline",children:"nodejs.org"})]}),e.jsx("li",{children:"npm 9+ or pnpm (bundled with Node.js)"}),e.jsx("li",{children:"A modern browser (Chrome, Firefox, Edge, or Safari)"})]})]}),e.jsxs("div",{className:"rounded-xl border border-border bg-card p-5 space-y-2",children:[e.jsx("h3",{className:"font-semibold text-foreground text-sm",children:"Backend (REST API)"}),e.jsxs("ul",{className:"space-y-1 text-sm text-muted-foreground list-disc list-inside",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Java 21+"})," — the Monitor Server backend is a Spring Boot application."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"MySQL 8+"})," — the primary database. Create a database named"," ",e.jsx("code",{className:"bg-muted px-1.5 py-0.5 rounded text-xs font-mono",children:"monitorserver"})," ","and a dedicated user."]}),e.jsx("li",{children:"Alternatively, you can point the dashboard at an existing deployed API instance by setting the API base URL in Settings."})]})]}),e.jsxs("div",{className:"rounded-xl border border-border bg-card p-5 space-y-2",children:[e.jsx("h3",{className:"font-semibold text-foreground text-sm",children:"Target Servers (to be monitored)"}),e.jsxs("ul",{className:"space-y-1 text-sm text-muted-foreground list-disc list-inside",children:[e.jsx("li",{children:"Linux (any distro with Bash) or Windows (PowerShell 5.1+)"}),e.jsx("li",{children:"Outbound HTTPS access on port 443 to the API endpoint"})]})]})]})]}),e.jsxs("section",{className:"space-y-4",children:[e.jsx("h2",{className:"font-display text-xl font-semibold text-foreground",children:"2. Installation"}),e.jsx("p",{className:"text-muted-foreground",children:"Clone the repository and install dependencies:"}),e.jsx("pre",{className:"rounded-lg bg-muted p-4 text-sm overflow-x-auto",children:e.jsx("code",{children:`# Clone the repository
git clone https://github.com/monitorserver/monitorserver.git
cd monitorserver

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev`})}),e.jsxs("p",{className:"text-muted-foreground",children:["The dashboard will be available at"," ",e.jsx("code",{className:"bg-muted px-1.5 py-0.5 rounded text-xs font-mono",children:"http://localhost:5173"})," ","by default."]}),e.jsx("p",{className:"text-muted-foreground",children:"To build for production:"}),e.jsx("pre",{className:"rounded-lg bg-muted p-4 text-sm overflow-x-auto",children:e.jsx("code",{children:`npm run build
# Output is in the dist/ directory — serve with any static host`})})]}),e.jsxs("section",{className:"space-y-4",children:[e.jsx("h2",{className:"font-display text-xl font-semibold text-foreground",children:"3. Configuration"}),e.jsx("p",{className:"text-muted-foreground",children:"Monitor Server connects to your backend REST API. Set the API base URL in two ways:"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"rounded-xl border border-border bg-card p-5 space-y-2",children:[e.jsx("h3",{className:"font-semibold text-foreground text-sm",children:"Option A — Environment Variable (recommended for production)"}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Create a"," ",e.jsx("code",{className:"bg-muted px-1.5 py-0.5 rounded text-xs font-mono",children:".env.local"})," ","file in the project root:"]}),e.jsx("pre",{className:"rounded-lg bg-muted p-4 text-sm overflow-x-auto",children:e.jsx("code",{children:"VITE_API_BASE_URL=https://api.your-domain.com"})})]}),e.jsxs("div",{className:"rounded-xl border border-border bg-card p-5 space-y-2",children:[e.jsx("h3",{className:"font-semibold text-foreground text-sm",children:"Option B — Settings Page (runtime)"}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["After logging in, navigate to ",e.jsx(t,{to:"/settings",className:"text-primary hover:underline",children:"Settings"}),`. In the "API Configuration" section, enter your API base URL and save. This setting is persisted in your browser's local storage and takes effect immediately.`]})]})]})]}),e.jsxs("section",{className:"space-y-4",children:[e.jsx("h2",{className:"font-display text-xl font-semibold text-foreground",children:"4. Adding Your First Server"}),e.jsxs("p",{className:"text-muted-foreground",children:["Once you have an account (register at"," ",e.jsx(t,{to:"/register",className:"text-primary hover:underline",children:"/register"}),"), follow these steps:"]}),e.jsxs("ol",{className:"space-y-3 text-muted-foreground",children:[e.jsxs("li",{className:"flex gap-3",children:[e.jsx("span",{className:"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5",children:"1"}),e.jsxs("span",{children:["Navigate to ",e.jsx(t,{to:"/servers/new",className:"text-primary hover:underline",children:"Servers → Add Server"}),"."]})]}),e.jsxs("li",{className:"flex gap-3",children:[e.jsx("span",{className:"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5",children:"2"}),e.jsxs("span",{children:["Enter a ",e.jsx("strong",{children:"display name"}),` (e.g. "web-prod-01"), the server's `,e.jsx("strong",{children:"hostname or IP address"}),", and select the ",e.jsx("strong",{children:"operating system"}),"."]})]}),e.jsxs("li",{className:"flex gap-3",children:[e.jsx("span",{className:"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5",children:"3"}),e.jsxs("span",{children:["Optionally add a description, then click ",e.jsx("strong",{children:'"Register Server"'}),"."]})]}),e.jsxs("li",{className:"flex gap-3",children:[e.jsx("span",{className:"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5",children:"4"}),e.jsxs("span",{children:["The success page shows your ",e.jsx("strong",{children:"Agent Key"})," and a pre-configured agent script. Copy both — you will need them in the next step."]})]})]}),e.jsxs("div",{className:"rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-600 dark:text-amber-400",children:[e.jsx("strong",{children:"Important:"})," The agent key is shown only once after registration. Copy it immediately. If you lose it, you can regenerate a new key from the Server Detail page, but the old key will be permanently invalidated."]})]}),e.jsxs("section",{className:"space-y-4",children:[e.jsx("h2",{className:"font-display text-xl font-semibold text-foreground",children:"5. Running the Agent"}),e.jsx("h3",{className:"font-semibold text-foreground",children:"Linux / macOS (Bash)"}),e.jsx("p",{className:"text-muted-foreground",children:"Copy the generated script to your server and run it:"}),e.jsx("pre",{className:"rounded-lg bg-muted p-4 text-sm overflow-x-auto",children:e.jsx("code",{children:`#!/usr/bin/env bash
# monitor-agent.sh — Monitor Server agent script
# Set your agent key before running

export MONITOR_AGENT_KEY="your-agent-key-here"
export MONITOR_API_URL="https://api.monitorserver.io"
export INTERVAL=60   # seconds between metric pushes

while true; do
  CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
  MEM_TOTAL=$(free -m | awk '/^Mem:/{print $2}')
  MEM_AVAIL=$(free -m | awk '/^Mem:/{print $7}')
  DISK_USED=$(df / | awk 'NR==2{print $5}' | tr -d '%')
  DISK_TOTAL=$(df -BG / | awk 'NR==2{print $2}' | tr -d 'G')
  UPTIME=$(cat /proc/uptime | awk '{print int($1)}')
  LOAD=$(cat /proc/loadavg | awk '{print $1}')
  PROCS=$(ps aux | wc -l)

  curl -s -X POST "\${MONITOR_API_URL}/metrics/ingest" \\
    -H "Content-Type: application/json" \\
    -d "[
      {\\"agent_key\\":\\"\${MONITOR_AGENT_KEY}\\",\\"metric_type\\":\\"CPU_USAGE\\",\\"value\\":$CPU},
      {\\"agent_key\\":\\"\${MONITOR_AGENT_KEY}\\",\\"metric_type\\":\\"MEMORY_TOTAL\\",\\"value\\":$MEM_TOTAL},
      {\\"agent_key\\":\\"\${MONITOR_AGENT_KEY}\\",\\"metric_type\\":\\"MEMORY_AVAILABLE\\",\\"value\\":$MEM_AVAIL},
      {\\"agent_key\\":\\"\${MONITOR_AGENT_KEY}\\",\\"metric_type\\":\\"DISK_USAGE\\",\\"value\\":$DISK_USED},
      {\\"agent_key\\":\\"\${MONITOR_AGENT_KEY}\\",\\"metric_type\\":\\"DISK_TOTAL\\",\\"value\\":$DISK_TOTAL},
      {\\"agent_key\\":\\"\${MONITOR_AGENT_KEY}\\",\\"metric_type\\":\\"UPTIME\\",\\"value\\":$UPTIME},
      {\\"agent_key\\":\\"\${MONITOR_AGENT_KEY}\\",\\"metric_type\\":\\"LOAD_AVERAGE\\",\\"value\\":$LOAD},
      {\\"agent_key\\":\\"\${MONITOR_AGENT_KEY}\\",\\"metric_type\\":\\"PROCESS_COUNT\\",\\"value\\":$PROCS}
    ]"

  sleep "\${INTERVAL}"
done`})}),e.jsx("h3",{className:"font-semibold text-foreground mt-6",children:"Running as a systemd service (Linux)"}),e.jsx("p",{className:"text-muted-foreground",children:"To keep the agent running across reboots, create a systemd service unit:"}),e.jsx("pre",{className:"rounded-lg bg-muted p-4 text-sm overflow-x-auto",children:e.jsx("code",{children:`# Create the service file
sudo tee /etc/systemd/system/monitor-agent.service << 'EOF'
[Unit]
Description=Monitor Server Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=nobody
Environment="MONITOR_AGENT_KEY=your-agent-key-here"
Environment="MONITOR_API_URL=https://api.monitorserver.io"
Environment="INTERVAL=60"
ExecStart=/opt/monitor-agent.sh
Restart=on-failure
RestartSec=30
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Copy the agent script
sudo cp monitor-agent.sh /opt/monitor-agent.sh
sudo chmod +x /opt/monitor-agent.sh

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable --now monitor-agent

# Check service status
sudo systemctl status monitor-agent

# View live logs
sudo journalctl -fu monitor-agent`})}),e.jsx("h3",{className:"font-semibold text-foreground mt-6",children:"Windows (PowerShell)"}),e.jsx("p",{className:"text-muted-foreground",children:"On Windows, run the generated PowerShell script in an elevated PowerShell session:"}),e.jsx("pre",{className:"rounded-lg bg-muted p-4 text-sm overflow-x-auto",children:e.jsx("code",{children:`# Set the agent key and run the agent
$env:MONITOR_AGENT_KEY = "your-agent-key-here"
$env:MONITOR_API_URL   = "https://api.monitorserver.io"
.monitor-agent.ps1

# To run as a background Windows service, use NSSM:
# nssm install MonitorAgent "powershell.exe" "-File C:monitor-agent.ps1"
# nssm set MonitorAgent AppEnvironmentExtra MONITOR_AGENT_KEY=your-key
# nssm start MonitorAgent`})})]}),e.jsxs("section",{className:"space-y-4",children:[e.jsx("h2",{className:"font-display text-xl font-semibold text-foreground",children:"6. Verifying Metrics"}),e.jsx("p",{className:"text-muted-foreground",children:"After starting the agent, verify that metrics are being received:"}),e.jsxs("ol",{className:"space-y-3 text-muted-foreground",children:[e.jsxs("li",{className:"flex gap-3",children:[e.jsx("span",{className:"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5",children:"1"}),e.jsxs("span",{children:["Navigate to the ",e.jsx(t,{to:"/servers",className:"text-primary hover:underline",children:"Servers"})," page — your server should show a green ",e.jsx("strong",{children:"ONLINE"})," status within 60–90 seconds of the agent starting."]})]}),e.jsxs("li",{className:"flex gap-3",children:[e.jsx("span",{className:"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5",children:"2"}),e.jsxs("span",{children:["Click on the server to open the ",e.jsx("strong",{children:"Server Detail"})," page. You should see live metric cards (CPU %, Memory, Disk, etc.) populated with real values."]})]}),e.jsxs("li",{className:"flex gap-3",children:[e.jsx("span",{className:"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5",children:"3"}),e.jsx("span",{children:"The real-time charts will begin displaying data points as each metric push arrives."})]}),e.jsxs("li",{className:"flex gap-3",children:[e.jsx("span",{className:"flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5",children:"4"}),e.jsxs("span",{children:["After a few minutes, visit the ",e.jsx(t,{to:"/history",className:"text-primary hover:underline",children:"History"})," page to confirm historical data is accumulating."]})]})]}),e.jsxs("div",{className:"rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 text-sm text-blue-600 dark:text-blue-400",children:["If the server remains OFFLINE, check the"," ",e.jsx(t,{to:"/help",className:"underline",children:"Help & Support"}),' page for troubleshooting steps, specifically the "Agent not sending metrics" and "Server always shows OFFLINE" sections.']})]}),e.jsxs("div",{className:"flex items-center justify-between pt-6 border-t border-border",children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"You're all set!"}),e.jsxs(t,{to:"/docs/core-features",className:"flex items-center gap-1 text-sm text-primary hover:underline",children:["Next: Core Features ",e.jsx(s,{className:"h-3.5 w-3.5"})]})]})]})}export{l as default};
