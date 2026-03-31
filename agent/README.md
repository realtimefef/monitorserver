# Monitor Server Monitoring Agent

This directory contains agent scripts that run on client servers to collect and send metrics to the Monitor Server dashboard.

## Available Agents

### 1. Shell Script Agent (`monitor-agent.sh`)

A lightweight bash script for Linux servers.

**Features:**
- Collects CPU, Memory, Disk, Network, Process, and Load metrics
- No dependencies (uses standard Linux tools)
- Easy to deploy and configure

**Installation:**

```bash
# 1. Copy the script to your server
scp monitor-agent.sh user@your-server:/opt/monitor/

# 2. Make it executable
chmod +x /opt/monitor/monitor-agent.sh

# 3. Set environment variables and run
export AGENT_KEY=your-agent-key-here

# 4. Test manually
/opt/monitor/monitor-agent.sh

# 5. Add to crontab (runs every minute — agent loops internally at 5s intervals)
(crontab -l 2>/dev/null; echo "*/1 * * * * AGENT_KEY=your-agent-key /opt/monitor/monitor-agent.sh >> /var/log/monitor-agent.log 2>&1") | crontab -
```

### 2. PowerShell Agent (`monitor-agent.ps1`)

For Windows servers.

```powershell
# Set environment variables
$env:AGENT_KEY = "your-agent-key-here"

# Run the agent
.\monitor-agent.ps1
```

### 3. Systemd Service (Recommended for Production)

```bash
sudo nano /etc/systemd/system/monitor-agent.service
```

```ini
[Unit]
Description=Monitor Server Agent
After=network.target

[Service]
Type=simple
ExecStart=/bin/bash -c 'while true; do /opt/monitor/monitor-agent.sh; sleep 5; done'
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable monitor-agent
sudo systemctl start monitor-agent
```

## Metrics Collected

| Metric | Description | Unit |
|--------|-------------|------|
| CPU_USAGE | CPU utilization | % |
| MEMORY_USAGE | Memory used | % |
| DISK_USAGE | Root partition usage | % |
| NETWORK_IN | Bytes received | bytes |
| NETWORK_OUT | Bytes transmitted | bytes |
| PROCESS_COUNT | Running processes | count |
| LOAD_AVERAGE | 1-minute load | - |
| UPTIME | System uptime | seconds |
