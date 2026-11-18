import { loadEnv } from './env.js';
import { createLogger } from './lib/logger.js';
import { connectDb } from './db.js';
import { createApp } from './app.js';

const env = loadEnv();
const logger = createLogger({ level: env.LOG_LEVEL });
const db = await connectDb({ uri: env.MONGODB_URI, logger });
const app = createApp({ env, logger });

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'api listening');
});

/** Graceful shutdown on SIGINT and SIGTERM. */
async function shutdown(signal) {
  logger.info({ signal }, 'shutting down');
  server.close();
  await db.stop();
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
