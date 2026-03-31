import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface TimezoneContextType {
  timezone: string;
  setTimezone: (tz: string) => void;
  formatDate: (date: string | Date, style?: 'full' | 'short' | 'time' | 'relative' | 'datetime') => string;
}

const TimezoneContext = createContext<TimezoneContextType>({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  setTimezone: () => {},
  formatDate: () => '',
});

export const useTimezone = () => useContext(TimezoneContext);

// Common timezones for the selector
export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Anchorage', label: 'Alaska Time' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
  { value: 'America/Sao_Paulo', label: 'Brasilia Time' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina Time' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European Time' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow Time' },
  { value: 'Europe/Istanbul', label: 'Turkey Time' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
  { value: 'Asia/Dhaka', label: 'Bangladesh Time' },
  { value: 'Asia/Bangkok', label: 'Indochina Time' },
  { value: 'Asia/Singapore', label: 'Singapore Time' },
  { value: 'Asia/Shanghai', label: 'China Standard Time' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time' },
  { value: 'Australia/Perth', label: 'Australian Western Time' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time' },
  { value: 'Africa/Cairo', label: 'Eastern European Time' },
  { value: 'Africa/Lagos', label: 'West Africa Time' },
  { value: 'Africa/Johannesburg', label: 'South Africa Time' },
];

export const TimezoneProvider = ({ children }: { children: React.ReactNode }) => {
  const [timezone, setTimezoneState] = useState(() => {
    return localStorage.getItem('user-timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(tz);
    localStorage.setItem('user-timezone', tz);
  }, []);

  // Sync from server preferences when they load
  useEffect(() => {
    const saved = localStorage.getItem('user-timezone');
    if (saved) setTimezoneState(saved);
  }, []);

  const formatDate = useCallback((date: string | Date, style: 'full' | 'short' | 'time' | 'relative' | 'datetime' = 'full') => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (style === 'relative') {
      return formatDistanceToNow(d, { addSuffix: true });
    }

    const options: Intl.DateTimeFormatOptions = { timeZone: timezone };

    switch (style) {
      case 'full':
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.timeZoneName = 'short';
        break;
      case 'short':
        options.month = 'short';
        options.day = 'numeric';
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
      case 'time':
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
      case 'datetime':
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
        options.hour = '2-digit';
        options.minute = '2-digit';
        break;
    }

    return new Intl.DateTimeFormat(undefined, options).format(d);
  }, [timezone]);

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, formatDate }}>
      {children}
    </TimezoneContext.Provider>
  );
};
