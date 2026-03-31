import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Shield, Zap, Heart } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

const values = [
  { icon: Server, title: 'Reliability First', desc: 'We built CloudMonitor because downtime costs real money. Every design decision prioritizes accuracy and uptime.' },
  { icon: Shield, title: 'Security by Default', desc: 'Row Level Security, encrypted connections, JWT auth — security is baked in, not bolted on.' },
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
            <span className="font-display text-lg font-bold tracking-tight">CloudMonitor</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-4">About CloudMonitor</h1>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          CloudMonitor is a lightweight, real-time server monitoring platform designed for developers and 
          DevOps teams who need immediate visibility into their infrastructure without the overhead of 
          enterprise solutions.
        </p>

        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Server issues shouldn't be discovered by your users. CloudMonitor gives you a live pulse on 
            every machine you manage — CPU, memory, disk, network — so you can catch problems before 
            they become incidents. We built this because we were tired of bloated monitoring tools that 
            take days to set up and cost a fortune. CloudMonitor takes seconds to deploy and puts 
            everything you need in a single, clean dashboard.
          </p>
        </section>

        <section className="mb-14">
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
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">
            You install a small shell agent (Bash or PowerShell) on each server you want to monitor. 
            The agent sends CPU, RAM, disk, and network metrics to CloudMonitor via a secure API every 
            few seconds. The dashboard uses real-time subscriptions to update instantly — no polling, 
            no delays. You configure alert rules with custom thresholds, and CloudMonitor notifies you 
            the moment something crosses the line.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="font-medium text-foreground">Frontend:</span> React, TypeScript, Tailwind CSS, Framer Motion, Recharts</li>
              <li><span className="font-medium text-foreground">Backend:</span> Supabase (PostgreSQL, Auth, Realtime, Edge Functions)</li>
              <li><span className="font-medium text-foreground">Agent:</span> Bash (Linux/macOS) & PowerShell (Windows)</li>
              <li><span className="font-medium text-foreground">Hosting:</span> Vercel / Netlify (Static) + Supabase (Backend)</li>
            </ul>
          </div>
        </section>
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
