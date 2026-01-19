import React, { useMemo } from 'react';
import { CalendarEvent } from '../types';
import EventCard from './EventCard';

interface CalendarProps {
  events: CalendarEvent[];
  month: number; // 0-11
  year: number;
  onEventClick: (event: CalendarEvent) => void;
  id?: string;
}

const Calendar: React.FC<CalendarProps> = ({ events, month, year, onEventClick, id }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const days = useMemo(() => {
    const dayArray = [];
    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayArray.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      dayArray.push(i);
    }
    return dayArray;
  }, [daysInMonth, firstDayOfMonth]);

  const getEventsForDay = (day: number) => {
    const targetDate = new Date(year, month, day);
    
    return events.filter(event => {
      const start = new Date(event.startDate);
      // Reset times for purely date comparison
      const targetTime = targetDate.getTime();
      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();

      // Check for single day match
      if (startTime === targetTime) return true;

      // Check for range match
      if (event.endDate) {
        const end = new Date(event.endDate);
        const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
        return targetTime >= startTime && targetTime <= endTime;
      }

      return false;
    }).sort((a, b) => {
        // Sort by time if available
        if (!a.time) return -1;
        if (!b.time) return 1;
        return a.time.localeCompare(b.time);
    });
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div id={id} className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{monthNames[month]} {year}</h2>
        <div className="text-blue-100 text-sm font-medium uppercase tracking-wider">Monthly Overview</div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px border-b border-gray-200">
        {days.map((day, index) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          
          return (
            <div 
              key={index} 
              className={`
                min-h-[140px] bg-white p-2 flex flex-col relative group transition-colors
                ${!day ? 'bg-gray-50' : 'hover:bg-blue-50/30'}
              `}
            >
              {day && (
                <>
                  <span className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-2
                    ${dayEvents.length > 0 ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}
                  `}>
                    {day}
                  </span>
                  
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[120px] custom-scrollbar">
                    {dayEvents.map(event => (
                      <EventCard 
                        key={`${event.id}-${day}`} 
                        event={event} 
                        onClick={onEventClick}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;