import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Monitor</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Cookie Policy</h1>
            <p className="mt-2 text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <Separator />

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-foreground">
            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files stored on your device when you visit a website. They help the
                website remember your preferences and sessions across page loads or browser restarts.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold">Cookies We Use</h2>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">Purpose</th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { name: 'ms-access-token', type: 'Essential', purpose: 'Authentication session token (JWT)', expires: 'Session' },
                      { name: 'ms-refresh-token', type: 'Essential', purpose: 'Auth token renewal', expires: 'Session' },
                      { name: 'monitor-theme', type: 'Functional', purpose: 'Stores your dark/light theme preference', expires: '1 year (localStorage)' },
                      { name: 'monitor_user_settings', type: 'Functional', purpose: 'Stores dashboard display preferences', expires: 'Persistent (localStorage)' },
                      { name: 'monitor_scheduled_reports', type: 'Functional', purpose: 'Stores saved report templates', expires: 'Persistent (localStorage)' },
                    ].map(row => (
                      <tr key={row.name}>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">{row.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.purpose}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.expires}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold">Essential Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Essential cookies are required for the website to function. They enable authentication, security,
                and core features. You cannot opt out of these cookies.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold">Functional Cookies (localStorage)</h2>
              <p className="text-muted-foreground leading-relaxed">
                Functional data is stored in your browser's localStorage (not as HTTP cookies). This stores
                your theme preference, display settings, and report templates locally. This data never leaves
                your device.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold">No Analytics or Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                Monitor Server does not use analytics cookies, advertising cookies, or any third-party
                tracking. We do not sell your data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions about our cookie use? Contact us at{' '}
                <a href="mailto:support@monitorserver.in" className="text-primary hover:underline">
                  support@monitorserver.in
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Monitor Server.</p>
          <nav className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <a href="mailto:support@monitorserver.in" className="hover:text-foreground transition-colors">support@monitorserver.in</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
