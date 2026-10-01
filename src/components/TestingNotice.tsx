import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Small-print notice shown in page footers while the site is in limited-partner testing.
 */
export function TestingNotice({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs leading-relaxed text-muted-foreground', className)}>
      <span className="font-medium text-foreground/80">Testing phase:</span> this website is currently in testing
      and access is limited to selected partners. To request access,{' '}
      <Link to="/contact" className="underline underline-offset-2 hover:text-foreground transition-colors">
        contact us
      </Link>{' '}
      or email{' '}
      <a href="mailto:support@nodevigil.cloud" className="underline underline-offset-2 hover:text-foreground transition-colors">
        support@nodevigil.cloud
      </a>
      .
    </p>
  );
}

export default TestingNotice;
