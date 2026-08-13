import React from 'react';
import { cn } from '@/lib/utils/cn';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  cols?: 1 | 2 | 3 | 4 | 'auto-fit' | 'auto-fill';
  gap?: 'sm' | 'md' | 'lg';
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, as: Component = 'div', cols = 1, gap = 'md', ...props }, ref) => {
    
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      'auto-fit': 'grid-cols-[repeat(auto-fit,minmax(240px,1fr))]',
      'auto-fill': 'grid-cols-[repeat(auto-fill,minmax(240px,1fr))]',
    };

    const gapClasses = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    };

    return (
      <Component
        ref={ref}
        className={cn('grid', colClasses[cols], gapClasses[gap], className)}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';
