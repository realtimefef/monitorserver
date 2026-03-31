import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServerCard } from '@/components/ServerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Server as ServerIcon,
  Loader2,
  Filter,
  SortAsc,
  Upload,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { serversApi, Server } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortOption = 'name-asc' | 'name-desc' | 'status' | 'newest' | 'oldest';

function sortServers(servers: Server[], sort: SortOption): Server[] {
  const copy = [...servers];
  switch (sort) {
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case 'status': {
      const order = { CRITICAL: 0, WARNING: 1, OFFLINE: 2, ONLINE: 3, UNKNOWN: 4 };
      return copy.sort((a, b) => (order[a.status] ?? 4) - (order[b.status] ?? 4));
    }
    case 'newest':
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    default:
      return copy;
  }
}

const POLL_INTERVAL = 10_000;

export default function Servers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const { toast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchServers = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await serversApi.getAll();
      if (response.success) setServers(response.data);
    } catch (error) {
      if (!silent) toast({
        title: 'Failed to fetch servers',
        description: error instanceof Error ? error.message : 'Could not load servers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial fetch + polling with tab-visibility pause
  useEffect(() => {
    fetchServers();

    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        if (!document.hidden) fetchServers(true);
      }, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchServers(true);
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchServers]);

  const filteredServers = servers.filter((server) => {
    const matchesSearch =
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.hostAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || server.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedServers = sortServers(filteredServers, sortOption);

  const statusCounts = {
    all: servers.length,
    ONLINE: servers.filter(s => s.status === 'ONLINE').length,
    OFFLINE: servers.filter(s => s.status === 'OFFLINE').length,
    WARNING: servers.filter(s => s.status === 'WARNING').length,
    CRITICAL: servers.filter(s => s.status === 'CRITICAL').length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">Servers</h1>
            <p className="mt-1 text-muted-foreground">Manage and monitor your server fleet</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchServers()} disabled={isLoading}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/servers/import">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Import
              </Button>
            </Link>
            <Link to="/servers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Server
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters + Sort */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search servers by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                <SelectItem value="ONLINE">Online ({statusCounts.ONLINE})</SelectItem>
                <SelectItem value="OFFLINE">Offline ({statusCounts.OFFLINE})</SelectItem>
                <SelectItem value="WARNING">Warning ({statusCounts.WARNING})</SelectItem>
                <SelectItem value="CRITICAL">Critical ({statusCounts.CRITICAL})</SelectItem>
              </SelectContent>
            </Select>
            <SortAsc className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name-asc">Name A→Z</SelectItem>
                <SelectItem value="name-desc">Name Z→A</SelectItem>
                <SelectItem value="status">Status (critical first)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Server Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedServers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
            <ServerIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-display text-lg font-medium text-foreground">
              {servers.length === 0 ? 'No servers yet' : 'No servers found'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {servers.length === 0 ? 'Add your first server to start monitoring' : 'Try adjusting your search or filter'}
            </p>
            {servers.length === 0 && (
              <Link to="/servers/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Server
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedServers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
