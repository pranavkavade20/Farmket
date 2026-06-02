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
        description: `Stage: ${crop.crop_stage.replace(/_/g, ' ')}\nExpected Harvest: ${new Date(crop.expected_harvest_date).toLocaleDateString()}`,
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
      <div className="py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
        <p className="text-gray-500 dark:text-gray-400">No crops found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <Calendar events={events} />
    </div>
  );
};
