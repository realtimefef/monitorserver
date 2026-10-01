import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Mail,
  Github,
  ExternalLink,
  AlertCircle,
  Wifi,
  Bell,
  LogIn,
  MemoryStick,
  ArrowLeft,
} from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Issue {
  icon: React.ElementType;
  title: string;
  body: string;
}

const commonIssues: Issue[] = [
  {
    icon: Wifi,
    title: 'Agent not sending metrics',
    body: `Check the following:
1. Verify your MONITOR_AGENT_KEY environment variable is set correctly on the server.
2. Confirm the agent process is running: ps aux | grep monitor-agent
3. Check network connectivity from the server to the API endpoint: curl -I https://api.monitorserver.io/health
4. Review the agent log output for error messages — look for HTTP 401 (bad key) or connection refused errors.
5. Make sure no firewall rules are blocking outbound HTTPS (port 443) from the server.`,
  },
  {
    icon: AlertCircle,
    title: 'Server always shows OFFLINE',
    body: `A server is marked OFFLINE when no heartbeat metric has been received within the heartbeat timeout window (default: 90 seconds).

Steps to diagnose:
1. Confirm the agent is actively running and not in a crashed/stopped state.
2. Check that the MONITOR_AGENT_KEY in the agent script matches the key shown on the Server Detail page.
3. If you regenerated the agent key recently, update the environment variable on the server and restart the agent service.
4. Verify the server's system clock is accurate (NTP synced) — large clock skew can cause issues.
5. Check the agent logs for repeated errors or silent exits.`,
  },
  {
    icon: Bell,
    title: 'No alerts firing',
    body: `If your alert rules exist but alerts are never triggered:
1. Go to Alert Rules and confirm the rule is enabled (the toggle should be ON).
2. Double-check the threshold value — for example, CPU_USAGE > 90 will only fire when CPU is above 90%, not 9%.
3. Check the "Duration" field on the rule: if set to 120 seconds, the condition must be continuously true for two full minutes before an alert fires.
4. Verify the metric type on the rule matches the metric the agent is actually sending (check the Server Detail page for live values).
5. Check if a cooldown period is active — the rule may have fired recently and is in its cooldown window.`,
  },
  {
    icon: LogIn,
    title: "Can't log in",
    body: `If you cannot log in to your account:
1. Check your email address for a verification email — new accounts require email verification before login is allowed. Check your spam/junk folder.
2. If you forgot your password, use the "Forgot password?" link on the Login page to request a reset link.
3. Make sure you're using the correct email address — the one you used during registration.
4. If your session expired, simply log in again. Sessions expire after the JWT token lifetime (typically 1 hour).
5. If login still fails, contact support at support@nodevigil.cloud with your email address.`,
  },
  {
    icon: MemoryStick,
    title: 'High memory usage in agent',
    body: `The agent is designed to be extremely lightweight, but if you observe high memory usage:
1. Check whether multiple agent instances are running simultaneously: ps aux | grep monitor-agent — kill any duplicates.
2. Reduce the poll interval in the agent script. A longer INTERVAL (e.g. 120s instead of 30s) reduces CPU and memory overhead.
3. If using the systemd service, ensure the Restart=always policy does not create a rapidly respawning loop that builds up zombie processes.
4. Update to the latest agent script from the Add Server page — performance improvements may be included.`,
  },
];

interface ShortcutRow {
  keys: string[];
  action: string;
}

const shortcuts: ShortcutRow[] = [
  { keys: ['Ctrl', 'K'], action: 'Open global command palette / search' },
  { keys: ['Esc'], action: 'Close sidebar, dialogs, or command palette' },
  { keys: ['R'], action: 'Refresh page data (where applicable)' },
];

function IssueCard({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState(false);
  const Icon = issue.icon;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="flex-1 font-medium text-foreground text-sm">{issue.title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1">
          <pre className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
            {issue.body}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function HelpSupport() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Monitor</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="outline">Log In</Button>
              </Link>
            )}
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 space-y-16">
        {/* Hero */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl font-bold text-foreground">Help &amp; Support</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the help you need. Browse our guides, troubleshoot common issues, or get in touch with
            the team.
          </p>
        </motion.div>

        {/* Getting Started */}
        <motion.section
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl font-semibold text-foreground">Getting Started</h2>
          <p className="text-muted-foreground">
            New to NodeVigil? These guides will get you up and running quickly.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/docs/getting-started"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Getting Started Guide</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Install NodeVigil, add your first server, deploy the agent, and verify metrics are
                flowing — step by step.
              </p>
              <div className="flex items-center gap-1 mt-4 text-sm text-primary">
                Read guide <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            <Link
              to="/docs/core-features"
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MonitorLogo className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Core Features</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Learn about real-time monitoring, alert rules, historical data export, scheduled reports,
                bulk import, and more.
              </p>
              <div className="flex items-center gap-1 mt-4 text-sm text-primary">
                Read guide <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </div>
        </motion.section>

        {/* Common Issues */}
        <motion.section
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl font-semibold text-foreground">Common Issues</h2>
          <p className="text-muted-foreground">
            Click any issue below to expand troubleshooting steps.
          </p>
          <div className="space-y-3">
            {commonIssues.map(issue => (
              <IssueCard key={issue.title} issue={issue} />
            ))}
          </div>
        </motion.section>

        {/* Contact / Support */}
        <motion.section
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl font-semibold text-foreground">Contact &amp; Support</h2>
          <p className="text-muted-foreground">
            Can't find what you're looking for? Reach out to us directly.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Email */}
            <a
              href="mailto:support@nodevigil.cloud"
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email Support</p>
                <p className="text-sm text-muted-foreground mt-0.5">support@nodevigil.cloud</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-primary mt-auto">
                Send email <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </a>

            {/* GitHub Issues */}
            <a
              href="https://github.com/monitorserver/monitorserver/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Github className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">GitHub Issues</p>
                <p className="text-sm text-muted-foreground mt-0.5">Report bugs or request features</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-primary mt-auto">
                Open GitHub <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </a>

            {/* Documentation */}
            <Link
              to="/docs"
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Documentation</p>
                <p className="text-sm text-muted-foreground mt-0.5">Full guides and API reference</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-primary mt-auto">
                Browse docs <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </div>
        </motion.section>

        {/* Keyboard Shortcuts */}
        <motion.section
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl font-semibold text-foreground">Keyboard Shortcuts</h2>
          <p className="text-muted-foreground">
            Speed up your workflow with these keyboard shortcuts available throughout the dashboard.
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Shortcut
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shortcuts.map((row, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1">
                        {row.keys.map((k, ki) => (
                          <span key={ki}>
                            <kbd className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono text-foreground">
                              {k}
                            </kbd>
                            {ki < row.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs mx-0.5">+</span>
                            )}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NodeVigil. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <a href="mailto:support@nodevigil.cloud" className="hover:text-foreground transition-colors">support@nodevigil.cloud</a>
          </nav>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-6">
          <TestingNotice className="text-center sm:text-left" />
        </div>
      </footer>
    </div>
  );
}
