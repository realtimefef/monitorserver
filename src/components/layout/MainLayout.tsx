import { ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SearchCommand } from '@/components/SearchCommand';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { Menu, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: ReactNode;
}

// Derive breadcrumb labels from pathname
function useBreadcrumbs(pathname: string) {
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    servers: 'Servers',
    new: 'Add Server',
    import: 'Bulk Import',
    alerts: 'Alerts',
    rules: 'Alert Rules',
    history: 'History',
    reports: 'Reports',
    settings: 'Settings',
    status: 'Status',
    docs: 'Documentation',
    about: 'About',
    faq: 'FAQ',
    features: 'Features',
    'how-it-works': 'How It Works',
    help: 'Help & Support',
    edit: 'Edit',
  };

  const segments = pathname.split('/').filter(Boolean);
  return segments.map((seg, i) => ({
    label: map[seg] ?? (seg.match(/^\d+$/) ? `#${seg}` : seg),
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const manualToggleRef = useRef(false);
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs(location.pathname);

  // Respond to mobile changes
  useEffect(() => {
    if (!manualToggleRef.current) {
      setSidebarOpen(!isMobile);
    }
    manualToggleRef.current = false;
  }, [isMobile]);

  const toggleSidebar = () => {
    manualToggleRef.current = true;
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    if (isMobile) setSidebarOpen(false);
  };

  // Listen for session lifecycle events dispatched by AuthContext
  useEffect(() => {
    const handleExpiring = () => {
      toast.warning('Session expiring soon', {
        description: 'Your session will expire in about 1 minute. Save your work.',
        duration: 10000,
      });
    };
    const handleExpired = () => {
      toast.error('Session expired', {
        description: 'You have been logged out.',
        duration: 5000,
      });
    };

    window.addEventListener('monitor:session-expiring', handleExpiring);
    window.addEventListener('monitor:session-expired', handleExpired);

    return () => {
      window.removeEventListener('monitor:session-expiring', handleExpiring);
      window.removeEventListener('monitor:session-expired', handleExpired);
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent relative">
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />

      {/* Mobile backdrop overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <main
        className={`transition-all duration-300 ${
          isMobile ? 'pl-0' : 'pl-64'
        }`}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
          {/* Hamburger — mobile only */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 text-sm overflow-hidden">
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.path} className="flex items-center gap-1 min-w-0">
                  {idx > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  <span
                    className={
                      crumb.isLast
                        ? 'font-medium text-foreground truncate'
                        : 'text-muted-foreground truncate'
                    }
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
          )}

          {/* Keyboard shortcut hint — desktop */}
          {!isMobile && (
            <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
              <kbd className="font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="font-mono">K</kbd>
            </div>
          )}
        </div>

        {/* Page content */}
        <div className="min-h-[calc(100vh-3.5rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Global command palette */}
      <SearchCommand />
    </div>
  );
}
