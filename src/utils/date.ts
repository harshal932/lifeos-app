import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  addDays,
  isBefore,
  isAfter,
  isSameDay,
  eachDayOfInterval,
} from 'date-fns';

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses a YYYY-MM-DD string into a local Date object set to 12:00 PM
 * to prevent daylight saving / midnight timezone shifts.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Formats a YYYY-MM-DD string into user-friendly format (e.g. 24 Oct 2026).
 */
export function formatDisplayDate(dateStr: string, formatStr: string = 'dd MMM yyyy'): string {
  try {
    const date = parseLocalDate(dateStr);
    return format(date, formatStr);
  } catch {
    return dateStr;
  }
}

/**
 * Gets day of week for a YYYY-MM-DD string (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
 */
export function getDayOfWeek(dateStr: string): number {
  return parseLocalDate(dateStr).getDay();
}

/**
 * Returns an array of YYYY-MM-DD strings for a given interval.
 */
export function getDateRangeList(startDateStr: string, endDateStr: string): string[] {
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);

  if (isAfter(start, end)) return [];

  const days = eachDayOfInterval({ start, end });
  return days.map((d) => getLocalDateString(d));
}

/**
 * Get current month formatted as YYYY-MM.
 */
export function getCurrentMonthString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get the dates of the current week (e.g. starting Monday).
 */
export function getWeekDates(weekStartDay: 0 | 1 = 1, referenceDate: Date = new Date()): string[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: weekStartDay });
  const end = endOfWeek(referenceDate, { weekStartsOn: weekStartDay });
  return eachDayOfInterval({ start, end }).map((d) => getLocalDateString(d));
}

/**
 * Returns greeting based on hour of day.
 */
export function getTimeBasedGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
