import { Link } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import { ArrowLeft, Mail, Github, MessageSquare, MapPin } from 'lucide-react';
import { MonitorLogo } from '@/components/MonitorLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export default function Contact() {
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
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          Have a question, found a bug, or want to suggest a feature? We'd love to hear from you.
          This website is currently in testing and access is limited to selected partners. If you would like
          access, contact us.
        </p>

        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Email</h3>
            <a href="mailto:support@nodevigil.cloud" className="text-sm text-muted-foreground hover:text-primary transition-colors">support@nodevigil.cloud</a>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <Github className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">GitHub</h3>
            <p className="text-sm text-muted-foreground">Open an issue or PR</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Community</h3>
            <p className="text-sm text-muted-foreground">Join the discussion</p>
          </div>
        </div>

        <section className="grid sm:grid-cols-2 gap-5 mb-14">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Address</h3>
            </div>
            <address className="text-sm not-italic text-muted-foreground leading-relaxed">
              NodeVigil<br />
              5 Grenfell Liwene Rd, Apt 5, Didsbury,<br />
              Manchester, M20 6TG,<br />
              United Kingdom
            </address>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <h3 className="font-semibold mb-2">Request access</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access is limited to selected partners during testing. Email{' '}
              <a href="mailto:support@nodevigil.cloud" className="text-primary hover:underline">support@nodevigil.cloud</a>{' '}
              and tell us about your infrastructure and use case.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-5 rounded-xl border border-border bg-card p-6"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1.5">Subject</label>
              <input
                id="subject"
                type="text"
                placeholder="What's this about?"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1.5">Message</label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell us what's on your mind..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Send Message
            </Button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} NodeVigil by <span className="text-foreground">Davinosia Pahilanipa</span></span>
            <nav className="flex flex-wrap justify-center gap-6">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <a href="mailto:support@nodevigil.cloud" className="hover:text-foreground transition-colors">support@nodevigil.cloud</a>
            </nav>
          </div>
          <TestingNotice className="mt-6 text-center sm:text-left" />
        </div>
      </footer>
    </div>
  );
}
