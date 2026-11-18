import pino from 'pino';

/**
 * Structured logger. Patient fields, free text and secrets are redacted so PII never reaches logs.
 * @param {{ level?: string }} [opts]
 */
export function createLogger(opts = {}) {
  return pino({
    level: opts.level ?? 'info',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.patient',
        'req.body.notes',
        'req.body.message',
        'req.body.password',
        'req.body.currentPassword',
        'req.body.newPassword',
        '*.patient',
        '*.notes',
        '*.message',
        '*.password',
        '*.email',
        '*.phone',
        '*.phoneE164',
      ],
      censor: '[redacted]',
    },
  });
}
