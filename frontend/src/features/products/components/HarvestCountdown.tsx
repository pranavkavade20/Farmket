import React from 'react';
import { Clock, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface HarvestCountdownProps {
  days: number;
  className?: string;
  size?: 'sm' | 'md';
}

export const HarvestCountdown: React.FC<HarvestCountdownProps> = ({
  days,
  className = '',
  size = 'md',
}) => {
  if (days < 0) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 font-bold rounded-full bg-success-muted text-success border border-success/30 shadow-2xs',
          size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3.5 py-1',
          className
        )}
      >
        <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>Harvest Ready</span>
      </div>
    );
  }

  if (days === 0) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 font-bold rounded-full bg-warning-muted text-warning border border-warning/30 shadow-2xs animate-pulse',
          size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3.5 py-1',
          className
        )}
      >
        <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>Harvest Today</span>
      </div>
    );
  }

  const isUrgent = days <= 3;
  const isSoon = days <= 14;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-2xs',
        isUrgent
          ? 'bg-warning-muted text-warning border-warning/30'
          : isSoon
          ? 'bg-brand/10 text-brand border-brand/20'
          : 'bg-surface-elevated text-foreground-secondary border-border-subtle',
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1',
        className
      )}
    >
      <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4 text-brand'} />
      <span>
        Harvest in <strong className="font-bold">{days}</strong> {days === 1 ? 'Day' : 'Days'}
      </span>
    </div>
  );
};

export default HarvestCountdown;
