import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Server, Loader2, Save } from 'lucide-react';
import { serversApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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

export default function EditServer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [hostAddress, setHostAddress] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadServer = async () => {
      if (!id) {
        navigate('/servers');
        return;
      }
      try {
        const response = await serversApi.getById(Number(id));
        if (response.success) {
          const s = response.data;
          setName(s.name);
          setHostAddress(s.hostAddress);
          setOperatingSystem(s.operatingSystem ?? '');
          setDescription(s.description ?? '');
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : '';
        if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
          setNotFound(true);
        } else {
          toast({
            title: 'Failed to load server',
            description: msg || 'Could not load server data',
            variant: 'destructive',
          });
          navigate('/servers');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadServer();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    try {
      await serversApi.update(Number(id), {
        name,
        hostAddress,
        operatingSystem,
        description,
      });
      toast({
        title: 'Server updated',
        description: `${name} has been updated successfully.`,
      });
      navigate(`/servers/${id}`);
    } catch (error) {
      toast({
        title: 'Failed to update server',
        description: error instanceof Error ? error.message : 'Could not update server',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build the OS options list, including current value if it falls outside the standard list
  const osOptions =
    operatingSystem && !operatingSystems.includes(operatingSystem)
      ? [operatingSystem, ...operatingSystems]
      : operatingSystems;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Back button skeleton */}
          <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
          {/* Title skeleton */}
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          </div>
          {/* Form card skeleton */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                <div className="h-3 w-52 animate-pulse rounded bg-muted" />
              </div>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (notFound) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/servers')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Servers
          </Button>
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Server className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
              Server not found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The server you're looking for doesn't exist or has been deleted.
            </p>
            <Button className="mt-6" onClick={() => navigate('/servers')}>
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
          onClick={() => navigate(`/servers/${id}`)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Server
        </Button>

        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Edit Server</h1>
          <p className="mt-1 text-muted-foreground">
            Update server name, address, operating system, and description
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
                <p className="text-sm text-muted-foreground">
                  Update the basic details for this server
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Server Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Production Server 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hostAddress">
                  Host Address <span className="text-destructive">*</span>
                </Label>
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
                <Select value={operatingSystem} onValueChange={setOperatingSystem}>
                  <SelectTrigger id="os">
                    <SelectValue placeholder="Select operating system" />
                  </SelectTrigger>
                  <SelectContent>
                    {osOptions.map((os) => (
                      <SelectItem key={os} value={os}>
                        {os}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description{' '}
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
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

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/servers/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
