import React from 'react';
import { motion } from 'framer-motion';
import { CropStage } from '@/types/crops';

interface SegmentedProgressProps {
  currentStage: CropStage | string;
  className?: string;
}

const STAGES = [
  { id: 'PLANTED', label: 'Planted', icon: '🌱' },
  { id: 'GROWING', label: 'Growing', icon: '🌿' },
  { id: 'NEAR_HARVEST', label: 'Near Harvest', icon: '🌸' },
  { id: 'HARVESTED', label: 'Harvested', icon: '🌾' }
];

export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({ currentStage, className = '' }) => {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-semibold text-foreground tracking-tight">
          Growth Progress
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
          {Math.round(((activeIndex + 1) / STAGES.length) * 100)}%
        </span>
      </div>
      
      <div className="flex w-full gap-1 h-1.5">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx <= activeIndex;
          const isActive = idx === activeIndex;
          
          return (
            <div 
              key={stage.id} 
              className="relative flex-1 rounded-full overflow-hidden bg-surface-elevated border border-border-subtle"
            >
              {isCompleted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
                  className={`absolute inset-0 h-full ${
                    isActive 
                      ? 'bg-brand' 
                      : 'bg-brand/50'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between items-center px-1 mt-0.5">
        <div className="flex gap-1.5 items-center">
          <span className="text-sm">{STAGES[activeIndex].icon}</span>
          <span className="text-[10px] font-medium text-muted">
            Current: <span className="text-foreground font-semibold">{STAGES[activeIndex].label}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
