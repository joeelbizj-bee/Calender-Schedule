
export enum EventType {
  MEETING = 'MEETING',
  HOLIDAY = 'HOLIDAY',
  APPOINTMENT = 'APPOINTMENT',
  PARTY = 'PARTY',
  REMINDER = 'REMINDER',
  OTHER = 'OTHER'
}

export interface Notification {
  type: 'EMAIL' | 'POPUP';
  timeBefore: number; // minutes
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // ISO Date String YYYY-MM-DD
  endDate?: string;  // ISO Date String YYYY-MM-DD
  time?: string;     // e.g. "09:30"
  duration?: number; // minutes
  type: EventType;
  location?: string;
  description?: string;
  color?: string;    // Custom hex or tailwind class
  guests?: string[];
  notifications?: Notification[];
  isRecurring?: boolean;
  recurrenceId?: string;
}

export interface ProcessingState {
  status: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
  message?: string;
}
