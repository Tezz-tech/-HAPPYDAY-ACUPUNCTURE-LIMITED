import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { createLogger } from './lib/logger.js';
import { dbReady } from './db.js';
import { healthRouter } from './routes/health.js';
import { publicRouter } from './routes/public.js';
import { bookingsRouter } from './routes/bookings.js';
import { inquiriesRouter } from './routes/inquiries.js';
import { rateLimits } from './middleware/rateLimits.js';
import { BookingError } from './services/bookingService.js';

/**
 * Builds the Express app. Kept separate from server.js so tests can mount it.
 * @param {{
 *   env: import('./env.js').Env,
 *   logger?: ReturnType<typeof createLogger>,
 *   rateLimit?: boolean
 * }} deps
 */
export function createApp({ env, logger = createLogger({ level: env.LOG_LEVEL }), rateLimit = true }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === '/api/v1/health' },
      serializers: {
        req: (req) => ({ method: req.method, url: req.url.split('?')[0] }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser());

  const limits = rateLimits({ enabled: rateLimit });
  app.use('/api/v1', healthRouter({ dbReady }));
  app.use('/api/v1/public', publicRouter({ limits }));
  app.use('/api/v1/bookings', bookingsRouter({ limits }));
  app.use('/api/v1/inquiries', inquiriesRouter({ limits }));

  app.use((req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } });
  });

  // Error shape from docs/05: { error: { code, message, fields? } }
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof BookingError) {
      return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    }
    const status = err.status ?? err.statusCode ?? 500;
    if (status >= 500) req.log?.error({ err: { name: err.name, code: err.code } }, 'request failed');
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: {
        code: status >= 500 ? 'INTERNAL' : err.code ?? 'VALIDATION',
        message: status >= 500 ? 'Something went wrong. Please try again.' : err.message,
      },
    });
  });

  return app;
}
