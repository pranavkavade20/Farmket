import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className }) => {
  // Determine color based on progress
  let colorClass = 'bg-blue-500';
  if (progress >= 100) colorClass = 'bg-green-500';
  else if (progress > 75) colorClass = 'bg-emerald-400';
  else if (progress > 40) colorClass = 'bg-yellow-400';

  return (
    <div className={clsx("w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700", className)}>
      <div 
        className={clsx("h-2.5 rounded-full transition-all duration-500 ease-in-out", colorClass)} 
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      ></div>
    </div>
  );
};
