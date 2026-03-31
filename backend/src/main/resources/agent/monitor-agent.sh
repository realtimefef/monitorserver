#!/bin/bash

#######################################################
# MONITOR SERVER MONITORING AGENT
#
# Collects system metrics and POSTs them to the
# Monitor Server REST API every 60 seconds.
#
# Configuration via environment variables:
#   MONITOR_API_URL  - base URL of the REST API
#                      default: http://localhost:8080/api/v1
#   AGENT_KEY        - agent key issued when registering
#                      the server in the dashboard
#######################################################

MONITOR_API_URL="${MONITOR_API_URL:-http://localhost:8080/api/v1}"
AGENT_KEY="${AGENT_KEY:-}"

if [ -z "$AGENT_KEY" ]; then
    echo "Error: AGENT_KEY is not set. Set it via the AGENT_KEY environment variable." >&2
    exit 1
fi

# ── Metric collection helpers ────────────────────────────────────────────────

# CPU usage percentage (0-100)
get_cpu_usage() {
    local usage=""
    if command -v mpstat >/dev/null 2>&1; then
        usage=$(mpstat 1 1 2>/dev/null | awk '/^Average/ {printf "%.2f", 100 - $NF}')
    fi
    if [ -z "$usage" ]; then
        usage=$(top -bn1 2>/dev/null | grep -E "^(%Cpu|Cpu)" | awk '{print $2}' | tr -d '%us,' | head -1)
    fi
    if [ -z "$usage" ]; then
        # Fallback: read /proc/stat twice with 1-second gap
        local line1 line2
        line1=$(grep '^cpu ' /proc/stat)
        sleep 1
        line2=$(grep '^cpu ' /proc/stat)
        local idle1 total1 idle2 total2
        idle1=$(echo "$line1" | awk '{print $5}')
        total1=$(echo "$line1" | awk '{t=0; for(i=2;i<=NF;i++) t+=$i; print t}')
        idle2=$(echo "$line2" | awk '{print $5}')
        total2=$(echo "$line2" | awk '{t=0; for(i=2;i<=NF;i++) t+=$i; print t}')
        local idle_delta total_delta
        idle_delta=$((idle2 - idle1))
        total_delta=$((total2 - total1))
        if [ "$total_delta" -gt 0 ]; then
            usage=$(awk "BEGIN {printf \"%.2f\", 100 * (1 - $idle_delta / $total_delta)}")
        fi
    fi
    echo "${usage:-0}"
}

# Memory usage percent, total MB, available bytes
get_memory_info() {
    if command -v free >/dev/null 2>&1; then
        # free -b gives bytes; -m gives MB
        local total_mb free_mb available_mb used_mb usage_pct available_bytes
        total_mb=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}')
        available_mb=$(free -m 2>/dev/null | awk '/^Mem:/{print $7}')
        available_bytes=$(free -b 2>/dev/null | awk '/^Mem:/{print $7}')
        if [ -n "$total_mb" ] && [ "$total_mb" -gt 0 ]; then
            used_mb=$((total_mb - available_mb))
            usage_pct=$(awk "BEGIN {printf \"%.2f\", 100 * $used_mb / $total_mb}")
            echo "$usage_pct $total_mb $available_bytes"
            return
        fi
    fi
    echo "0 0 0"
}

# Disk usage percent, total bytes, available bytes for /
get_disk_info() {
    if command -v df >/dev/null 2>&1; then
        local usage_pct total_bytes avail_bytes
        usage_pct=$(df -m / 2>/dev/null | awk 'NR==2{gsub("%",""); print $5}')
        total_bytes=$(df -B1 / 2>/dev/null | awk 'NR==2{print $2}')
        avail_bytes=$(df -B1 / 2>/dev/null | awk 'NR==2{print $4}')
        echo "${usage_pct:-0} ${total_bytes:-0} ${avail_bytes:-0}"
    else
        echo "0 0 0"
    fi
}

# Network RX/TX bytes delta over 1 second (bytes/sec)
get_network_io() {
    local iface
    iface=$(ip route 2>/dev/null | awk '/^default/{print $5; exit}')
    if [ -z "$iface" ]; then
        iface=$(cat /proc/net/dev 2>/dev/null | awk 'NR>2 && !/lo/{gsub(":",""); print $1; exit}')
    fi

    if [ -n "$iface" ] && [ -f "/proc/net/dev" ]; then
        local rx1 tx1 rx2 tx2
        rx1=$(awk -v iface="$iface" '$1==iface":" {print $2}' /proc/net/dev 2>/dev/null || echo 0)
        tx1=$(awk -v iface="$iface" '$1==iface":" {print $10}' /proc/net/dev 2>/dev/null || echo 0)
        sleep 1
        rx2=$(awk -v iface="$iface" '$1==iface":" {print $2}' /proc/net/dev 2>/dev/null || echo 0)
        tx2=$(awk -v iface="$iface" '$1==iface":" {print $10}' /proc/net/dev 2>/dev/null || echo 0)
        local rx_delta tx_delta
        rx_delta=$((rx2 - rx1))
        tx_delta=$((tx2 - tx1))
        # Guard against counter wrap or negative delta
        [ "$rx_delta" -lt 0 ] && rx_delta=0
        [ "$tx_delta" -lt 0 ] && tx_delta=0
        echo "$rx_delta $tx_delta"
    else
        echo "0 0"
    fi
}

# 1-minute load average
get_load_average() {
    if [ -f /proc/loadavg ]; then
        awk '{print $1}' /proc/loadavg
    elif command -v uptime >/dev/null 2>&1; then
        uptime | awk -F'[a-z]:' '{print $2}' | awk '{print $1}' | sed 's/,//'
    else
        echo "0"
    fi
}

# Number of running processes (subtract 1 for the wc header line)
get_process_count() {
    if command -v ps >/dev/null 2>&1; then
        ps aux 2>/dev/null | tail -n +2 | wc -l
    else
        echo "0"
    fi
}

# Seconds since boot
get_uptime() {
    if [ -f /proc/uptime ]; then
        awk '{print $1}' /proc/uptime
    elif command -v uptime >/dev/null 2>&1; then
        uptime | awk '{
            for(i=1;i<=NF;i++){
                if($i ~ /up/) { t=$(i+1); gsub(/,/,"",t); print t*60; exit }
            }
        }'
    else
        echo "0"
    fi
}

# ── Build JSON payload and POST ──────────────────────────────────────────────

send_metrics() {
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # --- Collect ---
    local cpu_usage
    cpu_usage=$(get_cpu_usage)

    local mem_info mem_usage mem_total mem_available
    mem_info=$(get_memory_info)
    mem_usage=$(echo "$mem_info" | awk '{print $1}')
    mem_total=$(echo "$mem_info" | awk '{print $2}')
    mem_available=$(echo "$mem_info" | awk '{print $3}')

    local disk_info disk_usage disk_total disk_available
    disk_info=$(get_disk_info)
    disk_usage=$(echo "$disk_info" | awk '{print $1}')
    disk_total=$(echo "$disk_info" | awk '{print $2}')
    disk_available=$(echo "$disk_info" | awk '{print $3}')

    local net_io net_in net_out
    net_io=$(get_network_io)
    net_in=$(echo "$net_io" | awk '{print $1}')
    net_out=$(echo "$net_io" | awk '{print $2}')

    local load_avg
    load_avg=$(get_load_average)

    local process_count
    process_count=$(get_process_count)

    local uptime_secs
    uptime_secs=$(get_uptime)

    # --- Build JSON body ---
    local json_payload
    json_payload=$(cat <<EOF
{
  "agentKey": "$AGENT_KEY",
  "metrics": [
    {"metricType": "CPU_USAGE",        "value": $cpu_usage},
    {"metricType": "MEMORY_USAGE",     "value": $mem_usage},
    {"metricType": "MEMORY_TOTAL",     "value": $mem_total},
    {"metricType": "MEMORY_AVAILABLE", "value": $mem_available},
    {"metricType": "DISK_USAGE",       "value": $disk_usage},
    {"metricType": "DISK_TOTAL",       "value": $disk_total},
    {"metricType": "DISK_AVAILABLE",   "value": $disk_available},
    {"metricType": "NETWORK_IN",       "value": $net_in},
    {"metricType": "NETWORK_OUT",      "value": $net_out},
    {"metricType": "LOAD_AVERAGE",     "value": $load_avg},
    {"metricType": "PROCESS_COUNT",    "value": $process_count},
    {"metricType": "UPTIME",           "value": $uptime_secs}
  ]
}
EOF
)

    # --- POST to REST API ---
    local http_status response_body
    response_body=$(curl -s -o /tmp/monitor_response.txt -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        "${MONITOR_API_URL}/metrics/ingest" 2>&1)
    http_status="$response_body"

    if [ "$http_status" = "200" ] || [ "$http_status" = "201" ] || [ "$http_status" = "204" ]; then
        echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Metrics sent successfully (HTTP $http_status)"
    else
        echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Failed to send metrics (HTTP $http_status): $(cat /tmp/monitor_response.txt 2>/dev/null)" >&2
    fi
}

# ── Main loop ────────────────────────────────────────────────────────────────

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Monitor agent started — API: ${MONITOR_API_URL}"

while true; do
    send_metrics
    sleep 6
done
