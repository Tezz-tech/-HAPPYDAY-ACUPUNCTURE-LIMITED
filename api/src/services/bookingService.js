import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { AppointmentType, Availability, Booking, BookingEvent, Exception, SeatLock, Settings } from '../models/index.js';
import { bucketsFor, checkBookable, lockKey, computeSlots, localDateKey } from '@happyday/shared/slots';
import { HOLDING_STATUSES } from '@happyday/shared/constants';

const MIN = 60_000;
// Crockford base32: no I, L, O or U, and no 0 or 1 confusion.
const REF_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Typed error that the routes turn into a status code and a code string. */
export class BookingError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {{ status?: number, alternatives?: unknown }} [extra]
   */
  constructor(code, message, extra = {}) {
    super(message);
    this.code = code;
    this.status = extra.status ?? 409;
    this.alternatives = extra.alternatives;
  }
}

/** Legal status transitions (docs/04 state machine). Anything else is rejected. */
export const TRANSITIONS = {
  awaiting_payment: ['payment_submitted', 'confirmed', 'cancelled', 'expired'],
  payment_submitted: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
  completed: [],
  cancelled: [],
  expired: [],
  no_show: [],
};

/** Statuses that release the seat when entered. */
const RELEASING = new Set(['cancelled', 'expired', 'no_show']);

/** Generates a booking reference such as HD-7K3Q9. */
export function newRef() {
  const bytes = crypto.randomBytes(5);
  let out = 'HD-';
  for (const b of bytes) out += REF_ALPHABET[b % REF_ALPHABET.length];
  return out;
}

/** 32 random bytes, base64url. Only the SHA-256 hash is stored (docs/04). */
export function newManageToken() {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}

/** @param {string} token */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

/** Loads the scheduling rules from the Availability and Exception collections. */
export async function loadSlotConfig() {
  const avail = await Availability.findOne({ key: 'default' }).lean();
  const exceptions = await Exception.find({}).lean();
  const exMap = {};
  for (const ex of exceptions) {
    exMap[ex.date] = { closed: ex.closed, ranges: ex.ranges?.length ? ex.ranges : undefined };
  }
  if (!avail) throw new BookingError('NOT_FOUND', 'Availability has not been set up', { status: 500 });
  return {
    weekly: avail.weekly,
    exceptions: exMap,
    breaks: avail.breaks ?? [],
    slotIntervalMinutes: avail.slotIntervalMinutes,
    bufferMinutes: avail.bufferMinutes,
    minNoticeHours: avail.minNoticeHours,
    maxAdvanceDays: avail.maxAdvanceDays,
    capacityPerSlot: avail.capacityPerSlot,
  };
}

/**
 * The set of lockKey strings for holds that count right now. Holds on bookings that are awaiting payment
 * past their hold expiry are ignored, even before the cron job has released them (docs/04).
 * @param {Date} from
 * @param {Date} to
 * @param {number} [now]
 * @returns {Promise<Set<string>>}
 */
export async function heldLocks(from, to, now = Date.now()) {
  // Operator filters are marked trusted, because sanitizeFilter (db.js) strips operators from filters by default.
  const locks = await SeatLock.find(
    { holds: true, bucket: mongoose.trusted({ $gte: from, $lt: to }) },
    { bucket: 1, seat: 1, bookingId: 1 },
  ).lean();
  if (locks.length === 0) return new Set();
  const bookingIds = [...new Set(locks.map((l) => String(l.bookingId)))];
  const stale = await Booking.find(
    { _id: mongoose.trusted({ $in: bookingIds }), status: 'awaiting_payment', holdExpiresAt: mongoose.trusted({ $lte: new Date(now) }) },
    { _id: 1 },
  ).lean();
  const staleIds = new Set(stale.map((b) => String(b._id)));
  const set = new Set();
  for (const l of locks) {
    if (!staleIds.has(String(l.bookingId))) set.add(lockKey(new Date(l.bucket).getTime(), l.seat));
  }
  return set;
}

/**
 * Public slots for one appointment type.
 * @param {{ typeSlug: string, from: string, days: number, now?: number }} input
 */
export async function slotsFor({ typeSlug, from, days, now = Date.now() }) {
  const type = await AppointmentType.findOne({ slug: typeSlug, active: true }).lean();
  if (!type) throw new BookingError('NOT_FOUND', 'Unknown appointment type', { status: 404 });
  const cfg = await loadSlotConfig();
  const fromMs = new Date(`${from}T00:00:00+01:00`).getTime();
  const windowEnd = new Date(fromMs + days * 24 * 60 * MIN + 2 * 24 * 60 * MIN);
  const locked = await heldLocks(new Date(fromMs - 2 * MIN * 60), windowEnd, now);
  return computeSlots({ now, fromDate: from, days, durationMin: type.durationMinutes, cfg, locked });
}

/**
 * Creates a booking. The seat is acquired inside a transaction: each seat is tried in turn, and a duplicate
 * key on the unique (bucket, seat) index means that seat is taken. If no seat is free, the transaction aborts
 * and the caller gets SLOT_TAKEN with fresh alternatives (docs/04).
 * @param {{
 *   typeSlug: string, start: Date, concern: string, notes?: string,
 *   patient: { name: string, phoneE164: string, email?: string | null, firstVisit: boolean },
 *   consentTextVersion: string, source?: string, now?: number
 * }} input
 */
export async function createBooking(input) {
  const now = input.now ?? Date.now();
  const type = await AppointmentType.findOne({ slug: input.typeSlug, active: true }).lean();
  if (!type) throw new BookingError('NOT_FOUND', 'Unknown appointment type', { status: 404 });
  const cfg = await loadSlotConfig();
  const settings = (await Settings.findOne({ key: 'default' }).lean()) ?? {};
  const startMs = input.start.getTime();
  const end = new Date(startMs + type.durationMinutes * MIN);

  const locked = await heldLocks(new Date(startMs - 24 * 60 * MIN), new Date(startMs + 24 * 60 * MIN), now);
  const check = checkBookable({ startMs, durationMin: type.durationMinutes, now, cfg, locked });
  if (!check.ok) {
    if (check.reason === 'taken') {
      const day = localDateKey(startMs);
      const alt = await slotsFor({ typeSlug: input.typeSlug, from: day, days: 3, now });
      throw new BookingError('SLOT_TAKEN', 'Someone just took that time.', { alternatives: alt });
    }
    throw new BookingError('VALIDATION', 'That time is not available.', { status: 422 });
  }

  const payMode = settings.paymentMode ?? 'transfer_deposit';
  const payAtClinic = payMode === 'pay_at_clinic';
  const amount = payAtClinic ? null : payMode === 'transfer_full' ? type.priceNaira : type.depositNaira ?? type.priceNaira;
  // Holds end at the earlier of the unpaid hold window and two hours before the appointment (docs/04).
  const twoHoursBefore = startMs - 120 * MIN;
  const holdExpiresAt = payAtClinic
    ? null
    : new Date(Math.min(now + (settings.unpaidHoldMinutes ?? 180) * MIN, twoHoursBefore));
  const manage = newManageToken();
  const bookingId = new mongoose.Types.ObjectId();
  const bucketTimes = bucketsFor(startMs, type.durationMinutes, cfg.bufferMinutes);
  const status = payAtClinic ? 'confirmed' : 'awaiting_payment';

  const session = await mongoose.startSession();
  let booked;
  try {
    booked = await session.withTransaction(async () => {
      // Inside the transaction each seat is checked before it is written. A duplicate-key error inside a
      // transaction would abort it, so the check is a read. Two racing transactions then produce a transient
      // write conflict, which the driver retries, and the retry sees the other booking. The unique index on
      // (bucket, seat) stays as the final guard (docs/04).
      let seat = null;
      for (let s = 1; s <= cfg.capacityPerSlot && seat === null; s += 1) {
        const busy = await SeatLock.exists({
          holds: true,
          seat: s,
          bucket: mongoose.trusted({ $in: bucketTimes.map((b) => new Date(b)) }),
        }).session(session);
        if (busy) continue;
        const docs = bucketTimes.map((b) => ({ bookingId, bucket: new Date(b), seat: s, holds: true }));
        await SeatLock.insertMany(docs, { session, ordered: true });
        seat = s;
      }
      if (seat === null) {
        throw new BookingError('SLOT_TAKEN', 'Someone just took that time.');
      }

      const refValue = newRef();
      const [created] = await Booking.create(
        [
          {
            _id: bookingId,
            ref: refValue,
            status,
            holdsSlot: true,
            appointmentType: {
              slug: type.slug,
              name: type.name,
              durationMinutes: type.durationMinutes,
              priceNaira: type.priceNaira,
            },
            start: input.start,
            end,
            seat,
            concern: input.concern || 'general',
            notes: input.notes ?? '',
            patient: {
              name: input.patient.name,
              phoneE164: input.patient.phoneE164,
              email: input.patient.email ?? null,
              firstVisit: input.patient.firstVisit,
            },
            consent: { given: true, at: new Date(now), textVersion: input.consentTextVersion },
            payment: { mode: payMode, amountDue: amount, amountPaid: null },
            manageTokenHash: manage.hash,
            holdExpiresAt: holdExpiresAt,
            source: input.source ?? 'web',
          },
        ],
        { session },
      );
      await BookingEvent.create(
        [{ bookingId: created._id, actor: input.source === 'admin' ? 'admin' : 'patient', from: null, to: status, at: new Date(now) }],
        { session },
      );
      return created;
    });
  } catch (err) {
    if (err instanceof BookingError) throw err;
    if (err?.code === 11000 && String(err.message).includes('ref')) {
      // Reference collision: astronomically rare, so the caller can retry.
      throw new BookingError('CONFLICT', 'Please try again.', { status: 409 });
    }
    throw err;
  } finally {
    await session.endSession();
  }
  return { booking: booked, token: manage.token };
}

/**
 * Moves a booking to a new status if the transition is legal, and writes an event. Releasing statuses free
 * the seat in the same transaction (docs/04).
 * @param {string} bookingId
 * @param {string} to
 * @param {{ actor: string, note?: string, now?: number, extra?: Record<string, unknown> }} opts
 */
export async function transition(bookingId, to, opts) {
  const session = await mongoose.startSession();
  try {
    return await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw new BookingError('NOT_FOUND', 'Booking not found', { status: 404 });
      if (!TRANSITIONS[booking.status]?.includes(to)) {
        throw new BookingError('CONFLICT', `Cannot move a booking from ${booking.status} to ${to}`);
      }
      const from = booking.status;
      booking.status = to;
      booking.holdsSlot = HOLDING_STATUSES.includes(to);
      booking.set(opts.extra ?? {});
      if (RELEASING.has(to)) {
        await SeatLock.updateMany({ bookingId: booking._id }, { $set: { holds: false } }, { session });
      }
      await booking.save({ session });
      await BookingEvent.create(
        [{ bookingId: booking._id, actor: opts.actor, from, to, note: opts.note ?? '', at: new Date(opts.now ?? Date.now()) }],
        { session },
      );
      return booking;
    });
  } finally {
    await session.endSession();
  }
}

/**
 * Expires awaiting_payment holds whose time has passed. Run every 5 minutes by the job, and holds are also
 * ignored by heldLocks, so timing is not critical.
 * @param {number} [now]
 * @returns {Promise<number>} how many were expired
 */
export async function expireHolds(now = Date.now()) {
  const due = await Booking.find(
    { status: 'awaiting_payment', holdExpiresAt: mongoose.trusted({ $lte: new Date(now) }) },
    { _id: 1 },
  ).lean();
  let count = 0;
  for (const b of due) {
    try {
      await transition(b._id, 'expired', { actor: 'system', note: 'hold elapsed', now });
      count += 1;
    } catch (err) {
      if (!(err instanceof BookingError)) throw err;
    }
  }
  return count;
}

/** Looks up a booking by reference and checks the manage token. */
export async function findByToken(ref, token) {
  const booking = await Booking.findOne({ ref }).lean();
  if (!booking || !token || booking.manageTokenHash !== hashToken(token)) {
    throw new BookingError('NOT_FOUND', 'Booking not found', { status: 404 });
  }
  return booking;
}

