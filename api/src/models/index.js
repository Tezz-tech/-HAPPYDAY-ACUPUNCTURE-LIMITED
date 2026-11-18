import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_MODES, INQUIRY_TOPICS, REPLY_VIA, BOOKING_SOURCE } from '@happyday/shared/constants';

const { Schema } = mongoose;
const opts = { timestamps: true };

/** Treatment and consultation types, seeded from content/clinic.json and editable in admin. */
const AppointmentTypeSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    summary: { type: String, default: '' },
    durationMinutes: { type: Number, required: true },
    priceNaira: { type: Number, default: null },
    depositNaira: { type: Number, default: null },
    isFirstVisit: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  opts,
);

/** Singleton with the clinic's weekly hours and scheduling rules (key: 'default'). */
const AvailabilitySchema = new Schema(
  {
    key: { type: String, default: 'default', unique: true },
    timezone: { type: String, default: 'Africa/Lagos' },
    weekly: { type: Schema.Types.Mixed, default: {} },
    breaks: { type: [{ day: String, start: String, end: String }], default: [] },
    slotIntervalMinutes: { type: Number, default: 15 },
    bufferMinutes: { type: Number, default: 10 },
    minNoticeHours: { type: Number, default: 3 },
    maxAdvanceDays: { type: Number, default: 60 },
    capacityPerSlot: { type: Number, default: 1 },
  },
  opts,
);

/** A closed date, or a date with custom hours (YYYY-MM-DD, unique). */
const ExceptionSchema = new Schema(
  {
    date: { type: String, required: true, unique: true },
    closed: { type: Boolean, default: false },
    ranges: { type: [{ start: String, end: String }], default: undefined },
    note: { type: String, default: '' },
  },
  opts,
);

/** Booking. Times are stored in UTC. Only the hash of the manage token is kept. */
const BookingSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true },
    status: { type: String, enum: BOOKING_STATUS, required: true },
    holdsSlot: { type: Boolean, default: true },
    appointmentType: {
      slug: String,
      name: String,
      durationMinutes: Number,
      priceNaira: { type: Number, default: null },
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    seat: { type: Number, required: true },
    concern: { type: String, default: 'general' },
    notes: { type: String, default: '', maxlength: 500 },
    patient: {
      name: { type: String, required: true },
      phoneE164: { type: String, required: true },
      email: { type: String, default: null },
      firstVisit: { type: Boolean, default: true },
    },
    consent: {
      given: { type: Boolean, required: true },
      at: { type: Date, required: true },
      textVersion: { type: String, required: true },
    },
    payment: {
      mode: { type: String, enum: PAYMENT_MODES, required: true },
      amountDue: { type: Number, default: null },
      amountPaid: { type: Number, default: null },
      method: { type: String, default: null },
      receivedAt: { type: Date, default: null },
      submittedAt: { type: Date, default: null },
      note: { type: String, default: '' },
    },
    manageTokenHash: { type: String, required: true },
    holdExpiresAt: { type: Date, default: null },
    reminderEmailSentAt: { type: Date, default: null },
    reminderWhatsappAt: { type: Date, default: null },
    cancelledReason: { type: String, default: '' },
    source: { type: String, enum: BOOKING_SOURCE, default: 'web' },
  },
  opts,
);
BookingSchema.index({ start: 1 });
BookingSchema.index({ status: 1, start: 1 });
BookingSchema.index({ 'patient.phoneE164': 1 });

/**
 * Seat locks: one document per 15-minute bucket per seat. The partial unique index is what makes double
 * booking impossible (docs/04). Released locks have holds: false, so they stop counting.
 */
const SeatLockSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, required: true },
    bucket: { type: Date, required: true },
    seat: { type: Number, required: true },
    holds: { type: Boolean, default: true },
  },
  { timestamps: false },
);
SeatLockSchema.index({ bucket: 1, seat: 1 }, { unique: true, partialFilterExpression: { holds: true } });
SeatLockSchema.index({ bookingId: 1 });

const BookingEventSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, required: true, index: true },
    at: { type: Date, default: Date.now },
    actor: { type: String, required: true },
    from: { type: String, default: null },
    to: { type: String, required: true },
    note: { type: String, default: '' },
  },
  { timestamps: false },
);

/** Clinic settings singleton (key: 'default'). Bank details live here, editable in admin. */
const SettingsSchema = new Schema(
  {
    key: { type: String, default: 'default', unique: true },
    bank: {
      bankName: String,
      accountName: String,
      accountNumber: String,
    },
    paymentMode: { type: String, enum: PAYMENT_MODES, default: 'transfer_deposit' },
    unpaidHoldMinutes: { type: Number, default: 180 },
    notifyEmails: { type: [String], default: [] },
    whatsappE164: { type: String, default: null },
    cancellationNoticeHours: { type: Number, default: 24 },
    hoursArePlaceholder: { type: Boolean, default: true },
  },
  opts,
);

const InquirySchema = new Schema(
  {
    name: { type: String, required: true },
    phoneE164: { type: String, required: true },
    email: { type: String, default: null },
    topic: { type: String, enum: INQUIRY_TOPICS, default: 'other' },
    message: { type: String, required: true, maxlength: 1000 },
    replyVia: { type: String, enum: REPLY_VIA, default: 'whatsapp' },
    status: { type: String, enum: ['new', 'replied', 'closed'], default: 'new' },
    consent: {
      given: { type: Boolean, required: true },
      at: { type: Date, required: true },
      textVersion: { type: String, required: true },
    },
  },
  opts,
);

const TestimonialSchema = new Schema(
  {
    quote: { type: String, required: true },
    displayName: { type: String, required: true },
    concern: { type: String, default: '' },
    consentConfirmed: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  opts,
);

/** Models are registered once, so re-importing in tests is safe. */
const model = (name, schema) => mongoose.models[name] ?? mongoose.model(name, schema);

export const AppointmentType = model('AppointmentType', AppointmentTypeSchema);
export const Availability = model('Availability', AvailabilitySchema);
export const Exception = model('Exception', ExceptionSchema);
export const Booking = model('Booking', BookingSchema);
export const SeatLock = model('SeatLock', SeatLockSchema);
export const BookingEvent = model('BookingEvent', BookingEventSchema);
export const Settings = model('Settings', SettingsSchema);
export const Inquiry = model('Inquiry', InquirySchema);
export const Testimonial = model('Testimonial', TestimonialSchema);
