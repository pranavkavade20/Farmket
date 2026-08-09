import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center group w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs z-50",
          "px-3 py-1.5 text-xs font-medium text-background bg-foreground rounded-lg shadow-lg",
          "pointer-events-none animate-in fade-in zoom-in-95 duration-200",
          className
        )}>
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
};
