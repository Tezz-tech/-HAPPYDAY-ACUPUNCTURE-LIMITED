/**
 * Clinic time. Stored in UTC; displayed in Africa/Lagos (WAT, UTC+1, no DST).
 */
export const CLINIC_TZ = 'Africa/Lagos';

/**
 * @param {Date | string} value
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
function fmt(value, options) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('en-GB', { timeZone: CLINIC_TZ, ...options }).format(date);
}

/** @param {Date | string} value e.g. "14:30" */
export function formatTime(value) {
  return fmt(value, { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** @param {Date | string} value e.g. "Tuesday 1 December" */
export function formatDayDate(value) {
  return fmt(value, { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * The calendar date in clinic time, as YYYY-MM-DD.
 * @param {Date | string} value
 */
export function clinicDateKey(value) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value instanceof Date ? value : new Date(value));
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Period of day used to group slots (docs/04 step 5): morning before 12:00,
 * afternoon 12:00 to 16:59, evening from 17:00.
 * @param {Date | string} value
 * @returns {'morning' | 'afternoon' | 'evening'}
 */
export function periodOf(value) {
  const hour = Number(fmt(value, { hour: '2-digit', hour12: false }));
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
