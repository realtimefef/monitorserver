import { Link } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';
import {
  Cpu, HardDrive, Wifi, Bell, Eye, Lock,
  BarChart3, Zap, Shield, Clock, Download, Globe, Server,
  TrendingUp, Layers, ArrowRight, CheckCircle2, ArrowLeft,
  FileText, Settings, Mail, RefreshCw, Brain, Sparkles,
  Workflow, ScrollText, UserCheck, ShieldCheck,
} from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';

const featureGroups = [
  {
    tag: 'Monitoring',
    title: 'Deep system visibility',
    desc: 'Capture every metric that matters — from CPU utilization to network throughput — all without installing heavy agents or opening inbound ports.',
    features: [
      {
        icon: Cpu,
        title: 'CPU & Load Tracking',
        desc: 'Track per-core processor usage, load averages, and process queue lengths. Spot runaway processes before they starve your application.',
        highlights: ['Per-core breakdown', 'Load average trends', '5-second granularity'],
      },
      {
        icon: HardDrive,
        title: 'Memory & Disk',
        desc: 'Monitor RAM consumption, swap pressure, and disk space across every partition. Get ahead of out-of-memory kills and full-disk outages.',
        highlights: ['Used / available / total', 'Swap monitoring', 'Multi-partition support'],
      },
      {
        icon: Wifi,
        title: 'Network Throughput',
        desc: 'See inbound and outbound traffic rates in real time. Identify bandwidth spikes, saturation events, and unusual traffic patterns instantly.',
        highlights: ['RX/TX bytes per second', 'Interface-level data', 'Anomaly visibility'],
      },
      {
        icon: TrendingUp,
        title: 'Process & Uptime',
        desc: 'Count running processes, track system uptime, and see load averages — all in one view. Understand workload density across your fleet.',
        highlights: ['Total process count', 'Boot-time uptime', '1-min load average'],
      },
    ],
  },
  {
    tag: 'Alerting',
    title: 'Stay ahead of incidents',
    desc: 'Define custom rules, set severity levels, and receive notifications the moment something crosses a threshold.',
    features: [
      {
        icon: Bell,
        title: 'Custom Alert Rules',
        desc: 'Create rules per server and metric. Pick a comparison operator, set a numeric threshold, choose severity (Info / Warning / Critical), and configure cooldown periods.',
        highlights: ['6 comparison operators', '3 severity levels', 'Configurable cooldown'],
      },
      {
        icon: Mail,
        title: 'Email Notifications',
        desc: 'Receive branded HTML email alerts the instant a threshold is breached. Configure quiet hours so you are not woken up for non-critical spikes.',
        highlights: ['Branded HTML emails', 'Quiet hours support', 'Per-user preferences'],
      },
      {
        icon: Clock,
        title: 'Alert History',
        desc: 'Every alert is logged with timestamp, metric value, threshold, and resolution status. Review incident timelines and resolve alerts with one click.',
        highlights: ['Full audit trail', 'Acknowledge & resolve', 'Cooldown tracking'],
      },
      {
        icon: Zap,
        title: 'Real-time WebSocket',
        desc: 'Alerts push to your browser instantly over WebSocket — no polling delay, no page refresh. See the alert banner appear the moment it fires.',
        highlights: ['Sub-second delivery', 'STOMP over SockJS', 'Auto-reconnect'],
      },
    ],
  },
  {
    tag: 'Dashboard & Reporting',
    title: 'Visualize and export everything',
    desc: 'Interactive charts, fleet-wide overviews, and exportable reports in multiple formats.',
    features: [
      {
        icon: Eye,
        title: 'Live Dashboard',
        desc: 'See every server at a glance. Metric cards, status badges, and aggregated counts update every 5 seconds without touching the browser.',
        highlights: ['5-second refresh', 'Fleet summary', 'Status badges'],
      },
      {
        icon: BarChart3,
        title: 'Rich Charts',
        desc: 'Line, area, and bar charts for CPU, memory, disk, and network. Switch time ranges (1H, 6H, 24H, 7D) and chart types with one click.',
        highlights: ['3 chart types', '4 time ranges', 'Recharts powered'],
      },
      {
        icon: Download,
        title: 'Multi-format Export',
        desc: 'Export metric history as CSV, JSON, Excel, PDF, PNG, or JPG. Schedule recurring reports in PDF, CSV, or Excel with one-click generation.',
        highlights: ['6 export formats', 'Scheduled reports', 'On-demand download'],
      },
      {
        icon: FileText,
        title: 'Scheduled Reports',
        desc: 'Create report templates that capture specific servers, metrics, and time frames. Generate polished summaries whenever you need them.',
        highlights: ['Custom templates', 'Multi-server', 'One-click generate'],
      },
    ],
  },
  {
    tag: 'Infrastructure',
    title: 'Built for production',
    desc: 'Enterprise-grade security, multi-server support, and effortless bulk management.',
    features: [
      {
        icon: Lock,
        title: 'Security First',
        desc: 'JWT authentication, per-user data isolation, HTTPS everywhere, and auto-expiring tokens. Your data stays yours — always.',
        highlights: ['JWT auth', 'Row-level isolation', 'Auto-expiring tokens'],
      },
      {
        icon: Globe,
        title: 'Multi-server Fleet',
        desc: 'Add as many servers as you need. Each gets a unique agent key. Manage them all from a single dashboard with filtering and search.',
        highlights: ['Unlimited servers', 'Unique agent keys', 'Fleet overview'],
      },
      {
        icon: Layers,
        title: 'Bulk Import',
        desc: 'Register dozens of servers in one go via CSV upload. Validation, error reporting, and retry are all built in.',
        highlights: ['CSV upload', 'Inline validation', 'Retry failed rows'],
      },
      {
        icon: Settings,
        title: 'Agent Key Management',
        desc: 'Regenerate compromised keys instantly from the dashboard. The old key is invalidated immediately — zero-downtime key rotation.',
        highlights: ['Instant regeneration', 'Old key revoked', 'Zero downtime'],
      },
    ],
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function Features() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight hidden sm:inline">NodeVigil</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features', to: '/features' },
              { label: 'Pricing', to: '/pricing' },
              { label: 'How It Works', to: '/how-it-works' },
            ].map((n) => (
              <Link key={n.to} to={n.to} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <ThemeToggle />
            {isAuthenticated ? (
              <Button size="sm" asChild><Link to="/dashboard">Dashboard</Link></Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex"><Link to="/login">Log in</Link></Button>
                <Button size="sm" className="shadow-lg shadow-primary/25" asChild><Link to="/contact">Request access</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="pt-28 pb-20 sm:pt-32 sm:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/[0.04] rounded-full blur-[160px]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <RefreshCw className="h-3 w-3" /> 16 features available today
          </motion.span>
          <motion.h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[0.95] tracking-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            Every feature your<br />servers need.
          </motion.h1>
          <motion.p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Monitoring, alerting, visualization, and security are available today. AI-assisted detection,
            correlation, summaries, and policy-controlled remediation are planned.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Button size="lg" className="h-13 px-8 text-base shadow-xl shadow-primary/20" asChild>
              <Link to="/contact">Request access <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-13 px-8 text-base" asChild>
              <Link to="/how-it-works">See how it works</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── Feature Groups ─── */}
      {featureGroups.map((group, gi) => (
        <section key={gi} className={`py-20 sm:py-28 ${gi % 2 === 1 ? 'bg-muted/20 border-y border-border' : ''}`}>
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div className="max-w-2xl mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-sm font-medium text-primary mb-3 block">{group.tag}</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">{group.title}</h2>
              <p className="text-muted-foreground text-lg">{group.desc}</p>
            </motion.div>

            <motion.div className="grid sm:grid-cols-2 gap-6" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {group.features.map((f, fi) => (
                <motion.div key={fi} variants={item} className="group relative rounded-2xl border border-border bg-card p-6 sm:p-8 hover:border-primary/40 transition-all duration-300">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-5">{f.desc}</p>
                    <ul className="flex flex-wrap gap-2">
                      {f.highlights.map((h, hi) => (
                        <li key={hi} className="flex items-center gap-1.5 text-xs font-medium text-foreground/70 bg-muted/60 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3 text-primary shrink-0" /> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      ))}

      {/* ─── AI-Powered Roadmap ─── */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-muted/10 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div className="max-w-2xl mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium mb-4">
              <Brain className="h-3 w-3" /> Planned — not yet available
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">AI-powered monitoring and remediation</h2>
            <p className="text-muted-foreground text-lg">
              We are building an AI-powered cloud monitoring and auto-alert platform with automated AI remediation.
              Production reliability depends on uninterrupted access to frontier models, supported by suitable capacity,
              monitoring, retries, and fallback strategies.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-6">
              <span className="text-xs font-medium text-muted-foreground mr-1">Planned integrations:</span>
              {['Azure AI Foundry', 'Azure gateway services', 'VM/vCPU workloads', 'Supported GPU compute', 'Azure Monitor / Log Analytics'].map((chip) => (
                <span key={chip} className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted/60 text-foreground/70 border border-border">{chip}</span>
              ))}
            </div>
          </motion.div>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { icon: Brain, title: 'AI Anomaly Detection', desc: 'Learn each server\'s normal behaviour and surface unusual patterns before a static threshold is crossed.', tag: 'Detection' },
              { icon: Workflow, title: 'Alert Correlation', desc: 'Group related alerts across servers and services into a single incident to cut notification noise.', tag: 'Correlation' },
              { icon: ScrollText, title: 'Incident Summaries', desc: 'Plain-language summaries of what changed, what is affected, and what was tried — ready for hand-off and post-incident review.', tag: 'Summaries' },
              { icon: Sparkles, title: 'Policy-Controlled Remediation', desc: 'Automated fixes that run only inside policies you define — which actions are allowed, on which servers, and when.', tag: 'Remediation' },
              { icon: UserCheck, title: 'Human Approval', desc: 'Consequential changes wait for explicit approval from an authorised person before they run.', tag: 'Control' },
              { icon: ShieldCheck, title: 'Audit Logging', desc: 'Every AI recommendation, approval, and action is recorded so it can be reviewed later.', tag: 'Audit' },
            ].map((f, i) => (
              <motion.div key={i} variants={item} className="rounded-2xl border border-dashed border-primary/30 bg-card/50 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-violet-500" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">{f.tag}</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <p className="mt-8 max-w-3xl text-sm text-muted-foreground leading-relaxed">
            None of the capabilities above are available yet. No cloud or model service can promise uninterrupted
            availability, so reliability planning covers capacity, monitoring, retries, and fallback strategies.
          </p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.05] rounded-full blur-[140px]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Ready to see it in action?
          </motion.h2>
          <motion.p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Access is limited to selected partners during testing. Contact us to request access.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Button size="lg" className="h-13 px-8 text-base shadow-xl shadow-primary/20" asChild>
              <Link to="/contact">Request access <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-13 px-8 text-base" asChild>
              <Link to="/login">Log in</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-6">
              <img src="/powered-by-aws.png" alt="Powered by AWS" className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
              <img src="/powered-by-nvidia.png" alt="NVIDIA GPU" className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} NodeVigil by <span className="text-foreground">Davinosia Pahilanipa</span>. All rights reserved.</p>
              <nav className="flex flex-wrap gap-4">
                <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
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
