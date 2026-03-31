import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Monitor,
  KeyRound,
  Loader2,
  Check,
  Server,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
  Shield,
  Wifi,
  Link,
  Plus,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { authApi, userSettingsApi, type UserSettings, notificationPreferencesApi, type ServerNotificationPreferences, webhooksApi, type WebhookConfig as WebhookConfigType, apiKeysApi, type ApiKeyItem } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getApiUrl, setApiUrl } from '@/lib/apiClient';
import { useTimezone, TIMEZONE_OPTIONS } from '@/contexts/TimezoneContext';

// ── Password helpers ──────────────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return { score, label: 'Poor', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Okay', color: 'bg-amber-500' };
  if (score <= 5) return { score, label: 'Solid', color: 'bg-blue-500' };
  return { score, label: 'Excellent', color: 'bg-green-500' };
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Minimum 8 characters needed';
  if (!/[A-Z]/.test(password)) return 'Add at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Add at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Add at least one number';
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Add at least one special character';
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme, toggleTheme } = useTheme();
  const { timezone, setTimezone, formatDate } = useTimezone();
  const navigate = useNavigate();

  // ── API Configuration ───────────────────────────────────────────────────────
  const [apiUrl, setApiUrlState] = useState(getApiUrl());
  const [isSavingApiUrl, setIsSavingApiUrl] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleSaveApiUrl = () => {
    setIsSavingApiUrl(true);
    try {
      setApiUrl(apiUrl.trim());
      toast({ title: 'API URL saved' });
    } catch {
      toast({ title: 'Failed to save API URL', variant: 'destructive' });
    } finally {
      setIsSavingApiUrl(false);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    const base = apiUrl.replace(/\/$/, '');
    const url = `${base}/auth/validate`;
    const start = performance.now();
    try {
      const token = localStorage.getItem('monitor_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(url, { method: 'GET', headers });
      const ms = Math.round(performance.now() - start);
      // Any non-network response means the server is reachable
      if (res.status < 500) {
        setTestStatus('success');
        setTestMessage(`Connected successfully (${ms}ms, HTTP ${res.status})`);
      } else {
        setTestStatus('error');
        setTestMessage(`Server error HTTP ${res.status} (${ms}ms)`);
      }
    } catch {
      const ms = Math.round(performance.now() - start);
      setTestStatus('error');
      setTestMessage(`Connection failed after ${ms}ms. Check the URL and CORS settings.`);
    }
  };

  // ── Password Change ─────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordError = newPassword ? validatePassword(newPassword) : null;

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'All three password fields are required', variant: 'destructive' });
      return;
    }
    if (passwordError) {
      toast({ title: passwordError, variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords don\'t match', variant: 'destructive' });
      return;
    }
    setIsChangingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Password updated successfully' });
    } catch (error) {
      toast({
        title: 'Could not update password',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ── Notification Preferences ────────────────────────────────────────────────
  const [settings, setSettings] = useState<UserSettings>(userSettingsApi.get());
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const updateNotif = (key: keyof UserSettings['notifications'], value: boolean) => {
    // Optimistic update: apply to UI immediately
    const previous = settings;
    const updated: UserSettings = {
      ...settings,
      notifications: { ...settings.notifications, [key]: value },
    };
    setSettings(updated);
    setIsSavingSettings(true);
    try {
      userSettingsApi.save(updated);
      toast({ title: 'Preferences saved' });
    } catch {
      setSettings(previous);
      toast({ title: 'Failed to save preferences', variant: 'destructive' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ── Server Notification Preferences ────────────────────────────────────────
  const [serverPrefs, setServerPrefs] = useState<ServerNotificationPreferences | null>(null);
  const [isLoadingServerPrefs, setIsLoadingServerPrefs] = useState(false);
  const [isSavingServerPrefs, setIsSavingServerPrefs] = useState(false);

  useEffect(() => {
    setIsLoadingServerPrefs(true);
    notificationPreferencesApi
      .get()
      .then((prefs) => {
        setServerPrefs(prefs);
        // Sync timezone from server preferences
        if (prefs.timezone) {
          setTimezone(prefs.timezone);
        }
      })
      .catch(() => {
        // Endpoint may not exist yet — silently skip
      })
      .finally(() => setIsLoadingServerPrefs(false));
  }, [setTimezone]);

  const handleSaveServerPrefs = async () => {
    if (!serverPrefs) return;
    setIsSavingServerPrefs(true);
    try {
      await notificationPreferencesApi.update(serverPrefs);
      toast({ title: 'Notification preferences saved' });
    } catch (error) {
      toast({
        title: 'Failed to save preferences',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSavingServerPrefs(false);
    }
  };

  // ── Account Deletion ────────────────────────────────────────────────────────
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // ── Webhooks ────────────────────────────────────────────────────────────────
  const [webhooks, setWebhooks] = useState<WebhookConfigType[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', type: 'GENERIC' });
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  useEffect(() => {
    setIsLoadingWebhooks(true);
    webhooksApi.getAll()
      .then(setWebhooks)
      .catch(() => {})
      .finally(() => setIsLoadingWebhooks(false));
  }, []);

  const handleCreateWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({ title: 'Name and URL are required', variant: 'destructive' });
      return;
    }
    setIsCreatingWebhook(true);
    try {
      const created = await webhooksApi.create(newWebhook);
      setWebhooks((prev) => [...prev, created]);
      setNewWebhook({ name: '', url: '', type: 'GENERIC' });
      toast({ title: 'Webhook created' });
    } catch (error) {
      toast({ title: 'Failed to create webhook', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: number) => {
    try {
      await webhooksApi.delete(id);
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      toast({ title: 'Webhook deleted' });
    } catch {
      toast({ title: 'Failed to delete webhook', variant: 'destructive' });
    }
  };

  const handleToggleWebhook = async (id: number, enabled: boolean) => {
    try {
      await webhooksApi.update(id, { enabled });
      setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, enabled } : w)));
    } catch {
      toast({ title: 'Failed to update webhook', variant: 'destructive' });
    }
  };

  // ── API Keys ────────────────────────────────────────────────────────────────
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('90');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => {
    setIsLoadingApiKeys(true);
    apiKeysApi.getAll()
      .then(setApiKeys)
      .catch(() => {})
      .finally(() => setIsLoadingApiKeys(false));
  }, []);

  const handleCreateApiKey = async () => {
    if (!newKeyName) {
      toast({ title: 'Key name is required', variant: 'destructive' });
      return;
    }
    setIsCreatingKey(true);
    try {
      const created = await apiKeysApi.create({ name: newKeyName, expiresInDays: newKeyExpiry });
      setApiKeys((prev) => [created, ...prev]);
      setRevealedKey(created.key ?? null);
      setNewKeyName('');
      toast({ title: 'API key created. Copy it now — it won\'t be shown again.' });
    } catch (error) {
      toast({ title: 'Failed to create API key', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleRevokeApiKey = async (id: number) => {
    try {
      await apiKeysApi.revoke(id);
      setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, active: false } : k)));
      toast({ title: 'API key revoked' });
    } catch {
      toast({ title: 'Failed to revoke key', variant: 'destructive' });
    }
  };

  const handleDeleteApiKey = async (id: number) => {
    try {
      await apiKeysApi.delete(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      toast({ title: 'API key deleted' });
    } catch {
      toast({ title: 'Failed to delete key', variant: 'destructive' });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await authApi.deleteAccount();
      logout();
      navigate('/');
    } catch (error) {
      toast({
        title: 'Failed to delete account',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <RouterLink to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
            </Button>
          </RouterLink>
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account, API configuration, and preferences
          </p>
        </div>

        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="api" className="gap-2">
              <Server className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <KeyRound className="h-4 w-4" />
              Password
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Link className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="apikeys" className="gap-2">
              <KeyRound className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Monitor className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* ── API Configuration ─────────────────────────────────────────────── */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>API Configuration</CardTitle>
                    <CardDescription>Configure the backend API endpoint</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="api-url">API Base URL</Label>
                  <Input
                    id="api-url"
                    value={apiUrl}
                    onChange={(e) => setApiUrlState(e.target.value)}
                    placeholder="http://localhost:8080/api/v1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: http://localhost:8080/api/v1. Stored in localStorage as{' '}
                    <code className="rounded bg-muted px-1 py-0.5">monitor_api_url</code>.
                  </p>
                </div>

                {testStatus !== 'idle' && (
                  <div
                    className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                      testStatus === 'testing'
                        ? 'bg-muted text-muted-foreground'
                        : testStatus === 'success'
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {testStatus === 'testing' && (
                      <Loader2 className="h-4 w-4 animate-spin mt-0.5 shrink-0" />
                    )}
                    {testStatus === 'success' && (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                    {testStatus === 'error' && (
                      <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                    <span>
                      {testStatus === 'testing' ? 'Testing connection...' : testMessage}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleSaveApiUrl} disabled={isSavingApiUrl}>
                    {isSavingApiUrl ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save URL
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                  >
                    {testStatus === 'testing' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Wifi className="mr-2 h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Password Change ───────────────────────────────────────────────── */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <KeyRound className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Update Password</CardTitle>
                    <CardDescription>Choose a new password for your account</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Current password */}
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Your current password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                      onClick={() => setShowCurrentPw((p) => !p)}
                    >
                      {showCurrentPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* New password */}
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8+ chars with upper, lower, number & symbol"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                      onClick={() => setShowNewPw((p) => !p)}
                    >
                      {showNewPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Strength indicator */}
                  {newPassword && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.label === 'Poor'
                              ? 'text-red-500'
                              : passwordStrength.label === 'Okay'
                              ? 'text-amber-500'
                              : passwordStrength.label === 'Solid'
                              ? 'text-blue-500'
                              : 'text-green-500'
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      {passwordError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {passwordError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type={showNewPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="w-full"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Notification Preferences ──────────────────────────────────────── */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Control when and how you receive alerts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Email notifications — saved to localStorage only for refresh/timerange */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Browser Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Push notifications in the browser
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.browserNotifications}
                    onCheckedChange={(v) => updateNotif('browserNotifications', v)}
                  />
                </div>

                {isSavingSettings && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving preferences...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ── Server Notification Preferences (API) ──────────────────────── */}
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Configure server-side email and quiet hours settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {isLoadingServerPrefs ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading preferences...
                  </div>
                ) : serverPrefs === null ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Server notification preferences are not available. Ensure the backend endpoint
                    <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">
                      GET /notifications/preferences
                    </code>
                    is configured.
                  </p>
                ) : (
                  <>
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">
                          Receive alert emails from the server
                        </p>
                      </div>
                      <Switch
                        checked={serverPrefs.emailEnabled}
                        onCheckedChange={(v) =>
                          setServerPrefs((p) => p ? { ...p, emailEnabled: v } : p)
                        }
                      />
                    </div>

                    {serverPrefs.emailEnabled && (
                      <div className="ml-4 space-y-4 border-l border-border pl-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-500">Critical Alerts</p>
                            <p className="text-xs text-muted-foreground">
                              Send email for critical severity alerts
                            </p>
                          </div>
                          <Switch
                            checked={serverPrefs.emailCritical}
                            onCheckedChange={(v) =>
                              setServerPrefs((p) => p ? { ...p, emailCritical: v } : p)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-amber-500">Warning Alerts</p>
                            <p className="text-xs text-muted-foreground">
                              Send email for warning severity alerts
                            </p>
                          </div>
                          <Switch
                            checked={serverPrefs.emailWarning}
                            onCheckedChange={(v) =>
                              setServerPrefs((p) => p ? { ...p, emailWarning: v } : p)
                            }
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Timezone */}
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">Timezone</p>
                        <p className="text-xs text-muted-foreground">
                          All dates and times across the app will display in this timezone
                        </p>
                      </div>
                      <Select
                        value={serverPrefs.timezone || timezone}
                        onValueChange={(v) => {
                          setTimezone(v);
                          setServerPrefs((p) => p ? { ...p, timezone: v } : p);
                        }}
                      >
                        <SelectTrigger className="w-full max-w-sm">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONE_OPTIONS.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Current: <span className="font-mono text-foreground">{serverPrefs.timezone || timezone}</span>
                        {' · '}
                        Local time: <span className="font-mono text-foreground">
                          {new Intl.DateTimeFormat(undefined, {
                            timeZone: serverPrefs.timezone || timezone,
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZoneName: 'short',
                          }).format(new Date())}
                        </span>
                      </p>
                    </div>

                    <Separator />

                    {/* Quiet Hours */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Quiet Hours</p>
                          <p className="text-xs text-muted-foreground">
                            Suppress notifications during specified hours
                          </p>
                        </div>
                        <Switch
                          checked={serverPrefs.quietHoursEnabled}
                          onCheckedChange={(v) =>
                            setServerPrefs((p) => p ? { ...p, quietHoursEnabled: v } : p)
                          }
                        />
                      </div>

                      {serverPrefs.quietHoursEnabled && (
                        <div className="ml-4 flex items-center gap-4 border-l border-border pl-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start Hour</Label>
                            <Select
                              value={String(serverPrefs.quietHoursStart ?? 22)}
                              onValueChange={(v) =>
                                setServerPrefs((p) =>
                                  p ? { ...p, quietHoursStart: Number(v) } : p
                                )
                              }
                            >
                              <SelectTrigger className="w-[90px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem key={i} value={String(i)}>
                                    {String(i).padStart(2, '0')}:00
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End Hour</Label>
                            <Select
                              value={String(serverPrefs.quietHoursEnd ?? 8)}
                              onValueChange={(v) =>
                                setServerPrefs((p) =>
                                  p ? { ...p, quietHoursEnd: Number(v) } : p
                                )
                              }
                            >
                              <SelectTrigger className="w-[90px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem key={i} value={String(i)}>
                                    {String(i).padStart(2, '0')}:00
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSaveServerPrefs}
                      disabled={isSavingServerPrefs}
                    >
                      {isSavingServerPrefs ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Webhooks ──────────────────────────────────────────────────── */}
          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Link className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Webhook Notifications</CardTitle>
                    <CardDescription>Send alert notifications to Slack, Discord, or custom endpoints</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Create new webhook */}
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="font-medium text-sm">Add Webhook</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input placeholder="e.g. Slack Alerts" value={newWebhook.name} onChange={(e) => setNewWebhook(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL (HTTPS)</Label>
                      <Input placeholder="https://hooks.slack.com/..." value={newWebhook.url} onChange={(e) => setNewWebhook(p => ({ ...p, url: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select value={newWebhook.type} onValueChange={(v) => setNewWebhook(p => ({ ...p, type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SLACK">Slack</SelectItem>
                          <SelectItem value="DISCORD">Discord</SelectItem>
                          <SelectItem value="GENERIC">Generic JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleCreateWebhook} disabled={isCreatingWebhook} size="sm">
                    {isCreatingWebhook ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Add Webhook
                  </Button>
                </div>

                {/* Webhook list */}
                {isLoadingWebhooks ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading webhooks...
                  </div>
                ) : webhooks.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No webhooks configured yet.</p>
                ) : (
                  <div className="space-y-3">
                    {webhooks.map((wh) => (
                      <div key={wh.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{wh.name}</p>
                            <Badge variant="secondary" className="text-[10px]">{wh.type}</Badge>
                            {wh.enabled ? (
                              <Badge variant="default" className="text-[10px] bg-green-500/10 text-green-600">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{wh.url}</p>
                          {wh.lastError && <p className="text-xs text-destructive">Last error: {wh.lastError}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <Switch checked={wh.enabled} onCheckedChange={(v) => handleToggleWebhook(wh.id, v)} />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteWebhook(wh.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── API Keys ──────────────────────────────────────────────────────── */}
          <TabsContent value="apikeys">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <KeyRound className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Create API keys for programmatic access to your servers and data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Revealed key banner */}
                {revealedKey && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="inline h-4 w-4 mr-1" />
                      Copy this key now. It will not be shown again.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted p-2 text-xs font-mono break-all">{revealedKey}</code>
                      <Button variant="outline" size="icon" className="shrink-0" onClick={() => { navigator.clipboard.writeText(revealedKey); toast({ title: 'Key copied to clipboard' }); }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="link" size="sm" className="px-0 text-xs" onClick={() => setRevealedKey(null)}>Dismiss</Button>
                  </div>
                )}

                {/* Create new key */}
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="font-medium text-sm">Create New Key</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Key Name</Label>
                      <Input placeholder="e.g. CI/CD Pipeline" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Expires In (days)</Label>
                      <Select value={newKeyExpiry} onValueChange={setNewKeyExpiry}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleCreateApiKey} disabled={isCreatingKey} size="sm">
                    {isCreatingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Generate Key
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Use with <code className="rounded bg-muted px-1 py-0.5">Authorization: ApiKey ms_...</code> header.
                  Max 5 active keys per account.
                </p>

                {/* Key list */}
                {isLoadingApiKeys ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading API keys...
                  </div>
                ) : apiKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No API keys have been created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((k) => (
                      <div key={k.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{k.name}</p>
                            {k.active ? (
                              <Badge variant="default" className="text-[10px] bg-green-500/10 text-green-600">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-destructive">Revoked</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Prefix: <code className="rounded bg-muted px-1">{k.prefix}...</code>
                            {k.expiresAt && <> · Expires: {formatDate(k.expiresAt, 'short')}</>}
                            {k.lastUsedAt && <> · Last used: {formatDate(k.lastUsedAt, 'short')}</>}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {k.active && (
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => handleRevokeApiKey(k.id)}>
                              Revoke
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteApiKey(k.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Account ───────────────────────────────────────────────────────── */}
          <TabsContent value="account">
            <div className="space-y-4">
              {/* Account info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Your account details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Email
                    </Label>
                    <p className="font-medium text-foreground">{user?.email ?? '—'}</p>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Username
                    </Label>
                    <p className="font-medium text-foreground">{user?.username ?? '—'}</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      Role
                    </Label>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {user?.role ?? 'User'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Danger zone */}
              <Card className="border-destructive/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-destructive">Danger Zone</CardTitle>
                      <CardDescription>Irreversible account actions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
                    <div>
                      <p className="font-medium text-foreground">Delete Account</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permanently delete your account and all associated data. This action cannot
                        be undone.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your account and all monitoring data. Your
                            servers will no longer be monitored and this action{' '}
                            <strong>cannot be undone</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeletingAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeletingAccount ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              'Yes, delete my account'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Appearance ────────────────────────────────────────────────────── */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the dashboard</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-foreground">Theme</Label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-4">
                    Currently active:{' '}
                    <span className="font-medium text-foreground capitalize">{theme}</span>
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                          theme === t
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        {t === 'light' && <Sun className="h-5 w-5 text-amber-500" />}
                        {t === 'dark' && <Moon className="h-5 w-5 text-blue-400" />}
                        {t === 'system' && <Monitor className="h-5 w-5 text-muted-foreground" />}
                        <span className="text-xs font-medium capitalize text-foreground">{t}</span>
                        {theme === t && (
                          <Badge variant="default" className="text-xs px-1.5 py-0">
                            Active
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Quick Toggle</p>
                    <p className="text-xs text-muted-foreground">Switch between light and dark</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4" />
                        Switch to Light
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        Switch to Dark
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
