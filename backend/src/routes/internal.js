import express from 'express';
import { expireHolds } from '../services/bookingService.js';

/**
 * Routes called by the platform scheduler (Vercel Cron), not by people. Each route needs the
 * CRON_SECRET as a bearer token, so nobody else can trigger the work.
 * @param {{ logger: { info: Function, error: Function }, cronSecret?: string }} deps
 */
export function internalRouter({ logger, cronSecret }) {
  const router = express.Router();

  router.get('/expire-holds', async (req, res) => {
    if (!cronSecret || req.get('authorization') !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not allowed.' } });
    }
    try {
      const expired = await expireHolds();
      if (expired > 0) logger.info({ expired }, 'expired unpaid holds');
      return res.json({ expired });
    } catch (err) {
      logger.error({ err: { name: err.name, code: err.code } }, 'expireHolds failed');
      return res.status(500).json({ error: { code: 'INTERNAL', message: 'Could not expire holds.' } });
    }
  });

  return router;
}
