import React, { useMemo, useState } from 'react';
import type { CropGrowth } from '@/types/crops';
import { Calendar as CalendarIcon, ArrowRight, Activity, CalendarDays, ListOrdered } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { openStageUpdateModal, openCropDetail } from '../cropsSlice';
import { getHarvestTiming, formatCropQuantity } from '../utils/cropUtils';
import { Calendar, type CalendarEvent } from '@/components/ui/Calendar';

interface CropCalendarProps {
  crops: CropGrowth[];
}

export const CropCalendar: React.FC<CropCalendarProps> = ({ crops }) => {
  const dispatch = useAppDispatch();
  const [scheduleMode, setScheduleMode] = useState<'agenda' | 'grid'>('agenda');

  // 1. Agenda Groups (Grouped by Month)
  const groupedHarvests = useMemo(() => {
    const sorted = [...crops].sort(
      (a, b) => new Date(a.expected_harvest_date).getTime() - new Date(b.expected_harvest_date).getTime()
    );

    const groups: { [key: string]: CropGrowth[] } = {};

    sorted.forEach((crop) => {
      const d = new Date(crop.expected_harvest_date);
      const monthYear = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(crop);
    });

    return groups;
  }, [crops]);

  // 2. Calendar Grid Events
  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];
    crops.forEach((crop) => {
      const name = crop.product_details?.name || crop.crop_name || 'Crop';

      // Harvest Event
      calendarEvents.push({
        id: `${crop.id}-harvest`,
        title: `🌾 Harvest: ${name}`,
        description: `Expected: ${crop.expected_quantity} ${crop.product_details?.unit || 'units'}`,
        startDate: new Date(crop.expected_harvest_date),
        endDate: new Date(crop.expected_harvest_date),
        color: 'bg-orange-500 hover:bg-orange-600',
      });
    });
    return calendarEvents;
  }, [crops]);

  if (!crops || crops.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-border-strong rounded-2xl bg-surface">
        <CalendarIcon className="w-10 h-10 text-muted mx-auto mb-3" />
        <h3 className="text-base font-bold text-foreground">No Harvests Scheduled</h3>
        <p className="text-muted text-xs mt-1">Start tracking crops to populate your harvest schedule.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle Header */}
      <div className="flex items-center justify-between bg-surface p-3 rounded-2xl border border-border-subtle">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-brand" />
          <span className="text-xs sm:text-sm font-bold text-foreground font-display">
            Harvest Schedule Overview
          </span>
          <span className="text-xs text-muted">({crops.length} scheduled)</span>
        </div>

        <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-border-subtle">
          <button
            type="button"
            onClick={() => setScheduleMode('agenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scheduleMode === 'agenda'
                ? 'bg-surface text-brand shadow-xs border border-border-subtle'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Agenda View
          </button>
          <button
            type="button"
            onClick={() => setScheduleMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scheduleMode === 'grid'
                ? 'bg-surface text-brand shadow-xs border border-border-subtle'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendar Grid
          </button>
        </div>
      </div>

      {scheduleMode === 'agenda' ? (
        /* Farmer-Centric Chronological Harvest Agenda */
        <div className="space-y-6">
          {Object.entries(groupedHarvests).map(([monthYear, monthCrops]) => (
            <div key={monthYear} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base font-display font-bold text-foreground">
                  {monthYear}
                </span>
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-xs font-semibold text-muted">
                  {monthCrops.length} {monthCrops.length === 1 ? 'harvest' : 'harvests'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {monthCrops.map((crop) => {
                  const harvestDate = new Date(crop.expected_harvest_date);
                  const timing = getHarvestTiming(crop.expected_harvest_date, crop.stage, crop.actual_harvest_date);
                  const cropName = crop.product_details?.name || crop.crop_name || 'Crop';
                  const unit = crop.product_details?.unit || 'units';

                  return (
                    <div
                      key={crop.id}
                      onClick={() => dispatch(openCropDetail(crop.id))}
                      className="p-4 rounded-2xl bg-surface border border-border-subtle hover:border-brand/40 transition-all flex items-start justify-between gap-3 shadow-xs hover:shadow-md cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Day Box */}
                        <div className="w-12 h-14 rounded-xl bg-surface-elevated border border-border-subtle flex flex-col items-center justify-center shrink-0 group-hover:border-brand/30 transition-colors">
                          <span className="text-xs uppercase font-bold text-muted">
                            {harvestDate.toLocaleDateString(undefined, { weekday: 'short' })}
                          </span>
                          <span className="text-lg font-display font-bold text-foreground tabular-nums">
                            {harvestDate.getDate()}
                          </span>
                        </div>

                        {/* Crop & Timing Info */}
                        <div className="min-w-0">
                          <h4 className="text-sm font-display font-bold text-foreground group-hover:text-brand transition-colors truncate">
                            {cropName}
                          </h4>

                          <p className="text-xs text-foreground-secondary mt-0.5">
                            Expected: <strong>{formatCropQuantity(crop.expected_quantity, unit)}</strong>
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${timing.badgeClass}`}>
                              {timing.label}
                            </span>

                            <span className="text-[11px] font-medium text-muted">
                              {crop.stage === 'PLANTED' && '🌱 Planted'}
                              {crop.stage === 'GROWING' && '🌿 Growing'}
                              {crop.stage === 'NEAR_HARVEST' && '🌾 Harvest Ready'}
                              {crop.stage === 'HARVESTED' && '📦 Completed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {crop.stage !== 'HARVESTED' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(openStageUpdateModal(crop.id));
                            }}
                            className="p-2 rounded-xl text-brand hover:bg-brand/10 transition-colors cursor-pointer"
                            title="Update Stage"
                          >
                            <Activity className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(openCropDetail(crop.id));
                          }}
                          className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Monthly Calendar Grid */
        <div className="bg-surface rounded-2xl shadow-xs border border-border-subtle overflow-hidden p-4">
          <Calendar events={events} />
        </div>
      )}
    </div>
  );
};
