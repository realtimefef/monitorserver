import { Link } from 'react-router-dom';
import { ChevronRight, Search, ArrowLeft } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useMemo } from 'react';

const faqs = [
  {
    question: 'What is Monitor Server?',
    answer:
      'Monitor Server is a real-time server monitoring platform. You deploy a lightweight agent script on each server you want to observe, and it continuously pushes metrics — CPU, memory, disk, network, and more — to your dashboard. From there you can visualize trends, set threshold-based alert rules, manage incidents, export historical reports, and monitor your entire server fleet from a single interface.',
    category: 'general',
  },
  {
    question: 'How does the monitoring agent work?',
    answer:
      'The agent is a small Bash script (or PowerShell on Windows) that runs on your server. It collects system metrics every 5 seconds and sends them to the Monitor Server REST API using your unique agent key. The agent requires no inbound firewall rules — it only makes outbound HTTPS requests. On Linux you can run it as a systemd service so it starts automatically on boot.',
    category: 'agent',
  },
  {
    question: 'What metrics are collected?',
    answer:
      'The agent collects the following metric types: CPU_USAGE (%), MEMORY_USAGE (%), MEMORY_TOTAL (MB), MEMORY_AVAILABLE (MB), DISK_USAGE (%), DISK_TOTAL (GB), DISK_AVAILABLE (GB), NETWORK_IN (bytes/s), NETWORK_OUT (bytes/s), LOAD_AVERAGE (1-min load), PROCESS_COUNT (running processes), and UPTIME (seconds). All values are time-stamped and stored for historical analysis.',
    category: 'agent',
  },
  {
    question: 'How do I install the agent on Linux?',
    answer:
      'After adding your server, navigate to Servers → your server → copy the agent key. SSH into your Linux server and run the pre-generated agent script shown on the Add Server success page. To run it as a persistent service, create a systemd unit file that sets the AGENT_KEY environment variable and points ExecStart at the script path. Enable it with: sudo systemctl enable --now monitor-agent.',
    category: 'agent',
  },
  {
    question: 'How do I install the agent on Windows?',
    answer:
      'On Windows, use the generated PowerShell agent script from the Add Server page. Open PowerShell as Administrator, set your agent key as an environment variable (e.g. $env:AGENT_KEY = "your-key"), then run the script. To run it continuously as a background service you can use NSSM (Non-Sucking Service Manager) or the Windows Task Scheduler with a "Run at startup" trigger and a repeat interval.',
    category: 'agent',
  },
  {
    question: 'How often are metrics sent?',
    answer:
      'The agent sends metrics every 5 seconds by default. You can adjust the poll interval in the agent script by changing the sleep value. The dashboard and Server Detail page always display the most recently received metric values and update graphs every 5 seconds.',
    category: 'agent',
  },
  {
    question: 'Can I monitor multiple servers?',
    answer:
      'Yes — Monitor Server is designed for multi-server monitoring. Each server you add gets its own unique agent key. All servers appear on the main Servers page and the Dashboard overview. You can filter alerts, history charts, and reports by server, and use Bulk Import (CSV) to register many servers at once.',
    category: 'general',
  },
  {
    question: 'How do alert rules work?',
    answer:
      'Alert rules are threshold-based conditions you define per server. Each rule specifies: a metric type (e.g. CPU_USAGE), a comparison operator (>, <, >=, <=, ==), a numeric threshold, a severity level (INFO, WARNING, or CRITICAL), an optional duration (how many seconds the condition must hold before firing), and a cooldown period (minimum minutes between repeated alerts). When the condition is met, an alert is created and appears on the Alerts page.',
    category: 'alerts',
  },
  {
    question: 'What notification methods are supported?',
    answer:
      'Alerts appear instantly on the dashboard via WebSocket push notifications. Email notifications are sent when enabled in your notification preferences. You can configure quiet hours to suppress emails during off-hours. Alerts can also be exported to CSV or included in Scheduled Reports.',
    category: 'alerts',
  },
  {
    question: 'How do I reset my password?',
    answer:
      'On the Login page, click "Forgot password?" and enter your email address. You will receive a password reset link valid for a limited time. Click the link, enter your new password (minimum 8 characters with uppercase, lowercase, a digit, and a special character), and submit. You can also change your password at any time from Settings → Change Password when you are logged in.',
    category: 'account',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Go to Settings → Danger Zone and click "Delete Account". You will be asked to confirm the action. Deletion is permanent and irreversible — all your servers, metrics history, alert rules, alerts, and scheduled reports will be permanently removed. Make sure to export any data you need before deleting.',
    category: 'account',
  },
  {
    question: 'Is my server data secure?',
    answer:
      'Yes. All communication between the agent and the API uses HTTPS. Your JWT authentication tokens are stored securely in the browser and expire automatically. The backend enforces per-user isolation — you can only access your own servers and metrics. Agent keys are randomly generated UUIDs; if a key is compromised you can regenerate it from the Server Detail page, which immediately invalidates the old key.',
    category: 'security',
  },
  {
    question: 'Can I export my historical data?',
    answer:
      'Yes. On the History page, select a server and time range, then click an export button to download the data in CSV, JSON, Excel, PDF, PNG, or JPG format. You can also create Scheduled Report templates that capture a specific server, metric selection, and time frame in PDF, CSV, or Excel — and generate them on demand with one click.',
    category: 'general',
  },
  {
    question: 'What does the agent key do? How do I regenerate it?',
    answer:
      'The agent key is a unique secret that identifies which server a metric payload belongs to. When the agent sends data, it includes the agent key; the API maps this key to your server record and stores the metric accordingly. No user authentication is needed for metric ingestion — only the agent key. If a key is exposed or compromised, open the Server Detail page, click "Regenerate Key", and update the key in your agent script or environment variable. The old key is immediately invalidated.',
    category: 'security',
  },
];

export default function FAQ() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'general', label: 'General' },
    { key: 'agent', label: 'Agent' },
    { key: 'alerts', label: 'Alerts' },
    { key: 'account', label: 'Account' },
    { key: 'security', label: 'Security' },
  ];

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch = !search || faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
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

      <main className="pt-24 pb-16 sm:pt-28">
        {/* ─── Hero ─── */}
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center space-y-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything you need to know about Monitor Server.
              Can't find your answer? Visit our{' '}
              <Link to="/help" className="text-primary hover:underline">
                Help &amp; Support
              </Link>{' '}
              page.
            </p>
          </motion.div>

          {/* ─── Search + Categories ─── */}
          <div className="max-w-3xl mx-auto mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    activeCategory === cat.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── FAQ Accordion ─── */}
          <div className="max-w-3xl mx-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No questions match your search. Try different keywords.
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-3">
                {filtered.map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <AccordionItem
                      value={`item-${idx}`}
                      className="rounded-xl border border-border bg-card px-4 sm:px-6"
                    >
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline hover:text-primary text-sm sm:text-base">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed text-sm">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            )}
          </div>

          {/* ─── Still have questions? ─── */}
          <motion.div
            className="max-w-3xl mx-auto mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8 text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-xl font-semibold text-foreground">
              Still have questions?
            </h2>
            <p className="text-muted-foreground">
              Our documentation and help pages have detailed guides for every feature.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/docs">View Documentation <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild>
                <Link to="/help">Help &amp; Support <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-card/50 mt-12">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-6">
              <img src="/powered-by-aws.png" alt="Powered by AWS" className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
              <img src="/powered-by-nvidia.png" alt="NVIDIA GPU" className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Monitor Server by <a href="https://www.linkedin.com/in/gautamkumarcloud/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">Gautam Kumar</a>. All rights reserved.</p>
              <nav className="flex flex-wrap gap-4">
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
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
