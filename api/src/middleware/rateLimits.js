import rateLimit from 'express-rate-limit';

/**
 * Rate limits from docs/05: bookings 10 per hour per IP, inquiries 5 per hour, slots 120 per minute.
 * Tests build the app with enabled: false, and test the limiter on its own.
 * @param {{ enabled: boolean }} opts
 */
export function rateLimits({ enabled }) {
  const make = (limit, windowMs, message) =>
    enabled
      ? rateLimit({
          limit,
          windowMs,
          standardHeaders: 'draft-8',
          legacyHeaders: false,
          handler: (req, res) =>
            res.status(429).json({ error: { code: 'RATE_LIMITED', message } }),
        })
      : (req, res, next) => next();
  return {
    bookings: make(10, 60 * 60 * 1000, 'Too many bookings from this connection. Please WhatsApp us instead.'),
    inquiries: make(5, 60 * 60 * 1000, 'Too many messages from this connection. Please WhatsApp us instead.'),
    slots: make(120, 60 * 1000, 'Please wait a moment and try again.'),
  };
}

/**
 * Validates a request body or query against a zod schema and returns a 422 with field errors.
 * @param {import('zod').ZodType} schema
 * @param {'body' | 'query'} [source]
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(source === 'body' ? req.body : req.query);
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || 'form';
        fields[key] ??= issue.message;
      }
      return res.status(422).json({ error: { code: 'VALIDATION', message: 'Please check the highlighted fields.', fields } });
    }
    if (source === 'body') req.body = result.data;
    else req.validatedQuery = result.data;
    return next();
  };
}
