# Handover: running the clinic website

For the clinic owner. This covers the admin screens in plain language.

## Signing in
1. Go to `happydayacupuncture.com/admin` (the final address is still to be confirmed).
2. Enter your email and password. The first time, you are asked to choose a new password. Use at least 12 characters, and keep it somewhere safe.
3. After five wrong passwords, the account is locked for 15 minutes. That is deliberate.

## Today
This is the screen to open every morning. It shows today and tomorrow.
- **Needs checking** is at the top, in red. These patients have said they paid. Check your bank account, then press **Mark paid** (type the amount you received) or **Confirm**.
- Each booking has **Call**, **WhatsApp** (opens a message with the confirmation text), and **Send reminder** (a message for the day before).
- **Complete** when the visit is done. **No-show** if the patient did not come. **Cancel** if the booking should be cancelled.

## Bookings
Search by name or by the booking reference (it starts with HD-). Filter by status to see, for example, everything awaiting payment.

## Closures
To block a day off, enter the date and press **Close this day**. No times will be offered to patients on that day. To reopen it, press **Reopen**.

## Prices (owner only)
Change the price, deposit or duration of each appointment type. Leave a price empty if you do not want to show one. The site then says "Fee confirmed on booking". Changes apply immediately, and existing bookings keep the price they were made at.

## Settings (owner only)
- **Bank details:** the account patients transfer to. Double-check the account name and number after any change.
- **Payment mode:** transfer as a deposit, transfer in full, or pay at the clinic.
- **Hold for unpaid times:** how long a time is kept while the patient pays. The default is 3 hours.
- **Cancellation notice:** how many hours before the appointment patients can cancel online.
- **Hours are placeholders:** tick this until the real opening hours are confirmed. While it is ticked, the site says "Hours are confirmed on WhatsApp".

## Inquiries
Messages from the contact form appear here. Open the message, reply on WhatsApp, phone or email, and mark it replied.

## What the site does for you
- Holds a time while a patient pays, then releases it if they do not pay in time.
- Stops two people booking the same time.
- Keeps patients' details private and asks for their consent.

## What still needs your decision
See `TODO_CLIENT.md`. The launch-blocking items are the prices, the opening hours, the official email, the CAC number, the founder's bio and portrait, and the cancellation policy. Each one is a number or a sentence only you can give.
