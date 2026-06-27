import React from 'react';
import { Skeleton } from './Skeleton';
import { cn } from '@/lib/utils/cn';

interface PageSkeletonProps {
  className?: string;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ className }) => {
  return (
    <div className={cn("p-6 space-y-6 w-full max-w-7xl mx-auto animate-in fade-in duration-500", className)}>
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};
