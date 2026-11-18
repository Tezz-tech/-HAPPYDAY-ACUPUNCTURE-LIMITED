/**
 * Slot engine (docs/04 §Slot engine). Pure functions only: no database, no clock except the `now` argument.
 * Availability and seat-lock acquisition use the same bucket rule, so a shown slot can always be booked
 * unless someone else takes it first.
 *
 * Clinic time is Africa/Lagos, UTC+1 with no DST, so a fixed offset is exact here.
 */

export const LAGOS_OFFSET_MIN = 60;
export const BUCKET_MIN = 15;
const MIN = 60_000;
const BUCKET_MS = BUCKET_MIN * MIN;
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * @typedef {{ start: string, end: string }} Range  HH:MM local times
 * @typedef {{
 *   weekly: Record<string, Range[]>,
 *   exceptions?: Record<string, { closed?: boolean, ranges?: Range[] }>,
 *   breaks?: Array<{ day: string, start: string, end: string }>,
 *   slotIntervalMinutes: number,
 *   bufferMinutes: number,
 *   minNoticeHours: number,
 *   maxAdvanceDays: number,
 *   capacityPerSlot: number
 * }} Config
 */

/** @param {number} ms @returns {{ y: number, m: number, d: number, dow: string, minutes: number }} */
function localParts(ms) {
  const local = new Date(ms + LAGOS_OFFSET_MIN * MIN);
  return {
    y: local.getUTCFullYear(),
    m: local.getUTCMonth() + 1,
    d: local.getUTCDate(),
    dow: DAY_KEYS[local.getUTCDay()],
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}

/** @param {string} dateStr YYYY-MM-DD @returns {number} UTC ms of local midnight */
export function localMidnight(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d) - LAGOS_OFFSET_MIN * MIN;
}

/** @param {number} ms @returns {string} YYYY-MM-DD in clinic time */
export function localDateKey(ms) {
  const p = localParts(ms);
  return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
}

/** @param {string} hhmm @returns {number} minutes since local midnight */
export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** @param {string} dateStr @param {number} days @returns {string} */
export function addDays(dateStr, days) {
  return localDateKey(localMidnight(dateStr) + days * 24 * 60 * MIN);
}

/** @param {string} dateStr @returns {string} weekday key */
function dowOf(dateStr) {
  return localParts(localMidnight(dateStr) + 12 * 60 * MIN).dow;
}

/**
 * Open intervals (in local minutes) for one date: weekly hours, overridden by an exception, minus breaks.
 * @param {string} dateStr
 * @param {Config} cfg
 * @returns {Array<[number, number]>}
 */
export function openIntervals(dateStr, cfg) {
  const dow = dowOf(dateStr);
  const ex = cfg.exceptions?.[dateStr];
  let ranges;
  if (ex) {
    ranges = ex.closed ? [] : ex.ranges ?? cfg.weekly[dow] ?? [];
  } else {
    ranges = cfg.weekly[dow] ?? [];
  }
  let intervals = ranges
    .map((r) => [toMinutes(r.start), toMinutes(r.end)])
    .filter(([a, b]) => b > a);

  const dayBreaks = (cfg.breaks ?? []).filter((b) => b.day === dow).map((b) => [toMinutes(b.start), toMinutes(b.end)]);
  for (const [bs, be] of dayBreaks) {
    intervals = intervals.flatMap(([a, b]) => {
      if (be <= a || bs >= b) return [[a, b]];
      const out = [];
      if (bs > a) out.push([a, bs]);
      if (be < b) out.push([be, b]);
      return out;
    });
  }
  return intervals;
}

/**
 * Seat-lock buckets a booking occupies: start through start + duration + buffer, rounded up to 15 minutes.
 * @param {number} startMs
 * @param {number} durationMin
 * @param {number} bufferMin
 * @returns {number[]} bucket start times in UTC ms
 */
export function bucketsFor(startMs, durationMin, bufferMin) {
  const first = Math.floor(startMs / BUCKET_MS) * BUCKET_MS;
  const endRaw = startMs + (durationMin + bufferMin) * MIN;
  const end = Math.ceil(endRaw / BUCKET_MS) * BUCKET_MS;
  const out = [];
  for (let t = first; t < end; t += BUCKET_MS) out.push(t);
  return out;
}

/** Key used in lock sets: "<bucketMs>|<seat>". */
export const lockKey = (bucketMs, seat) => `${bucketMs}|${seat}`;

/**
 * Is there a seat with none of this candidate's buckets locked?
 * @param {number} startMs
 * @param {number} durationMin
 * @param {Config} cfg
 * @param {Set<string>} locked set of lockKey strings for held locks
 * @returns {number | null} the free seat number, or null
 */
export function freeSeat(startMs, durationMin, cfg, locked) {
  const buckets = bucketsFor(startMs, durationMin, cfg.bufferMinutes);
  for (let seat = 1; seat <= cfg.capacityPerSlot; seat += 1) {
    if (buckets.every((b) => !locked.has(lockKey(b, seat)))) return seat;
  }
  return null;
}

/**
 * @param {number} minutes minutes since local midnight
 * @returns {'morning' | 'afternoon' | 'evening'}
 */
export function periodForMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

/**
 * Candidate starts for one date, before notice and locks are applied.
 * @param {string} dateStr
 * @param {number} durationMin
 * @param {Config} cfg
 * @returns {number[]} UTC ms starts
 */
export function candidatesForDate(dateStr, durationMin, cfg) {
  const midnight = localMidnight(dateStr);
  const out = [];
  for (const [a, b] of openIntervals(dateStr, cfg)) {
    for (let t = a; t + durationMin <= b; t += cfg.slotIntervalMinutes) {
      out.push(midnight + t * MIN);
    }
  }
  return out;
}

/**
 * Public slot list: date by date, starting at `fromDate`, for `days` days.
 * @param {{
 *   now: number, fromDate: string, days: number, durationMin: number, cfg: Config, locked: Set<string>
 * }} input
 * @returns {{ days: Array<{ date: string, slots: Array<{ start: string, period: string }> }>, nextAvailable: string | null }}
 */
export function computeSlots({ now, fromDate, days, durationMin, cfg, locked }) {
  const today = localDateKey(now);
  const lastAllowed = addDays(today, cfg.maxAdvanceDays);
  const earliest = now + cfg.minNoticeHours * 60 * MIN;
  const result = [];
  let nextAvailable = null;

  for (let i = 0; i < days; i += 1) {
    const date = addDays(fromDate, i);
    const slots = [];
    if (date <= lastAllowed) {
      for (const startMs of candidatesForDate(date, durationMin, cfg)) {
        if (startMs < earliest) continue;
        if (freeSeat(startMs, durationMin, cfg, locked) === null) continue;
        const minutes = (startMs - localMidnight(date)) / MIN;
        slots.push({ start: new Date(startMs).toISOString(), period: periodForMinutes(minutes) });
        if (!nextAvailable) nextAvailable = new Date(startMs).toISOString();
      }
    }
    result.push({ date, slots });
  }
  return { days: result, nextAvailable };
}

/**
 * Can a booking be created at this exact start? Used when a booking is requested, so the check and the
 * lock acquisition agree (docs/04).
 * @param {{ startMs: number, durationMin: number, now: number, cfg: Config, locked: Set<string> }} input
 * @returns {{ ok: true, seat: number } | { ok: false, reason: 'notice' | 'advance' | 'closed' | 'taken' }}
 */
export function checkBookable({ startMs, durationMin, now, cfg, locked }) {
  if (startMs < now + cfg.minNoticeHours * 60 * MIN) return { ok: false, reason: 'notice' };
  if (localDateKey(startMs) > addDays(localDateKey(now), cfg.maxAdvanceDays)) return { ok: false, reason: 'advance' };
  const date = localDateKey(startMs);
  const legal = candidatesForDate(date, durationMin, cfg).some((c) => c === startMs);
  if (!legal) return { ok: false, reason: 'closed' };
  const seat = freeSeat(startMs, durationMin, cfg, locked);
  return seat === null ? { ok: false, reason: 'taken' } : { ok: true, seat };
}
