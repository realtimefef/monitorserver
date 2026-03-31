import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  /** Alias for trendValue — use either one */
  delta?: string;
  /**
   * When true, the colour semantics are inverted:
   *   up → red (bad), down → green (good)
   * Use this for metrics where an increase is undesirable (e.g. alert counts).
   */
  trendInverted?: boolean;
  status?: 'normal' | 'warning' | 'critical';
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  delta,
  trendInverted = false,
  status = 'normal',
  className,
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  // delta takes priority over trendValue when both are provided
  const displayTrendValue = delta ?? trendValue;

  const statusGlow = {
    normal: '',
    warning: 'ring-1 ring-warning/30 glow-warning',
    critical: 'ring-1 ring-critical/30 glow-critical',
  };

  /**
   * Resolve the Tailwind colour class for the trend indicator.
   * Default (not inverted):  up = success/green, down = critical/red
   * Inverted:                up = critical/red,  down = success/green
   */
  const trendColorClass = (t: 'up' | 'down' | 'stable'): string => {
    if (t === 'stable') return 'text-muted-foreground';
    const isPositive = trendInverted ? t === 'down' : t === 'up';
    return isPositive ? 'text-success' : 'text-critical';
  };

  return (
    <div className={cn('metric-card', statusGlow[status], className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold text-foreground">
              {value}
            </span>
            {unit && (
              <span className="text-lg text-muted-foreground">{unit}</span>
            )}
          </div>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>

      {trend && displayTrendValue && (
        <div className="mt-4 flex items-center gap-1.5">
          <TrendIcon
            className={cn('h-4 w-4', trendColorClass(trend))}
          />
          <span className={cn('text-sm font-medium', trendColorClass(trend))}>
            {displayTrendValue}
          </span>
          <span className="text-sm text-muted-foreground">vs last snapshot</span>
        </div>
      )}

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
}
