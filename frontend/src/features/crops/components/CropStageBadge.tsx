import React from 'react';
import { Badge, type BadgeVariant } from '@/components/ui';
import type { CropStage } from '@/types/crops';
import { Sprout, Leaf, Wheat, Package } from 'lucide-react';

interface Props {
  stage: CropStage | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const STAGE_CONFIG: Record<string, { label: string; variant: BadgeVariant; icon: React.ReactNode }> = {
  PLANTED: {
    label: 'Planted',
    variant: 'in-progress',
    icon: <Sprout className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />,
  },
  GROWING: {
    label: 'Growing',
    variant: 'success',
    icon: <Leaf className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />,
  },
  NEAR_HARVEST: {
    label: 'Near Harvest',
    variant: 'pending',
    icon: <Wheat className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />,
  },
  HARVESTED: {
    label: 'Harvested',
    variant: 'success',
    icon: <Package className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />,
  },
};

export const CropStageBadge: React.FC<Props> = ({ stage, className = '', size = 'sm' }) => {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.PLANTED;

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={config.icon}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

export default CropStageBadge;
