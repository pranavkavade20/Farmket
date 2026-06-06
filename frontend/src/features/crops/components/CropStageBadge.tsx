import React from 'react';
import { Leaf, Sprout, Wheat, Package } from 'lucide-react';
import { CropStage } from '@/types/crops';

interface Props {
  stage: CropStage | string;
  className?: string;
}

const STAGE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PLANTED: { label: 'Planted', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Sprout },
  GROWING: { label: 'Growing', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Leaf },
  NEAR_HARVEST: { label: 'Near Harvest', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Wheat },
  HARVESTED: { label: 'Harvested', color: 'bg-green-800 text-white dark:bg-green-700 dark:text-white', icon: Package },
};

export const CropStageBadge: React.FC<Props> = ({ stage, className = '' }) => {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.PLANTED;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};
