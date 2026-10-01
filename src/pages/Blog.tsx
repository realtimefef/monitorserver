import { Link } from 'react-router-dom';
import { TestingNotice } from '@/components/TestingNotice';
import { ArrowLeft, ArrowRight, Clock, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonitorLogo } from '@/components/MonitorLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { getBlogPosts } from './BlogPost';

const allPosts = getBlogPosts();
const categories = ['All', 'Engineering', 'AI & ML', 'Product', 'Infrastructure', 'Tutorial'];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = activeCategory === 'All'
    ? allPosts
    : allPosts.filter(p => p.category === activeCategory);

  const featured = filteredPosts.slice(0, 2);
  const regular = filteredPosts.slice(2);

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
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Blog & Resources</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Engineering deep-dives, product updates, and insights on building 
            AI-powered infrastructure monitoring at scale.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          className="flex flex-wrap gap-2 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Featured posts */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {featured.map((post, i) => (
            <Link key={i} to={`/blog/${post.slug}`}>
              <motion.article
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300 h-full"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="h-48 bg-gradient-to-br from-primary/10 via-primary/5 to-violet-500/10 flex items-center justify-center gap-6">
                  {i === 0 ? (
                    <img src="/aws-logo.webp" alt="AWS" className="h-14 object-contain opacity-40" />
                  ) : (
                    <img src="/nvidia-logo.webp" alt="NVIDIA" className="h-14 object-contain opacity-40" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">{post.category}</span>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" /> {post.author}
                      <span className="mx-1">·</span>
                      <Clock className="h-3 w-3" /> {post.date}
                    </div>
                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                      Read Article <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>

        {/* Regular posts */}
        <div className="space-y-6 mb-16">
          {regular.map((post, i) => (
            <Link key={i} to={`/blog/${post.slug}`}>
              <motion.article
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all duration-300"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">{post.category}</span>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" /> {post.author}
                        <span className="mx-1">·</span>
                        <Clock className="h-3 w-3" /> {post.date}
                      </div>
                      <span className="text-xs font-medium text-primary flex items-center gap-1">
                        Read Article <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div
          className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-3">Stay updated</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Get the latest engineering insights, product updates, and AI roadmap progress 
            delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Button className="shadow-lg shadow-primary/20">Subscribe</Button>
          </div>
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
