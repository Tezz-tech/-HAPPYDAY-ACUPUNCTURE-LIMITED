import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { loadEnv } from '../src/env.js';
import { createApp } from '../src/app.js';
import { seed } from '../scripts/seed.js';

const SECRET = 'cron-secret-for-tests-0123456789';
let replset;
let app;

beforeAll(async () => {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  await mongoose.connect(replset.getUri(), { autoIndex: true });
  await seed();
  const env = loadEnv({ NODE_ENV: 'test', CRON_SECRET: SECRET });
  app = createApp({ env, rateLimit: false, sessionSecret: 'x'.repeat(40) });
});

afterAll(async () => {
  await mongoose.disconnect();
  await replset.stop();
});

describe('scheduled work endpoint (Vercel Cron)', () => {
  it('refuses a call without the cron secret', async () => {
    const res = await request(app).get('/api/v1/internal/expire-holds');
    expect(res.status).toBe(401);
  });

  it('refuses a wrong secret', async () => {
    const res = await request(app).get('/api/v1/internal/expire-holds').set('Authorization', 'Bearer wrong');
    expect(res.status).toBe(401);
  });

  it('runs the hold expiry with the right secret', async () => {
    const res = await request(app).get('/api/v1/internal/expire-holds').set('Authorization', `Bearer ${SECRET}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ expired: 0 });
  });
});
