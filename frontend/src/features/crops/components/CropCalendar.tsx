import React, { useMemo } from 'react';
import type { CropGrowth } from '@/types/crops';
import { Calendar, type CalendarEvent } from '@/components/ui/Calendar';

interface CropCalendarProps {
  crops: CropGrowth[];
}

export const CropCalendar: React.FC<CropCalendarProps> = ({ crops }) => {
  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];
    crops.forEach(crop => {
      const name = crop.product_details?.name || 'Unknown Crop';
      
      // Sowing Event
      calendarEvents.push({
        id: `${crop.id}-sowing`,
        title: `🌱 Sown: ${name}`,
        description: `Stage: ${crop.stage?.replace(/_/g, ' ')}\nExpected Harvest: ${new Date(crop.expected_harvest_date).toLocaleDateString()}`,
        startDate: new Date(crop.sowing_date),
        endDate: new Date(crop.sowing_date),
        color: 'bg-blue-500 hover:bg-blue-600'
      });

      // Expected Harvest Event
      calendarEvents.push({
        id: `${crop.id}-harvest`,
        title: `🌾 Harvest: ${name}`,
        description: `Expected Qty: ${crop.expected_quantity} ${crop.product_details?.unit || 'units'}`,
        startDate: new Date(crop.expected_harvest_date),
        endDate: new Date(crop.expected_harvest_date),
        color: 'bg-orange-500 hover:bg-orange-600'
      });
    });
    return calendarEvents;
  }, [crops]);

  if (!crops || crops.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-border-strong rounded-3xl bg-surface">
        <p className="text-muted font-medium">No crops found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl shadow-sm border border-border-subtle overflow-hidden p-4">
      <Calendar events={events} />
    </div>
  );
};
