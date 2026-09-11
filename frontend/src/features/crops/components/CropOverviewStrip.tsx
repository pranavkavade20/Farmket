import React from 'react';
import { Sprout, Wheat, Store, CheckCircle2 } from 'lucide-react';

interface CropOverviewStripProps {
  analytics: {
    total: number;
    growing: number;
    harvestSoon: number;
    readyToSell: number;
    completed: number;
  };
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const CropOverviewStrip: React.FC<CropOverviewStripProps> = ({
  analytics,
  activeFilter,
  onSelectFilter,
}) => {
  const items = [
    {
      id: 'GROWING',
      label: 'Actively Growing',
      count: analytics.growing,
      unit: analytics.growing === 1 ? 'crop' : 'crops',
      icon: Sprout,
      iconColor: 'text-brand',
      iconBg: 'bg-brand/10',
      activeBorder: 'border-brand ring-2 ring-brand/20',
      badge: 'In Soil',
    },
    {
      id: 'HARVEST_SOON',
      label: 'Harvest Soon',
      count: analytics.harvestSoon,
      unit: analytics.harvestSoon === 1 ? 'crop' : 'crops',
      icon: Wheat,
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10',
      activeBorder: 'border-warning ring-2 ring-warning/20',
      badge: '< 14 days',
    },
    {
      id: 'READY_TO_SELL',
      label: 'Ready to Sell',
      count: analytics.readyToSell,
      unit: analytics.readyToSell === 1 ? 'crop' : 'crops',
      icon: Store,
      iconColor: 'text-info',
      iconBg: 'bg-info/10',
      activeBorder: 'border-info ring-2 ring-info/20',
      badge: 'Available Stock',
    },
    {
      id: 'HARVESTED',
      label: 'Completed',
      count: analytics.completed,
      unit: analytics.completed === 1 ? 'cycle' : 'cycles',
      icon: CheckCircle2,
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
      activeBorder: 'border-success ring-2 ring-success/20',
      badge: 'Harvested',
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isSelected = activeFilter === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectFilter(isSelected ? 'ALL' : item.id)}
              className={`group text-left p-3.5 sm:p-4 rounded-2xl bg-surface border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 focus:outline-none ${
                isSelected
                  ? `bg-surface-elevated ${item.activeBorder} shadow-sm`
                  : 'border-border-subtle hover:border-border-strong'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <span className="text-[11px] font-semibold text-muted bg-surface-elevated px-2 py-0.5 rounded-full border border-border-subtle group-hover:text-foreground transition-colors">
                  {item.badge}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight tabular-nums">
                  {item.count}
                </span>
                <span className="text-xs font-medium text-foreground-secondary">
                  {item.unit}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-foreground-secondary mt-0.5 group-hover:text-foreground transition-colors truncate">
                {item.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
