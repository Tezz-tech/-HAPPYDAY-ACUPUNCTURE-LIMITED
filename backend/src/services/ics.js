/**
 * iCalendar (.ics) for a booking (docs/03 confirmation, docs/05 routes). Times are UTC, which is valid iCalendar.
 * @param {{ ref: string, start: Date, end: Date, typeName: string, address: string }} b
 * @returns {string}
 */
export function bookingIcs(b) {
  const stamp = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Happyday Acupuncture//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${b.ref}@happyday`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(b.start)}`,
    `DTEND:${stamp(b.end)}`,
    `SUMMARY:${esc(`${b.typeName}, Happyday Acupuncture`)}`,
    `LOCATION:${esc(b.address)}`,
    `DESCRIPTION:${esc(`Booking reference ${b.ref}. Acupuncture works alongside your medical care.`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
