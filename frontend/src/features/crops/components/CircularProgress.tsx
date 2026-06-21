import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { clsx } from 'clsx';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  colorClass?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ 
  progress, 
  size = 48, 
  strokeWidth = 4,
  className,
  colorClass
}) => {
  const safeProgress = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, safeProgress, { duration: 1.2, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [safeProgress, count]);

  // Determine dynamic color if none is explicitly provided
  let dynamicColorClass = 'text-info';
  if (safeProgress >= 100) dynamicColorClass = 'text-success';
  else if (safeProgress > 75) dynamicColorClass = 'text-brand';
  else if (safeProgress > 40) dynamicColorClass = 'text-warning';

  const strokeColor = colorClass || dynamicColorClass;

  return (
    <div className={clsx("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Background Track */}
      <svg className="absolute inset-0 transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border-subtle"
        />
        {/* Animated Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={strokeColor}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (safeProgress / 100) * circumference }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      
      {/* Centered Percentage Label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-foreground tracking-tighter">
          <motion.span>{rounded}</motion.span>%
        </span>
      </div>
    </div>
  );
};
