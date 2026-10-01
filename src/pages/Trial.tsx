import { Link } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import { ArrowLeft, Rocket, CheckCircle2, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonitorLogo } from '@/components/MonitorLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

const currentFeatures = [
  'Unlimited server monitoring',
  'Real-time CPU, memory, disk & network metrics',
  'Custom alert rules with email notifications',
  'Webhook integrations (Slack, Discord, Generic)',
  'Scheduled PDF & Excel reports',
  'API key management',
  'Maintenance windows',
  'WebSocket live dashboard updates',
  'Multi-server fleet overview',
  'Metric history & export',
];

const comingSoon = [
  { name: 'AI Anomaly Detection', eta: 'Planned' },
  { name: 'Alert Correlation', eta: 'Planned' },
  { name: 'AI Incident Summaries', eta: 'Planned' },
  { name: 'Policy-Controlled Remediation (human approval + audit log)', eta: 'Planned' },
  { name: 'Smart Capacity Planning', eta: 'Planned' },
  { name: 'Root Cause Analysis', eta: 'Planned' },
];

export default function Trial() {
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
        <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Pricing
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" /> Pro Plan — Coming Soon
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Pro features are on the way
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              We're building AI-powered monitoring, alerting, and policy-controlled remediation. 
              In the meantime, <strong className="text-foreground">all current features are completely free</strong> — no limits, no credit card, no trial period.
            </p>
          </div>

          {/* Currently Free */}
          <motion.div
            className="rounded-2xl border border-primary/30 bg-primary/5 p-8 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">100% Free Right Now</h2>
                <p className="text-sm text-muted-foreground">All features included — no restrictions</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {currentFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Coming Soon */}
          <motion.div
            className="rounded-2xl border border-border bg-card p-8 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Planned — AI Pro Features</h2>
                <p className="text-sm text-muted-foreground">Planned, not yet available. Planned integrations include Azure AI Foundry, Azure Monitor / Log Analytics, and supported GPU compute.</p>
              </div>
            </div>
            <div className="space-y-4">
              {comingSoon.map((feature) => (
                <div key={feature.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-foreground">{feature.name}</span>
                  </div>
                  <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                    {feature.eta}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center rounded-2xl border border-border bg-card p-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-2">Start monitoring now — completely free</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This website is currently in testing and access is limited to selected partners. If you have access,
              add your servers and use every available feature. To request access, contact us.
            </p>
            <Link to="/register">
              <Button size="lg" className="shadow-lg shadow-primary/20">
                Get Started Free <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
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
