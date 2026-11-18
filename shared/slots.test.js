import { describe, it, expect } from 'vitest';
import {
  bucketsFor,
  candidatesForDate,
  checkBookable,
  computeSlots,
  localDateKey,
  localMidnight,
  lockKey,
  openIntervals,
} from './slots.js';

const MIN = 60_000;
const HOUR = 60 * MIN;

/** Default config, mirroring content/clinic.json scheduling and hours. */
const base = {
  weekly: {
    mon: [{ start: '09:00', end: '17:00' }],
    tue: [{ start: '09:00', end: '17:00' }],
    wed: [{ start: '09:00', end: '17:00' }],
    thu: [{ start: '09:00', end: '17:00' }],
    fri: [{ start: '09:00', end: '17:00' }],
    sat: [{ start: '10:00', end: '15:00' }],
    sun: [],
  },
  exceptions: {},
  breaks: [],
  slotIntervalMinutes: 15,
  bufferMinutes: 10,
  minNoticeHours: 3,
  maxAdvanceDays: 60,
  capacityPerSlot: 1,
};

/** Local time helper: a UTC instant for a Lagos wall-clock time. */
const at = (dateStr, hhmm) => localMidnight(dateStr) + (Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3))) * MIN;

// 2026-11-23 is a Monday.
const MON = '2026-11-23';
const SAT = '2026-11-28';
const SUN = '2026-11-29';
const NOW_EARLY = at('2026-11-16', '08:00'); // a week before, so notice never bites

describe('clinic time', () => {
  it('uses Lagos time (UTC+1) for the calendar date', () => {
    // 23:30 UTC on 30 Nov is 00:30 on 1 Dec in Lagos
    expect(localDateKey(Date.UTC(2026, 10, 30, 23, 30))).toBe('2026-12-01');
  });
});

describe('openIntervals', () => {
  it('uses the weekly hours for an ordinary day', () => {
    expect(openIntervals(MON, base)).toEqual([[540, 1020]]);
  });

  it('returns nothing for a day with no hours', () => {
    expect(openIntervals(SUN, base)).toEqual([]);
  });

  it('an exception can close a normally open day', () => {
    const cfg = { ...base, exceptions: { [MON]: { closed: true } } };
    expect(openIntervals(MON, cfg)).toEqual([]);
  });

  it('an exception can open a normally closed day with custom hours', () => {
    const cfg = { ...base, exceptions: { [SUN]: { closed: false, ranges: [{ start: '12:00', end: '14:00' }] } } };
    expect(openIntervals(SUN, cfg)).toEqual([[720, 840]]);
  });

  it('a break splits the day into two intervals', () => {
    const cfg = { ...base, breaks: [{ day: 'mon', start: '13:00', end: '14:00' }] };
    expect(openIntervals(MON, cfg)).toEqual([
      [540, 780],
      [840, 1020],
    ]);
  });
});

describe('candidatesForDate', () => {
  it('generates starts every interval where the whole duration fits', () => {
    const starts = candidatesForDate(MON, 75, base);
    expect(starts[0]).toBe(at(MON, '09:00'));
    expect(starts[starts.length - 1]).toBe(at(MON, '15:45')); // 15:45 + 75 min = 17:00
  });

  it('produces no slots when the duration is longer than the open window', () => {
    expect(candidatesForDate(SAT, 301, base)).toEqual([]);
  });
});

describe('bucketsFor', () => {
  it('covers start through start + duration + buffer, rounded up to 15 minutes', () => {
    const buckets = bucketsFor(at(MON, '10:00'), 75, 10);
    // 10:00 + 85 min = 11:25, rounded up to 11:30, so buckets 10:00 to 11:15
    expect(buckets).toHaveLength(6);
    expect(buckets[0]).toBe(at(MON, '10:00'));
    expect(buckets[5]).toBe(at(MON, '11:15'));
  });
});

describe('computeSlots', () => {
  it('lists open starts for a day and groups them by period', () => {
    const { days } = computeSlots({ now: NOW_EARLY, fromDate: MON, days: 1, durationMin: 50, cfg: base, locked: new Set() });
    const first = days[0].slots[0];
    expect(first.period).toBe('morning');
    expect(days[0].slots.some((s) => s.period === 'afternoon')).toBe(true);
  });

  it('hides a slot once a seat is locked over its buckets', () => {
    const locked = new Set();
    for (const b of bucketsFor(at(MON, '10:00'), 50, 10)) locked.add(lockKey(b, 1));
    const { days } = computeSlots({ now: NOW_EARLY, fromDate: MON, days: 1, durationMin: 50, cfg: base, locked });
    const starts = days[0].slots.map((s) => new Date(s.start).getTime());
    expect(starts).not.toContain(at(MON, '10:00'));
    expect(starts).not.toContain(at(MON, '10:15'));
  });

  it('allows a booking that starts exactly when another one ends (the buffer makes the bucket free)', () => {
    // Existing: 10:00 for 50 min with buffer 10: occupies 10:00 to 11:00, rounded to 11:00 end.
    const locked = new Set(bucketsFor(at(MON, '10:00'), 50, 10).map((b) => lockKey(b, 1)));
    const res = checkBookable({ startMs: at(MON, '11:00'), durationMin: 50, now: NOW_EARLY, cfg: base, locked });
    expect(res.ok).toBe(true);
  });

  it('refuses a start that overlaps a neighbour through the buffer', () => {
    const locked = new Set(bucketsFor(at(MON, '10:00'), 50, 10).map((b) => lockKey(b, 1)));
    const res = checkBookable({ startMs: at(MON, '10:45'), durationMin: 50, now: NOW_EARLY, cfg: base, locked });
    expect(res).toEqual({ ok: false, reason: 'taken' });
  });

  it('enforces minimum notice across midnight', () => {
    const now = at(MON, '23:00') - 1 * HOUR; // 22:00 on Monday
    const { days } = computeSlots({ now, fromDate: MON, days: 2, durationMin: 50, cfg: base, locked: new Set() });
    const tueSlots = days[1].slots.map((s) => new Date(s.start).getTime());
    // Minimum notice 3 hours: nothing on Monday after 22:00 is open; Tuesday starts at 09:00 is fine
    expect(days[0].slots).toHaveLength(0);
    expect(tueSlots[0]).toBe(at('2026-11-24', '09:00'));
  });

  it('respects the maximum advance window on its boundary', () => {
    const now = at('2026-11-16', '08:00');
    const last = localDateKey(localMidnight('2026-11-16') + 60 * 24 * HOUR);
    const beyond = localDateKey(localMidnight('2026-11-16') + 61 * 24 * HOUR);
    const { days } = computeSlots({ now, fromDate: last, days: 2, durationMin: 50, cfg: base, locked: new Set() });
    const lastDay = days.find((d) => d.date === last);
    const beyondDay = days.find((d) => d.date === beyond);
    expect(lastDay.slots.length).toBeGreaterThan(0);
    expect(beyondDay.slots).toHaveLength(0);
  });

  it('with capacity 3, a slot stays open until all three seats are locked', () => {
    const cfg = { ...base, capacityPerSlot: 3 };
    const locked = new Set();
    const buckets = bucketsFor(at(MON, '10:00'), 50, 10);
    for (const s of [1, 2]) for (const b of buckets) locked.add(lockKey(b, s));
    expect(checkBookable({ startMs: at(MON, '10:00'), durationMin: 50, now: NOW_EARLY, cfg, locked })).toEqual({
      ok: true,
      seat: 3,
    });
    for (const b of buckets) locked.add(lockKey(b, 3));
    expect(checkBookable({ startMs: at(MON, '10:00'), durationMin: 50, now: NOW_EARLY, cfg, locked })).toEqual({
      ok: false,
      reason: 'taken',
    });
  });

  it('a stale lock is ignored once the caller removes it from the set', () => {
    // The caller only puts held locks into `locked`. An expired hold is simply not in the set.
    const res = checkBookable({ startMs: at(MON, '10:00'), durationMin: 50, now: NOW_EARLY, cfg: base, locked: new Set() });
    expect(res.ok).toBe(true);
  });

  it('refuses a start that is not on the slot grid or outside hours', () => {
    const res = checkBookable({ startMs: at(MON, '08:00'), durationMin: 50, now: NOW_EARLY, cfg: base, locked: new Set() });
    expect(res).toEqual({ ok: false, reason: 'closed' });
  });
});
