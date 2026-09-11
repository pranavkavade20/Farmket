import React from 'react';
import type { CropStage } from '@/types/crops';
import { Sprout, Leaf, Wheat, PackageCheck, Check } from 'lucide-react';

interface CropLifecycleStepperProps {
  currentStage: CropStage | string;
  className?: string;
  compact?: boolean;
}

interface StageDefinition {
  id: CropStage;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const STAGES: StageDefinition[] = [
  { id: 'PLANTED', label: 'Planted', shortLabel: 'Planted', icon: Sprout },
  { id: 'GROWING', label: 'Growing', shortLabel: 'Growing', icon: Leaf },
  { id: 'NEAR_HARVEST', label: 'Near Harvest', shortLabel: 'Harvest Ready', icon: Wheat },
  { id: 'HARVESTED', label: 'Harvested', shortLabel: 'Done', icon: PackageCheck },
];

export const CropLifecycleStepper: React.FC<CropLifecycleStepperProps> = ({
  currentStage,
  className = '',
  compact = false,
}) => {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  if (compact) {
    const activeStage = STAGES[activeIndex] || STAGES[0];
    const ActiveIcon = activeStage.icon;
    const pct = Math.round(((activeIndex + 1) / STAGES.length) * 100);

    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <ActiveIcon className="w-3.5 h-3.5 text-brand" />
            <span>{activeStage.label}</span>
          </div>
          <span className="text-[11px] font-bold text-muted tabular-nums">
            {pct}%
          </span>
        </div>

        {/* Multi-segment mini bar */}
        <div className="grid grid-cols-4 gap-1 h-1.5 w-full">
          {STAGES.map((s, idx) => {
            const isDone = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            return (
              <div
                key={s.id}
                className={`h-full rounded-full transition-colors ${
                  isDone
                    ? 'bg-brand'
                    : isCurrent
                    ? 'bg-brand shadow-xs'
                    : 'bg-border-subtle'
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Connecting track lines behind circles */}
        <div className="absolute left-3 right-3 top-3.5 h-0.5 bg-border-subtle z-0" />
        <div
          className="absolute left-3 top-3.5 h-0.5 bg-brand z-0 transition-all duration-500"
          style={{
            width: `calc(${(activeIndex / (STAGES.length - 1)) * 100}% - 6px)`,
          }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isDone
                    ? 'bg-brand border-brand text-white'
                    : isCurrent
                    ? 'bg-surface border-brand text-brand ring-4 ring-brand/15 shadow-xs'
                    : 'bg-surface-elevated border-border-strong text-muted'
                }`}
                title={`${stage.label} stage`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              <span
                className={`text-[11px] font-semibold mt-1.5 transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'text-brand font-bold'
                    : isDone
                    ? 'text-foreground'
                    : 'text-muted'
                }`}
              >
                {stage.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
