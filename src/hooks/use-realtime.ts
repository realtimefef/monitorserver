/**
 * Realtime hooks — WebSocket/STOMP with automatic polling fallback.
 *
 * usePolling: simple interval-based polling (tab-visibility-aware).
 * useStompSubscription: subscribe to a STOMP topic over WebSocket.
 * useRealtimeMetrics: subscribe to server metrics via STOMP with polling fallback.
 * useRealtimeAlerts: subscribe to user alerts via STOMP with polling fallback.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getApiUrl, getToken } from '@/lib/apiClient';

// ── Polling ──────────────────────────────────────────────────────────────────

interface PollingOptions {
  interval?: number; // ms (default 5000)
  enabled?: boolean;
}

export function usePolling(
  fetchFn: () => void | Promise<void>,
  options: PollingOptions = {}
) {
  const { interval = 5_000, enabled = true } = options;
  const fnRef = useRef(fetchFn);
  fnRef.current = fetchFn;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      if (!document.hidden) fnRef.current();
    }, interval);
  }, [interval]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Invoke immediately on mount so data appears without waiting for first tick
    fnRef.current();

    const onVisibility = () => {
      if (document.hidden) stopPolling();
      else { fnRef.current(); startPolling(); }
    };

    startPolling();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, startPolling, stopPolling]);
}

// ── STOMP singleton ──────────────────────────────────────────────────────────

let stompClient: Client | null = null;
let stompConnected = false;
const connectionListeners = new Set<(connected: boolean) => void>();

function notifyConnectionListeners(connected: boolean) {
  stompConnected = connected;
  connectionListeners.forEach(fn => fn(connected));
}

function getWsUrl(): string {
  const api = getApiUrl();
  const base = api.replace(/\/api\/v1\/?$/, '');
  return `${base}/ws`;
}

function getOrCreateClient(): Client {
  if (stompClient) return stompClient;

  const client = new Client({
    webSocketFactory: () => new SockJS(getWsUrl()),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    // Refresh token on each connect/reconnect attempt
    beforeConnect: () => {
      client.connectHeaders = {
        Authorization: `Bearer ${getToken() ?? ''}`,
      };
    },
    onConnect: () => notifyConnectionListeners(true),
    onDisconnect: () => notifyConnectionListeners(false),
    onStompError: () => notifyConnectionListeners(false),
    onWebSocketClose: () => notifyConnectionListeners(false),
  });

  client.activate();
  stompClient = client;
  return client;
}

/** Deactivate the global STOMP client (e.g., on logout). */
export function disconnectStomp() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    stompConnected = false;
  }
}

// ── useStompConnection status ────────────────────────────────────────────────

export function useStompConnected(): boolean {
  const [connected, setConnected] = useState(stompConnected);

  useEffect(() => {
    connectionListeners.add(setConnected);
    return () => { connectionListeners.delete(setConnected); };
  }, []);

  return connected;
}

// ── useStompSubscription ─────────────────────────────────────────────────────

export function useStompSubscription<T>(
  topic: string | null,
  onMessage: (data: T) => void,
  enabled = true,
) {
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;

  useEffect(() => {
    if (!enabled || !topic) return;

    const client = getOrCreateClient();
    let subscription: ReturnType<typeof client.subscribe> | null = null;
    let removed = false;

    const doSubscribe = () => {
      if (removed) return;
      subscription = client.subscribe(topic, (msg: IMessage) => {
        try {
          const data = JSON.parse(msg.body);
          cbRef.current(data);
        } catch (err) {
          // Silently handle errors — never re-throw inside STOMP handler
        }
      });
    };

    if (client.connected) {
      doSubscribe();
    } else {
      const listener = (connected: boolean) => {
        if (connected && !subscription && !removed) {
          doSubscribe();
        }
      };
      connectionListeners.add(listener);

      // Unified cleanup
      return () => {
        removed = true;
        connectionListeners.delete(listener);
        subscription?.unsubscribe();
      };
    }

    return () => {
      removed = true;
      subscription?.unsubscribe();
    };
  }, [topic, enabled]);
}

// ── useRealtimeServerStatus ──────────────────────────────────────────────────

/**
 * Subscribe to real-time server status changes (ONLINE/OFFLINE/etc.) via STOMP.
 * Backend publishes to `/topic/servers/user/{userId}` when a server's status changes.
 */
export function useRealtimeServerStatus<T = { serverId: number; status: string }>(
  userId: string | null,
  onStatusChange: (data: T) => void,
) {
  useStompSubscription<T>(
    userId ? `/topic/servers/user/${userId}` : null,
    onStatusChange,
    !!userId,
  );
}

// ── useRealtimeMetrics ───────────────────────────────────────────────────────

export function useRealtimeMetrics<T>(
  serverId: number | null,
  onMetric: (data: T) => void,
  pollingFallback?: () => void | Promise<void>,
  pollingInterval = 10_000,
) {
  const wsConnected = useStompConnected();

  useStompSubscription<T>(
    serverId ? `/topic/servers/${serverId}/metrics` : null,
    onMetric,
    !!serverId,
  );

  usePolling(
    () => { if (pollingFallback) pollingFallback(); },
    { interval: pollingInterval, enabled: !!serverId && !wsConnected && !!pollingFallback },
  );
}

// ── useRealtimeAlerts ────────────────────────────────────────────────────────

export function useRealtimeAlerts<T>(
  userId: string | null,
  onAlert: (data: T) => void,
  pollingFallback?: () => void | Promise<void>,
  pollingInterval = 30_000,
) {
  const wsConnected = useStompConnected();

  useStompSubscription<T>(
    userId ? `/topic/alerts/user/${userId}` : null,
    onAlert,
    !!userId,
  );

  usePolling(
    () => { if (pollingFallback) pollingFallback(); },
    { interval: pollingInterval, enabled: !!userId && !wsConnected && !!pollingFallback },
  );
}

// ── Compatibility aliases ────────────────────────────────────────────────────

export { usePolling as useRealtime };
