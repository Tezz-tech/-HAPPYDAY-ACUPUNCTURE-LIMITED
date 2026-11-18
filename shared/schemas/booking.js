import { z } from 'zod';
import { phoneInput } from './phone.js';

/** Email may be empty (optional) or a valid address. Empty becomes null. */
const optionalEmail = z
  .union([z.literal(''), z.email()])
  .optional()
  .transform((v) => (v ? v : null));

/**
 * Body of POST /api/v1/bookings (docs/05). `hp` is the honeypot (must stay empty) and `t` is the
 * milliseconds between the form loading and submitting (must be at least 3000).
 */
export const bookingCreate = z.object({
  typeSlug: z.string().min(1).max(60),
  start: z.iso.datetime(),
  concern: z.string().min(1).max(60).default('general'),
  notes: z.string().max(500).optional().default(''),
  patient: z.object({
    name: z.string().trim().min(2, 'Please enter your full name.').max(80),
    phone: phoneInput,
    email: optionalEmail,
    firstVisit: z.boolean().default(true),
  }),
  consent: z.literal(true, { error: 'Please tick the box so we can look after your booking.' }),
  hp: z.string().max(0).optional().default(''),
  t: z.number().int().min(0).max(24 * 60 * 60 * 1000).default(0),
});

/** Query for GET /public/slots (docs/05). */
export const slotsQuery = z.object({
  type: z.string().min(1).max(60),
  from: z.iso.date(),
  days: z.coerce.number().int().min(1).max(14).default(7),
});

/** Manage-link query (?t=). */
export const manageQuery = z.object({
  // Missing or malformed tokens get a 404 from findByToken, so the reply never reveals whether a reference exists.
  t: z.string().max(120).default(''),
});

export const rescheduleBody = z.object({
  start: z.iso.datetime(),
});

/** POST /api/v1/inquiries (docs/03 Contact). */
export const inquiryCreate = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneInput,
  email: optionalEmail,
  topic: z.enum(['treatment', 'booking', 'other']).default('other'),
  message: z.string().trim().min(5).max(1000),
  replyVia: z.enum(['whatsapp', 'call', 'email']).default('whatsapp'),
  consent: z.literal(true, { error: 'Please tick the box so we can reply to you.' }),
  hp: z.string().max(0).optional().default(''),
  t: z.number().int().min(0).max(24 * 60 * 60 * 1000).default(0),
});

/** Minimum time to fill a form before submitting (docs/05 Bots). */
export const MIN_FILL_MS = 3000;
