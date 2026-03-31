# Monitor Server Monitoring Agent

Lightweight agent scripts that run on your servers to collect and send metrics to the Monitor Server dashboard.

## Quick Start

### Linux / macOS

```bash
# 1. Download the agent (replace YOUR_API_URL with your API base URL)
curl -fsSL "YOUR_API_URL/agent/monitor-agent.sh" -o monitor-agent.sh
chmod +x monitor-agent.sh

# 2. Run the agent (replace YOUR_AGENT_KEY with the key from your dashboard)
MONITOR_API_URL="YOUR_API_URL" AGENT_KEY="YOUR_AGENT_KEY" ./monitor-agent.sh
```

### Windows (PowerShell)

```powershell
# 1. Download the agent (replace YOUR_API_URL with your API base URL)
Invoke-WebRequest -Uri "YOUR_API_URL/agent/monitor-agent.ps1" -OutFile monitor-agent.ps1

# 2. Run the agent (replace YOUR_API_URL and YOUR_AGENT_KEY)
.\monitor-agent.ps1 -ApiUrl "YOUR_API_URL" -AgentKey "YOUR_AGENT_KEY"
```

> **Tip:** When you add a server in the dashboard, a ready-to-paste command with your URL and key pre-filled is shown. Just copy and paste it.

## Keep the Agent Running

### Linux — systemd (recommended)

```bash
sudo tee /etc/systemd/system/monitor-agent.service << 'EOF'
[Unit]
Description=Monitor Server Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment="MONITOR_API_URL=YOUR_API_URL"
Environment="AGENT_KEY=YOUR_AGENT_KEY"
ExecStart=/opt/monitor/monitor-agent.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo cp monitor-agent.sh /opt/monitor/monitor-agent.sh
sudo chmod +x /opt/monitor/monitor-agent.sh
sudo systemctl daemon-reload
sudo systemctl enable --now monitor-agent
```

### Linux — Background process (quick)

```bash
nohup env MONITOR_API_URL="YOUR_API_URL" AGENT_KEY="YOUR_AGENT_KEY" ./monitor-agent.sh &
```

### Windows — Task Scheduler

1. Open **Task Scheduler** → Create Basic Task
2. Set trigger to **At Startup**
3. Action: Start a program → `powershell.exe`
4. Arguments: `-File "C:\path\to\monitor-agent.ps1" -ApiUrl "YOUR_API_URL" -AgentKey "YOUR_AGENT_KEY"`

## Configuration

| Parameter | Env Variable | Default | Description |
|-----------|-------------|---------|-------------|
| `-ApiUrl` | `MONITOR_API_URL` | `http://localhost:8080/api/v1` | API base URL |
| `-AgentKey` | `AGENT_KEY` | (required) | Your server's agent key |

Priority: Script parameter > Environment variable > Default

## Metrics Collected

| Metric | Description | Unit |
|--------|-------------|------|
| CPU_USAGE | CPU utilization | % |
| MEMORY_USAGE | Memory used | % |
| MEMORY_TOTAL | Total memory | MB |
| MEMORY_AVAILABLE | Available memory | bytes |
| DISK_USAGE | Root partition usage | % |
| DISK_TOTAL | Total disk space | bytes |
| DISK_AVAILABLE | Available disk space | bytes |
| NETWORK_IN | Bytes received/sec | bytes/s |
| NETWORK_OUT | Bytes transmitted/sec | bytes/s |
| PROCESS_COUNT | Running processes | count |
| LOAD_AVERAGE | 1-minute load | - |
| UPTIME | System uptime | seconds |
