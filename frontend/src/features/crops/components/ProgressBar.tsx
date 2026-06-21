import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className, showLabel = false }) => {
  const safeProgress = Math.max(0, Math.min(100, progress));
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, safeProgress, { duration: 1, ease: "easeOut" });
    return controls.stop;
  }, [safeProgress, count]);

  let colorClass = 'bg-info';
  if (safeProgress >= 100) colorClass = 'bg-success';
  else if (safeProgress > 75) colorClass = 'bg-brand';
  else if (safeProgress > 40) colorClass = 'bg-warning';

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <div className="w-full bg-border-subtle rounded-full h-2 overflow-hidden shadow-inner">
        <motion.div 
          className={clsx("h-2 rounded-full", colorClass)} 
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-muted font-medium">
          <span>Progress</span>
          <motion.span>{rounded}</motion.span>
        </div>
      )}
    </div>
  );
};
