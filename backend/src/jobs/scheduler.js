import cron from 'node-cron';
import { expireHolds } from '../services/bookingService.js';

/**
 * Background jobs (docs/05): expire unpaid holds every 5 minutes. Reminders arrive in Phase 7.
 * @param {{ logger: { info: Function, error: Function } }} deps
 * @returns {{ stop: () => void }}
 */
export function startJobs({ logger }) {
  const task = cron.schedule('*/5 * * * *', async () => {
    try {
      const expired = await expireHolds();
      if (expired > 0) logger.info({ expired }, 'expired unpaid holds');
    } catch (err) {
      logger.error({ err: { name: err.name, code: err.code } }, 'expireHolds failed');
    }
  });
  return { stop: () => task.stop() };
}
