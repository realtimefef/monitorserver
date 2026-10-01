import { Link } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import { ArrowLeft, Server, Shield, Zap, Heart, Mail, MapPin, Cloud } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

const values = [
  { icon: Server, title: 'Reliability First', desc: 'We built NodeVigil because downtime costs real money. Every design decision prioritizes accuracy and reliability.' },
  { icon: Shield, title: 'Security by Default', desc: 'Per-user data isolation, encrypted connections, JWT auth — security is baked in, not bolted on.' },
  { icon: Zap, title: 'Simplicity', desc: 'One script, one dashboard, real-time data. No complex setups, no bloated agents, no learning curve.' },
  { icon: Heart, title: 'Open & Transparent', desc: 'We believe in clear communication — whether it\'s an alert notification, our own policies, or what is available today versus planned.' },
];

export default function About() {
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

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight mb-4">About NodeVigil</h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            We are building an AI-powered cloud monitoring and auto-alert platform with automated AI
            remediation. Production reliability depends on uninterrupted access to frontier models,
            supported by suitable capacity, monitoring, retries, and fallback strategies.
          </p>
          <p className="text-base text-muted-foreground mb-12 leading-relaxed">
            NodeVigil is designed for DevOps teams, SaaS startups, and cloud infrastructure engineers.
            Real-time monitoring and threshold alerting are available today; AI-assisted anomaly detection,
            alert correlation, incident summaries, and policy-controlled remediation are planned.
          </p>
        </motion.div>

        {/* Leadership Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Leadership</h2>
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div
                className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border-2 border-border bg-primary/10 text-3xl font-bold text-primary shadow-lg"
                aria-hidden="true"
              >
                DP
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Davinosia Pahilanipa</h3>
                <p className="text-sm text-primary font-medium mb-3">CEO</p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Leads NodeVigil and its limited partner testing. To request access, discuss a partnership,
                  or ask about the roadmap, contact the CEO directly.
                </p>
                <a
                  href="mailto:davinosia.pahilanipa@nodevigil.cloud"
                  className="inline-flex max-w-full items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium break-all"
                >
                  <Mail className="h-4 w-4 shrink-0" /> davinosia.pahilanipa@nodevigil.cloud
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Mission */}
        <motion.section
          className="mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Server issues shouldn't be discovered by your users. NodeVigil gives you a live pulse on
            every machine you manage — CPU, memory, disk, network — so you can catch problems before
            they become incidents. We built this because we were tired of bloated monitoring tools that
            take days to set up and cost a fortune. Next, we are adding AI that helps detect, explain, and
            fix issues — with policy controls, human approval for consequential changes, and an audit log
            of every action.
          </p>
        </motion.section>

        {/* Backed by */}
        <motion.section
          className="mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Powered By</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <img src="/powered-by-nvidia.png" alt="NVIDIA" className="h-12 object-contain" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">NVIDIA GPU Platform</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use NVIDIA GPUs to train AI models for anomaly detection and an intelligent
                chatbot that helps users diagnose server issues and get fixes in plain language.
              </p>
              <p className="mt-3 text-xs font-medium text-violet-500">AI features are in development.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <img src="/powered-by-aws.png" alt="AWS" className="h-12 object-contain" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">AWS Cloud Platform</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built on AWS cloud infrastructure for reliable, scalable server monitoring
                with 99.9% uptime backed by EC2, RDS PostgreSQL, and CloudWatch.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 items-center gap-3 mb-3">
                <Cloud className="h-9 w-9 text-sky-500" aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">Planned</span>
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Microsoft Azure</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Planned integrations: Azure AI Foundry, Azure gateway services, VM/vCPU workloads,
                supported GPU compute, and Azure Monitor / Log Analytics. These are not yet available.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Values */}
        <motion.section
          className="mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-6">What We Believe</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="font-medium text-foreground">Frontend:</span> React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion</li>
              <li><span className="font-medium text-foreground">Backend:</span> Spring Boot 3.4, Java 21, WebSocket STOMP, REST API</li>
              <li><span className="font-medium text-foreground">Database:</span> PostgreSQL with per-user data isolation</li>
              <li><span className="font-medium text-foreground">Infrastructure:</span> AWS (EC2, RDS, CloudWatch), NVIDIA GPU (AI features, in development)</li>
              <li><span className="font-medium text-foreground">Planned integrations:</span> Azure AI Foundry, Azure gateway services, VM/vCPU workloads, supported GPU compute, Azure Monitor / Log Analytics</li>
              <li><span className="font-medium text-foreground">Agent:</span> Bash (Linux/macOS) & PowerShell (Windows)</li>
              <li><span className="font-medium text-foreground">Hosting:</span> Render (Backend + Frontend + Database)</li>
            </ul>
          </div>
        </motion.section>

        {/* Company details */}
        <motion.section
          className="mt-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Company</h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <address className="flex items-start gap-3 text-sm not-italic text-muted-foreground leading-relaxed">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="font-medium text-foreground">NodeVigil</span><br />
                5 Grenfell Liwene Rd, Apt 5, Didsbury,<br />
                Manchester, M20 6TG, United Kingdom
              </span>
            </address>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-6">
              <img src="/powered-by-aws.png" alt="Powered by AWS" className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
              <img src="/powered-by-nvidia.png" alt="NVIDIA GPU" className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
              <img src="/tensorrt-logo.png" alt="NVIDIA TensorRT" className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <span>&copy; {new Date().getFullYear()} NodeVigil by <span className="text-foreground">Davinosia Pahilanipa</span></span>
              <nav className="flex gap-6">
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
