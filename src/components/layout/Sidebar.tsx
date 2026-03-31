import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Bell,
  AlertTriangle,
  Settings,
  LogOut,
  History,
  FileText,
  HelpCircle,
  Info,
  Wifi,
  WifiOff,
  X,
  Sparkles,
  Route,
} from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const primaryNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Server, label: 'Servers', path: '/servers' },
  { icon: Bell, label: 'Alerts', path: '/alerts' },
  { icon: AlertTriangle, label: 'Alert Rules', path: '/rules' },
  { icon: History, label: 'History', path: '/history' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const secondaryNav = [
  { icon: Sparkles, label: 'Features', path: '/features' },
  { icon: Route, label: 'How It Works', path: '/how-it-works' },
  { icon: Info, label: 'About', path: '/about' },
  { icon: HelpCircle, label: 'FAQ', path: '/faq' },
  { icon: HelpCircle, label: 'Help & Support', path: '/help' },
];

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export function Sidebar({ isOpen, toggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // WebSocket connection status indicator
  // we show a simple status indicator
  const [realtimeStatus] = ['connected'];

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast({ title: 'Logout failed', variant: 'destructive' });
    }
  };

  const NavItem = ({ item }: { item: typeof primaryNav[0] }) => {
    const isActive =
      location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

    return (
      <Link
        to={item.path}
        onClick={() => {
          // Close sidebar on mobile when navigating
          if (window.innerWidth < 768) toggle();
        }}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        <span className="truncate">{item.label}</span>
        {isActive && (
          <div className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
              {/* Connection status dot */}
              <span
                className={cn(
                  'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar',
                  realtimeStatus === 'connected' ? 'bg-green-500' : 'bg-amber-500'
                )}
              />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Monitor</span>
          </Link>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  {realtimeStatus === 'connected' ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-amber-500" />
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">
                  {realtimeStatus === 'connected' ? 'Realtime Connected' : 'Connecting...'}
                </p>
              </TooltipContent>
            </Tooltip>
            <ThemeToggle />
            {/* Close button — mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={toggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {primaryNav.map(item => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-4 space-y-1">
            {secondaryNav.map(item => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.username || 'User'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
