import React from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface HarvestCountdownCardProps {
  expectedDate: string;
  className?: string;
}

export default function HarvestCountdownCard({ expectedDate, className }: HarvestCountdownCardProps) {
  const harvestDate = new Date(expectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  harvestDate.setHours(0, 0, 0, 0);

  const diffTime = harvestDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isPast = diffDays < 0;
  const isToday = diffDays === 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-hover to-brand-active text-white p-5 sm:p-6 shadow-md group',
        className
      )}
    >
      {/* Decorative background glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-white/20 text-white">
              <Clock className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs uppercase tracking-wider font-bold text-white/90">
              Expected Harvest
            </h4>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            {isPast ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" /> Harvest Ready
              </span>
            ) : isToday ? (
              'Harvesting Today!'
            ) : (
              `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} Remaining`
            )}
          </p>
        </div>

        <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-white/15">
          <p className="text-xs font-medium text-white/80 flex items-center sm:justify-end gap-1 mb-0.5">
            <Calendar className="w-3 h-3" /> Target Date
          </p>
          <p className="text-sm font-bold text-white tracking-wide">
            {harvestDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
