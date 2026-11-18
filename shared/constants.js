/** Shared enums and constants (docs/04, docs/05). Kept in one place so web and api agree. */

/** Booking statuses (docs/04 state machine). */
export const BOOKING_STATUS = /** @type {const} */ ([
  'awaiting_payment',
  'payment_submitted',
  'confirmed',
  'completed',
  'cancelled',
  'expired',
  'no_show',
]);

/** Statuses that hold a seat (docs/04 `holdsSlot`). */
export const HOLDING_STATUSES = /** @type {const} */ (['awaiting_payment', 'payment_submitted', 'confirmed']);

/** Payment modes (docs/04). */
export const PAYMENT_MODES = /** @type {const} */ (['pay_at_clinic', 'transfer_deposit', 'transfer_full']);

/** Inquiry topics (docs/03 Contact). */
export const INQUIRY_TOPICS = /** @type {const} */ (['treatment', 'booking', 'other']);

/** Preferred reply method (docs/03 Contact). */
export const REPLY_VIA = /** @type {const} */ (['whatsapp', 'call', 'email']);

/** Booking source. */
export const BOOKING_SOURCE = /** @type {const} */ (['web', 'admin', 'whatsapp']);

/** Admin roles. */
export const ROLES = /** @type {const} */ (['owner', 'staff']);

/** Concern value when the visitor is not sure what is wrong (docs/03 booking step 1). */
export const CONCERN_NOT_SURE = 'general';

/** Consent text version stored with each booking or inquiry (NDPA 2023). */
export const CONSENT_TEXT_VERSION = '2026-11-01';
