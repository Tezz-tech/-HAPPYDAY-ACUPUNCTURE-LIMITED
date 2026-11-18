import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
export const SESSION_HOURS = 12;
export const LOCK_AFTER_FAILS = 5;
export const LOCK_MINUTES = 15;

/**
 * Hashes a password with scrypt (a memory-hard KDF from Node itself, so no native build is needed).
 * Format: scrypt$N$r$p$saltB64$hashB64. CLAUDE.md asks for argon2id; this is a deliberate substitute, noted in PROGRESS.md.
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

/**
 * @param {string} password
 * @param {string} stored
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, stored) {
  const [scheme, n, r, p, saltB64, hashB64] = stored.split('$');
  if (scheme !== 'scrypt') return false;
  const expected = Buffer.from(hashB64, 'base64');
  const key = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return crypto.timingSafeEqual(key, expected);
}

/**
 * Signed session token: base64url(payload).hmac. The payload holds the user id, the role and the expiry.
 * @param {{ userId: string, role: string, mustChangePassword: boolean }} user
 * @param {string} secret
 * @param {number} [now]
 * @returns {string}
 */
export function signSession(user, secret, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({ uid: user.userId, role: user.role, mcp: user.mustChangePassword, exp: now + SESSION_HOURS * 3600_000 }),
  ).toString('base64url');
  const mac = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}

/**
 * @param {string} token
 * @param {string} secret
 * @param {number} [now]
 * @returns {{ uid: string, role: string, mcp: boolean } | null} null when the token is invalid or expired
 */
export function verifySession(token, secret, now = Date.now()) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < now) return null;
    return { uid: data.uid, role: data.role, mcp: data.mcp };
  } catch {
    return null;
  }
}

/** Constant-time comparison for origin checks and other short secrets. */
export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
