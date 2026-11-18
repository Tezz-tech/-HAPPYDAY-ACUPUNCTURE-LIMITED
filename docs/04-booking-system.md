# 04: Booking system

## Goals
1. A patient can book a real slot on a phone in under 90 seconds.
2. Two people can **never** hold the same seat at the same time.
3. Bank-transfer payment works without a payment gateway, while the system is ready to add Paystack later.
4. WhatsApp is a first-class path at every step, not a fallback.
5. The clinic can run everything from `/admin` on a phone.

## Statuses (state machine)
```
                 ┌────────────── expire (cron, hold elapsed) ─────────────┐
                 │                                                        ▼
[create] → awaiting_payment ──patient "I've paid"──▶ payment_submitted ──admin──▶ confirmed ──▶ completed
                 │                     │                                  │   └──▶ no_show
                 │                     └────────────admin────────────────▶│
                 └──admin/patient cancel──▶ cancelled ◀──admin/patient────┘
pay_at_clinic mode: [create] → confirmed
```
- `holdsSlot` = true for `awaiting_payment`, `payment_submitted` and `confirmed`. Set it false on cancelled, expired and no_show. Completed keeps the record but releases the seat (the time has passed anyway).
- `payment_submitted` **never expires automatically**. The patient says they paid, so a human must check. Admin gets a "needs checking" badge.
- `awaiting_payment` expires after `payments.unpaidHoldMinutes` (default 180) or 2 hours before the start time, whichever comes first. A cron job runs every 5 minutes; slot queries also ignore stale holds defensively.
- Every transition writes a `BookingEvent` (who, when, from → to, note).

## Slot engine (`shared/slots.js`, pure functions, heavily unit-tested)
Input: date range, appointment type (duration), weekly hours, exceptions (closed dates and custom hours), breaks, existing seat locks, `slotIntervalMinutes`, `bufferMinutes`, `minNoticeHours`, `maxAdvanceDays`, `capacityPerSlot`, and "now".

Algorithm per day (in Africa/Lagos):
1. Get the open intervals for the day: weekly hours, overridden by any exception for that date, minus breaks.
2. Generate candidate starts every `slotIntervalMinutes` where `start + duration ≤ interval end`.
3. Drop candidates before `now + minNoticeHours` and after `today + maxAdvanceDays`.
4. Convert each candidate to the same 15-minute **buckets** the seat locks use (start through `start + duration + buffer`, rounded up; see below). Keep the candidate only if **some seat `s` in 1..capacity has none of those buckets locked**. Availability and lock acquisition then use exactly the same rule, so a shown slot can always be booked unless someone else takes it first.
5. Return the starts as UTC ISO strings, grouped by local date, with `period: morning|afternoon|evening` (before 12:00, 12:00–16:59, 17:00 and after).

Edge cases to test: a day with no hours; an exception closing a normally open day; an exception opening a normally closed day; a break splitting the day; a booking that ends exactly when another starts (allowed, with the buffer); minNotice crossing midnight; maxAdvance on the boundary; capacity 1 and 3; a stale awaiting_payment lock (ignored); and a duration longer than the interval (no slots).

## Preventing double booking (the seat-lock pattern)
Overlap can't be enforced with a simple unique index, because different durations overlap without sharing a start time. So:
- The `SeatLock` collection has `{ bookingId, seat (1..capacity), start, end, holds: true }`.
- Time is discretised into **15-minute buckets**. A booking from 10:00 to 11:15 inserts one lock document per bucket per seat: `{ bucket: '2026-12-01T09:00Z', seat: 1 }`, and so on. The duration plus the buffer is rounded up to whole buckets.
- A **unique index on `{ bucket: 1, seat: 1 }`** with `partialFilterExpression: { holds: true }`.
- Create a booking inside a **MongoDB transaction** (Atlas and replica sets support them; mongodb-memory-server needs `MongoMemoryReplSet` for tests):
  1. For `seat` from 1 to capacity: try `insertMany(locksForSeat, { ordered: true, session })`. On a duplicate-key error (E11000), abort that seat's attempt and try the next seat.
  2. If no seat succeeds, abort the transaction and return `409 SLOT_TAKEN` with fresh slots for that day, so the UI can offer alternatives.
  3. If a seat succeeds, insert the Booking with `seat`, then commit.
- On release (cancel, expire or no-show), set `holds: false` on that booking's locks (or delete them) inside the same transaction as the status change.
- Rescheduling = acquire the new locks first, then release the old ones, in one transaction.
- **Tests:** fire 20 concurrent create requests at one slot with capacity 1. Exactly 1 succeeds and 19 get 409. Repeat with capacity 3, where exactly 3 succeed.

## Booking reference and manage links
- The ref is `HD-` plus 5 characters from the Crockford base32 alphabet without 0/O/1/I/L (e.g. `HD-7K3Q9`). It's unique-indexed; retry on collision.
- The manage token is 32 random bytes in base64url. **Store only a SHA-256 hash.** The link is `/booking/HD-7K3Q9?t=<token>`, valid until 24 hours after the appointment. From it, the patient can view the booking, cancel (if beyond `cancellationNoticeHours`) or reschedule (same rules). Inside the notice window, the page shows "Please WhatsApp us to change this booking."

## Payment by bank transfer (v1)
- Bank details are stored in `Settings` (seeded from `content/clinic.json`) and editable in admin. Show them on step 5 and in the confirmation email.
- The amount: `depositNaira` if the mode is `transfer_deposit`, or `priceNaira` if it's `transfer_full`. If the price is null in a transfer mode, fall back to "We'll confirm the fee on WhatsApp", the booking is created as `awaiting_payment` with no amount, and admin is flagged.
- "I've made the transfer" → `payment_submitted` and the patient sees "Thanks. We'll check and confirm shortly (usually within [x] hours during opening times)." Admin gets an email and a dashboard badge.
- Admin "Mark as paid" → `confirmed`, records the amount, method (`transfer|cash|pos|other`), received date and note, then sends a confirmation email if there is an email address, plus a one-tap WhatsApp confirmation link for admin (see below).
- Optional receipt upload is out of scope for v1. Patients send receipts on WhatsApp, which they already do naturally.

## Paystack (phase 7, optional; build the seams now)
- A `PaymentProvider` interface in `api/src/payments/` with a `bankTransfer` implementation now and a `paystack` stub.
- When enabled: step 5 shows "Pay now with card, transfer or USSD (Paystack)" as the primary option and manual transfer as secondary. Initialise the transaction server-side, verify it via the **webhook** (HMAC-SHA512 signature check with the secret key) and a server-side verify call. Never trust the client redirect alone. Make the webhook handler idempotent by transaction reference.

## WhatsApp integration (no API needed for v1)
`shared/whatsapp.js` exports builders that return `https://wa.me/2348036404321?text=...`:
- `general()`: "Hello Happyday Acupuncture, I'd like to ask about a consultation."
- `aboutTreatment(name)`: "Hello, I'd like to ask about acupuncture for {name}."
- `bookingStart(concern?)`: "Hello, I'd like to book an appointment{ for {concern}}. What times do you have?"
- `receipt(booking)`: "Hello, here is my transfer receipt for booking {ref} on {date} at {time}."
- `changeBooking(booking)`: "Hello, I need to change my booking {ref} ({date}, {time})."

Admin-side "click to send" links go to the **patient's** number (`wa.me/<patient E.164 without +>`):
- `confirmPatient(b)`: "Hello {firstName}, your appointment at Happyday Acupuncture is confirmed for {day, date} at {time}. Address: {address}. Reply here if you need anything."
- `remindPatient(b)`: "Hello {firstName}, a reminder of your acupuncture appointment tomorrow, {date}, at {time}. Please wear loose clothing and eat a light meal beforehand. See you soon."
- `paymentReminder(b)`.

The admin "Today" and "Tomorrow" views show a **Send reminder** button per booking that opens WhatsApp with that text, a zero-cost "automation" that still feels personal. Track `reminderSentAt` when it's clicked.

Phase 7 (optional): the WhatsApp Business Cloud API, with approved templates for automated confirmations and reminders. It needs Meta Business verification. Keep a `Notifier` interface so it plugs in.

## Notifications (v1)
- Email via SMTP (Nodemailer). The provider is configurable (Resend SMTP, Zoho or Brevo). Templates are simple branded HTML: logo, paper background and Gambetta headings, with a system serif fallback since mail clients won't load web fonts. Every email has a plain-text part.
  - To the patient (if an email was given): booking received / awaiting payment (with bank details), confirmed, rescheduled, cancelled, and a 24-hour reminder.
  - To the clinic: new booking, payment submitted, cancellation, new inquiry.
- Every email includes the WhatsApp link and the address. Include an `.ics` attachment for confirmed bookings.
- The 24-hour reminder runs on a cron every 15 minutes: it finds confirmed bookings starting in 23–25 hours with no `reminderEmailSentAt`.

## Admin dashboard `/admin` (mobile-first)
Auth: a single owner account, plus an optional `staff` role. The owner is seeded from env (`ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`) and forced to change the password on first login. Sessions use httpOnly cookies. Lock the account for 15 minutes after 5 failed logins.

Screens:
1. **Today** (home): the timeline of today's and tomorrow's bookings, with "Needs checking" (payment_submitted) at the top in a cinnabar-bordered group. Each row has the time, name, type, concern and status, plus quick actions: Call · WhatsApp · Send reminder · Mark paid · Complete · No-show.
2. **Bookings**: a table/list with filters (status, date range, type, search by name, phone or ref) and a CSV export.
3. **Booking detail**: all fields, the event history, internal notes, and actions (confirm, mark paid, reschedule with the slot picker, cancel with a reason, and a status override with confirmation).
4. **New booking** (for phone and WhatsApp bookings): the same slot engine, with an admin override that allows booking outside hours with a warning.
5. **Availability**: a weekly hours editor (multiple ranges per day), breaks, closures/exceptions on a calendar, capacity, buffer, notice and max advance. A live preview of next week's slots.
6. **Appointment types**: name, summary, duration, price, deposit, active and order.
7. **Inquiries**: an inbox with statuses (new, replied, closed) and reply shortcuts (WhatsApp, call, email).
8. **Testimonials**: quote, display name, concern, `consentConfirmed` (required to publish), published, and order. The home §8 renders only published testimonials with consent.
9. **Settings**: bank details, payment mode, hold minutes, notification email(s), WhatsApp number, cancellation notice, and the "hours are placeholder" flag.

The admin UI uses the same tokens but is denser: Switzer only, `small`/`body` sizes, hairline tables and no decorative motion.

## Analytics events (privacy-friendly: Plausible or Umami)
`booking_step_view {step}`, `booking_slot_selected`, `booking_created {mode}`, `booking_payment_submitted`, `whatsapp_click {context}`, `call_click`, `bodymap_region_select {region}`, `inquiry_submitted`. Never send names, phones or concerns' free text.
