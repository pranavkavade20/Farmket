import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div
    className={cn(
      'animate-pulse rounded-full bg-gray-200 dark:bg-gray-800',
      className
    )}
  />
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="rounded-[2rem] p-6 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
    <Skeleton className="h-[220px] w-full rounded-[1.5rem] mb-6" />
    <div className="space-y-4">
      <Skeleton className="h-5 w-3/4 rounded-xl" />
      <Skeleton className="h-4 w-1/2 rounded-xl" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-7 w-20 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="rounded-[2rem] bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 p-8 space-y-4">
    <Skeleton className="h-5 w-1/3 rounded-xl" />
    <Skeleton className="h-10 w-1/2 rounded-xl" />
    <Skeleton className="h-4 w-2/3 rounded-xl" />
  </div>
);
