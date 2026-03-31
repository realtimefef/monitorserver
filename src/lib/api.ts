/**
 * API Module — all application data access goes through here.
 * Uses the REST apiClient (JWT + fetch) — no Supabase SDK.
 */
import { api } from './apiClient';

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    email: string;
    username: string;
    role: string;
}

export interface Metric {
    id: number;
    serverId?: number;
    metricType: string;
    value: number;
    unit?: string;
    timestamp: string;
}

export interface Server {
    id: number;
    name: string;
    hostAddress: string;
    operatingSystem: string;
    status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
    lastHeartbeat: string;
    agentKey: string;
    activeAlerts: number;
    createdAt: string;
    description?: string;
}

export interface Alert {
    id: number;
    serverId: number;
    serverName?: string;
    type: string;
    title?: string;
    message: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
    createdAt: string;
    triggeredAt?: string;
    resolvedAt?: string;
    acknowledgedAt?: string;
    metricValue?: number | string;
    thresholdValue?: number | string;
    note?: string;
}

export interface AlertRule {
    id: number;
    serverId: number;
    name: string;
    description?: string;
    metricType: string;
    conditionOperator: string;
    thresholdValue: number;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    isEnabled: boolean;
    durationSeconds: number;
    cooldownMinutes: number;
    createdAt: string;
}

export interface NotificationPreferences {
    emailEnabled: boolean;
    emailCritical: boolean;
    emailWarning: boolean;
    emailInfo: boolean;
    browserNotifications: boolean;
}

export interface UserSettings {
    refreshInterval: number;
    defaultTimeRange: string;
    notifications: NotificationPreferences;
}

// ── Constants ────────────────────────────────────────────────────────────────

export type TimeRange = '1h' | '6h' | '24h' | '7d';

export const ALL_METRIC_TYPES = [
    'CPU_USAGE', 'MEMORY_USAGE', 'MEMORY_TOTAL', 'MEMORY_AVAILABLE',
    'DISK_USAGE', 'DISK_TOTAL', 'DISK_AVAILABLE',
    'NETWORK_IN', 'NETWORK_OUT', 'LOAD_AVERAGE', 'PROCESS_COUNT', 'UPTIME',
] as const;

// ── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
    login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
        return api.post('/auth/login', { email, password }, false);
    },

    register: async (username: string, email: string, password: string): Promise<void> => {
        return api.post('/auth/register', { username, email, password }, false);
    },

    forgotPassword: async (email: string): Promise<void> => {
        return api.post('/auth/forgot-password', { email }, false);
    },

    resetPassword: async (token: string, newPassword: string): Promise<void> => {
        return api.post(`/auth/reset-password?token=${encodeURIComponent(token)}`, { password: newPassword }, false);
    },

    verifyEmail: async (token: string): Promise<void> => {
        return api.get(`/auth/verify?token=${encodeURIComponent(token)}`, false);
    },

    resendVerification: async (email: string): Promise<void> => {
        return api.post('/auth/resend-verification', { email }, false);
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
        return api.post('/auth/change-password', { currentPassword, newPassword });
    },

    updateProfile: async (updates: { username?: string }): Promise<User> => {
        return api.put('/users/me', updates);
    },

    getMe: async (): Promise<User> => {
        return api.get('/users/me');
    },

    deleteAccount: async (): Promise<void> => {
        return api.delete('/auth/account');
    },

    validateToken: async (): Promise<{ success: boolean; user?: User }> => {
        try {
            const res = await api.get<{ success: boolean; data: User }>('/auth/validate');
            return { success: true, user: res.data };
        } catch { return { success: false }; }
    },

    getEmailByUsername: async (username: string): Promise<string | null> => {
        try {
            const res = await api.get<{ email: string }>(`/auth/get-email?username=${encodeURIComponent(username)}`);
            return res.email;
        } catch { return null; }
    },
};

// ── Servers API ──────────────────────────────────────────────────────────────

export const serversApi = {
    getAll: async (): Promise<{ success: boolean; message: string; data: Server[] }> => {
        const data = await api.get<Server[]>('/servers');
        return { success: true, message: 'OK', data };
    },

    getByStatus: async (status: string): Promise<{ success: boolean; message: string; data: Server[] }> => {
        const data = await api.get<Server[]>(`/servers/status/${status}`);
        return { success: true, message: 'OK', data };
    },

    getById: async (id: number): Promise<{ success: boolean; message: string; data: Server }> => {
        const data = await api.get<Server>(`/servers/${id}`);
        return { success: true, message: 'OK', data };
    },

    create: async (server: Partial<Server>): Promise<{ success: boolean; message: string; data: Server }> => {
        const data = await api.post<Server>('/servers', server);
        return { success: true, message: 'Created', data };
    },

    update: async (id: number, updates: Partial<Server>): Promise<{ success: boolean; message: string; data: Server }> => {
        const data = await api.put<Server>(`/servers/${id}`, updates);
        return { success: true, message: 'Updated', data };
    },

    delete: async (id: number): Promise<void> => {
        return api.delete(`/servers/${id}`);
    },

    regenerateKey: async (id: number): Promise<{ agentKey: string }> => {
        return api.post(`/servers/${id}/regenerate-key`);
    },
};

// ── Metrics API ──────────────────────────────────────────────────────────────

export const metricsApi = {
    getLatest: async (serverId: number, type: string): Promise<Metric | null> => {
        try {
            return await api.get<Metric>(`/servers/${serverId}/metrics/latest?type=${type}`);
        } catch { return null; }
    },

    getLatestAll: async (serverId: number): Promise<Metric[]> => {
        try {
            return await api.get<Metric[]>(`/servers/${serverId}/metrics/latest`);
        } catch { return []; }
    },

    getHistory: async (serverId: number, type: string, range: TimeRange): Promise<Metric[]> => {
        const hoursMap: Record<TimeRange, number> = { '1h': 1, '6h': 6, '24h': 24, '7d': 168 };
        const from = new Date(Date.now() - (hoursMap[range] ?? 24) * 3_600_000).toISOString();
        try {
            return await api.get<Metric[]>(`/servers/${serverId}/metrics?type=${type}&start=${encodeURIComponent(from)}`);
        } catch { return []; }
    },

    getHistoryMultiple: async (serverId: number, types: string[], range: TimeRange): Promise<Record<string, Metric[]>> => {
        const result: Record<string, Metric[]> = {};
        await Promise.allSettled(types.map(async t => {
            result[t] = await metricsApi.getHistory(serverId, t, range);
        }));
        return result;
    },

    exportCsv: (serverId: number, type: string, data: Metric[]): void => {
        const lines = ['timestamp,metric_type,value,unit'];
        data.forEach(m => lines.push(`${m.timestamp},${type},${m.value},${m.unit ?? ''}`));
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `metrics-${serverId}-${type}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },

    getAverage: async (serverId: number, type: string, minutes = 60): Promise<number> => {
        try {
            const res = await api.get<{ average: number }>(`/servers/${serverId}/metrics/average?type=${type}&minutes=${minutes}`);
            return res.average;
        } catch { return 0; }
    },
};

// ── Metrics with custom date range ───────────────────────────────────────────

export const metricsCustomApi = {
    getHistoryRange: async (
        serverId: number,
        types: string[],
        from: Date,
        to: Date
    ): Promise<{ success: boolean; message: string; data: Record<string, Metric[]> }> => {
        const result: Record<string, Metric[]> = {};
        await Promise.allSettled(types.map(async type => {
            try {
                result[type] = await api.get<Metric[]>(
                    `/servers/${serverId}/metrics?type=${type}&start=${encodeURIComponent(from.toISOString())}&end=${encodeURIComponent(to.toISOString())}`
                );
            } catch { result[type] = []; }
        }));
        return { success: true, message: 'OK', data: result };
    },
};

// ── Alerts API ───────────────────────────────────────────────────────────────

export const alertsApi = {
    getActive: async (): Promise<{ success: boolean; message: string; data: Alert[] }> => {
        const data = await api.get<Alert[]>('/alerts');
        return { success: true, message: 'OK', data };
    },

    getAll: async (limit = 100): Promise<{ success: boolean; message: string; data: Alert[] }> => {
        const data = await api.get<Alert[]>(`/alerts/resolved?limit=${limit}`);
        return { success: true, message: 'OK', data };
    },

    getByStatus: async (status: string): Promise<{ success: boolean; message: string; data: Alert[] }> => {
        const data = await api.get<Alert[]>(`/alerts/status/${status}`);
        return { success: true, message: 'OK', data };
    },

    getByServer: async (serverId: number): Promise<{ success: boolean; message: string; data: Alert[] }> => {
        const data = await api.get<Alert[]>(`/alerts?serverId=${serverId}`);
        return { success: true, message: 'OK', data };
    },

    acknowledge: async (id: number, note?: string): Promise<void> => {
        return api.post(`/alerts/${id}/acknowledge`, note ? { note } : undefined);
    },

    acknowledgeAll: async (ids: number[]): Promise<void> => {
        await Promise.allSettled(ids.map(id => alertsApi.acknowledge(id)));
    },

    resolve: async (id: number): Promise<void> => {
        return api.post(`/alerts/${id}/resolve`);
    },

    resolveAll: async (ids: number[]): Promise<void> => {
        await Promise.allSettled(ids.map(id => alertsApi.resolve(id)));
    },

    exportCsv: (alerts: Alert[]): void => {
        const lines = ['id,server,type,severity,status,created_at,message'];
        alerts.forEach(a =>
            lines.push([a.id, a.serverName ?? '', a.type, a.severity, a.status, a.createdAt,
            `"${a.message.replace(/"/g, '""')}"`].join(','))
        );
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'alerts.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    },
};

// ── Alert Rules API ──────────────────────────────────────────────────────────

export const alertRulesApi = {
    getByServer: async (serverId: number): Promise<{ success: boolean; message: string; data: AlertRule[] }> => {
        const data = await api.get<AlertRule[]>(`/alerts/rules?serverId=${serverId}`);
        return { success: true, message: 'OK', data };
    },

    getEnabled: async (): Promise<{ success: boolean; message: string; data: AlertRule[] }> => {
        const data = await api.get<AlertRule[]>('/alerts/rules/enabled');
        return { success: true, message: 'OK', data };
    },

    create: async (rule: Partial<AlertRule>): Promise<{ success: boolean; message: string; data: AlertRule }> => {
        const data = await api.post<AlertRule>('/alerts/rules', rule);
        return { success: true, message: 'Created', data };
    },

    update: async (id: number, updates: Partial<AlertRule>): Promise<{ success: boolean; message: string; data: AlertRule }> => {
        const data = await api.put<AlertRule>(`/alerts/rules/${id}`, updates);
        return { success: true, message: 'Updated', data };
    },

    toggle: async (id: number): Promise<void> => {
        return api.post(`/alerts/rules/${id}/toggle`);
    },

    delete: async (id: number): Promise<void> => {
        return api.delete(`/alerts/rules/${id}`);
    },
};

// ── User Settings (localStorage) ─────────────────────────────────────────────

const SETTINGS_KEY = 'monitor_user_settings';

export const defaultSettings: UserSettings = {
    refreshInterval: 30,
    defaultTimeRange: '24h',
    notifications: {
        emailEnabled: false,
        emailCritical: true,
        emailWarning: true,
        emailInfo: false,
        browserNotifications: false,
    },
};

export const userSettingsApi = {
    get: (): UserSettings => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
        } catch { return defaultSettings; }
    },
    save: (settings: UserSettings): void => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    },
    reset: (): void => { localStorage.removeItem(SETTINGS_KEY); },
};

// ── Dashboard customization (localStorage) ───────────────────────────────────

const DASHBOARD_SECTIONS_KEY = 'monitor_dashboard_sections';
const DASHBOARD_ORDER_KEY = 'monitor_dashboard_order';

export const dashboardSettingsApi = {
    getSections: (): Record<string, boolean> => {
        try { return JSON.parse(localStorage.getItem(DASHBOARD_SECTIONS_KEY) ?? '{}'); }
        catch { return {}; }
    },
    saveSections: (v: Record<string, boolean>) => localStorage.setItem(DASHBOARD_SECTIONS_KEY, JSON.stringify(v)),
    getOrder: (): string[] => {
        try { return JSON.parse(localStorage.getItem(DASHBOARD_ORDER_KEY) ?? '[]'); }
        catch { return []; }
    },
    saveOrder: (v: string[]) => localStorage.setItem(DASHBOARD_ORDER_KEY, JSON.stringify(v)),
};

// ── Scheduled Reports API ─────────────────────────────────────────────────────

export interface ReportTemplate {
    id: string;
    name: string;
    format: 'PDF' | 'CSV' | 'EXCEL' | 'JSON';
    timeframe: string;
    frequency: 'MANUAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    recipients?: string;
    enabled: boolean;
    serverIds: number[];
    metricTypes: string[];
    lastGenerated?: string;
}

export const reportsApi = {
    getAll: async (): Promise<ReportTemplate[]> => {
        return api.get<ReportTemplate[]>('/reports');
    },
    create: async (template: {
        name: string;
        format: string;
        timeframe: string;
        frequency?: string;
        recipients?: string;
        serverIds: number[];
        metricTypes: string[];
        enabled?: boolean;
    }): Promise<ReportTemplate> => {
        return api.post<ReportTemplate>('/reports', template);
    },
    update: async (id: string, updates: {
        name?: string;
        format?: string;
        timeframe?: string;
        frequency?: string;
        recipients?: string;
        serverIds?: number[];
        metricTypes?: string[];
        enabled?: boolean;
    }): Promise<ReportTemplate> => {
        return api.put<ReportTemplate>(`/reports/${id}`, updates);
    },
    delete: async (id: string): Promise<void> => {
        return api.delete(`/reports/${id}`);
    },
};

// ── Server Notification Preferences API ──────────────────────────────────────

export interface ServerNotificationPreferences {
    emailEnabled: boolean;
    emailCritical: boolean;
    emailWarning: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart?: number | null;
    quietHoursEnd?: number | null;
    timezone?: string;
}

export interface NotificationHistoryItem {
    id: number;
    alertId: number;
    userId: number;
    channel: string;
    subject: string;
    content: string;
    status: 'PENDING' | 'SENT' | 'FAILED';
    sentAt: string | null;
    errorMessage: string | null;
    retryCount: number;
    createdAt: string;
}

export const notificationPreferencesApi = {
    get: async (): Promise<ServerNotificationPreferences> => {
        return api.get('/notifications/preferences');
    },
    update: async (prefs: Partial<ServerNotificationPreferences>): Promise<void> => {
        return api.put('/notifications/preferences', prefs);
    },
    getHistoryByAlert: async (alertId: number): Promise<NotificationHistoryItem[]> => {
        return api.get(`/notifications/alert/${alertId}`);
    },
    getHistory: async (): Promise<NotificationHistoryItem[]> => {
        return api.get('/notifications/history');
    },
};

// ── Webhook API ──────────────────────────────────────────────────────────────

export interface WebhookConfig {
    id: number;
    name: string;
    url: string;
    type: 'SLACK' | 'DISCORD' | 'GENERIC';
    enabled: boolean;
    notifyCritical: boolean;
    notifyWarning: boolean;
    notifyInfo: boolean;
    lastTriggeredAt: string | null;
    lastError: string | null;
    createdAt: string;
}

export const webhooksApi = {
    getAll: async (): Promise<WebhookConfig[]> => {
        return api.get('/webhooks');
    },
    create: async (webhook: { name: string; url: string; type?: string; notifyCritical?: boolean; notifyWarning?: boolean; notifyInfo?: boolean }): Promise<WebhookConfig> => {
        return api.post('/webhooks', webhook);
    },
    update: async (id: number, updates: Partial<WebhookConfig>): Promise<WebhookConfig> => {
        return api.put(`/webhooks/${id}`, updates);
    },
    delete: async (id: number): Promise<void> => {
        return api.delete(`/webhooks/${id}`);
    },
};

// ── API Keys API ─────────────────────────────────────────────────────────────

export interface ApiKeyItem {
    id: number;
    name: string;
    prefix: string;
    key?: string;
    active: boolean;
    lastUsedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
}

export const apiKeysApi = {
    getAll: async (): Promise<ApiKeyItem[]> => {
        return api.get('/api-keys');
    },
    create: async (data: { name: string; expiresInDays?: string }): Promise<ApiKeyItem> => {
        return api.post('/api-keys', data);
    },
    revoke: async (id: number): Promise<void> => {
        return api.post(`/api-keys/${id}/revoke`);
    },
    delete: async (id: number): Promise<void> => {
        return api.delete(`/api-keys/${id}`);
    },
};

// ── Maintenance Windows API ──────────────────────────────────────────────────

export interface MaintenanceWindowItem {
    id: number;
    serverId: number;
    reason: string;
    startTime: string;
    endTime: string;
    active: boolean;
    createdByUsername: string;
    createdAt: string;
}

export const maintenanceApi = {
    getByServer: async (serverId: number): Promise<MaintenanceWindowItem[]> => {
        return api.get(`/servers/${serverId}/maintenance`);
    },
    create: async (serverId: number, data: { reason: string; startTime: string; endTime: string }): Promise<MaintenanceWindowItem> => {
        return api.post(`/servers/${serverId}/maintenance`, data);
    },
    cancel: async (serverId: number, windowId: number): Promise<void> => {
        return api.post(`/servers/${serverId}/maintenance/${windowId}/cancel`);
    },
    delete: async (serverId: number, windowId: number): Promise<void> => {
        return api.delete(`/servers/${serverId}/maintenance/${windowId}`);
    },
};
