import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { loadEnv } from '../src/env.js';
import { createApp } from '../src/app.js';
import { seed } from '../scripts/seed.js';
import { AppointmentType, Availability, Booking, BookingEvent, SeatLock, Settings } from '../src/models/index.js';
import { createBooking, expireHolds, transition, BookingError } from '../src/services/bookingService.js';
import { localMidnight, localDateKey, addDays } from '@happyday/shared/slots';

const HOUR = 60 * 60 * 1000;
let replset;
let env;

/** The next Monday–Friday on or after `offset` days from now, as a Lagos 10:00 start. */
function weekdayStart(offset = 8) {
  let d = addDays(localDateKey(Date.now()), offset);
  for (;;) {
    const dow = new Date(localMidnight(d) + 12 * HOUR).getUTCDay();
    if (dow >= 1 && dow <= 5) break;
    d = addDays(d, 1);
  }
  return new Date(localMidnight(d) + 10 * HOUR);
}

const validBody = (overrides = {}) => ({
  typeSlug: 'consultation-only',
  start: weekdayStart(8).toISOString(),
  concern: 'pain-relief',
  notes: '',
  patient: { name: 'Amaka Test', phone: '0803 640 4321', email: '', firstVisit: true },
  consent: true,
  hp: '',
  t: 5000,
  ...overrides,
});

beforeAll(async () => {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  // Same settings as production (db.js), so tests catch filter-sanitising problems too.
  mongoose.set('sanitizeFilter', true);
  mongoose.set('strictQuery', true);
  await mongoose.connect(replset.getUri());
  env = loadEnv({ NODE_ENV: 'test' });
  await Promise.all([Booking, SeatLock, BookingEvent, AppointmentType, Availability, Settings].map((m) => m.syncIndexes()));
});

afterAll(async () => {
  await mongoose.disconnect();
  await replset.stop();
});

beforeEach(async () => {
  await Promise.all([Booking, SeatLock, BookingEvent, AppointmentType, Availability, Settings].map((m) => m.deleteMany({})));
  await seed();
  await Availability.updateOne({ key: 'default' }, { $set: { capacityPerSlot: 1 } });
});

async function setCapacity(n) {
  await Availability.updateOne({ key: 'default' }, { $set: { capacityPerSlot: n } });
}

describe('public config and slots', () => {
  it('lists the active appointment types from content', async () => {
    const app = createApp({ env, rateLimit: false });
    const res = await request(app).get('/api/v1/public/config');
    expect(res.status).toBe(200);
    expect(res.body.appointmentTypes.map((t) => t.slug)).toContain('first-consultation');
    expect(res.body.paymentMode).toBe('transfer_deposit');
    expect(res.body.bank.accountNumber).toBe('3235012468');
  });

  it('returns slots and leaves out a time that is already booked', async () => {
    const app = createApp({ env, rateLimit: false });
    const start = weekdayStart(8);
    const from = localDateKey(start.getTime());
    const before = await request(app).get(`/api/v1/public/slots?type=consultation-only&from=${from}&days=1`);
    const times = before.body.days[0].slots.map((s) => s.start);
    expect(times).toContain(start.toISOString());

    await createBooking({
      typeSlug: 'consultation-only',
      start,
      concern: 'general',
      patient: { name: 'Taken Test', phoneE164: '+2348036404321', firstVisit: true },
      consentTextVersion: 'test',
    });
    const after = await request(app).get(`/api/v1/public/slots?type=consultation-only&from=${from}&days=1`);
    expect(after.body.days[0].slots.map((s) => s.start)).not.toContain(start.toISOString());
  });
});

describe('creating bookings', () => {
  it('creates an awaiting_payment booking with a reference and a manage link', async () => {
    const app = createApp({ env, rateLimit: false });
    const res = await request(app).post('/api/v1/bookings').send(validBody());
    expect(res.status).toBe(201);
    expect(res.body.ref).toMatch(/^HD-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{5}$/);
    expect(res.body.status).toBe('awaiting_payment');
    expect(res.body.manageUrl).toContain(`/booking/${res.body.ref}?t=`);
    expect(res.body.payment.bank.accountName).toBe('Balogun Happyday Ojoayo');
  });

  it('stores only the hash of the manage token', async () => {
    const app = createApp({ env, rateLimit: false });
    const res = await request(app).post('/api/v1/bookings').send(validBody());
    const token = new URL(`http://x${res.body.manageUrl}`).searchParams.get('t');
    const stored = await Booking.findOne({ ref: res.body.ref }).lean();
    expect(stored.manageTokenHash).not.toBe(token);
    expect(stored.manageTokenHash).toHaveLength(64);
  });

  it('rejects a missing consent with field errors', async () => {
    const app = createApp({ env, rateLimit: false });
    const res = await request(app).post('/api/v1/bookings').send(validBody({ consent: false }));
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION');
    expect(res.body.error.fields.consent).toBeTruthy();
  });

  it('rejects a bad phone number', async () => {
    const app = createApp({ env, rateLimit: false });
    const res = await request(app)
      .post('/api/v1/bookings')
      .send(validBody({ patient: { name: 'Amaka Test', phone: '12345', firstVisit: true } }));
    expect(res.status).toBe(422);
    expect(res.body.error.fields['patient.phone']).toBeTruthy();
  });

  it('treats a filled honeypot as a bot and creates nothing', async () => {
    const app = createApp({ env, rateLimit: false });
    const res = await request(app).post('/api/v1/bookings').send(validBody({ hp: 'http://spam' }));
    expect(res.status).toBe(422);
    expect(await Booking.countDocuments()).toBe(0);
  });

  it('rejects a form submitted faster than three seconds', async () => {
    const app = createApp({ env, rateLimit: false });
    const res = await request(app).post('/api/v1/bookings').send(validBody({ t: 900 }));
    expect(res.status).toBe(422);
    expect(await Booking.countDocuments()).toBe(0);
  });

  it('rate limits bookings to 10 per hour per IP', async () => {
    const app = createApp({ env, rateLimit: true });
    let last;
    for (let i = 0; i < 11; i += 1) {
      last = await request(app).post('/api/v1/bookings').send({});
    }
    expect(last.status).toBe(429);
    expect(last.body.error.code).toBe('RATE_LIMITED');
  });
});

describe('double booking is impossible', () => {
  it('20 concurrent creates for one slot with capacity 1: exactly one succeeds', async () => {
    const start = weekdayStart(9);
    const results = await Promise.allSettled(
      Array.from({ length: 20 }, () =>
        createBooking({
          typeSlug: 'consultation-only',
          start,
          concern: 'general',
          patient: { name: 'Race Test', phoneE164: '+2348036404321', firstVisit: true },
          consentTextVersion: 'test',
        }),
      ),
    );
    const ok = results.filter((r) => r.status === 'fulfilled');
    const taken = results.filter((r) => r.status === 'rejected' && r.reason instanceof BookingError && r.reason.code === 'SLOT_TAKEN');
    expect(ok).toHaveLength(1);
    expect(taken).toHaveLength(19);
    expect(await Booking.countDocuments({ start })).toBe(1);
  }, 120_000);

  it('20 concurrent creates with capacity 3: exactly three succeed, on seats 1 to 3', async () => {
    await setCapacity(3);
    const start = weekdayStart(10);
    const results = await Promise.allSettled(
      Array.from({ length: 20 }, () =>
        createBooking({
          typeSlug: 'consultation-only',
          start,
          concern: 'general',
          patient: { name: 'Race Test', phoneE164: '+2348036404321', firstVisit: true },
          consentTextVersion: 'test',
        }),
      ),
    );
    const ok = results.filter((r) => r.status === 'fulfilled');
    expect(ok).toHaveLength(3);
    const seats = ok.map((r) => r.value.booking.seat).sort();
    expect(seats).toEqual([1, 2, 3]);
  }, 120_000);

  it('a start that overlaps a booking through the buffer is refused with alternatives', async () => {
    const app = createApp({ env, rateLimit: false });
    const start = weekdayStart(11);
    await createBooking({
      typeSlug: 'follow-up',
      start,
      concern: 'general',
      patient: { name: 'First Patient', phoneE164: '+2348036404321', firstVisit: false },
      consentTextVersion: 'test',
    });
    // follow-up is 50 minutes, so the buffer holds the slot until 11:00. 10:30 overlaps.
    const clash = new Date(start.getTime() + 30 * 60 * 1000);
    const res = await request(app).post('/api/v1/bookings').send(validBody({ typeSlug: 'follow-up', start: clash.toISOString() }));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SLOT_TAKEN');
    expect(Array.isArray(res.body.error.alternatives.days)).toBe(true);
  });

  it('a start exactly when the previous buffer ends is allowed', async () => {
    const start = weekdayStart(12);
    await createBooking({
      typeSlug: 'follow-up',
      start,
      concern: 'general',
      patient: { name: 'First Patient', phoneE164: '+2348036404321', firstVisit: false },
      consentTextVersion: 'test',
    });
    const next = new Date(start.getTime() + 60 * 60 * 1000);
    const second = await createBooking({
      typeSlug: 'follow-up',
      start: next,
      concern: 'general',
      patient: { name: 'Second Patient', phoneE164: '+2348036404321', firstVisit: false },
      consentTextVersion: 'test',
    });
    expect(second.booking.status).toBe('awaiting_payment');
  });
});

describe('manage link and status transitions', () => {
  it('refuses a missing or wrong token with 404', async () => {
    const app = createApp({ env, rateLimit: false });
    const made = await request(app).post('/api/v1/bookings').send(validBody());
    expect((await request(app).get(`/api/v1/bookings/${made.body.ref}`)).status).toBe(404);
    expect((await request(app).get(`/api/v1/bookings/${made.body.ref}?t=${'x'.repeat(30)}`)).status).toBe(404);
  });

  it('the patient can say they have paid, and the booking waits for a human', async () => {
    const app = createApp({ env, rateLimit: false });
    const made = await request(app).post('/api/v1/bookings').send(validBody());
    const token = new URL(`http://x${made.body.manageUrl}`).searchParams.get('t');
    const res = await request(app).post(`/api/v1/bookings/${made.body.ref}/payment-submitted?t=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('payment_submitted');
    // payment_submitted never expires automatically (docs/04)
    await expireHolds(Date.now() + 30 * 24 * HOUR);
    const still = await Booking.findOne({ ref: made.body.ref }).lean();
    expect(still.status).toBe('payment_submitted');
  });

  it('an illegal transition is refused', async () => {
    const app = createApp({ env, rateLimit: false });
    const made = await request(app).post('/api/v1/bookings').send(validBody());
    const b = await Booking.findOne({ ref: made.body.ref });
    await transition(b._id, 'confirmed', { actor: 'test' });
    await transition(b._id, 'completed', { actor: 'test' });
    await expect(transition(b._id, 'cancelled', { actor: 'test' })).rejects.toThrow(BookingError);
  });

  it('an expired hold releases its seat so the time can be booked again', async () => {
    const start = weekdayStart(13);
    const now = Date.now();
    const first = await createBooking({
      typeSlug: 'consultation-only',
      start,
      concern: 'general',
      patient: { name: 'Hold Test', phoneE164: '+2348036404321', firstVisit: true },
      consentTextVersion: 'test',
      now,
    });
    expect(first.booking.status).toBe('awaiting_payment');
    await expect(
      createBooking({
        typeSlug: 'consultation-only',
        start,
        concern: 'general',
        patient: { name: 'Second', phoneE164: '+2348036404321', firstVisit: true },
        consentTextVersion: 'test',
      }),
    ).rejects.toThrow(BookingError);

    const expired = await expireHolds(now + 4 * HOUR);
    expect(expired).toBe(1);
    const after = await Booking.findById(first.booking._id).lean();
    expect(after.status).toBe('expired');
    expect(after.holdsSlot).toBe(false);
    const again = await createBooking({
      typeSlug: 'consultation-only',
      start,
      concern: 'general',
      patient: { name: 'Third', phoneE164: '+2348036404321', firstVisit: true },
      consentTextVersion: 'test',
    });
    expect(again.booking.status).toBe('awaiting_payment');
  });

  it('cancelling releases the seat', async () => {
    const start = weekdayStart(14);
    const made = await createBooking({
      typeSlug: 'consultation-only',
      start,
      concern: 'general',
      patient: { name: 'Cancel Test', phoneE164: '+2348036404321', firstVisit: true },
      consentTextVersion: 'test',
    });
    await transition(made.booking._id, 'cancelled', { actor: 'patient' });
    const locks = await SeatLock.countDocuments({ bookingId: made.booking._id, holds: true });
    expect(locks).toBe(0);
  });

  it('the calendar file is returned with the token', async () => {
    const app = createApp({ env, rateLimit: false });
    const made = await request(app).post('/api/v1/bookings').send(validBody());
    const token = new URL(`http://x${made.body.manageUrl}`).searchParams.get('t');
    const res = await request(app).get(`/api/v1/bookings/${made.body.ref}/ics?t=${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/calendar');
    expect(res.text).toContain('BEGIN:VEVENT');
  });
});

describe('inquiries', () => {
  it('stores a valid inquiry with consent', async () => {
    const app = createApp({ env, rateLimit: false });
    const res = await request(app).post('/api/v1/inquiries').send({
      name: 'Tunde Test',
      phone: '0803 640 4321',
      topic: 'treatment',
      message: 'Do you treat sciatica?',
      replyVia: 'whatsapp',
      consent: true,
      hp: '',
      t: 4000,
    });
    expect(res.status).toBe(201);
  });
});
