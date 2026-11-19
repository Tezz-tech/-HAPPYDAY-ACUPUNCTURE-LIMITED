import { Router } from 'express';
import { AppointmentType, Availability, Settings, Testimonial } from '../models/index.js';
import { slotsFor, BookingError } from '../services/bookingService.js';
import { slotsQuery } from '@happyday/shared/schemas';
import { validate } from '../middleware/rateLimits.js';

/**
 * Public read endpoints (docs/05): config, slots and published testimonials.
 * @param {{ limits: { slots: any } }} deps
 */
export function publicRouter({ limits }) {
  const router = Router();

  router.get('/config', async (req, res) => {
    const [types, settings, avail] = await Promise.all([
      AppointmentType.find({ active: true }).sort({ order: 1 }).lean(),
      Settings.findOne({ key: 'default' }).lean(),
      Availability.findOne({ key: 'default' }).lean(),
    ]);
    const mode = settings?.paymentMode ?? 'transfer_deposit';
    res.json({
      appointmentTypes: types.map((t) => ({
        slug: t.slug,
        name: t.name,
        summary: t.summary,
        durationMinutes: t.durationMinutes,
        priceNaira: t.priceNaira,
        depositNaira: t.depositNaira,
        isFirstVisit: t.isFirstVisit,
      })),
      paymentMode: mode,
      bank: mode === 'pay_at_clinic' ? null : settings?.bank ?? null,
      hoursArePlaceholder: settings?.hoursArePlaceholder ?? true,
      cancellationNoticeHours: settings?.cancellationNoticeHours ?? 24,
      weekly: avail?.weekly ?? {},
    });
  });

  router.get('/slots', limits.slots, validate(slotsQuery, 'query'), async (req, res, next) => {
    try {
      const { type, from, days } = req.validatedQuery;
      res.json(await slotsFor({ typeSlug: type, from, days }));
    } catch (err) {
      if (err instanceof BookingError) return res.status(err.status).json({ error: { code: err.code, message: err.message } });
      return next(err);
    }
  });

  router.get('/testimonials', async (req, res) => {
    const items = await Testimonial.find({ published: true, consentConfirmed: true }).sort({ order: 1 }).lean();
    res.json({
      testimonials: items.map((t) => ({ quote: t.quote, displayName: t.displayName, concern: t.concern })),
    });
  });

  return router;
}
