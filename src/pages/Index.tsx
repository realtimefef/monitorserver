import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  Server, Bell, Shield, Zap, LineChart, ChevronRight,
  CheckCircle2, Cpu, HardDrive, Wifi, BarChart3, ArrowRight,
  Terminal, AlertTriangle, Eye, Layers, Lock, Gauge,
  Clock, Menu, X, Play, Sparkles, Brain, Bot,
  Cloud, Network, Container, Users, TrendingUp,
  Rocket, Target, Building2, DollarSign
} from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ── Animated particles for hero ── */
const PARTICLES = Array.from({ length: 16 }, () => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: `${Math.random() * 2 + 1}px`,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2,
}));

const faqs = [
  { q: 'What exactly does Monitor Server do?', a: 'It gives you a live window into every server you manage. CPU spikes, memory leaks, disk pressure, network throughput — all visible in one place, updated every 5 seconds.' },
  { q: 'Is there anything to install?', a: 'Just a small shell script (Bash or PowerShell). Copy it to your server, plug in the agent key from your dashboard, and metrics start flowing within seconds.' },
  { q: 'How are alerts configured?', a: 'You create rules in the dashboard — pick a metric, set a threshold, choose a severity. When the value crosses that line, you get notified immediately.' },
  { q: 'What if I have dozens of servers?', a: 'Monitor Server is built for scale. Each server runs its own lightweight agent. The dashboard aggregates everything so you can see fleet-wide health at a glance.' },
  { q: 'Is my data secure?', a: 'All data is stored securely in PostgreSQL with per-user isolation. Each user can only see their own servers and metrics. Auth is handled via secure JWT tokens.' },
  { q: 'Is it really free?', a: 'Yes — the free tier includes unlimited servers, real-time metrics, and custom alert rules with no credit card required. When you need AI-powered features, advanced integrations, and longer metric history, upgrade to Pro.' },
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
      {/* ─── Navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
              <MonitorLogo className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight hidden sm:inline">Monitor Server</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features', to: '/features' },
              { label: 'Pricing', to: '/pricing' },
              { label: 'How It Works', to: '/how-it-works' },
              { label: 'Blog', to: '/blog' },
              { label: 'Docs', to: '/docs' },
            ].map((item) => (
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
              {[
                { label: 'Features', to: '/features' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'How It Works', to: '/how-it-works' },
                { label: 'Blog', to: '/blog' },
                { label: 'Docs', to: '/docs' },
              ].map((item) => (
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

      {/* ─── Announcement Bar ─── */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-center gap-2 text-xs sm:text-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-muted-foreground">Backed by</span>
          <span className="font-semibold text-foreground">NVIDIA Inception</span>
          <span className="text-muted-foreground">&amp;</span>
          <span className="font-semibold text-foreground">AWS Activate</span>
          <span className="text-muted-foreground hidden sm:inline">— AI-powered monitoring coming soon</span>
        </div>
      </div>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center pt-24 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient mesh blobs — subtle, professional */}
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

          {/* Minimal particles — refined, sparse */}
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
              <img src="/powered-by-aws-logo.webp" alt="AWS" className="h-4 sm:h-5 object-contain" />
              <span className="mx-1">&amp;</span>
              <img src="/nvidia-logo.webp" alt="NVIDIA" className="h-4 sm:h-5 object-contain" />
              GPU Infrastructure
            </motion.div>

            <motion.h1
              className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-6 leading-[0.95] tracking-tight"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Infrastructure monitoring,
              <br />
              <span className="text-gradient-primary">reimagined with AI.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              Real-time server monitoring for DevOps teams, SaaS startups, and cloud infrastructure engineers.
              Deploy a lightweight agent and get instant visibility into CPU, memory, disk &amp; network — powered by AWS cloud and NVIDIA GPU acceleration.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Button size="lg" className="h-13 px-8 text-base shadow-xl shadow-primary/20" asChild>
                <Link to="/register">
                  Get started — it's free
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
              {['No credit card needed', '5-minute setup', 'Unlimited servers'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
                </span>
              ))}
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
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground font-mono">monitorserver.in/dashboard</span>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 md:p-8">
                {/* Top row — metric tiles */}
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

                {/* Chart + server list */}
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

      {/* ─── Powered By / Trust Bar ─── */}
      <section className="py-20 border-y border-border bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p
            className="text-center text-sm text-muted-foreground mb-4 uppercase tracking-widest"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Infrastructure Partners
          </motion.p>
          <motion.h3
            className="text-center text-2xl sm:text-3xl font-bold text-foreground mb-10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Backed by industry leaders
          </motion.h3>

          {/* Large partner logos */}
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 mb-14">
            <motion.div
              className="flex flex-col items-center gap-3 hover:scale-105 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <img src="/powered-by-aws.png" alt="Powered by AWS" className="h-14 sm:h-20 object-contain" />
              <span className="text-xs text-muted-foreground font-medium">AWS Activate Program</span>
            </motion.div>
            <motion.div
              className="flex flex-col items-center gap-3 hover:scale-105 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <img src="/powered-by-nvidia.png" alt="Powered by NVIDIA" className="h-14 sm:h-20 object-contain" />
              <span className="text-xs text-muted-foreground font-medium">NVIDIA Inception Program</span>
            </motion.div>
            <motion.div
              className="flex flex-col items-center gap-3 hover:scale-105 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <img src="/tensorrt-logo.png" alt="NVIDIA TensorRT" className="h-14 sm:h-20 object-contain" />
              <span className="text-xs text-muted-foreground font-medium">NVIDIA TensorRT</span>
            </motion.div>
          </div>

          {/* Social proof stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '99.9%', label: 'Uptime SLA', icon: Shield },
              { value: '5s', label: 'Metric Refresh', icon: Gauge },
              { value: '<50ms', label: 'Alert Latency', icon: Zap },
              { value: '∞', label: 'Servers Supported', icon: Server },
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

      {/* ─── Who It's For ─── */}
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
              Whether you're managing a single server or an entire fleet, Monitor Server scales with you.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Rocket,
                title: 'SaaS Startups',
                desc: 'Monitor your production infrastructure from day one. Catch performance issues before they impact customers and churn.',
                color: 'bg-emerald-500/10 text-emerald-500',
              },
              {
                icon: Target,
                title: 'DevOps Engineers',
                desc: 'Replace fragmented monitoring with a single pane of glass. Track CPU, memory, disk, and network across every server.',
                color: 'bg-blue-500/10 text-blue-500',
              },
              {
                icon: Building2,
                title: 'Cloud Infrastructure Teams',
                desc: 'Manage AWS EC2 instances, on-premise servers, and hybrid environments from one dashboard with real-time alerts.',
                color: 'bg-violet-500/10 text-violet-500',
              },
              {
                icon: Container,
                title: 'Container & Kubernetes',
                desc: 'Monitor nodes running Docker and Kubernetes workloads. Track resource utilization across your orchestrated infrastructure.',
                color: 'bg-amber-500/10 text-amber-500',
              },
              {
                icon: Network,
                title: 'Multi-Cloud Deployments',
                desc: 'A single monitoring agent works across AWS EC2, GCP, Azure, and bare-metal. One consistent interface for all your infrastructure.',
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
      {/* ─── Core Technology Demos ─── */}
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
              A lightweight agent, real-time pipelines, and intelligent alerting — under the hood.
            </p>
          </motion.div>

          {/* Demo 1: Data Ingestion — left text, right animation */}
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
                A single shell script reads CPU, memory, disk and network counters every 5 seconds, then pushes them over HTTPS to the backend. No Docker, no sidecars, no daemons.
              </p>
              <ul className="space-y-3">
                {['Bash + PowerShell cross-platform', 'Under 5 KB footprint', 'Auto-reconnect on failure', 'Secure agent key auth'].map((item, i) => (
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
              {/* Animated ingestion visualization */}
              <div className="rounded-2xl border border-border bg-[#0c0f1a] overflow-hidden shadow-2xl p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                <div className="relative space-y-4">
                  {/* Simulated server nodes sending data */}
                  {[
                    { name: 'web-prod-01', cpu: 24, mem: 61, color: 'emerald' },
                    { name: 'db-primary', cpu: 45, mem: 78, color: 'blue' },
                    { name: 'cache-01', cpu: 12, mem: 34, color: 'violet' },
                  ].map((node, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                    >
                      <div className={`h-8 w-8 rounded-lg bg-${node.color}-500/20 flex items-center justify-center shrink-0`}>
                        <Server className={`h-4 w-4 text-${node.color}-400`} />
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

                  {/* Central hub */}
                  <motion.div
                    className="flex items-center justify-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 mt-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                  >
                    <MonitorLogo className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">Monitor Server API — Ingesting</span>
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

          {/* Demo 2: Real-time Streaming — right text, left animation */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-28">
            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Live metric stream visualization */}
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

                  {/* Animated metric bars */}
                  <div className="space-y-3">
                    {[
                      { label: 'CPU', value: 24, max: 100, color: 'bg-emerald-400' },
                      { label: 'RAM', value: 61, max: 100, color: 'bg-blue-400' },
                      { label: 'Disk', value: 43, max: 100, color: 'bg-amber-400' },
                      { label: 'Net', value: 38, max: 100, color: 'bg-violet-400' },
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

                  {/* WebSocket indicator */}
                  <motion.div
                    className="mt-4 flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 }}
                  >
                    <Zap className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs text-blue-300 font-mono">ws://api/metrics — connected</span>
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
                Once ingested, metrics are pushed to your dashboard instantly via WebSocket + STOMP. No polling, no delays — your charts animate in real time.
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

          {/* Demo 3: Smart Alerting — left text, right animation */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium mb-6">
                <Bell className="h-3 w-3" /> Intelligent Alerts
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Threshold-based alerting engine
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">
                Define rules for any metric — CPU, memory, disk, network. When values breach your thresholds, alerts fire instantly with configurable severity and cooldowns.
              </p>
              <ul className="space-y-3">
                {['INFO / WARNING / CRITICAL levels', 'Configurable cooldown periods', 'Per-server rule overrides', 'One-click acknowledge & resolve'].map((item, i) => (
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
              {/* Animated alert chart */}
              <div className="rounded-2xl border border-border bg-[#0c0f1a] overflow-hidden shadow-2xl p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-300">CPU — prod-web-01</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Last 30 min</span>
                  </div>

                  {/* Chart bars with threshold line */}
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

                  {/* Alert toast popup */}
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
                      <div className="text-xs font-semibold text-red-300">CRITICAL — CPU &gt; 80%</div>
                      <div className="text-[10px] text-gray-500">prod-web-01 · triggered 30s ago</div>
                    </div>
                    <span className="text-[10px] bg-red-500/30 text-red-300 font-medium px-2 py-0.5 rounded-full shrink-0">ACTIVE</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-28">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-2xl mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary mb-3 block">Capabilities</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Everything you need,<br />nothing you don't.
            </h2>
            <p className="text-muted-foreground text-lg">
              Focused monitoring tools that work out of the box.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Cpu, title: 'CPU & Load Tracking', desc: 'Watch processor usage and load averages across every core, with per-server breakdowns.' },
              { icon: HardDrive, title: 'Memory & Disk', desc: 'Track RAM consumption, swap usage, and disk space so you never get caught off guard.' },
              { icon: Wifi, title: 'Network Throughput', desc: 'See inbound and outbound traffic in real time. Spot anomalies before they impact users.' },
              { icon: Bell, title: 'Custom Alert Rules', desc: 'Set thresholds per server, per metric. Choose severity levels and get notified your way.' },
              { icon: Eye, title: 'Live Dashboard', desc: 'Metrics update in real time via WebSocket — no refresh needed. See the pulse of your fleet.' },
              { icon: Lock, title: 'Secure by Design', desc: 'JWT authentication, per-user data isolation, and auto-expiring tokens keep your data yours.' },
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

      {/* ─── How It Works — Visual Pipeline ─── */}
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
                title: 'Create your account',
                desc: 'Sign up, verify your email, and land in your dashboard. Takes about 30 seconds.',
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
                desc: 'CPU, RAM, disk, network — all streaming live. Set up alert rules and relax.',
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
                <div><span className="text-emerald-400">$</span> chmod +x monitor-agent.sh && ./monitor-agent.sh</div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <span className="text-gray-500">[info]</span> Monitor Server Agent v1.0
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

      {/* ─── FAQ ─── */}
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
                Can't find what you're looking for? Check our detailed FAQ page or reach out.
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

      {/* ─── Cloud Infrastructure ─── */}
      <section className="py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-medium text-emerald-500 mb-3 block">Cloud Infrastructure</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Enterprise-grade cloud,<br />startup-friendly pricing.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
                Deployed on AWS infrastructure with NVIDIA GPU acceleration for AI workloads. 
                Your data is secured with enterprise-level encryption and per-user isolation.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Cloud, label: 'AWS Cloud', desc: 'Hosted on AWS infrastructure' },
                  { icon: Shield, label: 'SOC 2 Ready', desc: 'Enterprise security posture' },
                  { icon: Lock, label: 'Data Isolation', desc: 'Per-user encrypted data' },
                  { icon: Zap, label: '99.9% Uptime', desc: 'SLA-backed reliability' },
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
              {/* Infrastructure stack card */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-border">
                  <span className="text-sm font-semibold text-foreground">Infrastructure Stack</span>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { layer: 'Compute', tech: 'AWS EC2 + Auto Scaling', color: 'bg-amber-500' },
                    { layer: 'AI / ML', tech: 'NVIDIA CUDA + TensorRT', color: 'bg-emerald-500' },
                    { layer: 'Database', tech: 'AWS RDS PostgreSQL', color: 'bg-blue-500' },
                    { layer: 'Real-time', tech: 'WebSocket + STOMP', color: 'bg-violet-500' },
                    { layer: 'API', tech: 'Spring Boot 3 + Java 21', color: 'bg-sky-500' },
                    { layer: 'Frontend', tech: 'React + TypeScript + Vite', color: 'bg-red-500' },
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
                        <span className="text-sm font-medium text-foreground font-mono">{item.tech}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="px-6 py-4 border-t border-border bg-muted/20">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <img src="/powered-by-aws-logo.webp" alt="AWS" className="h-5 object-contain opacity-70" />
                    <span>+</span>
                    <img src="/nvidia-logo.webp" alt="NVIDIA" className="h-5 object-contain opacity-70" />
                    <span className="ml-1">Backed by industry leaders</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Developer Resources ─── */}
      <section className="py-28 border-t border-border">
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
                title: 'Security & Architecture',
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

      {/* ─── AI-Powered Future ─── */}
      <section className="py-28 bg-gradient-to-b from-muted/10 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500 text-xs font-medium mb-6">
              <Brain className="h-3 w-3" /> Coming Soon — AI-Powered
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              The future of monitoring is intelligent
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Leveraging NVIDIA GPU infrastructure and AWS cloud, we're building AI-powered features 
              that don't just detect problems — they solve them automatically.
            </p>
            <div className="flex items-center justify-center gap-6">
              <img src="/nvidia-logo.webp" alt="NVIDIA" className="h-8 sm:h-10 object-contain opacity-70" />
              <img src="/tensorrt-logo.png" alt="TensorRT" className="h-7 sm:h-9 object-contain opacity-70" />
              <img src="/powered-by-aws-logo.webp" alt="AWS" className="h-7 sm:h-9 object-contain opacity-70" />
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Bot,
                title: 'Auto-Solve Alerts',
                desc: 'AI-powered remediation that automatically resolves common infrastructure issues — from restarting services to scaling resources — without human intervention.',
                tag: 'AI Agent',
                tagColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              },
              {
                icon: Brain,
                title: 'AI Recommendations',
                desc: 'Get intelligent suggestions for resolving errors and alerts. Our AI analyzes patterns across your infrastructure and recommends the most effective fix.',
                tag: 'ML Engine',
                tagColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
              },
              {
                icon: Sparkles,
                title: 'Predictive Analytics',
                desc: 'Forecast CPU spikes, memory exhaustion, and disk capacity issues before they happen. Plan infrastructure scaling with confidence.',
                tag: 'GPU Accelerated',
                tagColor: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
              },
              {
                icon: TrendingUp,
                title: 'Anomaly Detection',
                desc: 'Machine learning models trained on your metric baselines detect unusual patterns and alert you to silent failures that thresholds miss.',
                tag: 'Neural Network',
                tagColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
              },
              {
                icon: Cloud,
                title: 'Smart Capacity Planning',
                desc: 'AI-driven insights on resource utilization trends help you right-size your infrastructure and cut cloud costs by up to 40%.',
                tag: 'Cost Optimizer',
                tagColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
              },
              {
                icon: Network,
                title: 'Root Cause Analysis',
                desc: 'When an incident occurs, AI traces through correlated metrics across your fleet to pinpoint the exact root cause in seconds.',
                tag: 'Deep Analysis',
                tagColor: 'bg-red-500/10 text-red-500 border-red-500/20',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="group relative rounded-2xl border border-border bg-card p-7 overflow-hidden"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/[0.03] to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${feature.tagColor}`}>
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-muted-foreground mb-4">
              AI features are currently in development, powered by NVIDIA CUDA and AWS SageMaker.
            </p>
            <Button variant="outline" asChild>
              <Link to="/blog">
                Read our AI roadmap <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── Integration Badges ─── */}
      <section className="py-20 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Works everywhere your servers run
            </h2>
            <p className="text-muted-foreground text-lg">
              One agent, any platform — cloud, on-premise, or hybrid.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              'AWS EC2', 'Google Cloud', 'Microsoft Azure', 'DigitalOcean',
              'Docker', 'Kubernetes', 'Ubuntu', 'CentOS', 'Debian',
              'Windows Server', 'Red Hat', 'Bare Metal',
            ].map((platform, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
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

      {/* ─── Pricing Teaser ─── */}
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
              Free to start. Scale when you're ready.
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              Get started with unlimited servers on our free tier. Upgrade to Pro for AI-powered features,
              priority support, and advanced integrations.
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
                  {['Everything in Free', 'AI auto-solve alerts', 'AI recommendations', '90-day metric history', 'Webhook integrations', 'Priority support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button className="w-full shadow-lg shadow-primary/20" asChild>
                  <Link to="/register">Start 14-Day Trial</Link>
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

      {/* ─── CTA ─── */}
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
              {['No credit card required', 'Unlimited servers', 'AWS cloud infrastructure', '5-minute setup'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <MonitorLogo className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-base font-bold tracking-tight">Monitor Server</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
                AI-powered server monitoring with real-time metrics, intelligent alerts, and a beautiful dashboard. Deployed on AWS cloud with NVIDIA GPU acceleration.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                All systems operational
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Product</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
                <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
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
            <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
              <img src="/powered-by-aws.png" alt="Powered by AWS" className="h-10 opacity-70 hover:opacity-100 transition-opacity object-contain" />
              <img src="/powered-by-nvidia.png" alt="NVIDIA Inception" className="h-10 opacity-70 hover:opacity-100 transition-opacity object-contain" />
              <img src="/tensorrt-logo.png" alt="NVIDIA TensorRT" className="h-8 opacity-70 hover:opacity-100 transition-opacity object-contain" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>&copy; {new Date().getFullYear()} Monitor Server by <a href="https://www.linkedin.com/in/gautamkumarcloud/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">Gautam Kumar</a>. All rights reserved.</span>
              <div className="flex items-center gap-6">
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
