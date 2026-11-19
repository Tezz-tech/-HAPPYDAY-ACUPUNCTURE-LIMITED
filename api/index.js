// Vercel entry point for the API (zero-config Express). The local server is src/server.js; this file runs the
// same app as a serverless function. The database is connected once per instance, and the first request waits for it.
import { loadEnv } from './src/env.js';
import { createLogger } from './src/lib/logger.js';
import { connectDb } from './src/db.js';
import { createApp } from './src/app.js';
import { seed, seedAdmin } from './scripts/seed.js';

const env = loadEnv();
const logger = createLogger({ level: env.LOG_LEVEL });
const app = createApp({ env, logger, rateLimit: env.NODE_ENV === 'production', sessionSecret: env.SESSION_SECRET ?? undefined });

let ready = null;

/** Connect and seed once. A failure clears the cache so the next request tries again. */
function boot() {
  if (!ready) {
    ready = (async () => {
      await connectDb({ uri: env.MONGODB_URI, logger });
      await seed();
      await seedAdmin(env);
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

export default async function handler(req, res) {
  try {
    await boot();
  } catch (err) {
    logger.error({ err: { name: err.name, code: err.code } }, 'database not ready');
    res.statusCode = 503;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: { code: 'UNAVAILABLE', message: 'The service is starting. Please try again in a moment.' } }));
    return;
  }
  return app(req, res);
}
