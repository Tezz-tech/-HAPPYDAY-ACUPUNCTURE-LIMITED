import { verifySession } from '../services/auth.js';

/** Cookie name: __Host- prefix in production (Secure, Path=/, no Domain), plain in development over http. */
export function cookieName(env) {
  return env.NODE_ENV === 'production' ? '__Host-session' : 'session';
}

/**
 * Reads the session cookie and sets req.session when it is valid. It never rejects by itself.
 * @param {{ secret: string, name: string }} opts
 */
export function sessionMiddleware({ secret, name }) {
  return (req, res, next) => {
    req.session = verifySession(req.cookies?.[name], secret) ?? null;
    next();
  };
}

/** Routes a user may reach while they still have to change their password. */
const ALLOWED_WHILE_MUST_CHANGE = new Set(['/api/v1/auth/me', '/api/v1/auth/change-password', '/api/v1/auth/logout']);

/** 401 without a session. 403 while a forced password change is pending (docs/04 Admin auth). */
export function requireAuth(req, res, next) {
  if (!req.session) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
  }
  // Compare the full path: req.path is relative to whichever router mounted this middleware.
  const fullPath = req.originalUrl.split('?')[0].replace(/\/$/, '');
  if (req.session.mcp && !ALLOWED_WHILE_MUST_CHANGE.has(fullPath)) {
    return res.status(403).json({ error: { code: 'PASSWORD_CHANGE_REQUIRED', message: 'Please choose a new password first.' } });
  }
  return next();
}

/**
 * Owner-only routes refuse staff with 403 (docs/04).
 * @param {'owner' | 'staff'} role the minimum role
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.session) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
    if (role === 'owner' && req.session.role !== 'owner') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only the owner can do that.' } });
    }
    return next();
  };
}

/**
 * CSRF defence in depth (docs/05): SameSite=Lax cookies plus an Origin check on every state-changing request.
 * A request with no Origin header (for example a same-origin GET or a server call) is allowed through.
 * @param {string} webOrigin
 */
export function originCheck(webOrigin) {
  const allowed = new URL(webOrigin).origin;
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.headers.origin;
    if (origin && origin !== allowed) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'This request came from an unexpected site.' } });
    }
    return next();
  };
}
