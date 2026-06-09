import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={cn(
      'animate-pulse rounded-xl bg-border-strong dark:bg-border-subtle',
      className
    )}
  />
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="rounded-2xl p-4 bg-surface shadow-sm border border-border-subtle">
    <Skeleton className="h-[220px] w-full rounded-xl mb-4" />
    <div className="space-y-3">
      <Skeleton className="h-5 w-3/4 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-surface shadow-sm border border-border-subtle p-6 space-y-4">
    <Skeleton className="h-5 w-1/3 rounded-md" />
    <Skeleton className="h-8 w-1/2 rounded-md" />
    <Skeleton className="h-4 w-2/3 rounded-md" />
  </div>
);
