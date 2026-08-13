import React from 'react';
import { cn } from '@/lib/utils/cn';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none';
  wrap?: boolean;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    as: Component = 'div', 
    direction = 'col', 
    align, 
    justify, 
    gap = 'md',
    wrap = false,
    ...props 
  }, ref) => {
    
    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-2',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12'
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          'flex',
          direction === 'col' ? 'flex-col' : 'flex-row',
          align && alignClasses[align],
          justify && justifyClasses[justify],
          gapClasses[gap],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';
