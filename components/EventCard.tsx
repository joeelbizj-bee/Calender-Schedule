
import React from 'react';
import { CalendarEvent, EventType } from '../types';
import { Clock, MapPin, Users } from 'lucide-react';

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

const getTypeStyles = (type: EventType, customColor?: string) => {
  if (customColor) {
    return {
      backgroundColor: `${customColor}15`, // Low opacity background
      color: customColor,
      borderLeft: `4px solid ${customColor}`
    };
  }
  switch (type) {
    case EventType.HOLIDAY:
      return { backgroundColor: '#fee2e2', color: '#991b1b', borderLeft: '4px solid #ef4444' };
    case EventType.MEETING:
      return { backgroundColor: '#dbeafe', color: '#1e40af', borderLeft: '4px solid #3b82f6' };
    case EventType.PARTY:
      return { backgroundColor: '#f3e8ff', color: '#6b21a8', borderLeft: '4px solid #a855f7' };
    case EventType.APPOINTMENT:
      return { backgroundColor: '#ccfbf1', color: '#115e59', borderLeft: '4px solid #14b8a6' };
    case EventType.REMINDER:
      return { backgroundColor: '#fef9c3', color: '#854d0e', borderLeft: '4px solid #eab308' };
    default:
      return { backgroundColor: '#f3f4f6', color: '#374151', borderLeft: '4px solid #9ca3af' };
  }
};

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const styles = getTypeStyles(event.type, event.color);
  
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      style={styles}
      className="text-[11px] p-1.5 mb-1 rounded cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] truncate"
      title={event.title}
    >
      <div className="font-bold flex items-center justify-between">
        <span className="truncate">{event.title}</span>
      </div>
      {event.time && (
        <div className="flex items-center mt-0.5 opacity-80 text-[10px] font-medium">
          <Clock size={10} className="mr-1" />
          {event.time}
        </div>
      )}
      {event.guests && event.guests.length > 0 && (
        <div className="flex items-center mt-0.5 opacity-80 text-[10px]">
          <Users size={10} className="mr-1" />
          {event.guests.length} guest{event.guests.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default EventCard;
