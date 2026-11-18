// Seeds the database from /content (docs/05). Idempotent: running it twice changes nothing new.
// Usage: npm run seed -w api  (set MONGODB_URI, or it uses the in-memory dev database)
import clinic from '../../content/clinic.json' with { type: 'json' };
import { loadEnv } from '../src/env.js';
import { connectDb } from '../src/db.js';
import { AppointmentType, Availability, Settings, User } from '../src/models/index.js';
import { hashPassword } from '../src/services/auth.js';

/** Converts content hours [['09:00','17:00']] to [{start,end}] for storage. */
function ranges(list) {
  return list.map(([start, end]) => ({ start, end }));
}

export async function seed() {
  const weekly = Object.fromEntries(Object.entries(clinic.hours.weekly).map(([day, list]) => [day, ranges(list)]));

  for (const [order, t] of clinic.appointmentTypes.entries()) {
    await AppointmentType.updateOne(
      { slug: t.slug },
      {
        $setOnInsert: {
          slug: t.slug,
          name: t.name,
          summary: t.summary,
          durationMinutes: t.durationMinutes,
          priceNaira: t.priceNaira,
          depositNaira: t.depositNaira,
          isFirstVisit: t.isFirstVisit,
          active: true,
          order,
        },
      },
      { upsert: true },
    );
  }

  await Availability.updateOne(
    { key: 'default' },
    {
      $setOnInsert: {
        key: 'default',
        timezone: clinic.hours.timezone,
        weekly,
        breaks: [],
        slotIntervalMinutes: clinic.scheduling.slotIntervalMinutes,
        bufferMinutes: clinic.scheduling.bufferMinutes,
        minNoticeHours: clinic.scheduling.minNoticeHours,
        maxAdvanceDays: clinic.scheduling.maxAdvanceDays,
        capacityPerSlot: clinic.scheduling.capacityPerSlot,
      },
    },
    { upsert: true },
  );

  await Settings.updateOne(
    { key: 'default' },
    {
      $setOnInsert: {
        key: 'default',
        bank: {
          bankName: clinic.payments.bankTransfer.bankName,
          accountName: clinic.payments.bankTransfer.accountName,
          accountNumber: clinic.payments.bankTransfer.accountNumber,
        },
        paymentMode: clinic.payments.mode,
        unpaidHoldMinutes: clinic.payments.unpaidHoldMinutes,
        cancellationNoticeHours: clinic.scheduling.cancellationNoticeHours,
        hoursArePlaceholder: clinic.hours.isPlaceholder,
      },
    },
    { upsert: true },
  );
}

/**
 * Creates the owner account once (docs/04 Admin auth). The password is forced to change on first sign-in.
 * In production ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD must be set. In development a clearly labelled
 * account is created so the admin can be tried locally.
 * @param {{ NODE_ENV: string, ADMIN_EMAIL?: string, ADMIN_INITIAL_PASSWORD?: string }} env
 */
export async function seedAdmin(env) {
  const exists = await User.exists({ role: 'owner' });
  if (exists) return;
  const dev = env.NODE_ENV !== 'production';
  const email = env.ADMIN_EMAIL ?? (dev ? 'owner@localhost.test' : null);
  const password = env.ADMIN_INITIAL_PASSWORD ?? (dev ? 'dev-owner-password-1' : null);
  if (!email || !password) return;
  await User.create({ email, passwordHash: await hashPassword(password), role: 'owner', mustChangePassword: true });
}

async function main() {
  const env = loadEnv();
  const db = await connectDb({ uri: env.MONGODB_URI });
  await seed();
  await seedAdmin(env);
  console.log('seeded from content/');
  await db.stop();
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('seed.js')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
