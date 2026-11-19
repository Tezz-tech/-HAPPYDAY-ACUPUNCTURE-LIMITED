import { Router } from 'express';

/**
 * @param {{ dbReady: () => boolean }} deps
 */
export function healthRouter({ dbReady }) {
  const router = Router();
  router.get('/health', (req, res) => {
    const db = dbReady();
    res.status(db ? 200 : 503).json({ ok: db, db: db ? 'connected' : 'unavailable' });
  });
  return router;
}
