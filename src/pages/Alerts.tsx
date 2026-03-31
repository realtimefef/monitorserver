import { useEffect, useState, useCallback, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { AlertCard } from '@/components/AlertCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Loader2,
  Filter,
  Shield,
  Search,
  CheckCheck,
  XCircle,
  X,
  Download,
  RefreshCw,
  History,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { alertsApi, serversApi, notificationPreferencesApi, Alert, Server, NotificationHistoryItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TabView = 'active' | 'resolved' | 'notifications';

const PAGE_SIZE = 20;

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tabView, setTabView] = useState<TabView>('active');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serverFilter, setServerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const { toast } = useToast();

  const fetchAlerts = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      if (tabView === 'notifications') {
        setIsLoadingNotifications(true);
        const data = await notificationPreferencesApi.getHistory();
        setNotifications(data);
        setIsLoadingNotifications(false);
      } else {
        const [alertsRes, serversRes] = await Promise.all([
          tabView === 'active' ? alertsApi.getActive() : alertsApi.getAll(200),
          serversApi.getAll(),
        ]);
        if (alertsRes.success) setAlerts(alertsRes.data);
        if (serversRes.success) setServers(serversRes.data);
      }
    } catch (error) {
      toast({
        title: 'Failed to fetch data',
        description: error instanceof Error ? error.message : 'Could not load data',
        variant: 'destructive',
      });
      setIsLoadingNotifications(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast, tabView]);

  useEffect(() => {
    setIsLoading(true);
    setSelectedIds(new Set());
    setPage(1);
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAcknowledge = async (alertId: number) => {
    try {
      await alertsApi.acknowledge(alertId);
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const } : a));
      toast({ title: 'Alert acknowledged' });
    } catch {
      toast({ title: 'Failed to acknowledge alert', variant: 'destructive' });
    }
  };

  const handleResolve = async (alertId: number) => {
    try {
      await alertsApi.resolve(alertId);
      if (tabView === 'active') {
        setAlerts(alerts.filter(a => a.id !== alertId));
      } else {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' as const } : a));
      }
      toast({ title: 'Alert resolved' });
    } catch {
      toast({ title: 'Failed to resolve alert', variant: 'destructive' });
    }
  };

  const handleAcknowledgeSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    // Optimistic update
    setAlerts(prev => prev.map(a => ids.includes(a.id) ? { ...a, status: 'ACKNOWLEDGED' as const } : a));
    setSelectedIds(new Set());
    try {
      await alertsApi.acknowledgeAll(ids);
      toast({ title: `${ids.length} alert${ids.length > 1 ? 's' : ''} acknowledged` });
      fetchAlerts();
    } catch {
      toast({ title: 'Bulk acknowledge failed', variant: 'destructive' });
      fetchAlerts(); // revert on error via refetch
    }
  };

  const handleResolveSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    // Optimistic update
    if (tabView === 'active') {
      setAlerts(prev => prev.filter(a => !ids.includes(a.id)));
    } else {
      setAlerts(prev => prev.map(a => ids.includes(a.id) ? { ...a, status: 'RESOLVED' as const } : a));
    }
    setSelectedIds(new Set());
    try {
      await alertsApi.resolveAll(ids);
      toast({ title: `${ids.length} alert${ids.length > 1 ? 's' : ''} resolved` });
      fetchAlerts();
    } catch {
      toast({ title: 'Bulk resolve failed', variant: 'destructive' });
      fetchAlerts(); // revert on error via refetch
    }
  };

  const handleExport = async () => {
    try {
      const csv = await alertsApi.exportCsv();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alerts-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Alerts exported' });
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
      const matchesServer = serverFilter === 'all' || String(alert.serverId) === serverFilter;
      const matchesSearch = !searchQuery
        || alert.message.toLowerCase().includes(searchQuery.toLowerCase())
        || alert.type.toLowerCase().includes(searchQuery.toLowerCase())
        || (alert.serverName ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesStatus && matchesServer && matchesSearch;
    });
  }, [alerts, severityFilter, statusFilter, serverFilter, searchQuery]);

  const paginatedAlerts = useMemo(
    () => filteredAlerts.slice(0, page * PAGE_SIZE),
    [filteredAlerts, page]
  );

  const hasMore = filteredAlerts.length > paginatedAlerts.length;

  const selectAllVisible = () => {
    const allIds = new Set(paginatedAlerts.map(a => a.id));
    const allSelected = paginatedAlerts.every(a => selectedIds.has(a.id));
    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        allIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        allIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const counts = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'CRITICAL').length,
    warning: alerts.filter(a => a.severity === 'WARNING').length,
    active: alerts.filter(a => a.status === 'ACTIVE').length,
    acknowledged: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
    resolved: alerts.filter(a => a.status === 'RESOLVED').length,
  };

  const activeAlertCount = alerts.filter(a => a.status !== 'RESOLVED').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Alerts</h1>
            <p className="mt-1 text-muted-foreground">
              Monitor and manage system alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAlerts(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="font-display text-2xl font-bold text-foreground">{counts.total}</p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Critical</p>
            <p className="font-display text-2xl font-bold text-red-500">{counts.critical}</p>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Warning</p>
            <p className="font-display text-2xl font-bold text-amber-500">{counts.warning}</p>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
            <p className="font-display text-2xl font-bold text-primary">{counts.active}</p>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Resolved</p>
            <p className="font-display text-2xl font-bold text-emerald-500">{counts.resolved}</p>
          </div>
        </div>

        {/* View Tabs */}
        <Tabs value={tabView} onValueChange={(v) => setTabView(v as TabView)}>
          <TabsList>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Active
              {activeAlertCount > 0 && (
                <Badge variant="destructive" className="h-4 text-xs px-1.5">
                  {activeAlertCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCheck className="h-4 w-4" />
              Resolved
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Log
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search alerts..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>

          <Select value={serverFilter} onValueChange={(v) => { setServerFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Servers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Servers</SelectItem>
              {servers.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
            </SelectContent>
          </Select>

          {tabView === 'resolved' && (
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
            <span className="text-sm font-medium text-foreground">
              {selectedIds.size} alert{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <Button size="sm" variant="outline" onClick={handleAcknowledgeSelected}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Acknowledge All
            </Button>
            <Button size="sm" variant="outline" onClick={handleResolveSelected}>
              <XCircle className="mr-2 h-4 w-4" />
              Resolve All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto text-muted-foreground"
              onClick={() => setSelectedIds(new Set())}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Clear Selection
            </Button>
          </div>
        )}

        {/* Alerts List */}
        {tabView === 'notifications' ? (
          isLoadingNotifications ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-display text-lg font-medium text-foreground">No email notifications yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Email notification history will appear here when alerts trigger
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">{n.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{n.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                      {n.sentAt ? ` · Sent ${formatDistanceToNow(new Date(n.sentAt), { addSuffix: true })}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Badge
                      variant={n.status === 'SENT' ? 'default' : n.status === 'FAILED' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {n.status}
                    </Badge>
                    {n.status === 'FAILED' && n.errorMessage && (
                      <p className="text-xs text-destructive mt-1 max-w-[200px] truncate" title={n.errorMessage}>
                        {n.errorMessage}
                      </p>
                    )}
                    {n.retryCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Retries: {n.retryCount}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
            <Shield className="mx-auto h-12 w-12 text-success" />
            <h3 className="mt-4 font-display text-lg font-medium text-foreground">
              {alerts.length === 0 ? 'All clear!' : 'No matching alerts'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {alerts.length === 0
                ? (tabView === 'active' ? 'No active alerts at the moment' : 'No resolved alerts yet')
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Select All Row */}
            {paginatedAlerts.length > 1 && (
              <div className="flex items-center gap-2 px-1">
                <button
                  onClick={selectAllVisible}
                  className="text-xs text-primary hover:underline"
                >
                  {paginatedAlerts.every(a => selectedIds.has(a.id)) ? 'Deselect all' : `Select all ${paginatedAlerts.length}`}
                </button>
                <span className="text-xs text-muted-foreground">
                  ({filteredAlerts.length} total)
                </span>
              </div>
            )}

            {paginatedAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3">
                <div className="mt-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(alert.id)}
                    onChange={() => toggleSelect(alert.id)}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <AlertCard
                    alert={alert}
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                  />
                  {alert.serverName && (
                    <p className="mt-1 text-xs text-muted-foreground px-1">
                      Server: <span className="text-foreground">{alert.serverName}</span>
                      {' · '}
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={() => setPage(p => p + 1)}>
                  Load more ({filteredAlerts.length - paginatedAlerts.length} remaining)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
