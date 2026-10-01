import { Link } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import { ArrowLeft } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">NodeVigil</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using NodeVigil, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>NodeVigil is a cloud server monitoring and alerting platform. AI-assisted features (anomaly detection, alert correlation, incident summaries, and policy-controlled remediation) are planned and not yet available. The service is currently in testing and access is limited to selected partners. Track CPU, memory, disk, and network metrics in real time with a web-based dashboard, lightweight agents, and configurable alert rules.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. You must provide accurate information when creating your account and keep it up to date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h2>
            <p>You agree to use NodeVigil only for lawful purposes. You may not use the service to monitor servers you do not own or have authorization to manage. You may not attempt to reverse-engineer, disrupt, or overload the service infrastructure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Agent Installation</h2>
            <p>By installing the NodeVigil agent on your server, you authorize it to collect and transmit system metrics (CPU, memory, disk, and network statistics) to the NodeVigil platform. The agent does not access file contents, user data, or application data on your server.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Ownership</h2>
            <p>You retain ownership of all metric data collected from your servers. NodeVigil does not claim any ownership rights over your data. We process your data only to provide and improve the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Service Availability</h2>
            <p>We strive to maintain high uptime but do not guarantee uninterrupted availability. The service may be temporarily unavailable for maintenance or due to circumstances beyond our control. We are not liable for any damages resulting from service downtime.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>NodeVigil is provided "as is" without warranties of any kind. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the service, including but not limited to loss of data or server downtime not detected by alerts.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Termination</h2>
            <p>You may close your account at any time through the Settings page. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, all data associated with your account will be permanently deleted.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to Terms</h2>
            <p>We may revise these Terms of Service from time to time. Updated terms will be posted on this page. Continued use of NodeVigil after changes constitutes acceptance of the revised terms.</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-6">
              <img src="/powered-by-aws.png" alt="Powered by AWS" className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
              <img src="/powered-by-nvidia.png" alt="NVIDIA GPU" className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <span>&copy; {new Date().getFullYear()} NodeVigil by <span className="text-foreground">Davinosia Pahilanipa</span></span>
              <nav className="flex gap-6">
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
                <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                <a href="mailto:support@nodevigil.cloud" className="hover:text-foreground transition-colors">support@nodevigil.cloud</a>
              </nav>
            </div>
          </div>
          <TestingNotice className="mt-6 text-center sm:text-left" />
        </div>
      </footer>
    </div>
  );
}
