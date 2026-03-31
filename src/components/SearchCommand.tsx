import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Server,
  Bell,
  AlertTriangle,
  Settings,
  History,
  FileText,
  HelpCircle,
  Info,
  Upload,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Ctrl+K / Cmd+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const runAndClose = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Servers', icon: Server, path: '/servers' },
    { label: 'Alerts', icon: Bell, path: '/alerts' },
    { label: 'Alert Rules', icon: AlertTriangle, path: '/rules' },
    { label: 'History', icon: History, path: '/history' },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const quickActions = [
    { label: 'Add Server', icon: Server, path: '/servers/new' },
    { label: 'Bulk Import', icon: Upload, path: '/servers/import' },
    { label: 'System Status', icon: Activity, path: '/status' },
  ];

  const resources = [
    { label: 'Documentation', icon: FileText, path: '/docs' },
    { label: 'FAQ', icon: HelpCircle, path: '/faq' },
    { label: 'Help & Support', icon: HelpCircle, path: '/help' },
    { label: 'About', icon: Info, path: '/about' },
  ];

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {navItems.map(item => (
              <CommandItem
                key={item.path}
                onSelect={() => runAndClose(() => navigate(item.path))}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            {quickActions.map(item => (
              <CommandItem
                key={item.path}
                onSelect={() => runAndClose(() => navigate(item.path))}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Resources">
            {resources.map(item => (
              <CommandItem
                key={item.path}
                onSelect={() => runAndClose(() => navigate(item.path))}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() => runAndClose(toggleTheme)}
              className="cursor-pointer"
            >
              {theme === 'dark' ? (
                <><Sun className="mr-2 h-4 w-4" />Switch to Light Mode</>
              ) : (
                <><Moon className="mr-2 h-4 w-4" />Switch to Dark Mode</>
              )}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
