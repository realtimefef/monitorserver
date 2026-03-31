#######################################################
# MONITOR SERVER MONITORING AGENT (PowerShell)
#
# Collects system metrics and POSTs them to the
# Monitor Server REST API every 60 seconds.
#
# Configuration (highest-priority source wins):
#   1. Script parameters    (-ApiUrl, -AgentKey)
#   2. Environment variables (MONITOR_API_URL, AGENT_KEY)
#   3. Built-in defaults
#
# Usage examples:
#   .\monitor-agent.ps1 -AgentKey "your-key-here"
#   .\monitor-agent.ps1 -ApiUrl "http://myserver:8080/api/v1" -AgentKey "key"
#   $env:AGENT_KEY = "key"; .\monitor-agent.ps1
#######################################################

param(
    [string]$ApiUrl   = "",
    [string]$AgentKey = ""
)

# Resolve configuration (param > env > default)
$MONITOR_API_URL = if ($ApiUrl)   { $ApiUrl }   elseif ($env:MONITOR_API_URL) { $env:MONITOR_API_URL } else { "http://localhost:8080/api/v1" }
$AGENT_KEY       = if ($AgentKey) { $AgentKey } elseif ($env:AGENT_KEY)       { $env:AGENT_KEY }       else { "" }

if (-not $AGENT_KEY) {
    Write-Error "AGENT_KEY is not set. Provide it via -AgentKey parameter or the AGENT_KEY environment variable."
    exit 1
}

# ── Metric collection functions ──────────────────────────────────────────────

function Get-CpuUsage {
    try {
        $cpu = Get-CimInstance -ClassName Win32_Processor -ErrorAction Stop |
               Measure-Object -Property LoadPercentage -Average
        return [math]::Round($cpu.Average, 2)
    } catch {
        Write-Warning "Get-CpuUsage failed: $_"
        return 0
    }
}

function Get-MemoryInfo {
    try {
        $os = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction Stop
        $totalMB      = [math]::Round($os.TotalVisibleMemorySize / 1024, 0)
        $availableMB  = [math]::Round($os.FreePhysicalMemory     / 1024, 0)
        $availableBytes = $os.FreePhysicalMemory * 1024   # KiB -> bytes
        $usedMB       = $totalMB - $availableMB
        $usagePct     = if ($totalMB -gt 0) { [math]::Round(($usedMB / $totalMB) * 100, 2) } else { 0 }
        return @{
            UsagePercent   = $usagePct
            TotalMB        = $totalMB
            AvailableBytes = $availableBytes
        }
    } catch {
        Write-Warning "Get-MemoryInfo failed: $_"
        return @{ UsagePercent = 0; TotalMB = 0; AvailableBytes = 0 }
    }
}

function Get-DiskInfo {
    try {
        $disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'" -ErrorAction Stop
        $totalBytes = $disk.Size
        $freeBytes  = $disk.FreeSpace
        $usedBytes  = $totalBytes - $freeBytes
        $usagePct   = if ($totalBytes -gt 0) { [math]::Round(($usedBytes / $totalBytes) * 100, 2) } else { 0 }
        return @{
            UsagePercent   = $usagePct
            TotalBytes     = $totalBytes
            AvailableBytes = $freeBytes
        }
    } catch {
        Write-Warning "Get-DiskInfo failed: $_"
        return @{ UsagePercent = 0; TotalBytes = 0; AvailableBytes = 0 }
    }
}

function Get-NetworkIO {
    # Takes two samples 1 second apart and computes bytes/sec delta
    try {
        $sample1 = Get-CimInstance -ClassName Win32_PerfRawData_Tcpip_NetworkInterface -ErrorAction Stop |
                   Where-Object { $_.Name -notmatch 'Loopback|Teredo|isatap' } |
                   Select-Object -First 1

        if (-not $sample1) { return @{ BytesIn = 0; BytesOut = 0 } }

        Start-Sleep -Seconds 1

        $sample2 = Get-CimInstance -ClassName Win32_PerfRawData_Tcpip_NetworkInterface -ErrorAction Stop |
                   Where-Object { $_.Name -eq $sample1.Name } |
                   Select-Object -First 1

        if (-not $sample2) { return @{ BytesIn = 0; BytesOut = 0 } }

        $rxDelta = [math]::Max(0, [long]$sample2.BytesReceivedPersec - [long]$sample1.BytesReceivedPersec)
        $txDelta = [math]::Max(0, [long]$sample2.BytesSentPersec     - [long]$sample1.BytesSentPersec)

        return @{ BytesIn = $rxDelta; BytesOut = $txDelta }
    } catch {
        Write-Warning "Get-NetworkIO failed: $_"
        return @{ BytesIn = 0; BytesOut = 0 }
    }
}

function Get-LoadAverage {
    # Windows has no direct load-average equivalent; use 1-minute CPU average
    # by sampling processor queue length as a proxy.
    try {
        $pql = (Get-CimInstance -ClassName Win32_PerfFormattedData_PerfOS_System -ErrorAction Stop).ProcessorQueueLength
        return [math]::Round($pql, 2)
    } catch {
        # Fallback: re-use CPU percentage divided by 100 as a 0-1 normalised value
        return [math]::Round((Get-CpuUsage) / 100, 2)
    }
}

function Get-ProcessCount {
    try {
        return (Get-Process -ErrorAction Stop).Count
    } catch {
        Write-Warning "Get-ProcessCount failed: $_"
        return 0
    }
}

function Get-SystemUptime {
    try {
        $os = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction Stop
        $uptimeSeconds = [math]::Round(((Get-Date) - $os.LastBootUpTime).TotalSeconds, 0)
        return $uptimeSeconds
    } catch {
        Write-Warning "Get-SystemUptime failed: $_"
        return 0
    }
}

# ── Build payload and POST ───────────────────────────────────────────────────

function Send-Metrics {
    $cpuUsage  = Get-CpuUsage
    $memInfo   = Get-MemoryInfo
    $diskInfo  = Get-DiskInfo
    $netIO     = Get-NetworkIO    # includes 1-second sleep internally
    $loadAvg   = Get-LoadAverage
    $procCount = Get-ProcessCount
    $uptime    = Get-SystemUptime

    $body = [ordered]@{
        agentKey = $AGENT_KEY
        metrics  = @(
            [ordered]@{ metricType = "CPU_USAGE";        value = $cpuUsage }
            [ordered]@{ metricType = "MEMORY_USAGE";     value = $memInfo.UsagePercent }
            [ordered]@{ metricType = "MEMORY_TOTAL";     value = $memInfo.TotalMB }
            [ordered]@{ metricType = "MEMORY_AVAILABLE"; value = $memInfo.AvailableBytes }
            [ordered]@{ metricType = "DISK_USAGE";       value = $diskInfo.UsagePercent }
            [ordered]@{ metricType = "DISK_TOTAL";       value = $diskInfo.TotalBytes }
            [ordered]@{ metricType = "DISK_AVAILABLE";   value = $diskInfo.AvailableBytes }
            [ordered]@{ metricType = "NETWORK_IN";       value = $netIO.BytesIn }
            [ordered]@{ metricType = "NETWORK_OUT";      value = $netIO.BytesOut }
            [ordered]@{ metricType = "LOAD_AVERAGE";     value = $loadAvg }
            [ordered]@{ metricType = "PROCESS_COUNT";    value = $procCount }
            [ordered]@{ metricType = "UPTIME";           value = $uptime }
        )
    }

    $json = $body | ConvertTo-Json -Depth 4 -Compress

    try {
        $response = Invoke-RestMethod `
            -Uri     "$MONITOR_API_URL/metrics/ingest" `
            -Method  POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body    $json `
            -ErrorAction Stop

        Write-Host "[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ' -AsUTC)] Metrics sent successfully"
    } catch {
        $statusCode = $_.Exception.Response?.StatusCode?.value__ ?? "?"
        Write-Warning "[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ' -AsUTC)] Failed to send metrics (HTTP $statusCode): $_"
    }
}

# ── Main loop ────────────────────────────────────────────────────────────────

Write-Host "[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ' -AsUTC)] Monitor agent started — API: $MONITOR_API_URL"

while ($true) {
    Send-Metrics
    # Get-NetworkIO already sleeps 1s; wait the remaining ~4s
    Start-Sleep -Seconds 5
}
