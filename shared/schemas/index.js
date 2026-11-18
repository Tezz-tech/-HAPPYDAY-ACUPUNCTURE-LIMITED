import { z } from 'zod';
import { normalizeNgPhone } from '../phone.js';

/** A Nigerian phone number, accepted in any common format and normalised to E.164. */
export const phoneInput = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const e164 = normalizeNgPhone(value);
    if (!e164) {
      ctx.addIssue({ code: 'custom', message: 'Enter a Nigerian mobile number, e.g. 0803 640 4321' });
      return z.NEVER;
    }
    return e164;
  });

export { normalizeNgPhone };
