import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { User, AuditLog } from '../models/index.js';
import {
  hashPassword,
  verifyPassword,
  signSession,
  LOCK_AFTER_FAILS,
  LOCK_MINUTES,
  SESSION_HOURS,
} from '../services/auth.js';
import { cookieName } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/rateLimits.js';

const loginBody = z.object({
  email: z.string().trim().min(3).max(120),
  password: z.string().min(1).max(200),
});
const changeBody = z.object({
  current: z.string().min(1).max(200),
  next: z.string().min(12, 'Use at least 12 characters.').max(200),
});

/** Dummy hash so an unknown email takes as long to check as a real one (no account enumeration by timing). */
let dummyHash = null;

/**
 * Auth routes (docs/05, docs/04): login with a per-IP limit and a 15-minute lock after 5 failures,
 * logout, the current user, and change-password (which clears the forced change).
 * @param {{ env: any, secret: string, enabled?: boolean }} deps
 */
export function authRouter({ env, secret, enabled = true }) {
  const router = Router();
  const name = cookieName(env);
  const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_HOURS * 3600_000,
  };

  const loginLimiter = enabled
    ? rateLimit({ limit: 10, windowMs: 15 * 60 * 1000, standardHeaders: 'draft-8', legacyHeaders: false, handler: (req, res) => res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many sign-in attempts. Please wait 15 minutes.' } }) })
    : (req, res, next) => next();

  router.post('/login', loginLimiter, validate(loginBody), async (req, res, next) => {
    try {
      const email = req.body.email.toLowerCase();
      const user = await User.findOne({ email });
      const now = Date.now();
      if (!user) {
        if (!dummyHash) dummyHash = await hashPassword('not-a-real-password');
        await verifyPassword(req.body.password, dummyHash);
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Email or password is not right.' } });
      }
      if (user.lockedUntil && user.lockedUntil.getTime() > now) {
        return res.status(423).json({ error: { code: 'LOCKED', message: 'This account is locked for a while after failed sign-ins. Try again later.' } });
      }
      const ok = await verifyPassword(req.body.password, user.passwordHash);
      if (!ok) {
        user.failedLogins += 1;
        if (user.failedLogins >= LOCK_AFTER_FAILS) {
          user.lockedUntil = new Date(now + LOCK_MINUTES * 60 * 1000);
          user.failedLogins = 0;
        }
        await user.save();
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Email or password is not right.' } });
      }
      user.failedLogins = 0;
      user.lockedUntil = null;
      user.lastLoginAt = new Date(now);
      await user.save();
      const token = signSession({ userId: String(user._id), role: user.role, mustChangePassword: user.mustChangePassword }, secret, now);
      res.cookie(name, token, cookieOptions);
      return res.json({ user: { email: user.email, role: user.role, mustChangePassword: user.mustChangePassword } });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/logout', (req, res) => {
    res.clearCookie(name, { ...cookieOptions, maxAge: undefined });
    res.json({ ok: true });
  });

  router.get('/me', requireAuth, async (req, res, next) => {
    try {
      const user = await User.findById(req.session.uid).lean();
      if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
      return res.json({ user: { email: user.email, role: user.role, mustChangePassword: user.mustChangePassword } });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/change-password', requireAuth, validate(changeBody), async (req, res, next) => {
    try {
      const user = await User.findById(req.session.uid);
      if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
      const ok = await verifyPassword(req.body.current, user.passwordHash);
      if (!ok) return res.status(422).json({ error: { code: 'VALIDATION', message: 'Your current password is not right.', fields: { current: 'Not right' } } });
      user.passwordHash = await hashPassword(req.body.next);
      user.mustChangePassword = false;
      await user.save();
      await AuditLog.create({ userId: user._id, action: 'password.change', entity: 'user', entityId: String(user._id) });
      const token = signSession({ userId: String(user._id), role: user.role, mustChangePassword: false }, secret);
      res.cookie(name, token, cookieOptions);
      return res.json({ ok: true });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
