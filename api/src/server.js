import { loadEnv } from './env.js';
import { createLogger } from './lib/logger.js';
import { connectDb } from './db.js';
import { createApp } from './app.js';
import { seed } from '../scripts/seed.js';
import { startJobs } from './jobs/scheduler.js';

const env = loadEnv();
const logger = createLogger({ level: env.LOG_LEVEL });
const db = await connectDb({ uri: env.MONGODB_URI, logger });
await seed();
const app = createApp({ env, logger, rateLimit: env.NODE_ENV === 'production' });
const jobs = startJobs({ logger });

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'api listening');
});

/** Graceful shutdown on SIGINT and SIGTERM. */
async function shutdown(signal) {
  logger.info({ signal }, 'shutting down');
  server.close();
  jobs.stop();
  await db.stop();
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
