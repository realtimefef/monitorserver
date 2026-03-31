import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Shield, Zap, Heart, Linkedin, Globe, Award, Rocket } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

const values = [
  { icon: Server, title: 'Reliability First', desc: 'We built Monitor Server because downtime costs real money. Every design decision prioritizes accuracy and uptime.' },
  { icon: Shield, title: 'Security by Default', desc: 'Per-user data isolation, encrypted connections, JWT auth — security is baked in, not bolted on.' },
  { icon: Zap, title: 'Simplicity', desc: 'One script, one dashboard, real-time data. No complex setups, no bloated agents, no learning curve.' },
  { icon: Heart, title: 'Open & Transparent', desc: 'We believe in clear communication — whether it\'s an alert notification or our own policies.' },
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
            <span className="font-display text-lg font-bold tracking-tight">Monitor Server</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight mb-4">About Monitor Server</h1>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Monitor Server is a real-time server monitoring platform designed for DevOps teams,
            SaaS startups, and cloud infrastructure engineers who need instant visibility into their
            infrastructure — powered by AWS cloud and NVIDIA GPU acceleration.
          </p>
        </motion.div>

        {/* Founder Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Founder</h2>
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <img
                src="/founder.avif"
                alt="Gautam Kumar — Founder of Monitor Server"
                className="w-28 h-28 rounded-2xl object-cover border-2 border-border shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Gautam Kumar</h3>
                <p className="text-sm text-primary font-medium mb-3">Founder & CEO</p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Cloud infrastructure engineer and full-stack developer building the next generation of 
                  server monitoring. Passionate about making infrastructure observability accessible to 
                  every developer and team, regardless of scale.
                </p>
                <a
                  href="https://www.linkedin.com/in/gautamkumarcloud/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors text-sm font-medium"
                >
                  <Linkedin className="h-4 w-4" /> Connect on LinkedIn
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
            Server issues shouldn't be discovered by your users. Monitor Server gives you a live pulse on
            every machine you manage — CPU, memory, disk, network — so you can catch problems before
            they become incidents. We built this because we were tired of bloated monitoring tools that
            take days to set up and cost a fortune. Monitor Server takes seconds to deploy and puts
            everything you need in a single, clean dashboard.
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
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <img src="/powered-by-nvidia.png" alt="NVIDIA" className="h-12 object-contain" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">NVIDIA GPU Platform</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use NVIDIA GPUs to train AI models for anomaly detection and an intelligent
                chatbot that helps users diagnose server issues and get fixes in plain language.
              </p>
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
              <li><span className="font-medium text-foreground">Infrastructure:</span> AWS (EC2, RDS), NVIDIA GPU (AI features)</li>
              <li><span className="font-medium text-foreground">Agent:</span> Bash (Linux/macOS) & PowerShell (Windows)</li>
              <li><span className="font-medium text-foreground">Hosting:</span> Render (Backend + Frontend + Database)</li>
            </ul>
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
              <span>&copy; {new Date().getFullYear()} Monitor Server by <a href="https://www.linkedin.com/in/gautamkumarcloud/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">Gautam Kumar</a></span>
              <nav className="flex gap-6">
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                <a href="mailto:support@monitorserver.in" className="hover:text-foreground transition-colors">support@monitorserver.in</a>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
