import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AppointmentType, Availability, AuditLog, Booking, BookingEvent, Exception, Inquiry, Settings } from '../models/index.js';
import { transition, BookingError } from '../services/bookingService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/rateLimits.js';
import { localDateKey, localMidnight } from '@happyday/shared/slots';
import { PAYMENT_MODES } from '@happyday/shared/constants';

const HOUR = 60 * 60 * 1000;

/** Writes an audit entry for an admin change. Diffs hold settings values only, never patient health notes. */
async function audit(req, action, entity, entityId, diff = {}) {
  await AuditLog.create({ userId: req.session.uid, action, entity, entityId: String(entityId), diff });
}

function sendError(res, err) {
  return res.status(err.status).json({ error: { code: err.code, message: err.message } });
}

const actionBody = z.object({
  action: z.enum(['confirm', 'markPaid', 'complete', 'noShow', 'cancel']),
  amount: z.number().int().min(0).max(100_000_000).optional(),
  method: z.enum(['transfer', 'cash', 'pos', 'other']).optional(),
  receivedAt: z.iso.datetime().optional(),
  note: z.string().max(300).optional().default(''),
  reason: z.string().max(200).optional().default(''),
});

const settingsBody = z.object({
  bank: z.object({ bankName: z.string().min(2).max(80), accountName: z.string().min(2).max(120), accountNumber: z.string().regex(/^\d{10}$/, 'Ten digits') }).optional(),
  paymentMode: z.enum(PAYMENT_MODES).optional(),
  unpaidHoldMinutes: z.number().int().min(15).max(1440).optional(),
  cancellationNoticeHours: z.number().int().min(0).max(240).optional(),
  hoursArePlaceholder: z.boolean().optional(),
  notifyEmails: z.array(z.string().email()).max(5).optional(),
});

const typeBody = z.object({
  name: z.string().min(2).max(120).optional(),
  summary: z.string().max(400).optional(),
  durationMinutes: z.number().int().min(15).max(240).optional(),
  priceNaira: z.number().int().min(0).max(100_000_000).nullable().optional(),
  depositNaira: z.number().int().min(0).max(100_000_000).nullable().optional(),
  active: z.boolean().optional(),
  order: z.number().int().min(0).max(99).optional(),
});

const availabilityBody = z.object({
  weekly: z.record(z.string(), z.array(z.object({ start: z.string(), end: z.string() }))).optional(),
  breaks: z.array(z.object({ day: z.string(), start: z.string(), end: z.string() })).optional(),
  slotIntervalMinutes: z.number().int().min(5).max(120).optional(),
  bufferMinutes: z.number().int().min(0).max(120).optional(),
  minNoticeHours: z.number().int().min(0).max(240).optional(),
  maxAdvanceDays: z.number().int().min(1).max(365).optional(),
  capacityPerSlot: z.number().int().min(1).max(10).optional(),
});

const exceptionBody = z.object({
  closed: z.boolean().default(false),
  ranges: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
  note: z.string().max(200).optional().default(''),
});

const inquiryBody = z.object({ status: z.enum(['new', 'replied', 'closed']) });

/** Maps the admin action names (docs/05) to state machine targets. */
function planFor(action, body) {
  const now = new Date();
  switch (action) {
    case 'confirm':
      return { to: 'confirmed', note: 'confirmed by admin' };
    case 'markPaid':
      return {
        to: 'confirmed',
        note: body.note || 'marked as paid',
        extra: {
          'payment.amountPaid': body.amount ?? null,
          'payment.method': body.method ?? 'transfer',
          'payment.receivedAt': body.receivedAt ? new Date(body.receivedAt) : now,
          'payment.note': body.note,
        },
      };
    case 'complete':
      return { to: 'completed', note: 'visit completed' };
    case 'noShow':
      return { to: 'no_show', note: 'no-show' };
    default:
      return { to: 'cancelled', note: body.reason || 'cancelled by admin', extra: { cancelledReason: body.reason } };
  }
}

/**
 * Admin API (docs/05 Admin). Every route needs a session. Settings, prices, hours and the audit view are owner-only.
 */
export function adminRouter() {
  const router = Router();
  router.use(requireAuth);

  // ---- Today ----
  router.get('/today', async (req, res, next) => {
    try {
      const days = Math.min(7, Math.max(1, Number(req.query.days) || 2));
      const todayKey = localDateKey(Date.now());
      const from = new Date(localMidnight(todayKey));
      const to = new Date(localMidnight(todayKey) + days * 24 * HOUR);
      // Operator filters are trusted: sanitizeFilter (db.js) would otherwise strip them.
      const bookings = await Booking.find({
        start: mongoose.trusted({ $gte: from, $lt: to }),
        status: mongoose.trusted({ $ne: 'cancelled' }),
      })
        .sort({ start: 1 })
        .lean();
      const shape = (b) => ({
        id: String(b._id),
        ref: b.ref,
        start: b.start,
        status: b.status,
        type: b.appointmentType?.name,
        concern: b.concern,
        name: b.patient.name,
        phone: b.patient.phoneE164,
        reminderSentAt: b.reminderWhatsappAt,
        amountDue: b.payment?.amountDue ?? null,
      });
      res.json({
        needsChecking: bookings.filter((b) => b.status === 'payment_submitted').map(shape),
        bookings: bookings.filter((b) => b.status !== 'payment_submitted').map(shape),
      });
    } catch (err) {
      next(err);
    }
  });

  // ---- Bookings ----
  router.get('/bookings', async (req, res, next) => {
    try {
      const filter = {};
      if (req.query.status) filter.status = String(req.query.status);
      if (req.query.from || req.query.to) {
        const range = {};
        if (req.query.from) range.$gte = new Date(`${req.query.from}T00:00:00+01:00`);
        if (req.query.to) range.$lt = new Date(`${req.query.to}T23:59:59+01:00`);
        filter.start = mongoose.trusted(range);
      }
      if (req.query.q) {
        const q = String(req.query.q).slice(0, 60);
        filter.$or = mongoose.trusted([
          { ref: new RegExp(q.replace(/[^\w-]/g, ''), 'i') },
          { 'patient.name': new RegExp(q.replace(/[^\w\s-]/g, ''), 'i') },
        ]);
      }
      const page = Math.max(1, Number(req.query.page) || 1);
      const items = await Booking.find(filter).sort({ start: -1 }).skip((page - 1) * 50).limit(50).lean();
      res.json({
        items: items.map((b) => ({
          id: String(b._id),
          ref: b.ref,
          start: b.start,
          status: b.status,
          type: b.appointmentType?.name,
          name: b.patient.name,
          phone: b.patient.phoneE164,
          paymentMode: b.payment?.mode,
          amountDue: b.payment?.amountDue ?? null,
          amountPaid: b.payment?.amountPaid ?? null,
        })),
        page,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/bookings/:id', async (req, res, next) => {
    try {
      const b = await Booking.findById(req.params.id).lean();
      if (!b) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Booking not found' } });
      const events = await BookingEvent.find({ bookingId: b._id }).sort({ at: 1 }).lean();
      res.json({
        id: String(b._id),
        ref: b.ref,
        status: b.status,
        start: b.start,
        end: b.end,
        seat: b.seat,
        type: b.appointmentType,
        concern: b.concern,
        notes: b.notes,
        patient: { name: b.patient.name, phone: b.patient.phoneE164, email: b.patient.email, firstVisit: b.patient.firstVisit },
        payment: b.payment,
        holdExpiresAt: b.holdExpiresAt,
        events: events.map((e) => ({ at: e.at, actor: e.actor, from: e.from, to: e.to, note: e.note })),
      });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/bookings/:id', validate(actionBody), async (req, res, next) => {
    try {
      const plan = planFor(req.body.action, req.body);
      if (req.body.action === 'markPaid' && req.body.amount === undefined) {
        return res.status(422).json({ error: { code: 'VALIDATION', message: 'Enter the amount received.', fields: { amount: 'Required' } } });
      }
      const updated = await transition(req.params.id, plan.to, {
        actor: `admin:${req.session.uid}`,
        note: plan.note,
        extra: plan.extra,
      });
      await audit(req, `booking.${req.body.action}`, 'booking', updated._id, { to: plan.to });
      res.json({ id: String(updated._id), ref: updated.ref, status: updated.status });
    } catch (err) {
      if (err instanceof BookingError) return sendError(res, err);
      next(err);
    }
  });

  // ---- Settings (owner) ----
  router.get('/settings', requireRole('owner'), async (req, res, next) => {
    try {
      res.json((await Settings.findOne({ key: 'default' }).lean()) ?? {});
    } catch (err) {
      next(err);
    }
  });

  router.put('/settings', requireRole('owner'), validate(settingsBody), async (req, res, next) => {
    try {
      const updated = await Settings.findOneAndUpdate({ key: 'default' }, { $set: req.body }, { new: true, upsert: true }).lean();
      await audit(req, 'settings.update', 'settings', 'default', req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // ---- Appointment types (owner) ----
  router.get('/appointment-types', async (req, res, next) => {
    try {
      res.json({ items: await AppointmentType.find({}).sort({ order: 1 }).lean() });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/appointment-types/:slug', requireRole('owner'), validate(typeBody), async (req, res, next) => {
    try {
      const updated = await AppointmentType.findOneAndUpdate({ slug: req.params.slug }, { $set: req.body }, { new: true }).lean();
      if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Unknown appointment type' } });
      await audit(req, 'type.update', 'appointmentType', req.params.slug, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // ---- Availability (owner) ----
  router.get('/availability', async (req, res, next) => {
    try {
      res.json((await Availability.findOne({ key: 'default' }).lean()) ?? {});
    } catch (err) {
      next(err);
    }
  });

  router.put('/availability', requireRole('owner'), validate(availabilityBody), async (req, res, next) => {
    try {
      const updated = await Availability.findOneAndUpdate({ key: 'default' }, { $set: req.body }, { new: true, upsert: true }).lean();
      await audit(req, 'availability.update', 'availability', 'default', req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // ---- Closures and custom hours (staff can manage) ----
  router.get('/exceptions', async (req, res, next) => {
    try {
      res.json({ items: await Exception.find({}).sort({ date: 1 }).lean() });
    } catch (err) {
      next(err);
    }
  });

  router.put('/exceptions/:date', validate(exceptionBody), async (req, res, next) => {
    try {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.params.date)) {
        return res.status(422).json({ error: { code: 'VALIDATION', message: 'Use the date as YYYY-MM-DD.' } });
      }
      const updated = await Exception.findOneAndUpdate({ date: req.params.date }, { $set: { ...req.body, date: req.params.date } }, { new: true, upsert: true }).lean();
      await audit(req, 'exception.set', 'exception', req.params.date, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/exceptions/:date', async (req, res, next) => {
    try {
      await Exception.deleteOne({ date: req.params.date });
      await audit(req, 'exception.delete', 'exception', req.params.date);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // ---- Inquiries ----
  router.get('/inquiries', async (req, res, next) => {
    try {
      res.json({ items: await Inquiry.find({}).sort({ createdAt: -1 }).limit(100).lean() });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/inquiries/:id', validate(inquiryBody), async (req, res, next) => {
    try {
      const updated = await Inquiry.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, { new: true }).lean();
      if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Inquiry not found' } });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // ---- Audit (owner) ----
  router.get('/audit', requireRole('owner'), async (req, res, next) => {
    try {
      res.json({ items: await AuditLog.find({}).sort({ at: -1 }).limit(200).lean() });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
