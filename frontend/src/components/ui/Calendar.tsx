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
    <div className={cn("w-full bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-xs", className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
        <h2 className="text-base sm:text-lg font-display font-bold text-foreground">{monthName}</h2>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={prevMonth} 
            aria-label="Previous month"
            className="p-2 hover:bg-state-hover rounded-xl transition-colors text-foreground-secondary hover:text-foreground focus-ring cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            type="button"
            onClick={nextMonth} 
            aria-label="Next month"
            className="p-2 hover:bg-state-hover rounded-xl transition-colors text-foreground-secondary hover:text-foreground focus-ring cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-border-subtle bg-surface-elevated/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(90px,auto)]">
        {blanks.map(blank => (
          <div key={`blank-${blank}`} className="p-2 border-r border-b border-border-subtle bg-surface-elevated/20 last:border-r-0" />
        ))}
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
          return (
            <div 
              key={day} 
              className={cn(
                "p-2 border-r border-b border-border-subtle last:border-r-0 transition-colors hover:bg-state-hover/40",
                (idx + firstDayOfMonth + 1) % 7 === 0 ? "border-r-0" : ""
              )}
            >
              <div className={cn(
                "w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1",
                isToday ? "bg-brand text-on-brand shadow-xs" : "text-foreground-secondary"
              )}>
                {day}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {dayEvents.map(event => (
                  <Tooltip 
                    key={event.id}
                    content={
                      <div className="text-left text-xs">
                        <div className="font-bold text-foreground">{event.title}</div>
                        {event.description && <div className="mt-1 text-foreground-secondary font-medium">{event.description}</div>}
                      </div>
                    }
                  >
                    <button 
                      type="button"
                      onClick={() => onEventClick?.(event)}
                      className={cn(
                        "px-2 py-1 text-xs truncate rounded-md cursor-pointer text-white shadow-xs transition-transform hover:scale-[1.02] w-full text-left focus-ring",
                        event.color || "bg-brand"
                      )}
                    >
                      {event.title}
                    </button>
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
