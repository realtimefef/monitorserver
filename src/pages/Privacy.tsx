import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">CloudMonitor</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>When you create an account, we collect your email address and authentication credentials. When you connect servers, we collect server metrics such as CPU usage, memory usage, disk usage, and network throughput. This data is used solely to provide the monitoring service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Data</h2>
            <p>Your data is used to display real-time server metrics on your dashboard, trigger alert notifications based on your configured rules, and improve the reliability and performance of CloudMonitor. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
            <p>All data is stored in Supabase with PostgreSQL Row Level Security (RLS) enabled, ensuring each user can only access their own data. Authentication is handled via secure JWT tokens. All communication between the monitoring agents and our servers is encrypted.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Retention</h2>
            <p>Server metrics are retained for as long as your account is active. When you delete a server from your dashboard, all associated metric data is permanently removed. Upon account deletion, all personal data and server metrics are irreversibly deleted.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use third-party tracking cookies or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal data at any time through the Settings page. You may also request a complete data export by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Continued use of the service after changes constitutes acceptance of the revised policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact</h2>
            <p>If you have questions about this Privacy Policy, please reach out via our <Link to="/contact" className="text-primary hover:underline">Contact page</Link>.</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} CloudMonitor</span>
          <nav className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
