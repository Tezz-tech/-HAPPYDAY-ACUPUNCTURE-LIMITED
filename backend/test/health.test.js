import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadEnv } from '../src/env.js';

describe('health', () => {
  it('reports unavailable when the database is not connected', async () => {
    const app = createApp({ env: loadEnv({ NODE_ENV: 'test' }) });
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(503);
    expect(res.body.ok).toBe(false);
  });

  it('returns a 404 in the documented error shape', async () => {
    const app = createApp({ env: loadEnv({ NODE_ENV: 'test' }) });
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('env', () => {
  it('refuses to start in production without secrets', () => {
    expect(() => loadEnv({ NODE_ENV: 'production' })).toThrow(/MONGODB_URI/);
  });
});
