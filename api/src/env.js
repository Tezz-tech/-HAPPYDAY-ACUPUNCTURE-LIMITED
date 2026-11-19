import { z } from 'zod';

/**
 * Environment, validated at start-up. Missing secrets in production stop the server.
 * @typedef {z.infer<typeof schema>} Env
 */
const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
    API_ORIGIN: z.string().url().default('http://localhost:4000'),
    MONGODB_URI: z.string().optional(),
    SESSION_SECRET: z.string().min(32).optional(),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_INITIAL_PASSWORD: z.string().min(12).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;
    for (const key of ['MONGODB_URI', 'SESSION_SECRET']) {
      if (!env[key])
        ctx.addIssue({ code: 'custom', path: [key], message: `${key} is required in production` });
    }
  });

/**
 * @param {Record<string, string | undefined>} source
 * @returns {Env}
 */
export function loadEnv(source = process.env) {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment: ${details}`);
  }
  return parsed.data;
}
