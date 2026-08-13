import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  maxWidth?: 'default' | 'wide';
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, as: Component = 'div', maxWidth = 'default', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'w-full mx-auto px-4 sm:px-6 lg:px-8', 
          maxWidth === 'wide' ? 'max-w-[1400px]' : 'max-w-[1280px]',
          className
        )}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';
