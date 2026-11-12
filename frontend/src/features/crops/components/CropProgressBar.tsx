import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CropProgressBarProps {
  progress: number;
  stage?: string | null;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CropProgressBar: React.FC<CropProgressBarProps> = ({
  progress,
  stage,
  className = '',
  showLabel = true,
  size = 'md',
}) => {
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const formattedStage = stage
    ? stage.replace(/_/g, ' ').toLowerCase()
    : 'In Progress';

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-foreground capitalize">
            {stage ? formattedStage : 'Growth Progress'}
          </span>
          <span className="font-bold text-brand tabular-nums">
            {safeProgress}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-border-subtle dark:bg-surface-elevated rounded-full overflow-hidden shadow-inner',
          heightClasses[size]
        )}
        role="progressbar"
        aria-valuenow={safeProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={stage ? `${formattedStage} progress` : 'Crop growth progress'}
      >
        <div
          className="h-full bg-brand rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${safeProgress}%` }}
        >
          {safeProgress > 15 && (
            <div className="absolute inset-0 shimmer-wave opacity-30 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default CropProgressBar;
