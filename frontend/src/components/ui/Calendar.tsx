import React from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip } from './Tooltip';

export interface CalendarEvent {
  id: string | number;
  title: string;
  description?: React.ReactNode;
  startDate: Date;
  endDate: Date;
  color?: string; // Tailwind color class or hex
}

interface CalendarProps {
  events?: CalendarEvent[];
  className?: string;
  onEventClick?: (event: CalendarEvent) => void;
}

export function Calendar({ events = [], className, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    date.setHours(0,0,0,0);
    return events.filter(e => {
        const start = new Date(e.startDate); start.setHours(0,0,0,0);
        const end = new Date(e.endDate); end.setHours(23,59,59,999);
        return date >= start && date <= end;
    });
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className={cn("w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm", className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{monthName}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)]">
        {blanks.map(blank => (
          <div key={`blank-${blank}`} className="p-2 border-r border-b border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 last:border-r-0" />
        ))}
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
          return (
            <div 
              key={day} 
              className={cn(
                "p-2 border-r border-b border-gray-200 dark:border-gray-800 last:border-r-0 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900",
                (idx + firstDayOfMonth + 1) % 7 === 0 ? "border-r-0" : ""
              )}
            >
              <div className={cn(
                "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1",
                isToday ? "bg-green-600 text-white shadow-sm" : "text-gray-700 dark:text-gray-300"
              )}>
                {day}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {dayEvents.map(event => (
                  <Tooltip 
                    key={event.id}
                    content={
                      <div className="text-left">
                        <div className="font-semibold">{event.title}</div>
                        {event.description && <div className="mt-1 text-gray-300 font-normal">{event.description}</div>}
                      </div>
                    }
                  >
                    <div 
                      onClick={() => onEventClick?.(event)}
                      className={cn(
                        "px-2 py-1 text-xs truncate rounded-md cursor-pointer text-white shadow-sm transition-transform hover:scale-[1.02] w-full text-left",
                        event.color || "bg-blue-500"
                      )}
                    >
                      {event.title}
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
