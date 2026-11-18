import { Router } from 'express';
import { AppointmentType, Settings } from '../models/index.js';
import {
  createBooking,
  findByToken,
  transition,
  BookingError,
} from '../services/bookingService.js';
import { bookingIcs } from '../services/ics.js';
import { bookingCreate, manageQuery, MIN_FILL_MS } from '@happyday/shared/schemas';
import { CONSENT_TEXT_VERSION } from '@happyday/shared/constants';
import { validate } from '../middleware/rateLimits.js';
import { clinicAddress } from '../lib/clinic.js';

const CANCEL_TEXT = 'Please WhatsApp us to change this booking.';

/** Patient view of a booking: only the fields the manage page needs (docs/05). */
function patientView(b) {
  return {
    ref: b.ref,
    status: b.status,
    start: b.start,
    end: b.end,
    type: b.appointmentType?.name,
    concern: b.concern,
    payment: { mode: b.payment?.mode, amountDue: b.payment?.amountDue ?? null },
  };
}

/** Converts a BookingError into the documented error shape. */
function sendError(res, err) {
  const body = { error: { code: err.code, message: err.message } };
  if (err.alternatives) body.error.alternatives = err.alternatives;
  return res.status(err.status).json(body);
}

/**
 * Booking endpoints (docs/05). Create, view, payment-submitted, cancel, reschedule and calendar file.
 * Changes need the manage token in the ?t= query, and the token is compared by hash.
 * @param {{ limits: { bookings: any } }} deps
 */
export function bookingsRouter({ limits }) {
  const router = Router();

  router.post('/', limits.bookings, validate(bookingCreate), async (req, res, next) => {
    try {
      const body = req.body;
      // Honeypot: a filled hidden field means a bot. Respond as if it worked, without creating anything.
      if (body.hp) return res.status(422).json({ error: { code: 'VALIDATION', message: 'Please try again.' } });
      if (body.t < MIN_FILL_MS) {
        return res.status(422).json({ error: { code: 'VALIDATION', message: 'Please take a moment, then try again.' } });
      }
      const start = new Date(body.start);
      const type = await AppointmentType.findOne({ slug: body.typeSlug, active: true }).lean();
      if (!type) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Unknown appointment type' } });

      const { booking, token } = await createBooking({
        typeSlug: body.typeSlug,
        start,
        concern: body.concern,
        notes: body.notes,
        patient: { ...body.patient, phoneE164: body.patient.phone },
        consentTextVersion: CONSENT_TEXT_VERSION,
        source: 'web',
      });
      const settings = (await Settings.findOne({ key: 'default' }).lean()) ?? {};
      const mode = booking.payment.mode;
      res.status(201).json({
        ref: booking.ref,
        status: booking.status,
        manageUrl: `/booking/${booking.ref}?t=${token}`,
        payment: {
          mode,
          amountDue: booking.payment.amountDue,
          bank: mode === 'pay_at_clinic' ? null : settings.bank ?? null,
          holdExpiresAt: booking.holdExpiresAt,
        },
      });
    } catch (err) {
      if (err instanceof BookingError) return sendError(res, err);
      return next(err);
    }
  });

  router.get('/:ref', validate(manageQuery, 'query'), async (req, res, next) => {
    try {
      const b = await findByToken(req.params.ref, req.validatedQuery.t);
      res.json(patientView(b));
    } catch (err) {
      if (err instanceof BookingError) return sendError(res, err);
      return next(err);
    }
  });

  router.get('/:ref/ics', validate(manageQuery, 'query'), async (req, res, next) => {
    try {
      const b = await findByToken(req.params.ref, req.validatedQuery.t);
      const body = bookingIcs({ ref: b.ref, start: b.start, end: b.end, typeName: b.appointmentType.name, address: clinicAddress() });
      res.type('text/calendar').attachment(`${b.ref}.ics`).send(body);
    } catch (err) {
      if (err instanceof BookingError) return sendError(res, err);
      return next(err);
    }
  });

  router.post('/:ref/payment-submitted', validate(manageQuery, 'query'), async (req, res, next) => {
    try {
      const b = await findByToken(req.params.ref, req.validatedQuery.t);
      const updated = await transition(b._id, 'payment_submitted', {
        actor: 'patient',
        note: 'patient says the transfer was made',
        extra: { 'payment.submittedAt': new Date() },
      });
      res.json({ ref: updated.ref, status: updated.status });
    } catch (err) {
      if (err instanceof BookingError) return sendError(res, err);
      return next(err);
    }
  });

  router.post('/:ref/cancel', validate(manageQuery, 'query'), async (req, res, next) => {
    try {
      const b = await findByToken(req.params.ref, req.validatedQuery.t);
      const settings = (await Settings.findOne({ key: 'default' }).lean()) ?? {};
      const noticeMs = (settings.cancellationNoticeHours ?? 24) * 60 * 60 * 1000;
      if (new Date(b.start).getTime() - Date.now() < noticeMs) {
        return res.status(409).json({ error: { code: 'CONFLICT', message: CANCEL_TEXT } });
      }
      const updated = await transition(b._id, 'cancelled', { actor: 'patient', note: 'patient cancelled' });
      res.json({ ref: updated.ref, status: updated.status });
    } catch (err) {
      if (err instanceof BookingError) return sendError(res, err);
      return next(err);
    }
  });

  return router;
}

