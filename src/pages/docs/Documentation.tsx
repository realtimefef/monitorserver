import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Code2, Zap, Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const sections = [
  { to: '/docs/getting-started', label: 'Getting Started', icon: BookOpen },
  { to: '/docs/core-features', label: 'Core Features', icon: Zap },
  { to: '/docs/api-reference', label: 'API Reference', icon: Code2 },
  { to: '/docs/security', label: 'Security & Compliance', icon: Shield },
];

const docCards = [
  {
    to: '/docs/getting-started',
    icon: BookOpen,
    title: 'Getting Started',
    description:
      'Install Monitor Server, add your first server, and deploy an agent in minutes. Includes prerequisites, configuration, and verification steps.',
  },
  {
    to: '/docs/core-features',
    icon: Zap,
    title: 'Core Features',
    description:
      'Real-time monitoring, multi-server management, threshold alert rules, history charts, data export, scheduled reports, and bulk import.',
  },
  {
    to: '/docs/api-reference',
    icon: Code2,
    title: 'API Reference',
    description:
      'Complete reference for all REST API endpoints — authentication, server management, metric ingestion, alerts, and alert rules.',
  },
  {
    to: '/docs/security',
    icon: Shield,
    title: 'Security & Compliance',
    description:
      'JWT authentication, per-user data isolation, agent key management, HTTPS enforcement, and security best practices.',
  },
];

export default function Documentation() {
  const location = useLocation();
  const isIndex = location.pathname === '/docs';
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Monitor</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            {sections.map(s => (
              <Link
                key={s.to}
                to={s.to}
                className={cn(
                  'hover:text-foreground transition-colors',
                  location.pathname === s.to && 'text-foreground font-medium'
                )}
              >
                {s.label}
              </Link>
            ))}
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
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {isIndex ? (
          /* Hub landing page */
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
                </Button>
              </Link>
              <h1 className="font-display text-4xl font-bold text-foreground">Documentation</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about Monitor Server — from initial setup to advanced
                features and the full API reference.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {docCards.map(card => (
                <Link
                  key={card.to}
                  to={card.to}
                  className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      {card.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm">{card.description}</p>
                  <div className="flex items-center gap-1 mt-4 text-sm text-primary">
                    Read more <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                Looking for troubleshooting help?{' '}
                <Link to="/help" className="text-primary hover:underline">
                  Visit Help &amp; Support
                </Link>{' '}
                or check the{' '}
                <Link to="/faq" className="text-primary hover:underline">
                  FAQ
                </Link>
                .
              </p>
            </div>
          </div>
        ) : (
          /* Two-column layout for sub-routes */
          <div className="flex gap-8">
            {/* Left sidebar — fixed on desktop, hidden on mobile */}
            <aside className="hidden lg:block w-52 shrink-0">
              <nav className="space-y-1 sticky top-24">
                <p className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Documentation
                </p>
                {sections.map(s => (
                  <Link
                    key={s.to}
                    to={s.to}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                      location.pathname === s.to
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <s.icon className="h-4 w-4 shrink-0" />
                    {s.label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-border mt-4">
                  <Link
                    to="/help"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Help &amp; Support
                  </Link>
                  <Link
                    to="/faq"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </div>
              </nav>
            </aside>

            {/* Right content area — rendered by nested routes via <Outlet /> */}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Monitor Server. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <a href="mailto:support@monitorserver.in" className="hover:text-foreground transition-colors">support@monitorserver.in</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
