import { Link, useParams, Navigate } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import { ArrowLeft, Clock, User, Tag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonitorLogo } from '@/components/MonitorLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  content: string[];
}

const posts: BlogPostData[] = [
  {
    slug: 'real-time-websocket-monitoring',
    title: 'How NodeVigil Tracks Servers in Real-Time with WebSocket Streaming',
    excerpt: 'Deep dive into our real-time architecture — from lightweight shell agents to STOMP-over-WebSocket metric delivery that updates your dashboard in under a second.',
    date: 'March 15, 2026',
    author: 'Davinosia Pahilanipa',
    category: 'Engineering',
    readTime: '8 min read',
    content: [
      'At NodeVigil, we needed to solve a fundamental problem: how do you deliver server metrics to a dashboard in real-time without crushing the backend with HTTP polling? The answer was WebSocket streaming using the STOMP protocol over SockJS.',
      '## The Architecture',
      'Our monitoring pipeline has three layers: **lightweight shell agents** (Bash/PowerShell) running on each server, a **Spring Boot 3.4 backend** handling metric ingestion via REST and broadcasting via WebSocket, and a **React frontend** that subscribes to per-server STOMP topics for instant updates.',
      'When an agent sends metrics via `POST /api/v1/metrics/ingest`, the backend validates the agent key, stores the data in PostgreSQL, and immediately broadcasts the update to all WebSocket subscribers watching that server. The entire round trip — from agent to dashboard — typically completes in under 200ms.',
      '## The Agent',
      'Our agents are intentionally simple. The Bash agent is ~80 lines of shell script. It collects CPU usage (via `/proc/stat`), memory (via `/proc/meminfo`), disk (via `df`), and network throughput (via `/proc/net/dev`). Every 5 seconds, it POSTs a JSON payload to the backend. No dependencies, no runtime, no package manager required.',
      'The PowerShell agent does the same on Windows using `Get-Counter` and WMI queries. Both agents authenticate using a unique agent key generated when you add a server to your dashboard.',
      '## STOMP Over WebSocket',
      'We chose STOMP (Simple Text Oriented Messaging Protocol) over raw WebSocket for several reasons: topic-based routing (`/topic/metrics/{serverId}`), built-in heartbeat support, and clean subscription management. Spring\'s `@MessageMapping` and `SimpMessagingTemplate` make broadcasting trivial.',
      'On the frontend, we use SockJS as a WebSocket fallback and the `@stomp/stompjs` client library. When a user opens a server detail page, the component subscribes to that server\'s metric topic. When they navigate away, it unsubscribes. No wasted bandwidth.',
      '## Handling Scale',
      'Each server generates roughly 1KB of metric data every 5 seconds. For 1,000 servers, that\'s ~200KB/s of ingestion traffic — easily handled by a single Spring Boot instance. The real bottleneck is database writes, which we optimize with batch inserts and a configurable retention policy (default: 30 days).',
      '## What\'s Next',
      'We\'re building on this foundation with NVIDIA GPU-accelerated anomaly detection. Instead of static threshold alerts, our AI pipeline will analyze metric patterns in real-time to detect anomalies before they trigger traditional alerts. More on that in our AI roadmap post.',
    ],
  },
  {
    slug: 'gpu-accelerated-monitoring-nvidia',
    title: 'Building GPU-Accelerated Monitoring with NVIDIA CUDA',
    excerpt: 'How we use NVIDIA GPUs to train AI models for anomaly detection, predictive capacity planning, and an intelligent chatbot that helps users diagnose server issues.',
    date: 'February 20, 2026',
    author: 'Davinosia Pahilanipa',
    category: 'AI & ML',
    readTime: '10 min read',
    content: [
      'We use NVIDIA GPUs to train custom AI models that are transforming how we think about server monitoring. Traditional monitoring is reactive — you set a threshold, wait for it to break, then scramble to fix it. We\'re building something fundamentally different: an AI chatbot that understands your infrastructure and helps you fix problems in plain language.',
      '## Why GPUs for Monitoring?',
      'Server metrics are time-series data — sequences of numbers that follow patterns. CPUs are great at processing individual data points, but GPUs excel at analyzing thousands of metric streams simultaneously. With NVIDIA CUDA, we can run anomaly detection models across your entire server fleet in parallel.',
      '## Our AI Pipeline',
      'We\'re building a three-stage pipeline: **ingestion** (real-time metrics via our existing WebSocket architecture), **analysis** (GPU-accelerated pattern recognition using NVIDIA TensorRT), and **action** (automated alerts and eventually auto-remediation).',
      'The analysis stage uses a lightweight LSTM (Long Short-Term Memory) model trained on normal metric patterns for each server. When the real-time data deviates significantly from the learned baseline, the system flags it as an anomaly — even if no static threshold was breached.',
      '## NVIDIA TensorRT Optimization',
      'Raw PyTorch inference is too slow for real-time monitoring at scale. We use NVIDIA TensorRT to optimize our models for production — converting them to FP16 precision and fusing layers for 3-5x faster inference. This means we can analyze metrics for thousands of servers with a single GPU.',
      '## Predictive Capacity Planning',
      'Beyond anomaly detection, we\'re using GPU-accelerated time-series forecasting to predict when a server will run out of disk space, when memory usage will hit critical levels, and when CPU saturation will cause performance degradation. This shifts monitoring from reactive to predictive.',
      '## NVIDIA GPU Training Infrastructure',
      'NVIDIA GPUs give us the compute power to train models on large volumes of metric data. We use NVIDIA\'s DGX Cloud for distributed training, CUDA for parallel processing, and TensorRT for optimized inference. The result: an AI chatbot that can answer questions like "Why is my server slow?" with context-aware diagnoses.',
      '## What This Means for Users',
      'When our AI features launch, NodeVigil will automatically learn your server\'s normal behavior and alert you when something unusual happens — before a traditional threshold alert would fire. No configuration required. The system learns and adapts on its own.',
    ],
  },
  {
    slug: 'ai-roadmap-auto-solve-alerts',
    title: 'Our AI Roadmap: Auto-Solve Alerts and Intelligent Recommendations',
    excerpt: 'A look at the future of infrastructure monitoring — AI agents that automatically resolve common issues and recommend fixes before humans even notice a problem.',
    date: 'February 5, 2026',
    author: 'Davinosia Pahilanipa',
    category: 'Product',
    readTime: '6 min read',
    content: [
      'We believe the future of infrastructure monitoring isn\'t just detecting problems — it\'s solving them. Our AI roadmap focuses on three pillars: intelligent anomaly detection, automated recommendations, and eventually, auto-remediation.',
      '## Phase 1: Smart Anomaly Detection (In Development)',
      'Traditional monitoring relies on static thresholds — "alert me when CPU exceeds 80%." But what if 80% CPU is normal for your batch processing server at 2 AM? Our AI learns each server\'s unique patterns and alerts only on genuine anomalies, reducing false positives by an estimated 70%.',
      '## Phase 2: AI Recommendations (Q3 2026)',
      'When an alert fires, our AI will analyze the context — what changed, what metrics correlate, what historical incidents looked similar — and recommend specific actions. "Disk usage spiking on /var/log? Recent deployment generated excessive logging. Consider rotating logs or adjusting log levels."',
      '## Phase 3: Auto-Solve Alerts (Q4 2026)',
      'For predefined runbooks, our AI agents will take automated action: restart a crashed service, clear a full temp directory, scale up resources, or roll back a problematic deployment. Each action is logged, auditable, and reversible. You stay in control — the AI just handles the 3 AM pages.',
      '## How We\'re Building It',
      'Our AI stack leverages NVIDIA CUDA for real-time inference and AWS infrastructure for reliable delivery. Models are trained on anonymized metric patterns (never your actual data), fine-tuned per-server using federated learning, and served via NVIDIA TensorRT for sub-millisecond inference.',
      '## The Vision',
      'Imagine a world where your monitoring tool doesn\'t just tell you something is broken — it fixes it, explains what happened, and suggests how to prevent it next time. That\'s what we\'re building at NodeVigil.',
    ],
  },
  {
    slug: 'why-we-chose-aws',
    title: 'Why We Chose AWS for Our Cloud Infrastructure',
    excerpt: 'From EC2 instances to RDS PostgreSQL, here is why AWS was the perfect cloud platform for NodeVigil — and how it supports our 99.9% uptime target.',
    date: 'January 15, 2026',
    author: 'Davinosia Pahilanipa',
    category: 'Infrastructure',
    readTime: '7 min read',
    content: [
      'When we started building NodeVigil, we evaluated every major cloud provider. We chose AWS because it offered the best combination of reliability, services, and developer tools for our scale.',
      '## AWS Services We Use',
      '**Amazon EC2** runs our Spring Boot backend and handles metric ingestion from thousands of agents simultaneously. Auto Scaling ensures we can handle traffic spikes without manual intervention.',
      '**Amazon RDS (PostgreSQL)** stores all metrics, user data, and alert configurations with automated backups, point-in-time recovery, and read replicas for query performance.',
      '**Amazon CloudWatch** monitors our own infrastructure — yes, we monitor the monitor. CPU utilization, database connections, API latency — all tracked to help us maintain our 99.9% uptime target.',
      '**AWS Certificate Manager** handles SSL/TLS certificates for all our domains, ensuring encrypted connections between agents, backends, and frontends.',
      '## Why AWS Cloud',
      'AWS provides us with battle-tested infrastructure at every layer. The breadth of managed services — compute, database, networking, security — means we spend time building monitoring features, not managing infrastructure. Pay-as-you-go pricing keeps costs aligned with actual usage.',
      '## Architecture Decisions',
      'We run our backend in containers, database on managed RDS, and static frontend on a CDN. This separation means we can scale each component independently. The backend can handle thousands of metric ingestions per second, while the frontend loads in under 2 seconds globally.',
      '## Reliability',
      'Our uptime target is supported by AWS\'s infrastructure SLA. Multi-AZ database deployment, health checks with automatic failover, and zero-downtime deployments help keep your monitoring dashboard available during an incident. No cloud service can promise uninterrupted availability, and NodeVigil does not either.',
      '## Looking Ahead',
      'As we grow, we plan to leverage more AWS services: SQS for asynchronous alert processing, Lambda for serverless webhook delivery, and SageMaker for distributed AI model training alongside our NVIDIA GPU infrastructure.',
    ],
  },
  {
    slug: 'spring-boot-java21-backend',
    title: 'From Spring Boot to Production: Building a Java 21 Monitoring Backend',
    excerpt: 'Technical deep-dive into our backend architecture — Spring Boot 3.4, Java 21, WebSocket STOMP, and how we handle thousands of metric ingestions per second.',
    date: 'December 28, 2025',
    author: 'Davinosia Pahilanipa',
    category: 'Engineering',
    readTime: '12 min read',
    content: [
      'NodeVigil\'s backend is built with Spring Boot 3.4 running on Java 21. This combination gives us virtual threads, pattern matching, record types, and the mature Spring ecosystem — a solid foundation for a high-throughput monitoring platform.',
      '## Why Spring Boot?',
      'We evaluated Node.js, Go, and Rust for our backend. Spring Boot won because of its mature WebSocket support (STOMP), JPA/Hibernate for database operations, Spring Security for authentication, and a vast ecosystem of battle-tested libraries. Java 21\'s virtual threads eliminate the traditional "too many threads" concern.',
      '## API Architecture',
      'Our REST API serves 57 endpoints across 9 controllers: Auth (10), Servers (7), Metrics (6), Alerts (12), Reports (4), Notifications (4), Webhooks (4), API Keys (4), and Maintenance Windows (4). Every endpoint is authenticated via JWT (or API key), validated with Bean Validation, and protected by rate limiting.',
      '## Metric Ingestion Pipeline',
      'The hot path — `POST /api/v1/metrics/ingest` — is optimized for throughput. Agent key validation uses a database index, metric persistence uses batch-friendly JPA, and WebSocket broadcasting happens asynchronously. A single instance comfortably handles 1,000+ metric writes per second.',
      '## Alert Evaluation',
      'Alert rules are evaluated on every metric ingestion. Our `AlertEvaluationService` checks all enabled rules for the reporting server, evaluates threshold conditions with configurable duration requirements (the metric must exceed the threshold for N consecutive seconds), and fires notifications via email and webhooks. Maintenance windows are respected — no alerts during planned downtime.',
      '## Security Layers',
      'Authentication supports both JWT tokens (for the frontend) and API keys (for programmatic access). The `JwtAuthFilter` checks both header formats on every request. CORS is locked to the production domain. Rate limiting prevents abuse. All user-supplied data is validated and HTML-escaped before storage.',
      '## Database Design',
      '15 PostgreSQL tables with carefully designed indexes on every query path. Metrics have composite indexes on (server_id, metric_type, timestamp) for fast range queries. Alerts index on (server_id, status, triggered_at) for dashboard display. The schema supports cascading deletes — removing a server cleans up all associated metrics, alerts, and agent activity.',
      '## Lessons Learned',
      'The biggest lesson: always set `spring.jpa.open-in-view=false` and annotate every service method with `@Transactional`. Lazy-loaded relationships will silently fail without an active session. We caught and fixed 10 instances of this during our production audit.',
    ],
  },
  {
    slug: 'five-minute-monitoring-setup',
    title: 'The 5-Minute Server Monitoring Setup: A Step-by-Step Guide',
    excerpt: 'Go from zero to full infrastructure observability in under five minutes. Install the agent, configure alerts, and start monitoring — no complex setup required.',
    date: 'December 15, 2025',
    author: 'Davinosia Pahilanipa',
    category: 'Tutorial',
    readTime: '5 min read',
    content: [
      'Getting started with NodeVigil takes less than five minutes. No complex configurations, no infrastructure to set up, no credit card required. Here\'s how.',
      '## Step 1: Create Your Account (30 seconds)',
      'Visit **nodevigil.cloud** and click **Get Started Free**. Enter your email and password. You\'ll receive a verification email — click the link to activate your account.',
      '## Step 2: Add Your First Server (30 seconds)',
      'From your dashboard, click **Add Server**. Give it a name (e.g., "Production Web Server") and an optional host address. NodeVigil generates a unique **Agent Key** — copy it.',
      '## Step 3: Install the Agent (2 minutes)',
      'SSH into your server and run the appropriate installer:\n\n**Linux/macOS (Bash):**\n```bash\ncurl -sL https://nodevigil.cloud/agent/monitor-agent.sh -o monitor-agent.sh\nchmod +x monitor-agent.sh\n./monitor-agent.sh -u "https://api.nodevigil.cloud/api/v1" -k "YOUR_AGENT_KEY"\n```\n\n**Windows (PowerShell):**\n```powershell\nInvoke-WebRequest -Uri "https://nodevigil.cloud/agent/monitor-agent.ps1" -OutFile monitor-agent.ps1\n.\\monitor-agent.ps1 -ApiUrl "https://api.nodevigil.cloud/api/v1" -AgentKey "YOUR_AGENT_KEY"\n```',
      '## Step 4: See Metrics Flowing (Instant)',
      'Go back to your dashboard. Within seconds, you\'ll see live CPU, memory, disk, and network metrics streaming in real-time. The dashboard updates every 5 seconds with no page refresh required.',
      '## Step 5: Set Up Alerts (1 minute)',
      'Navigate to **Alert Rules** and create your first rule. Pick a metric (CPU, Memory, Disk, or Network), set a condition (e.g., "CPU > 80%"), choose a severity, and save. When the threshold is breached, you\'ll get an instant email notification.',
      '## What\'s Next?',
      'Add more servers, set up webhooks for Slack/Discord notifications, configure scheduled reports, and explore the API for programmatic access. NodeVigil scales with you — from a single VPS to a fleet of hundreds.',
      '## Need Help?',
      'Check our documentation at **nodevigil.cloud/docs**, or reach out at **support@nodevigil.cloud**. We typically respond within a few hours.',
    ],
  },
];

export function getBlogPosts() {
  return posts;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find(p => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const currentIndex = posts.findIndex(p => p.slug === slug);
  const nextPost = posts[currentIndex + 1];
  const prevPost = posts[currentIndex - 1];

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
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <motion.article initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              <Tag className="h-3 w-3 inline mr-1" />{post.category}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readTime}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {post.author}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 leading-tight">
            {post.title}
          </h1>
          <p className="text-muted-foreground mb-2">{post.date}</p>

          <hr className="border-border my-8" />

          {(post.category === 'AI & ML' || post.category === 'Product') && (
            <div className="mb-8 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Roadmap note:</span> AI-assisted anomaly detection,
              alert correlation, incident summaries, and policy-controlled remediation are planned and not yet
              available. See the <Link to="/docs/product-overview" className="text-primary hover:underline">product overview</Link> for
              what is available today.
            </div>
          )}

          {/* Body */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-5">
            {post.content.map((block, i) => {
              if (block.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold text-foreground mt-10 mb-4">{block.replace('## ', '')}</h2>;
              }
              if (block.includes('```')) {
                const lines = block.split('\n');
                const codeLines = lines.filter(l => !l.startsWith('```'));
                return (
                  <pre key={i} className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono">
                    <code>{codeLines.join('\n')}</code>
                  </pre>
                );
              }
              return (
                <p key={i} className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{
                  __html: block
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">$1</code>')
                }} />
              );
            })}
          </div>

          {/* Nav */}
          <hr className="border-border my-12" />
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`} className="group flex-1 rounded-xl border border-border p-4 hover:border-primary/40 transition-colors">
                <span className="text-xs text-muted-foreground mb-1 block">&larr; Previous</span>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{prevPost.title}</span>
              </Link>
            ) : <div className="flex-1" />}
            {nextPost ? (
              <Link to={`/blog/${nextPost.slug}`} className="group flex-1 rounded-xl border border-border p-4 hover:border-primary/40 transition-colors text-right">
                <span className="text-xs text-muted-foreground mb-1 block">Next &rarr;</span>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{nextPost.title}</span>
              </Link>
            ) : <div className="flex-1" />}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
            <h3 className="text-lg font-bold mb-2">Ready to monitor your servers?</h3>
            <p className="text-sm text-muted-foreground mb-4">Get started free — no credit card required.</p>
            <Link to="/register">
              <Button className="shadow-lg shadow-primary/20">
                Get Started Free <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.article>
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
