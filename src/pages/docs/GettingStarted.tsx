import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function GettingStarted() {
  return (
    <article className="space-y-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Getting Started</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Getting Started</h1>
        <p className="text-muted-foreground">
          Set up Monitor Server, add your first server, and start collecting metrics in minutes.
        </p>
      </header>

      {/* 1. Prerequisites */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">1. Prerequisites</h2>
        <p className="text-muted-foreground">
          Before you begin, make sure you have the following in place:
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-foreground text-sm">Frontend (React Dashboard)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>
                <strong>Node.js 18+</strong> — required to run the Vite dev server and build the app.
                Download from{' '}
                <a
                  href="https://nodejs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  nodejs.org
                </a>
              </li>
              <li>npm 9+ or pnpm (bundled with Node.js)</li>
              <li>A modern browser (Chrome, Firefox, Edge, or Safari)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-foreground text-sm">Backend (REST API)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>
                <strong>Java 21+</strong> — the Monitor Server backend is a Spring Boot application.
              </li>
              <li>
                <strong>MySQL 8+</strong> — the primary database. Create a database named{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">monitorserver</code>{' '}
                and a dedicated user.
              </li>
              <li>
                Alternatively, you can point the dashboard at an existing deployed API instance by
                setting the API base URL in Settings.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-foreground text-sm">Target Servers (to be monitored)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Linux (any distro with Bash) or Windows (PowerShell 5.1+)</li>
              <li>Outbound HTTPS access on port 443 to the API endpoint</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Installation */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">2. Installation</h2>
        <p className="text-muted-foreground">Clone the repository and install dependencies:</p>
        <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
          <code>{`# Clone the repository
git clone https://github.com/monitorserver/monitorserver.git
cd monitorserver

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev`}</code>
        </pre>
        <p className="text-muted-foreground">
          The dashboard will be available at{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">http://localhost:5173</code>{' '}
          by default.
        </p>
        <p className="text-muted-foreground">To build for production:</p>
        <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
          <code>{`npm run build
# Output is in the dist/ directory — serve with any static host`}</code>
        </pre>
      </section>

      {/* 3. Configuration */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">3. Configuration</h2>
        <p className="text-muted-foreground">
          Monitor Server connects to your backend REST API. Set the API base URL in two ways:
        </p>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-foreground text-sm">Option A — Environment Variable (recommended for production)</h3>
            <p className="text-sm text-muted-foreground">
              Create a{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code>{' '}
              file in the project root:
            </p>
            <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
              <code>{`VITE_API_BASE_URL=https://api.your-domain.com`}</code>
            </pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-foreground text-sm">Option B — Settings Page (runtime)</h3>
            <p className="text-sm text-muted-foreground">
              After logging in, navigate to <Link to="/settings" className="text-primary hover:underline">Settings</Link>.
              In the "API Configuration" section, enter your API base URL and save. This setting is
              persisted in your browser's local storage and takes effect immediately.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Adding Your First Server */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">4. Adding Your First Server</h2>
        <p className="text-muted-foreground">
          Once you have an account (register at{' '}
          <Link to="/register" className="text-primary hover:underline">/register</Link>
          ), follow these steps:
        </p>
        <ol className="space-y-3 text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">1</span>
            <span>Navigate to <Link to="/servers/new" className="text-primary hover:underline">Servers → Add Server</Link>.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">2</span>
            <span>Enter a <strong>display name</strong> (e.g. "web-prod-01"), the server's <strong>hostname or IP address</strong>, and select the <strong>operating system</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">3</span>
            <span>Optionally add a description, then click <strong>"Register Server"</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">4</span>
            <span>The success page shows your <strong>Agent Key</strong> and a pre-configured agent script. Copy both — you will need them in the next step.</span>
          </li>
        </ol>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-600 dark:text-amber-400">
          <strong>Important:</strong> The agent key is shown only once after registration. Copy it
          immediately. If you lose it, you can regenerate a new key from the Server Detail page, but
          the old key will be permanently invalidated.
        </div>
      </section>

      {/* 5. Running the Agent */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">5. Running the Agent</h2>

        <h3 className="font-semibold text-foreground">Linux / macOS (Bash)</h3>
        <p className="text-muted-foreground">Copy the generated script to your server and run it:</p>
        <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
          <code>{`#!/usr/bin/env bash
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
done`}</code>
        </pre>

        <h3 className="font-semibold text-foreground mt-6">Running as a systemd service (Linux)</h3>
        <p className="text-muted-foreground">
          To keep the agent running across reboots, create a systemd service unit:
        </p>
        <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
          <code>{`# Create the service file
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
sudo journalctl -fu monitor-agent`}</code>
        </pre>

        <h3 className="font-semibold text-foreground mt-6">Windows (PowerShell)</h3>
        <p className="text-muted-foreground">
          On Windows, run the generated PowerShell script in an elevated PowerShell session:
        </p>
        <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
          <code>{`# Set the agent key and run the agent
$env:MONITOR_AGENT_KEY = "your-agent-key-here"
$env:MONITOR_API_URL   = "https://api.monitorserver.io"
.\monitor-agent.ps1

# To run as a background Windows service, use NSSM:
# nssm install MonitorAgent "powershell.exe" "-File C:\monitor-agent.ps1"
# nssm set MonitorAgent AppEnvironmentExtra MONITOR_AGENT_KEY=your-key
# nssm start MonitorAgent`}</code>
        </pre>
      </section>

      {/* 6. Verifying Metrics */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">6. Verifying Metrics</h2>
        <p className="text-muted-foreground">
          After starting the agent, verify that metrics are being received:
        </p>
        <ol className="space-y-3 text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">1</span>
            <span>Navigate to the <Link to="/servers" className="text-primary hover:underline">Servers</Link> page — your server should show a green <strong>ONLINE</strong> status within 60–90 seconds of the agent starting.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">2</span>
            <span>Click on the server to open the <strong>Server Detail</strong> page. You should see live metric cards (CPU %, Memory, Disk, etc.) populated with real values.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">3</span>
            <span>The real-time charts will begin displaying data points as each metric push arrives.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">4</span>
            <span>After a few minutes, visit the <Link to="/history" className="text-primary hover:underline">History</Link> page to confirm historical data is accumulating.</span>
          </li>
        </ol>
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 text-sm text-blue-600 dark:text-blue-400">
          If the server remains OFFLINE, check the{' '}
          <Link to="/help" className="underline">Help &amp; Support</Link> page for troubleshooting
          steps, specifically the "Agent not sending metrics" and "Server always shows OFFLINE" sections.
        </div>
      </section>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <span className="text-sm text-muted-foreground">You're all set!</span>
        <Link
          to="/docs/core-features"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Next: Core Features <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
