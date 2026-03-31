import { useEffect, useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  Loader2,
  AlertTriangle,
  Trash2,
  Server,
  Pencil,
  Clock,
  RefreshCw,
  Info,
} from 'lucide-react';
import { serversApi, alertRulesApi, Server as ServerType, AlertRule } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const METRIC_TYPES = [
  { value: 'CPU_USAGE', label: 'CPU Usage (%)' },
  { value: 'MEMORY_USAGE', label: 'Memory Usage (%)' },
  { value: 'DISK_USAGE', label: 'Disk Usage (%)' },
  { value: 'MEMORY_AVAILABLE', label: 'Memory Available (MB)' },
  { value: 'NETWORK_IN', label: 'Network In (bytes/s)' },
  { value: 'NETWORK_OUT', label: 'Network Out (bytes/s)' },
  { value: 'LOAD_AVERAGE', label: 'Load Average' },
  { value: 'PROCESS_COUNT', label: 'Process Count' },
];

const OPERATORS = [
  { value: 'GREATER_THAN', label: 'Greater than (>)', symbol: '>' },
  { value: 'LESS_THAN', label: 'Less than (<)', symbol: '<' },
  { value: 'GREATER_THAN_OR_EQUAL', label: 'Greater than or equal (>=)', symbol: '>=' },
  { value: 'LESS_THAN_OR_EQUAL', label: 'Less than or equal (<=)', symbol: '<=' },
  { value: 'EQUALS', label: 'Equals (=)', symbol: '=' },
  { value: 'NOT_EQUALS', label: 'Not equals (!=)', symbol: '!=' },
];

const SEVERITIES = [
  { value: 'INFO', label: 'Info' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'CRITICAL', label: 'Critical' },
];

const emptyForm = {
  name: '',
  description: '',
  metricType: '',
  conditionOperator: '',
  thresholdValue: '',
  durationSeconds: '60',
  severity: 'WARNING',
  cooldownMinutes: '5',
};

// Pre-built suggestion templates for common scenarios
const RULE_TEMPLATES = [
  { name: 'High CPU Usage', description: 'Alert when CPU exceeds 90% for 60s', metricType: 'CPU_USAGE', conditionOperator: 'GREATER_THAN', thresholdValue: '90', severity: 'CRITICAL', durationSeconds: '60', cooldownMinutes: '5' },
  { name: 'CPU Warning', description: 'Warn when CPU exceeds 75% for 120s', metricType: 'CPU_USAGE', conditionOperator: 'GREATER_THAN', thresholdValue: '75', severity: 'WARNING', durationSeconds: '120', cooldownMinutes: '10' },
  { name: 'Disk Critical', description: 'Alert when disk usage exceeds 95%', metricType: 'DISK_USAGE', conditionOperator: 'GREATER_THAN', thresholdValue: '95', severity: 'CRITICAL', durationSeconds: '60', cooldownMinutes: '30' },
  { name: 'Disk Space Warning', description: 'Warn when disk usage exceeds 80%', metricType: 'DISK_USAGE', conditionOperator: 'GREATER_THAN', thresholdValue: '80', severity: 'WARNING', durationSeconds: '60', cooldownMinutes: '30' },
  { name: 'High Memory Usage', description: 'Alert when memory > 90%', metricType: 'MEMORY_USAGE', conditionOperator: 'GREATER_THAN', thresholdValue: '90', severity: 'CRITICAL', durationSeconds: '60', cooldownMinutes: '10' },
  { name: 'High Load Average', description: 'Alert when 1-min load average > 5', metricType: 'LOAD_AVERAGE', conditionOperator: 'GREATER_THAN', thresholdValue: '5', severity: 'WARNING', durationSeconds: '120', cooldownMinutes: '15' },
];

function RuleFormFields({
  formData,
  setFormData,
}: {
  formData: typeof emptyForm;
  setFormData: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Rule Name</Label>
        <Input
          id="name"
          placeholder="e.g., High CPU Alert"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe this alert rule..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Metric Type</Label>
          <Select value={formData.metricType} onValueChange={(v) => setFormData({ ...formData, metricType: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {METRIC_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Condition</Label>
          <Select value={formData.conditionOperator} onValueChange={(v) => setFormData({ ...formData, conditionOperator: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="threshold">Threshold Value</Label>
          <Input
            id="threshold"
            type="number"
            placeholder="90"
            value={formData.thresholdValue}
            onChange={(e) => setFormData({ ...formData, thresholdValue: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Severity</Label>
          <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITIES.map((sev) => (
                <SelectItem key={sev.value} value={sev.value}>{sev.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">How long the condition must be true before the alert fires (default: 60s)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="duration"
            type="number"
            min="0"
            placeholder="60"
            value={formData.durationSeconds}
            onChange={(e) => setFormData({ ...formData, durationSeconds: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="cooldown">Cooldown (minutes)</Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">Minimum time between repeat alerts for the same rule (default: 5m)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="cooldown"
            type="number"
            min="0"
            placeholder="5"
            value={formData.cooldownMinutes}
            onChange={(e) => setFormData({ ...formData, cooldownMinutes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export default function AlertRules() {
  const [servers, setServers] = useState<ServerType[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await serversApi.getAll();
        if (response.success) {
          setServers(response.data);
          if (response.data.length > 0) {
            setSelectedServer(response.data[0].id.toString());
          }
        }
      } catch {
        toast({ title: 'Failed to fetch servers', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchServers();
  }, [toast]);

  const fetchRules = useCallback(async () => {
    if (!selectedServer) return;
    try {
      const response = await alertRulesApi.getByServer(Number(selectedServer));
      if (response.success) setRules(response.data);
    } catch (error) {
      toast({
        title: 'Failed to fetch rules',
        description: error instanceof Error ? error.message : 'Could not load rules',
        variant: 'destructive',
      });
    }
  }, [selectedServer, toast]);

  useEffect(() => {
    if (selectedServer) fetchRules();
  }, [selectedServer, fetchRules]);

  const handleCreateRule = async () => {
    if (!selectedServer || !formData.name || !formData.metricType || !formData.conditionOperator || !formData.thresholdValue) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await alertRulesApi.create({
        name: formData.name,
        description: formData.description,
        serverId: Number(selectedServer),
        metricType: formData.metricType,
        conditionOperator: formData.conditionOperator,
        thresholdValue: Number(formData.thresholdValue),
        durationSeconds: Number(formData.durationSeconds),
        severity: formData.severity as 'CRITICAL' | 'WARNING' | 'INFO',
        cooldownMinutes: Number(formData.cooldownMinutes),
      });
      if (response.success) {
        setRules([...rules, response.data]);
        setIsCreateOpen(false);
        setFormData(emptyForm);
        toast({ title: 'Alert rule created' });
      }
    } catch (error) {
      toast({
        title: 'Failed to create rule',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRule = async () => {
    if (!editingRule) return;
    setIsSubmitting(true);
    try {
      const response = await alertRulesApi.update(editingRule.id, {
        name: formData.name,
        description: formData.description,
        metricType: formData.metricType,
        conditionOperator: formData.conditionOperator,
        thresholdValue: Number(formData.thresholdValue),
        durationSeconds: Number(formData.durationSeconds),
        severity: formData.severity as 'CRITICAL' | 'WARNING' | 'INFO',
        cooldownMinutes: Number(formData.cooldownMinutes),
      });
      if (response.success) {
        setRules(rules.map(r => r.id === editingRule.id ? response.data : r));
        setEditingRule(null);
        setFormData(emptyForm);
        toast({ title: 'Alert rule updated' });
      }
    } catch (error) {
      toast({
        title: 'Failed to update rule',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description ?? '',
      metricType: rule.metricType,
      conditionOperator: rule.conditionOperator,
      thresholdValue: String(rule.thresholdValue),
      durationSeconds: String(rule.durationSeconds),
      severity: rule.severity,
      cooldownMinutes: String(rule.cooldownMinutes),
    });
  };

  const handleToggleRule = async (ruleId: number, enabled: boolean) => {
    try {
      await alertRulesApi.toggle(ruleId, enabled);
      setRules(rules.map(r => r.id === ruleId ? { ...r, isEnabled: enabled } : r));
      toast({ title: `Rule ${enabled ? 'enabled' : 'disabled'}` });
    } catch {
      toast({ title: 'Failed to toggle rule', variant: 'destructive' });
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      await alertRulesApi.delete(ruleId);
      setRules(rules.filter(r => r.id !== ruleId));
      toast({ title: 'Rule deleted' });
    } catch {
      toast({ title: 'Failed to delete rule', variant: 'destructive' });
    }
  };

  const getOperatorSymbol = (op: string) => {
    return OPERATORS.find(o => o.value === op)?.symbol ?? op;
  };

  const getMetricLabel = (type: string) => {
    return METRIC_TYPES.find(m => m.value === type)?.label ?? type;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Alert Rules</h1>
            <p className="mt-1 text-muted-foreground">
              Configure threshold-based alerts for your servers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchRules} disabled={!selectedServer}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button disabled={servers.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Create Alert Rule</DialogTitle>
                  <DialogDescription>
                    Set up a new threshold-based alert for the selected server.
                  </DialogDescription>
                </DialogHeader>
                <RuleFormFields formData={formData} setFormData={setFormData} />
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setIsCreateOpen(false); setFormData(emptyForm); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRule} disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Rule'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingRule} onOpenChange={(open) => { if (!open) { setEditingRule(null); setFormData(emptyForm); } }}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Edit Alert Rule</DialogTitle>
              <DialogDescription>
                Update the configuration for this alert rule.
              </DialogDescription>
            </DialogHeader>
            <RuleFormFields formData={formData} setFormData={setFormData} />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditingRule(null); setFormData(emptyForm); }}>
                Cancel
              </Button>
              <Button onClick={handleEditRule} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Server Selector */}
        {servers.length > 0 && (
          <div className="flex items-center gap-4">
            <Server className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedServer} onValueChange={setSelectedServer}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server) => (
                  <SelectItem key={server.id} value={server.id.toString()}>
                    {server.name} ({server.hostAddress})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {rules.length} rule{rules.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Rule Overview Suggestion Templates */}
        {servers.length > 0 && selectedServer && rules.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-medium text-foreground text-sm">Quick-start templates</h3>
            <p className="text-xs text-muted-foreground">Apply a pre-built rule to get started quickly:</p>
            <div className="flex flex-wrap gap-2">
              {RULE_TEMPLATES.map((t) => (
                <Button
                  key={t.name}
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!selectedServer) return;
                    try {
                      const res = await alertRulesApi.create({
                        name: t.name,
                        description: t.description,
                        serverId: Number(selectedServer),
                        metricType: t.metricType,
                        conditionOperator: t.conditionOperator,
                        thresholdValue: Number(t.thresholdValue),
                        durationSeconds: Number(t.durationSeconds),
                        severity: t.severity as 'CRITICAL' | 'WARNING' | 'INFO',
                        cooldownMinutes: Number(t.cooldownMinutes),
                      });
                      setRules(prev => [...prev, res.data]);
                      toast({ title: `"${t.name}" rule created` });
                    } catch {
                      toast({ title: 'Failed to create rule', variant: 'destructive' });
                    }
                  }}
                >
                  + {t.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Rules Table */}
        {servers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
            <Server className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-display text-lg font-medium text-foreground">No servers registered</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add a server first to create alert rules</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-display text-lg font-medium text-foreground">No alert rules</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first alert rule to get notified when thresholds are breached
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Duration
                    </div>
                  </TableHead>
                  <TableHead>Cooldown</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} className={rule.isEnabled ? '' : 'opacity-60'}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{rule.name}</p>
                        {rule.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                            {rule.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getMetricLabel(rule.metricType)}</span>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                        {getOperatorSymbol(rule.conditionOperator)} {rule.thresholdValue}
                      </code>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={rule.severity} showDot={false} size="sm" />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{rule.durationSeconds}s</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{rule.cooldownMinutes}m</span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.isEnabled}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(rule)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
