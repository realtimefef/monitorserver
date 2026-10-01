import { Link } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import { ArrowLeft, ArrowRight, CheckCircle2, Zap, DollarSign, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonitorLogo } from '@/components/MonitorLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for individual developers and small projects getting started with server monitoring.',
    features: [
      'Unlimited servers',
      'Real-time CPU, memory, disk & network metrics',
      '5-second refresh interval',
      'Custom alert rules',
      'Email notifications',
      '7-day metric history',
      'REST API access',
      'WebSocket real-time streaming',
      'Community support',
    ],
    cta: 'Get Started Free',
    ctaLink: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    desc: 'For growing teams who need longer retention and priority support, with AI-powered features planned.',
    features: [
      'Everything in Free',
      'Policy-controlled AI remediation (planned)',
      'AI incident summaries (planned)',
      'AI anomaly detection & alert correlation (planned)',
      '90-day metric history',
      'Webhook integrations',
      'Scheduled PDF/Excel reports',
      'API key management',
      'Maintenance windows',
      'Priority email support',
    ],
    cta: 'View Pro roadmap',
    ctaLink: '/trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For organizations with advanced security, compliance, and scale requirements.',
    features: [
      'Everything in Pro',
      'SAML/SSO authentication',
      'Custom data retention',
      'Dedicated infrastructure',
      'SLA guarantee',
      'On-premise deployment option',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone & email support',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
    highlight: false,
  },
];

const faqs = [
  { q: 'Can I really use NodeVigil for free?', a: 'Yes. The Free tier includes unlimited servers, real-time metrics, custom alerts, and email notifications — no credit card required, no time limit.' },
  { q: 'What happens when I exceed the free tier limits?', a: 'The Free tier has no server limits. The main differences are metric retention (7 days vs 90 days), AI features (planned), and support level. You can upgrade anytime.' },
  { q: 'Can I deploy NodeVigil on my own AWS account?', a: 'Enterprise customers can get a dedicated deployment on their own AWS infrastructure. Contact our sales team for custom deployment options and SLAs.' },
  { q: 'Do you offer discounts for startups?', a: 'Yes! We offer special startup-friendly pricing for teams building on our platform. Contact us for details.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans. All payments are processed securely through Stripe.' },
  { q: 'Can I cancel anytime?', a: 'Yes. There are no long-term contracts. Cancel your subscription at any time and keep access until the end of your billing period.' },
];

export default function Pricing() {
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

      <main className="container mx-auto px-6 py-16 max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium mb-6">
            <DollarSign className="h-3 w-3" /> Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Start free, scale as you grow
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees, no surprises. Monitor unlimited servers on our free tier, 
            and upgrade when you need extended retention. AI-powered features are planned and not yet available.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8">
            <img src="/powered-by-aws.png" alt="Powered by AWS" className="h-10 object-contain opacity-50" />
            <img src="/powered-by-nvidia.png" alt="NVIDIA GPU" className="h-10 object-contain opacity-50" />
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`rounded-2xl border ${plan.highlight ? 'border-2 border-primary' : 'border-border'} bg-card p-8 relative flex flex-col`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{plan.desc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.highlight ? 'shadow-lg shadow-primary/20' : ''}`}
                variant={plan.highlight ? 'default' : 'outline'}
                asChild
              >
                <Link to={plan.ctaLink}>
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Feature comparison note */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            All plans include unlimited servers, real-time metrics, and custom alert rules.
          </div>
        </motion.div>

        {/* Pricing FAQ */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-8">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Pricing FAQ</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-base font-medium text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
                <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
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
