import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  spacing?: 'sm' | 'md' | 'lg' | 'none';
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, as: Component = 'section', spacing = 'md', ...props }, ref) => {
    
    const spacingClasses = {
      sm: 'py-8 md:py-12',    // Mobile: 32px, Desktop: 48px
      md: 'py-12 md:py-16',   // Mobile: 48px, Desktop: 64px
      lg: 'py-14 md:py-20',   // Mobile: 56px, Desktop: 80px
      none: '',
    };

    return (
      <Component
        ref={ref}
        className={cn('w-full', spacingClasses[spacing], className)}
        {...props}
      />
    );
  }
);
Section.displayName = 'Section';
