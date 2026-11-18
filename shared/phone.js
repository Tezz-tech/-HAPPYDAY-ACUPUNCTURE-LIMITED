/**
 * Nigerian phone numbers. Accepts 0803…, 803…, 234803…, +234 803… and common spacing or dashes.
 * Returns E.164 (+2348036404321) or null. Mobile prefixes start with 7, 8 or 9 after the country code.
 */

/**
 * @param {string | null | undefined} input
 * @returns {string | null} E.164 number, or null when the input is not a valid Nigerian mobile
 */
export function normalizeNgPhone(input) {
  if (!input) return null;
  let digits = String(input).replace(/[\s\-().]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('234')) digits = digits.slice(3);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  if (!/^[789]\d{9}$/.test(digits)) return null;
  return `+234${digits}`;
}

/**
 * @param {string} e164
 * @returns {string} national display format, e.g. 0803 640 4321
 */
export function displayNgPhone(e164) {
  const national = e164.replace(/^\+234/, '0');
  return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`;
}

/**
 * @param {string} e164
 * @returns {string} digits only, for wa.me links (no plus sign)
 */
export function waDigits(e164) {
  return e164.replace(/\D/g, '');
}
