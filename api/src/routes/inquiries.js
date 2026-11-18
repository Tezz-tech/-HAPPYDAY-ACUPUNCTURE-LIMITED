import { Router } from 'express';
import { Inquiry } from '../models/index.js';
import { inquiryCreate, MIN_FILL_MS } from '@happyday/shared/schemas';
import { CONSENT_TEXT_VERSION } from '@happyday/shared/constants';
import { validate } from '../middleware/rateLimits.js';

/**
 * POST /api/v1/inquiries (docs/03 Contact, docs/05). Honeypot and minimum fill time apply, as for bookings.
 * @param {{ limits: { inquiries: any } }} deps
 */
export function inquiriesRouter({ limits }) {
  const router = Router();

  router.post('/', limits.inquiries, validate(inquiryCreate), async (req, res, next) => {
    try {
      const body = req.body;
      if (body.hp) return res.status(422).json({ error: { code: 'VALIDATION', message: 'Please try again.' } });
      if (body.t < MIN_FILL_MS) {
        return res.status(422).json({ error: { code: 'VALIDATION', message: 'Please take a moment, then try again.' } });
      }
      const created = await Inquiry.create({
        name: body.name,
        phoneE164: body.phone,
        email: body.email,
        topic: body.topic,
        message: body.message,
        replyVia: body.replyVia,
        consent: { given: true, at: new Date(), textVersion: CONSENT_TEXT_VERSION },
      });
      res.status(201).json({ id: String(created._id), status: created.status });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
