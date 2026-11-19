import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { loadEnv } from '../src/env.js';
import { createApp } from '../src/app.js';
import { seed, seedAdmin } from '../scripts/seed.js';
import { AppointmentType, Availability, AuditLog, Booking, BookingEvent, Exception, SeatLock, Settings, User } from '../src/models/index.js';
import { createBooking } from '../src/services/bookingService.js';
import { hashPassword } from '../src/services/auth.js';
import { localMidnight, localDateKey, addDays } from '@happyday/shared/slots';

const HOUR = 3600_000;
const OWNER = { email: 'owner@localhost.test', password: 'dev-owner-password-1' };
const NEW_PASSWORD = 'a-new-long-password-2';
let replset;
let env;
let app;

/** The next Monday to Friday, as a 10:00 Lagos start, `offset` days out. */
function weekdayStart(offset = 8) {
  let d = addDays(localDateKey(Date.now()), offset);
  for (;;) {
    const dow = new Date(localMidnight(d) + 12 * HOUR).getUTCDay();
    if (dow >= 1 && dow <= 5) break;
    d = addDays(d, 1);
  }
  return { date: d, start: new Date(localMidnight(d) + 10 * HOUR) };
}

async function ownerAgent() {
  const agent = request.agent(app);
  await agent.post('/api/v1/auth/login').send(OWNER);
  return agent;
}

beforeAll(async () => {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  mongoose.set('sanitizeFilter', true);
  mongoose.set('strictQuery', true);
  await mongoose.connect(replset.getUri());
  await Promise.all([Booking, SeatLock, BookingEvent, AppointmentType, Availability, Settings, User, AuditLog, Exception].map((m) => m.syncIndexes()));
  env = loadEnv({ NODE_ENV: 'test' });
  app = createApp({ env, rateLimit: false, sessionSecret: 'test-secret-that-is-long-enough-123' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await replset.stop();
});

beforeEach(async () => {
  await Promise.all([Booking, SeatLock, BookingEvent, AppointmentType, Availability, Settings, User, AuditLog, Exception].map((m) => m.deleteMany({})));
  await seed();
  await seedAdmin({ NODE_ENV: 'development' });
  await User.create({ email: 'staff@localhost.test', passwordHash: await hashPassword('staff-password-long-1'), role: 'staff', mustChangePassword: false });
});

describe('admin sign-in', () => {
  it('refuses every admin route without a session', async () => {
    expect((await request(app).get('/api/v1/admin/today')).status).toBe(401);
    expect((await request(app).get('/api/v1/admin/bookings')).status).toBe(401);
  });

  it('a wrong password gets the same generic message, and five failures lock the account', async () => {
    let last;
    for (let i = 0; i < 5; i += 1) {
      last = await request(app).post('/api/v1/auth/login').send({ email: 'staff@localhost.test', password: 'wrong-password-xx' });
      expect(last.status).toBe(401);
      expect(last.body.error.message).toBe('Email or password is not right.');
    }
    const locked = await request(app).post('/api/v1/auth/login').send({ email: 'staff@localhost.test', password: 'staff-password-long-1' });
    expect(locked.status).toBe(423);
  });

  it('a new owner must change the password before using anything else', async () => {
    const agent = request.agent(app);
    const login = await agent.post('/api/v1/auth/login').send(OWNER);
    expect(login.body.user.mustChangePassword).toBe(true);
    expect((await agent.get('/api/v1/admin/today')).body.error.code).toBe('PASSWORD_CHANGE_REQUIRED');
    const changed = await agent.post('/api/v1/auth/change-password').send({ current: OWNER.password, next: NEW_PASSWORD });
    expect(changed.status).toBe(200);
    expect((await agent.get('/api/v1/admin/today')).status).toBe(200);
  });

  it('a session token is refused when it has been tampered with', async () => {
    const res = await request(app).get('/api/v1/admin/today').set('Cookie', 'session=abc.def');
    expect(res.status).toBe(401);
  });

  it('a request from another site is refused on state-changing calls', async () => {
    const agent = await ownerAgent();
    const res = await agent.patch('/api/v1/admin/bookings/000000000000000000000000').set('Origin', 'https://evil.example').send({ action: 'confirm' });
    expect(res.status).toBe(403);
  });
});

describe('staff and owner roles', () => {
  it('staff can read bookings but not change settings, prices or hours', async () => {
    const agent = request.agent(app);
    await agent.post('/api/v1/auth/login').send({ email: 'staff@localhost.test', password: 'staff-password-long-1' });
    expect((await agent.get('/api/v1/admin/bookings')).status).toBe(200);
    expect((await agent.put('/api/v1/admin/settings').send({ paymentMode: 'pay_at_clinic' })).status).toBe(403);
    expect((await agent.patch('/api/v1/admin/appointment-types/consultation-only').send({ priceNaira: 1 })).status).toBe(403);
    expect((await agent.put('/api/v1/admin/availability').send({ capacityPerSlot: 3 })).status).toBe(403);
  });
});

describe('booking actions', () => {
  async function pendingBooking() {
    const { start } = weekdayStart(9);
    const made = await createBooking({
      typeSlug: 'consultation-only',
      start,
      concern: 'general',
      patient: { name: 'Admin Test', phoneE164: '+2348036404321', firstVisit: true },
      consentTextVersion: 'test',
    });
    return made.booking;
  }

  it('marking as paid needs an amount, then confirms and records the payment and an audit entry', async () => {
    const agent = await ownerAgent();
    await agent.post('/api/v1/auth/change-password').send({ current: OWNER.password, next: NEW_PASSWORD });
    const booking = await pendingBooking();
    const refused = await agent.patch(`/api/v1/admin/bookings/${booking._id}`).send({ action: 'markPaid' });
    expect(refused.status).toBe(422);
    const ok = await agent.patch(`/api/v1/admin/bookings/${booking._id}`).send({ action: 'markPaid', amount: 15000, method: 'transfer' });
    expect(ok.status).toBe(200);
    expect(ok.body.status).toBe('confirmed');
    const stored = await Booking.findById(booking._id).lean();
    expect(stored.payment.amountPaid).toBe(15000);
    expect(await AuditLog.countDocuments({ action: 'booking.markPaid' })).toBe(1);
  });

  it('an illegal action is refused: a no-show cannot be cancelled afterwards', async () => {
    const agent = await ownerAgent();
    await agent.post('/api/v1/auth/change-password').send({ current: OWNER.password, next: NEW_PASSWORD });
    const booking = await pendingBooking();
    await agent.patch(`/api/v1/admin/bookings/${booking._id}`).send({ action: 'confirm' });
    expect((await agent.patch(`/api/v1/admin/bookings/${booking._id}`).send({ action: 'noShow' })).status).toBe(200);
    const bad = await agent.patch(`/api/v1/admin/bookings/${booking._id}`).send({ action: 'cancel', reason: 'late' });
    expect(bad.status).toBe(409);
  });

  it('the booking detail shows the event history', async () => {
    const agent = await ownerAgent();
    await agent.post('/api/v1/auth/change-password').send({ current: OWNER.password, next: NEW_PASSWORD });
    const booking = await pendingBooking();
    await agent.patch(`/api/v1/admin/bookings/${booking._id}`).send({ action: 'confirm' });
    const res = await agent.get(`/api/v1/admin/bookings/${booking._id}`);
    expect(res.body.events.map((e) => e.to)).toEqual(['awaiting_payment', 'confirmed']);
  });
});

describe('closures and prices reach the public site', () => {
  it('closing a date removes its slots from the public list', async () => {
    const agent = await ownerAgent();
    await agent.post('/api/v1/auth/change-password').send({ current: OWNER.password, next: NEW_PASSWORD });
    const { date } = weekdayStart(15);
    const before = await request(app).get(`/api/v1/public/slots?type=consultation-only&from=${date}&days=1`);
    expect(before.body.days[0].slots.length).toBeGreaterThan(0);
    await agent.put(`/api/v1/admin/exceptions/${date}`).send({ closed: true, note: 'Public holiday' });
    const after = await request(app).get(`/api/v1/public/slots?type=consultation-only&from=${date}&days=1`);
    expect(after.body.days[0].slots).toHaveLength(0);
  });

  it('a price change shows on the public config straight away', async () => {
    const agent = await ownerAgent();
    await agent.post('/api/v1/auth/change-password').send({ current: OWNER.password, next: NEW_PASSWORD });
    await agent.patch('/api/v1/admin/appointment-types/consultation-only').send({ priceNaira: 15000 });
    const cfg = await request(app).get('/api/v1/public/config');
    const t = cfg.body.appointmentTypes.find((x) => x.slug === 'consultation-only');
    expect(t.priceNaira).toBe(15000);
  });

  it('owner settings can be saved and the change is audited', async () => {
    const agent = await ownerAgent();
    await agent.post('/api/v1/auth/change-password').send({ current: OWNER.password, next: NEW_PASSWORD });
    const res = await agent.put('/api/v1/admin/settings').send({ cancellationNoticeHours: 48 });
    expect(res.status).toBe(200);
    expect(res.body.cancellationNoticeHours).toBe(48);
    expect(await AuditLog.countDocuments({ action: 'settings.update' })).toBe(1);
  });
});
