/**
 * Naira formatting. Prices can be null (fee not yet confirmed); never show ₦0 for those.
 */
const formatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

/** Shown in place of a price that has not been set. */
export const FEE_TBC = 'Fee confirmed on booking';

/**
 * @param {number | null | undefined} naira
 * @returns {string} e.g. ₦15,000, or FEE_TBC when the amount is unset
 */
export function formatNaira(naira) {
  if (naira === null || naira === undefined || Number.isNaN(naira)) return FEE_TBC;
  return formatter.format(naira);
}
