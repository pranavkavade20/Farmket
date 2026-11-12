import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  rounded = 'xl',
  ...props
}) => (
  <div
    className={cn(
      'relative overflow-hidden bg-border-subtle/80 dark:bg-surface-elevated/80',
      'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.8s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/25 dark:after:via-white/5 after:to-transparent',
      roundedMap[rounded],
      className
    )}
    {...props}
  />
);

export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'rounded-2xl p-4 bg-surface shadow-xs border border-border-subtle flex flex-col',
      className
    )}
  >
    <Skeleton className="aspect-square w-full rounded-xl mb-4" />
    <div className="space-y-3 flex-1 flex flex-col justify-between">
      <div>
        <Skeleton className="h-5 w-3/4 rounded-md mb-2" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'rounded-2xl bg-surface shadow-xs border border-border-subtle p-6 space-y-4',
      className
    )}
  >
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-1/3 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-1/2 rounded-md" />
    <Skeleton className="h-3.5 w-2/3 rounded-md" />
  </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number; rows?: number }> = ({
  columns = 5,
  rows = 4,
}) => (
  <>
    {Array.from({ length: rows }).map((_, rIdx) => (
      <tr key={rIdx} className="border-b border-border-subtle">
        {Array.from({ length: columns }).map((_, cIdx) => (
          <td key={cIdx} className="px-5 py-4">
            <Skeleton
              className={cn(
                'h-4 rounded-md',
                cIdx === 0 ? 'w-3/4' : cIdx === columns - 1 ? 'w-16 ml-auto' : 'w-1/2'
              )}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const FeedCardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-surface shadow-xs border border-border-subtle p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-11 w-11 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3 rounded-md" />
        <Skeleton className="h-3 w-1/5 rounded-md" />
      </div>
    </div>
    <Skeleton className="h-4 w-full rounded-md" />
    <Skeleton className="h-4 w-4/5 rounded-md" />
    <Skeleton className="h-64 w-full rounded-2xl" />
    <div className="flex items-center justify-between pt-2">
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);
