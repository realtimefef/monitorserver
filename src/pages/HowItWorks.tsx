import { Link } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';
import {
  Server, Terminal, LineChart, ArrowRight,
  CheckCircle2, Cpu, HardDrive, Wifi, BarChart3,
  Shield, Copy, Download, Bell, Eye, Play, ArrowLeft,
  Brain, Workflow, ScrollText, Sparkles,
} from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';

const steps = [
  {
    num: '01',
    title: 'Get access',
    desc: 'Access is limited to selected partners during testing. Contact us, then sign in and land in a clean, empty dashboard ready to go.',
    icon: Play,
    color: 'from-primary/20 to-primary/5',
    details: [
      'Email & password registration',
      'Email verification for security',
      'Instant dashboard access after confirmation',
    ],
  },
  {
    num: '02',
    title: 'Add your server',
    desc: 'Click "Add Server" and give it a name and host address. The platform generates a unique 64-character agent key automatically.',
    icon: Server,
    color: 'from-emerald-500/20 to-emerald-500/5',
    details: [
      'Name and host address — that\'s it',
      'Unique agent key auto-generated',
      'Bulk CSV import for multiple servers',
    ],
  },
  {
    num: '03',
    title: 'Install the agent',
    desc: 'Copy the one-liner to your server. The agent is a single shell script — no dependencies, no daemons, no root access needed.',
    icon: Terminal,
    color: 'from-violet-500/20 to-violet-500/5',
    details: [
      'Bash for Linux, PowerShell for Windows',
      'Zero external dependencies',
      'Runs as a lightweight loop every 5 seconds',
    ],
  },
  {
    num: '04',
    title: 'Watch metrics stream',
    desc: 'CPU, RAM, disk, network, process count, and uptime start flowing to your dashboard in real time via WebSocket.',
    icon: LineChart,
    color: 'from-amber-500/20 to-amber-500/5',
    details: [
      '12 metric types collected automatically',
      'Charts update every 5 seconds',
      'Historical data retained for 30 days',
    ],
  },
  {
    num: '05',
    title: 'Set alert rules',
    desc: 'Define thresholds — "CPU > 80% for 60 seconds → Critical". The platform fires alerts instantly and emails you if enabled.',
    icon: Bell,
    color: 'from-red-500/20 to-red-500/5',
    details: [
      'Per-server, per-metric rules',
      '6 comparison operators',
      'Cooldown periods to reduce noise',
    ],
  },
  {
    num: '06',
    title: 'Monitor your fleet',
    desc: 'All servers, alerts, metrics, and reports — one single pane of glass. Export data, schedule reports, and stay in control.',
    icon: Eye,
    color: 'from-cyan-500/20 to-cyan-500/5',
    details: [
      'Fleet-wide dashboard overview',
      'Export CSV, JSON, Excel, PDF',
      'Scheduled report templates',
    ],
  },
];

const metrics = [
  { icon: Cpu, label: 'CPU Usage', unit: '%', sample: '24' },
  { icon: HardDrive, label: 'Memory', unit: '%', sample: '61' },
  { icon: BarChart3, label: 'Disk', unit: '%', sample: '43' },
  { icon: Wifi, label: 'Network I/O', unit: 'MB/s', sample: '2.4' },
];

export default function HowItWorks() {
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
              { label: 'How It Works', to: '/how-it-works' },
              { label: 'FAQ', to: '/faq' },
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
                <Button size="sm" className="shadow-lg shadow-primary/25" asChild><Link to="/register">Start Free</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.04] rounded-full blur-[160px]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Play className="h-3 w-3" /> 5-minute setup
          </motion.span>
          <motion.h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[0.95] tracking-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            From zero to<br /><span className="text-primary">full observability.</span>
          </motion.h1>
          <motion.p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Six simple steps. No infrastructure to set up, no complex configs to write.
            Just deploy the agent and your dashboard comes alive.
          </motion.p>
        </div>
      </section>

      {/* ─── Steps ─── */}
      <section className="pb-20 sm:pb-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className={`relative rounded-2xl border border-border bg-gradient-to-b ${step.color} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                    <div className="shrink-0">
                      <div className="h-14 w-14 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                        <step.icon className="h-6 w-6 text-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-display text-3xl sm:text-4xl font-black text-foreground/[0.08]">{step.num}</span>
                        <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-5 max-w-lg">{step.desc}</p>
                      <ul className="flex flex-col sm:flex-row flex-wrap gap-3">
                        {step.details.map((d, di) => (
                          <li key={di} className="flex items-center gap-2 text-sm text-foreground/80">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Terminal Preview ─── */}
      <section className="py-20 sm:py-28 bg-muted/20 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">See it in action</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">Here's what it looks like when you run the agent for the first time.</p>
          </motion.div>

          <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="rounded-2xl border border-border bg-[#0c0f1a] overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-[#0f1326]">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="ml-3 text-xs text-gray-500 font-mono">~/ terminal</span>
              </div>
              <div className="p-5 font-mono text-sm text-gray-400 space-y-1.5 overflow-x-auto">
                <div><span className="text-emerald-400">$</span> export AGENT_KEY=&quot;a3f8b2...your-key&quot;</div>
                <div><span className="text-emerald-400">$</span> chmod +x monitor-agent.sh && ./monitor-agent.sh</div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <span className="text-gray-500">[info]</span> NodeVigil Agent v1.0
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <span className="text-gray-500">[info]</span> OS detected: Linux x86_64
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  <span className="text-gray-500">[info]</span> Connecting to API...
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.0 }} className="text-emerald-400">
                  [ok] Connected. Sending metrics every 5s.
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.4 }}>
                  <span className="text-gray-500">[metric]</span> cpu=12% mem=58% disk=41% net_in=1.2MB net_out=320KB
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.8 }}>
                  <span className="text-gray-500">[metric]</span> cpu=14% mem=57% disk=41% net_in=980KB net_out=210KB
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.2 }} className="animate-pulse text-gray-600">
                  _
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Metric tiles preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-10">
            {metrics.map((m, i) => (
              <motion.div
                key={i}
                className="rounded-xl bg-card border border-border p-4 text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <m.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{m.sample}<span className="text-sm text-muted-foreground ml-1">{m.unit}</span></div>
                <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Architecture Diagram ─── */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            How data flows
          </motion.h2>
          <motion.p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            From your server to your screen in under a second.
          </motion.p>

          <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 items-center">
              {[
                { icon: Server, label: 'Your Server', sub: 'Agent script runs every 5s' },
                { icon: Shield, label: 'NodeVigil API', sub: 'Validates, stores & evaluates' },
                { icon: Eye, label: 'Dashboard', sub: 'Real-time charts & alerts' },
              ].map((node, i) => (
                <div key={i} className="flex flex-col items-center relative">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                    <node.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground text-sm">{node.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{node.sub}</span>
                  {i < 2 && (
                    <div className="hidden sm:block absolute top-7 -right-2 z-10">
                      <ArrowRight className="h-5 w-5 text-primary/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Where AI fits in (planned) ─── */}
      <section className="py-20 sm:py-28 bg-muted/20 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium mb-4">
              <Brain className="h-3 w-3" /> Planned — not yet available
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">Where AI fits in</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The steps above are available today. The AI layer below is planned: it assists your team, and
              consequential changes always wait for human approval.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Brain, title: 'Detect', desc: 'AI-assisted anomaly detection flags unusual behaviour alongside your threshold alerts.' },
              { icon: Workflow, title: 'Correlate', desc: 'Related alerts across servers are grouped into one incident.' },
              { icon: ScrollText, title: 'Summarize', desc: 'A plain-language incident summary explains what changed and what is affected.' },
              { icon: Sparkles, title: 'Remediate', desc: 'Policy-controlled fixes run automatically only within allowed limits; the rest need approval.' },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="rounded-2xl border border-dashed border-primary/30 bg-card/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-violet-500" />
                  </div>
                  <span className="font-display text-2xl font-black text-foreground/[0.08]">0{i + 1}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every AI recommendation, approval, and action is designed to be written to an audit log. Production
            reliability depends on uninterrupted access to frontier models, so capacity, monitoring, retries, and
            fallback strategies are part of the plan.
          </p>
        </div>
      </section>

      {/* ─── Powered By ─── */}
      <section className="py-16 sm:py-20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Built on world-class infrastructure
          </motion.p>
          <motion.div className="flex items-center justify-center gap-10 flex-wrap" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <img src="/powered-by-aws.png" alt="Powered by AWS" className="h-12 object-contain opacity-50 hover:opacity-100 transition-opacity" />
            <img src="/powered-by-nvidia.png" alt="NVIDIA GPU" className="h-12 object-contain opacity-50 hover:opacity-100 transition-opacity" />
            <img src="/tensorrt-logo.png" alt="NVIDIA TensorRT" className="h-12 object-contain opacity-50 hover:opacity-100 transition-opacity" />
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              Microsoft Azure
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">Planned</span>
            </span>
          </motion.div>
          <p className="mt-8 text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Planned integrations (not yet available): Azure AI Foundry, Azure gateway services, VM/vCPU workloads,
            supported GPU compute, and Azure Monitor / Log Analytics.
          </p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 sm:py-28 bg-muted/20 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.05] rounded-full blur-[140px]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Start monitoring in minutes.
          </motion.h2>
          <motion.p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Free to use. No credit card. Deploy the agent and go.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Button size="lg" className="h-13 px-8 text-base shadow-xl shadow-primary/20" asChild>
              <Link to="/register">Create free account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-13 px-8 text-base" asChild>
              <Link to="/features">Explore features</Link>
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
              </nav>
            </div>
          </div>
          <TestingNotice className="mt-6 text-center sm:text-left" />
        </div>
      </footer>
    </div>
  );
}
