import { Link } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Server, Bell, Shield, Zap, LineChart, ChevronRight,
  CheckCircle2, Cpu, HardDrive, Wifi, BarChart3, ArrowRight,
  Terminal, AlertTriangle, Eye, Layers, Lock, Gauge,
  Clock, Menu, X, Play, Sparkles, Brain,
  Cloud, Network, Container, Users,
  Rocket, Target, Building2, DollarSign, Database,
  Activity, Globe, Quote, Star, Minus,
  ShieldCheck, ScrollText, UserCheck, Workflow, MapPin
} from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* Animated particles for hero */
const PARTICLES = Array.from({ length: 16 }, () => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: `${Math.random() * 2 + 1}px`,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2,
}));

const NAV_ITEMS = [
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Blog', to: '/blog' },
  { label: 'Docs', to: '/docs' },
];

const faqs = [
  { q: 'What exactly does NodeVigil do?', a: 'NodeVigil is being built as an AI-powered cloud monitoring and auto-alert platform with policy-controlled AI remediation. Today it gives you a live window into every server you manage - CPU, memory, disk, and network updated every 5 seconds - plus threshold-based alerts. AI-assisted detection, correlation, summaries, and remediation are planned.' },
  { q: 'What is available today and what is planned?', a: 'Available today: real-time metrics, threshold alert rules, email and webhook notifications (Slack, Discord, generic), scheduled reports, maintenance windows, and API keys. Planned: AI anomaly detection, alert correlation, incident summaries, policy-controlled remediation with human approval and audit logging, and the Azure and GPU integrations listed on this page.' },
  { q: 'Will AI change my infrastructure without asking?', a: 'No. Remediation is designed to be policy-controlled: you define what automation is allowed to do. Consequential changes require human approval, and every recommendation and action is written to an audit log. These controls are part of the planned design and are not live yet.' },
  { q: 'Do you guarantee uninterrupted access to AI models?', a: 'No. Production reliability of AI features depends on uninterrupted access to frontier models. We plan to support that with suitable capacity, monitoring, retries, and fallback strategies, but no cloud or model service can guarantee uninterrupted availability.' },
  { q: 'Which integrations are available?', a: 'Slack, Discord, and generic webhooks are available today. Azure AI Foundry, Azure gateway services, VM and vCPU workloads, supported GPU compute, and Azure Monitor / Log Analytics are planned integrations and are not generally available yet.' },
  { q: 'How do I get access?', a: 'This website is currently in testing and access is limited to selected partners. If you would like access, contact us at support@nodevigil.cloud.' },
  { q: 'Is there anything to install?', a: 'Just a small shell script (Bash or PowerShell). Copy it to your server, plug in the agent key from your dashboard, and metrics start flowing within seconds.' },
  { q: 'How are alerts configured?', a: 'You create rules in the dashboard - pick a metric, set a threshold, choose a severity. When the value crosses that line, you get notified immediately.' },
  { q: 'What if I have dozens of servers?', a: 'NodeVigil is built for scale. Each server runs its own lightweight agent. The dashboard aggregates everything so you can see fleet-wide health at a glance.' },
  { q: 'Does the agent slow my servers down?', a: 'No. The agent reads kernel counters, uses well under one percent of a single core, and holds a footprint smaller than 5 KB on disk.' },
  { q: 'Is my data secure?', a: 'All data is stored securely in PostgreSQL with per-user isolation. Each user can only see their own servers and metrics. Auth is handled via secure JWT tokens.' },
  { q: 'Can I monitor servers across different providers?', a: 'Yes. The same agent runs on cloud instances, bare metal, virtual machines, and container hosts. One dashboard covers all of them.' },
  { q: 'Is it really free?', a: 'During testing, access is limited to selected partners. The free tier includes unlimited servers, real-time metrics, and custom alert rules with no credit card required. AI-powered features are planned for a future Pro plan and are not yet available.' },
];

const testimonials = [
  {
    quote: 'We replaced three separate dashboards with NodeVigil in an afternoon. The agent took two minutes per host and we have not touched it since.',
    name: 'Platform Lead',
    role: 'Series A fintech, 40 servers',
  },
  {
    quote: 'The alerting is what sold us. Thresholds per server, sane cooldowns, and no pager noise at three in the morning for a blip that resolved itself.',
    name: 'Head of Infrastructure',
    role: 'B2B SaaS, 120 servers',
  },
  {
    quote: 'Setup was genuinely five minutes. Our on-call engineers can now see fleet health on one screen instead of stitching together log queries.',
    name: 'DevOps Engineer',
    role: 'E-commerce platform, 18 servers',
  },
];

const comparison = [
  { capability: 'Live metrics under 5 seconds', nodevigil: true, diy: false, legacy: true },
  { capability: 'Setup measured in minutes', nodevigil: true, diy: false, legacy: false },
  { capability: 'Unlimited servers on the free tier', nodevigil: true, diy: true, legacy: false },
  { capability: 'No agent dependencies or sidecars', nodevigil: true, diy: false, legacy: false },
  { capability: 'Per-server alert thresholds', nodevigil: true, diy: false, legacy: true },
  { capability: 'Per-user data isolation by default', nodevigil: true, diy: false, legacy: true },
];

export default function Index() {
  const { isAuthenticated } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight hidden sm:inline">NodeVigil</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button size="sm" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" className="shadow-lg shadow-primary/25" asChild>
                  <Link to="/register">Start Free</Link>
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </header>

      {/* Announcement bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-center gap-2 text-xs sm:text-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-semibold text-foreground">Limited partner testing</span>
          <span className="text-muted-foreground">monitoring and alerts are live</span>
          <span className="text-muted-foreground hidden sm:inline">- AI features are planned</span>
        </div>
      </div>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/[0.05] rounded-full blur-[160px]"
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/[0.04] rounded-full blur-[140px]"
            animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[120px]"
            animate={{ x: [0, 30, 0], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />

          {PARTICLES.map((p, i) => (
            <motion.div
              key={`p-${i}`}
              className="absolute bg-primary/30 rounded-full"
              style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
              animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.2, 1] }}
              transition={{ duration: p.duration + 2, repeat: Infinity, delay: p.delay }}
            />
          ))}
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8 backdrop-blur-sm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live metrics today - AI in development
            </motion.div>

            <motion.h1
              className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-6 leading-[0.95] tracking-tight"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              AI-powered cloud monitoring,
              <br />
              <span className="text-gradient-primary">auto-alerting, and remediation.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              We are building an AI-powered cloud monitoring and auto-alert platform with automated AI
              remediation. Production reliability depends on uninterrupted access to frontier models, supported
              by suitable capacity, monitoring, retries, and fallback strategies.
            </motion.p>
            <motion.p
              className="text-sm md:text-base text-muted-foreground/90 max-w-xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="font-medium text-foreground">Available today:</span> real-time server metrics,
              threshold alerts, and notifications. <span className="font-medium text-foreground">Planned:</span>{' '}
              AI anomaly detection, alert correlation, incident summaries, and policy-controlled remediation.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Button size="lg" className="h-13 px-8 text-base shadow-xl shadow-primary/20" asChild>
                <Link to="/register">
                  Get started - it is free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-13 px-8 text-base" asChild>
                <Link to="/how-it-works">See how it works</Link>
              </Button>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {['Live metrics and alerts today', 'AI features in development', 'Human approval and audit logging by design'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
                </span>
              ))}
            </motion.div>

            <motion.div
              className="mt-6 max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <TestingNotice className="text-center" />
            </motion.div>
          </div>

          {/* Dashboard mockup */}
          <motion.div
            className="relative max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7, type: 'spring', stiffness: 60 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 pointer-events-none" />
            <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl shadow-black/20 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground font-mono">nodevigil - dashboard</span>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Cpu, label: 'CPU', value: '24%', accent: 'text-emerald-500', bar: 'bg-emerald-500', w: '24%' },
                    { icon: HardDrive, label: 'RAM', value: '61%', accent: 'text-blue-500', bar: 'bg-blue-500', w: '61%' },
                    { icon: BarChart3, label: 'Disk', value: '43%', accent: 'text-amber-500', bar: 'bg-amber-500', w: '43%' },
                    { icon: Wifi, label: 'Net I/O', value: '2.4 GB', accent: 'text-violet-500', bar: 'bg-violet-500', w: '38%' },
                  ].map((m, i) => (
                    <motion.div
                      key={i}
                      className="rounded-xl bg-background/60 border border-border p-4"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.08 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <m.icon className={`h-4 w-4 ${m.accent}`} />
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
                      </div>
                      <div className="text-xl font-bold text-foreground mb-2">{m.value}</div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${m.bar}`}
                          initial={{ width: 0 }}
                          animate={{ width: m.w }}
                          transition={{ delay: 1 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 rounded-xl bg-background/60 border border-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-foreground">CPU over 24h</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] text-muted-foreground">Live</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-[3px] h-28">
                      {[18, 22, 19, 30, 26, 35, 28, 42, 34, 38, 24, 45, 52, 40, 36, 28, 32, 44, 50, 38, 30, 25, 20, 24].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t bg-primary/50 hover:bg-primary transition-colors"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1.1 + i * 0.03, duration: 0.4 }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-background/60 border border-border p-5">
                    <span className="text-sm font-semibold text-foreground block mb-4">Servers</span>
                    <div className="space-y-3">
                      {[
                        { name: 'prod-web-01', status: 'online' },
                        { name: 'prod-db-01', status: 'online' },
                        { name: 'staging-01', status: 'warning' },
                      ].map((s, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + i * 0.1 }}
                        >
                          <div className="flex items-center gap-2">
                            <Server className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground font-mono">{s.name}</span>
                          </div>
                          <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            s.status === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>{s.status}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="py-20 border-y border-border bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p
            className="text-center text-sm text-muted-foreground mb-4 uppercase tracking-widest"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Available today
          </motion.p>
          <motion.h3
            className="text-center text-2xl sm:text-3xl font-bold text-foreground mb-12"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            What the live platform delivers right now
          </motion.h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '5s', label: 'Metric Refresh', icon: Gauge },
              { value: '12', label: 'Metric Types Collected', icon: Activity },
              { value: '3', label: 'Alert Severity Levels', icon: Bell },
              { value: 'Unlimited', label: 'Servers Supported', icon: Server },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-2 text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <stat.icon className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary mb-3 block">Use Cases</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Built for teams who ship
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Whether you are managing a single server or an entire fleet, NodeVigil scales with you.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Rocket,
                title: 'SaaS Startups',
                desc: 'Monitor your production infrastructure from day one. Catch performance issues before they reach customers.',
                color: 'bg-emerald-500/10 text-emerald-500',
              },
              {
                icon: Target,
                title: 'DevOps Engineers',
                desc: 'Replace fragmented tooling with a single pane of glass covering CPU, memory, disk, and network on every host.',
                color: 'bg-blue-500/10 text-blue-500',
              },
              {
                icon: Building2,
                title: 'Platform Teams',
                desc: 'Manage cloud instances, on-premise servers, and hybrid environments from one dashboard with real-time alerts.',
                color: 'bg-violet-500/10 text-violet-500',
              },
              {
                icon: Container,
                title: 'Container and Kubernetes',
                desc: 'Monitor nodes running Docker and Kubernetes workloads. Track resource pressure across orchestrated infrastructure.',
                color: 'bg-amber-500/10 text-amber-500',
              },
              {
                icon: Network,
                title: 'Multi-Cloud Deployments',
                desc: 'One agent works across every major cloud provider and bare metal. One consistent interface for all of it.',
                color: 'bg-red-500/10 text-red-500',
              },
              {
                icon: Users,
                title: 'Managed Service Providers',
                desc: 'Monitor client infrastructure with per-user data isolation, custom alert rules, and branded email notifications.',
                color: 'bg-cyan-500/10 text-cyan-500',
              },
            ].map((useCase, i) => (
              <motion.div
                key={i}
                className="group rounded-2xl border border-border bg-card p-7 hover:border-primary/40 transition-all duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <div className={`h-12 w-12 rounded-xl ${useCase.color} flex items-center justify-center mb-5`}>
                  <useCase.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{useCase.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{useCase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core technology */}
      <section className="py-28 bg-muted/5">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary mb-3 block">Core Technology</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              How it all works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A lightweight agent, real-time pipelines, and threshold alerting today - with AI analysis planned.
            </p>
          </motion.div>

          {/* Ingestion */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-28">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium mb-6">
                <Terminal className="h-3 w-3" /> Lightweight Agent
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Zero-config data ingestion
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">
                A single shell script reads CPU, memory, disk, and network counters every 5 seconds, then pushes
                them over HTTPS to the backend. No Docker, no sidecars, no daemons.
              </p>
              <ul className="space-y-3">
                {['Bash and PowerShell cross-platform', 'Under 5 KB footprint', 'Auto-reconnect on failure', 'Secure agent key auth'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl border border-border bg-[#0c0f1a] overflow-hidden shadow-2xl p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                <div className="relative space-y-4">
                  {[
                    { name: 'web-prod-01', cpu: 24, mem: 61, dot: 'bg-emerald-500/20', icon: 'text-emerald-400' },
                    { name: 'db-primary', cpu: 45, mem: 78, dot: 'bg-blue-500/20', icon: 'text-blue-400' },
                    { name: 'cache-01', cpu: 12, mem: 34, dot: 'bg-violet-500/20', icon: 'text-violet-400' },
                  ].map((node, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                    >
                      <div className={`h-8 w-8 rounded-lg ${node.dot} flex items-center justify-center shrink-0`}>
                        <Server className={`h-4 w-4 ${node.icon}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-mono text-gray-300 mb-1">{node.name}</div>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>CPU {node.cpu}%</span>
                          <span>MEM {node.mem}%</span>
                        </div>
                      </div>
                      <motion.div
                        className="flex items-center gap-1"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      >
                        <div className="h-1 w-1 rounded-full bg-emerald-400" />
                        <div className="h-1 w-3 rounded-full bg-emerald-400/50" />
                        <div className="h-1 w-1 rounded-full bg-emerald-400/30" />
                        <ArrowRight className="h-3 w-3 text-emerald-400/60" />
                      </motion.div>
                    </motion.div>
                  ))}

                  <motion.div
                    className="flex items-center justify-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 mt-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                  >
                    <MonitorLogo className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">NodeVigil API - Ingesting</span>
                    <motion.div
                      className="h-2 w-2 rounded-full bg-emerald-400"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Streaming */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-28">
            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl border border-border bg-[#0c0f1a] overflow-hidden shadow-2xl p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-gray-300">Live Metric Stream</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-blue-400"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-[10px] text-blue-400/70 uppercase tracking-wider">Streaming</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'CPU', value: 24, color: 'bg-emerald-400' },
                      { label: 'RAM', value: 61, color: 'bg-blue-400' },
                      { label: 'Disk', value: 43, color: 'bg-amber-400' },
                      { label: 'Net', value: 38, color: 'bg-violet-400' },
                    ].map((m, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 font-mono">{m.label}</span>
                          <motion.span
                            className="text-gray-300 font-mono"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                          >
                            {m.value}%
                          </motion.span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${m.color}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${m.value}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.div
                    className="mt-4 flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 }}
                  >
                    <Zap className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs text-blue-300 font-mono">ws://api/metrics - connected</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-medium mb-6">
                <Zap className="h-3 w-3" /> WebSocket Streaming
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Sub-second metric delivery
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">
                Once ingested, metrics are pushed to your dashboard instantly over WebSocket and STOMP. No polling,
                no delays - your charts animate in real time.
              </p>
              <ul className="space-y-3">
                {['STOMP over WebSocket protocol', 'Per-server subscriptions', 'Automatic reconnection', 'Binary-efficient payloads'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Alerting */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium mb-6">
                <Bell className="h-3 w-3" /> Threshold Alerts
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Threshold-based alerting engine
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">
                Define rules for any metric - CPU, memory, disk, network. When values breach your thresholds,
                alerts fire instantly with configurable severity and cooldowns.
              </p>
              <ul className="space-y-3">
                {['INFO, WARNING, and CRITICAL levels', 'Configurable cooldown periods', 'Per-server rule overrides', 'One-click acknowledge and resolve'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-red-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl border border-border bg-[#0c0f1a] overflow-hidden shadow-2xl p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-300">CPU - prod-web-01</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Last 30 min</span>
                  </div>

                  <div className="h-32 flex items-end gap-[2px] relative mb-4">
                    <div className="absolute top-[20%] left-0 right-0 border-t border-dashed border-red-500/50 z-10">
                      <span className="absolute -top-2.5 right-0 text-[9px] text-red-400 bg-[#0c0f1a] px-1 rounded">80%</span>
                    </div>
                    {[20, 22, 25, 28, 32, 30, 35, 40, 38, 42, 48, 52, 58, 65, 72, 78, 84, 90, 95, 88, 82, 76, 68, 60, 52, 45, 40, 35, 30, 28].map((h, i) => (
                      <motion.div
                        key={i}
                        className={`flex-1 rounded-t ${h > 80 ? 'bg-red-500' : h > 60 ? 'bg-amber-500/70' : 'bg-emerald-500/50'}`}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.03, duration: 0.3 }}
                      />
                    ))}
                  </div>

                  <motion.div
                    className="flex items-center gap-3 rounded-xl bg-red-500/15 border border-red-500/30 p-3"
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.3, type: 'spring', stiffness: 120 }}
                  >
                    <motion.div
                      className="h-8 w-8 rounded-lg bg-red-500 flex items-center justify-center shrink-0"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-red-300">CRITICAL - CPU above 80%</div>
                      <div className="text-[10px] text-gray-500">prod-web-01 - triggered 30s ago</div>
                    </div>
                    <span className="text-[10px] bg-red-500/30 text-red-300 font-medium px-2 py-0.5 rounded-full shrink-0">ACTIVE</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-2xl mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary mb-3 block">Available capabilities</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Everything you need,<br />nothing you do not.
            </h2>
            <p className="text-muted-foreground text-lg">
              Focused monitoring tools that work out of the box today.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Cpu, title: 'CPU and Load Tracking', desc: 'Watch processor usage and load averages across every core, with per-server breakdowns.' },
              { icon: HardDrive, title: 'Memory and Disk', desc: 'Track RAM consumption, swap usage, and disk space so you never get caught off guard.' },
              { icon: Wifi, title: 'Network Throughput', desc: 'See inbound and outbound traffic in real time. Spot anomalies before they impact users.' },
              { icon: Bell, title: 'Custom Alert Rules', desc: 'Set thresholds per server, per metric. Choose severity levels and get notified your way.' },
              { icon: Eye, title: 'Live Dashboard', desc: 'Metrics update in real time over WebSocket - no refresh needed. See the pulse of your fleet.' },
              { icon: Lock, title: 'Secure by Design', desc: 'JWT authentication, per-user data isolation, and auto-expiring tokens keep your data yours.' },
              { icon: Clock, title: 'Historical Trends', desc: 'Compare today against last week. Spot slow regressions long before they become incidents.' },
              { icon: Database, title: 'Scheduled Reports', desc: 'Export fleet health summaries on a schedule and share them with the rest of your team.' },
              { icon: Activity, title: 'Status Pages', desc: 'Publish a live status view so stakeholders can check system health without asking you.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="group relative rounded-2xl border border-border bg-card p-7 hover:border-primary/40 transition-all duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-28 bg-muted/20 border-y border-border">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary mb-3 block">Setup</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Three steps. Five minutes.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From zero to full observability with almost no effort.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                num: '1',
                title: 'Get access',
                desc: 'Access is limited to selected partners during testing. Contact us, then sign in and land in your dashboard.',
                icon: Play,
                color: 'from-primary/20 to-primary/5',
              },
              {
                num: '2',
                title: 'Install the agent',
                desc: 'Add a server in the dashboard, copy the generated agent key, and run the script on your machine.',
                icon: Terminal,
                color: 'from-emerald-500/20 to-emerald-500/5',
              },
              {
                num: '3',
                title: 'Watch metrics flow',
                desc: 'CPU, RAM, disk, network - all streaming live. Set up alert rules and relax.',
                icon: LineChart,
                color: 'from-violet-500/20 to-violet-500/5',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className={`rounded-2xl border border-border bg-gradient-to-b ${step.color} p-8 h-full`}>
                  <div className="font-display text-6xl font-black text-foreground/[0.07] mb-4">{step.num}</div>
                  <div className="h-11 w-11 rounded-xl bg-background border border-border flex items-center justify-center mb-5 shadow-sm">
                    <step.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-6 z-10">
                    <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Terminal preview */}
          <motion.div
            className="max-w-3xl mx-auto mt-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl border border-border bg-[#0c0f1a] overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-[#0f1326]">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="ml-3 text-xs text-gray-500 font-mono">~/ terminal</span>
              </div>
              <div className="p-5 font-mono text-sm text-gray-400 space-y-1.5">
                <div><span className="text-emerald-400">$</span> chmod +x nodevigil-agent.sh &amp;&amp; ./nodevigil-agent.sh</div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <span className="text-gray-500">[info]</span> NodeVigil Agent v1.0
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <span className="text-gray-500">[info]</span> OS detected: Linux x86_64
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                  <span className="text-gray-500">[info]</span> Connecting to API...
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.3 }} className="text-emerald-400">
                  [ok] Connected. Sending metrics every 5s.
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.7 }}>
                  <span className="text-gray-500">[metric]</span> cpu=12% mem=58% disk=41% net_in=1.2MB net_out=320KB
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.1 }} className="animate-pulse text-gray-600">
                  _
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary mb-3 block">Customer Stories</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Teams that stopped guessing
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              What engineering teams say after moving their fleet onto NodeVigil.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="rounded-2xl border border-border bg-card p-8 flex flex-col"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Quote className="h-6 w-6 text-primary/40 mb-5" />
                <p className="text-foreground/90 leading-relaxed mb-6 flex-1">{t.quote}</p>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-28 bg-muted/20 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary mb-3 block">Comparison</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why teams switch
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              How NodeVigil compares to rolling your own scripts or running a heavyweight legacy suite.
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border bg-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-4 gap-2 px-6 py-4 border-b border-border bg-muted/30 text-xs sm:text-sm font-semibold text-foreground">
              <span className="col-span-1 sm:col-span-1">Capability</span>
              <span className="text-center text-primary">NodeVigil</span>
              <span className="text-center text-muted-foreground">DIY scripts</span>
              <span className="text-center text-muted-foreground">Legacy suite</span>
            </div>
            {comparison.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-2 px-6 py-4 border-b border-border last:border-b-0 items-center text-sm"
              >
                <span className="text-muted-foreground">{row.capability}</span>
                <span className="flex justify-center">
                  {row.nodevigil
                    ? <CheckCircle2 className="h-4 w-4 text-primary" />
                    : <Minus className="h-4 w-4 text-muted-foreground/50" />}
                </span>
                <span className="flex justify-center">
                  {row.diy
                    ? <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    : <Minus className="h-4 w-4 text-muted-foreground/50" />}
                </span>
                <span className="flex justify-center">
                  {row.legacy
                    ? <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    : <Minus className="h-4 w-4 text-muted-foreground/50" />}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Developer resources */}
      <section className="py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary mb-3 block">Resources</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Built for developers
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Everything you need to get up and running, integrate, and extend.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Terminal,
                title: 'Quick Start Guide',
                desc: 'Go from zero to monitoring in under five minutes. Install the agent, connect your first server, and start seeing metrics.',
                link: '/docs',
                linkText: 'Get started',
                accent: 'bg-primary/10',
                corner: 'bg-primary/10',
              },
              {
                icon: Layers,
                title: 'API Reference',
                desc: 'Full REST API documentation for server management, metrics retrieval, alert rules, and agent authentication.',
                link: '/docs/api-reference',
                linkText: 'Explore API',
                accent: 'bg-emerald-500/10',
                corner: 'bg-emerald-500/10',
              },
              {
                icon: Shield,
                title: 'Security and Architecture',
                desc: 'JWT authentication, per-user data isolation, secure agent keys, and the full system architecture explained.',
                link: '/docs/security',
                linkText: 'Learn more',
                accent: 'bg-violet-500/10',
                corner: 'bg-violet-500/10',
              },
            ].map((r, i) => (
              <motion.div
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${r.corner} rounded-bl-full pointer-events-none`} />
                <div className="relative p-8">
                  <div className={`h-12 w-12 rounded-xl ${r.accent} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <r.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">{r.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{r.desc}</p>
                  <Link
                    to={r.link}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    {r.linkText} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI platform */}
      <section id="ai" className="py-28 bg-gradient-to-b from-muted/10 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium mb-6">
              <Brain className="h-3 w-3" /> In development
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              AI that assists, with you in control
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              NodeVigil is being built to detect anomalies, correlate alerts, summarize incidents, and remediate
              within policies you define. Consequential changes need human approval, and every action is audit logged.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Brain, title: 'AI-Assisted Anomaly Detection', desc: 'Learn each server\'s normal behaviour and flag unusual patterns before a static threshold is crossed.' },
              { icon: Workflow, title: 'Alert Correlation', desc: 'Group related alerts across servers and services into one incident, so on-call engineers see one problem instead of fifty notifications.' },
              { icon: ScrollText, title: 'Incident Summaries', desc: 'Plain-language summaries of what changed, what is affected, and what was tried - ready for hand-off and review.' },
              { icon: Sparkles, title: 'Policy-Controlled Remediation', desc: 'Automated fixes run only inside the policies you define. Anything consequential waits for human approval.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="rounded-2xl border border-border bg-card p-7"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">Planned</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Guardrails */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-6">
            {[
              { icon: UserCheck, title: 'Human approval', desc: 'Consequential changes need explicit approval from an authorised person before they run.' },
              { icon: ShieldCheck, title: 'Policy controls', desc: 'You decide which actions are allowed, on which servers, and under what conditions.' },
              { icon: ScrollText, title: 'Audit logging', desc: 'Every AI recommendation, approval, and action is recorded so it can be reviewed later.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="rounded-2xl border border-dashed border-primary/30 bg-card/50 p-6 flex items-start gap-4"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">Planned</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Available vs planned */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-16">
            <motion.div
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-7"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium mb-4">
                <CheckCircle2 className="h-3 w-3" /> Available today
              </div>
              <ul className="space-y-2.5 text-sm text-foreground/80">
                {[
                  'Real-time CPU, memory, disk, and network metrics',
                  'Threshold alert rules with INFO, WARNING, and CRITICAL severity',
                  'Email and webhook notifications (Slack, Discord, generic)',
                  'Scheduled reports, metric history, and data export',
                  'Maintenance windows and API keys',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-7"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium mb-4">
                <Clock className="h-3 w-3" /> Planned - not yet available
              </div>
              <ul className="space-y-2.5 text-sm text-foreground/80">
                {[
                  'AI-assisted anomaly detection and alert correlation',
                  'AI incident summaries',
                  'Policy-controlled remediation with human approval',
                  'Audit log of AI recommendations and actions',
                  'Azure and GPU integrations (see below)',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Reliability of AI access */}
          <motion.div
            className="max-w-3xl mx-auto mt-10 rounded-2xl border border-border bg-card p-6 flex items-start gap-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground mb-1">Reliability of AI access</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Production reliability depends on uninterrupted access to frontier models. We plan to support that
                with suitable capacity, monitoring, retries, and fallback strategies. No cloud or model service can
                promise uninterrupted availability, and NodeVigil does not either.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Planned integrations */}
      <section id="integrations" className="py-24 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary mb-3 block">Integrations</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Planned Azure and GPU integrations
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              These integrations are planned and not yet available. Availability will depend on partner testing,
              capacity, and quotas.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Brain, title: 'Azure AI Foundry', desc: 'Frontier model access for detection, correlation, and incident summaries.', status: 'Planned' },
              { icon: Network, title: 'Azure gateway services', desc: 'A gateway layer in front of model endpoints to help with routing, capacity management, and fallback.', status: 'Planned' },
              { icon: Server, title: 'VM and vCPU workloads', desc: 'Visibility into VM and vCPU-based workloads, including the capacity the platform itself depends on.', status: 'Planned' },
              { icon: Cpu, title: 'Supported GPU compute', desc: 'GPU-backed compute for model training and inference, where supported by your quota and region.', status: 'Planned' },
              { icon: LineChart, title: 'Azure Monitor and Log Analytics', desc: 'Bring platform metrics and logs into NodeVigil to enrich detection and correlation.', status: 'Planned' },
              { icon: Terminal, title: 'NodeVigil agent', desc: 'Bash and PowerShell agent for Linux, Windows, virtual machines, container hosts, and bare metal.', status: 'Available' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="rounded-2xl border border-border bg-card p-7"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.status === 'Available' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-500/10 text-violet-500'}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${item.status === 'Available' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-violet-500/10 text-violet-500 border-violet-500/20'}`}>{item.status}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported platforms */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary mb-3 block">Compatibility</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Runs anywhere your servers do
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              If it runs Bash or PowerShell, the agent works. No provider lock-in.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {[
              'Ubuntu', 'Debian', 'CentOS', 'Rocky Linux', 'Alpine', 'Amazon Linux',
              'Red Hat', 'SUSE', 'Windows Server', 'Docker hosts', 'Kubernetes nodes', 'Bare metal',
            ].map((platform, i) => (
              <motion.div
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <Server className="h-3.5 w-3.5 text-muted-foreground" />
                {platform}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium mb-6">
              <DollarSign className="h-3 w-3" /> Simple, Transparent Pricing
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Free to start. Scale when you are ready.
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              Get started with unlimited servers on the free tier. AI-powered features are planned for a future
              Pro plan and are not yet available.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
              <div className="rounded-2xl border border-border bg-card p-8 text-left">
                <h3 className="text-lg font-semibold text-foreground mb-1">Free</h3>
                <p className="text-3xl font-bold text-foreground mb-4">$0<span className="text-base font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2.5 text-sm text-muted-foreground mb-6">
                  {['Unlimited servers', 'Real-time metrics', 'Custom alert rules', 'Email notifications', '7-day metric history'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/register">Get Started Free</Link>
                </Button>
              </div>
              <div className="rounded-2xl border-2 border-primary bg-card p-8 text-left relative">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">Popular</div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Pro</h3>
                <p className="text-3xl font-bold text-foreground mb-4">$29<span className="text-base font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2.5 text-sm text-muted-foreground mb-6">
                  {['Everything in Free', 'AI-assisted alerting (planned)', 'AI incident summaries (planned)', '90-day metric history', 'Webhook integrations', 'Priority support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button className="w-full shadow-lg shadow-primary/20" asChild>
                  <Link to="/trial">See what is planned</Link>
                </Button>
              </div>
            </div>

            <Button variant="link" asChild>
              <Link to="/pricing" className="text-primary">
                View full pricing details <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-28 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-medium text-emerald-500 mb-3 block">Cloud Infrastructure</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Built on cloud infrastructure,<br />designed for reliability.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
                NodeVigil is built on cloud infrastructure with encrypted transport and strict per-user isolation.
                Reliability planning covers capacity, monitoring, retries, and fallback strategies.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Cloud, label: 'Resilient Hosting', desc: 'Redundant, auto-scaling compute' },
                  { icon: Shield, label: 'Secure Access', desc: 'JWT auth and scoped agent keys' },
                  { icon: Lock, label: 'Data Isolation', desc: 'Per-user encrypted data' },
                  { icon: ScrollText, label: 'Audit Logging', desc: 'Planned for AI actions' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <item.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="shadow-lg shadow-primary/20">
                <Link to="/register">
                  Start monitoring free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-border">
                  <span className="text-sm font-semibold text-foreground">Infrastructure Stack</span>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { layer: 'Compute', tech: 'AWS EC2 + Auto Scaling', color: 'bg-amber-500' },
                    { layer: 'Database', tech: 'Managed PostgreSQL', color: 'bg-blue-500' },
                    { layer: 'Real-time', tech: 'WebSocket + STOMP', color: 'bg-violet-500' },
                    { layer: 'API', tech: 'Spring Boot 3 + Java 21', color: 'bg-sky-500' },
                    { layer: 'Frontend', tech: 'React + TypeScript + Vite', color: 'bg-red-500' },
                    { layer: 'Delivery', tech: 'Global edge CDN', color: 'bg-emerald-500' },
                    { layer: 'AI models', tech: 'Azure AI Foundry', color: 'bg-violet-500', planned: true },
                    { layer: 'AI gateway', tech: 'Azure gateway services', color: 'bg-violet-500', planned: true },
                    { layer: 'GPU compute', tech: 'Supported GPU compute', color: 'bg-violet-500', planned: true },
                    { layer: 'Telemetry', tech: 'Azure Monitor / Log Analytics', color: 'bg-violet-500', planned: true },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <div className={`h-2 w-2 rounded-full ${item.color} shrink-0`} />
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.layer}</span>
                        <span className="text-sm font-medium text-foreground font-mono text-right">
                          {item.tech}
                          {item.planned && (
                            <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 font-sans">Planned</span>
                          )}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="px-6 py-4 border-t border-border bg-muted/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Encrypted in transit over HTTPS and WSS. Items marked Planned are not yet available.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-28 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-medium text-primary mb-3 block">FAQ</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Common questions
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Cannot find what you are looking for? Check our detailed FAQ page or reach out.
              </p>
              <Button variant="outline" asChild>
                <Link to="/faq">View all FAQs <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>

            <div className="lg:col-span-3">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <AccordionItem value={`item-${i}`} className="border-border">
                      <AccordionTrigger className="text-base font-medium text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8">
              <Zap className="h-3 w-3" /> Ready in 5 minutes
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Start monitoring<br />your servers today.
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Free forever. No credit card. Deploy the agent, see your metrics, sleep better at night.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button size="lg" className="h-14 px-10 text-base shadow-xl shadow-primary/20" asChild>
                <Link to="/register">
                  Create free account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-base" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {['No credit card required', 'Unlimited servers', 'Live metrics in minutes', '5-minute setup'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <MonitorLogo className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-base font-bold tracking-tight">NodeVigil</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
                AI-powered cloud monitoring and auto-alerting with policy-controlled remediation in development.
                Live metrics and threshold alerts are available today.
              </p>
              <Link to="/status" className="flex w-fit items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Activity className="h-3.5 w-3.5" />
                View live system status
              </Link>
              <address className="mt-4 flex max-w-xs items-start gap-2 text-xs not-italic leading-relaxed text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>NodeVigil, 5 Grenfell Liwene Rd, Apt 5, Didsbury, Manchester, M20 6TG, United Kingdom</span>
              </address>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Product</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
                <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
                <Link to="/docs/product-overview" className="hover:text-foreground transition-colors">Product Overview</Link>
                <Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Company</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
                <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                <Link to="/status" className="hover:text-foreground transition-colors">Status</Link>
                <a href="mailto:support@nodevigil.cloud" className="hover:text-foreground transition-colors">support@nodevigil.cloud</a>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Legal</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Account</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
                <Link to="/register" className="hover:text-foreground transition-colors">Get Started</Link>
                <Link to="/forgot-password" className="hover:text-foreground transition-colors">Reset Password</Link>
              </nav>
            </div>
          </div>

          <div className="border-t border-border mt-10 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>&copy; {new Date().getFullYear()} NodeVigil by <span className="text-foreground">Davinosia Pahilanipa</span>. All rights reserved.</span>
              <div className="flex items-center gap-6">
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
          <TestingNotice className="mt-6 text-center sm:text-left" />
        </div>
      </footer>
    </div>
  );
}
