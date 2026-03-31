import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Server,
  Loader2,
  Copy,
  Check,
  Terminal,
  Download,
  ChevronRight,
} from 'lucide-react';
import { serversApi, Server as ServerType } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/apiClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const operatingSystems = [
  'Linux (Ubuntu / Debian)',
  'Linux (CentOS / RHEL / Fedora)',
  'Linux (Other)',
  'macOS',
  'Windows Server 2022',
  'Windows Server 2019',
  'Windows Server 2016',
  'Windows 11',
  'Windows 10',
  'FreeBSD',
  'Alpine Linux',
  'Amazon Linux',
  'Other',
];

function buildBashScript(apiUrl: string, agentKey: string): string {
  return [
    '#!/bin/bash',
    `# Download and run the Monitor Server agent`,
    `MONITOR_API_URL="${apiUrl}"`,
    `AGENT_KEY="${agentKey}"`,
    ``,
    `# Step 1: Download the agent script`,
    `curl -fsSL "\${MONITOR_API_URL}/agent/monitor-agent.sh" -o monitor-agent.sh || \\`,
    `  wget -q "\${MONITOR_API_URL}/agent/monitor-agent.sh" -O monitor-agent.sh`,
    'chmod +x monitor-agent.sh',
    ``,
    `# Step 2: Run the agent (it loops automatically)`,
    `MONITOR_API_URL="\${MONITOR_API_URL}" AGENT_KEY="\${AGENT_KEY}" ./monitor-agent.sh`,
  ].join('\n');
}

function buildPsScript(apiUrl: string, agentKey: string): string {
  return [
    `# Download and run the Monitor Server agent`,
    `$MONITOR_API_URL = "${apiUrl}"`,
    `$AGENT_KEY = "${agentKey}"`,
    ``,
    `# Step 1: Download the agent script`,
    `Invoke-WebRequest -Uri "$MONITOR_API_URL/agent/monitor-agent.ps1" -OutFile monitor-agent.ps1`,
    ``,
    `# Step 2: Run the agent (it loops automatically)`,
    `.\\monitor-agent.ps1 -ApiUrl $MONITOR_API_URL -AgentKey $AGENT_KEY`,
  ].join('\n');
}

export default function AddServer() {
  const [name, setName] = useState('');
  const [hostAddress, setHostAddress] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdServer, setCreatedServer] = useState<ServerType | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await serversApi.create({
        name,
        hostAddress,
        operatingSystem,
        description,
      });

      if (response.success) {
        setCreatedServer(response.data);
        toast({
          title: 'Server added!',
          description: 'Now install the monitoring agent on your server.',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to register server',
        description: error instanceof Error ? error.message : 'Could not register server',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (createdServer) {
    const apiUrl = getApiUrl();
    const agentKey = createdServer.agentKey;
    const isWindows = createdServer.operatingSystem?.toLowerCase().includes('windows');
    const script = isWindows ? buildPsScript(apiUrl, agentKey) : buildBashScript(apiUrl, agentKey);
    const scriptExt = isWindows ? 'ps1' : 'sh';
    const maskedKey =
      agentKey.length > 8
        ? agentKey.slice(0, 8) + '•'.repeat(Math.min(agentKey.length - 8, 20))
        : agentKey;

    const copyAgentKey = () => {
      navigator.clipboard.writeText(agentKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    };

    const copyScript = () => {
      navigator.clipboard.writeText(script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    };

    const downloadScript = () => {
      const safeName = createdServer.name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      const filename = `monitor-agent-${safeName}.${scriptExt}`;
      const blob = new Blob([script], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
      <MainLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Success header */}
          <div className="rounded-xl border border-success/30 bg-success/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Server added! Install the agent
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {createdServer.name}{' '}
                  <span className="text-muted-foreground/60">·</span>{' '}
                  {createdServer.hostAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Agent Key */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div>
              <h3 className="font-medium text-foreground">Agent Key</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keep this key secure — it authenticates the agent with the server.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={maskedKey}
                readOnly
                className="font-mono text-sm bg-muted/50"
              />
              <Button variant="outline" onClick={copyAgentKey} className="shrink-0">
                {copiedKey ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Script */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">Installation Script</h3>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {isWindows ? 'PowerShell' : 'Bash'}
              </span>
            </div>

            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs font-mono text-foreground leading-relaxed whitespace-pre">
              {script}
            </pre>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyScript}>
                {copiedScript ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-success" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Script
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadScript}>
                <Download className="mr-2 h-4 w-4" />
                Download .{scriptExt}
              </Button>
            </div>
          </div>

          {/* OS-specific instructions */}
          <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">
              {isWindows ? 'Windows — Quick Start' : 'Linux / macOS — Quick Start'}
            </p>
            {isWindows ? (
              <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
                <li>Open <strong>PowerShell</strong> on your server (Run as Administrator recommended)</li>
                <li>Paste the script above — it downloads the agent and starts it automatically</li>
                <li>Metrics will appear on your dashboard within seconds</li>
                <li>To keep it running permanently, set it up as a Windows Service or Scheduled Task</li>
              </ol>
            ) : (
              <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal list-inside">
                <li>SSH into your server and paste the script above — it downloads and runs the agent</li>
                <li>Metrics will appear on your dashboard within seconds</li>
                <li>
                  To keep it running in the background:{' '}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono text-primary">
                    nohup ./monitor-agent.sh &amp;
                  </code>
                </li>
                <li>For auto-start on boot, set up a systemd service (see docs for details)</li>
              </ol>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => navigate(`/servers/${createdServer.id}`)}>
              Go to Server
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/servers')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Servers
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/servers')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Servers
        </Button>

        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Add Server</h1>
          <p className="mt-1 text-muted-foreground">
            Register a new server for monitoring
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Server Information</h3>
                <p className="text-sm text-muted-foreground">Basic details about your server</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Server Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Production Server 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hostAddress">Host Address</Label>
                <Input
                  id="hostAddress"
                  placeholder="e.g., 192.168.1.100 or server.example.com"
                  value={hostAddress}
                  onChange={(e) => setHostAddress(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="os">Operating System</Label>
                <Select value={operatingSystem} onValueChange={setOperatingSystem} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operating system" />
                  </SelectTrigger>
                  <SelectContent>
                    {operatingSystems.map((os) => (
                      <SelectItem key={os} value={os}>
                        {os}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this server's purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/servers')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Server'
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
