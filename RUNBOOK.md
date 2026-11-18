# Runbook

For whoever operates the site. The owner's day-to-day guide is HANDOVER.md.

## Backups
The database is the only thing that cannot be rebuilt.
- **Atlas (paid tier):** automated backups are on by default. Check the cluster's backup tab weekly.
- **Atlas free tier (M0):** schedule a nightly `mongodump` into encrypted storage (a GitHub Action or a cron job on the VPS). Keep 30 days.
- The seed does not restore bookings. It only rebuilds the clinic's content, hours, prices and settings.

## Restore (test once before launch)
1. Create a new empty database on the cluster, for example `happyday_restore`.
2. `mongorestore --uri "<atlas uri>" --nsFrom 'happyday.*' --nsTo 'happyday_restore.*' <dump folder>`
3. Point a staging API at `happyday_restore` and check a few bookings, the events and the settings.
4. Only then, if production must be restored, stop the API, restore into `happyday`, and start it again.

## Rotate the admin password
- Signed-in owner: Settings is not where this lives. Use the password change screen on first sign-in. For a forgotten password, follow the next step.
- Forgotten password: an operator sets a new hash in the database. Run `npm run seed -w api` is not enough, because the seed only creates the owner when none exists. Use a one-off script that calls `hashPassword` from `api/src/services/auth.js` and updates the `users` document, setting `mustChangePassword: true`. Do not store the new password in a file or in chat.

## Change the bank details
Owner: Admin, Settings, bank section. The change applies to new bookings at once. Existing awaiting-payment bookings keep the details they were shown.

## Add or remove a closure
Admin, Closures. Enter the date and save. The date disappears from the public slot list immediately. Reopen it with the same screen.

## Rotate the session secret
Changing `SESSION_SECRET` signs everyone out. Do this if a secret leaks, and tell the owner first.

## Check the hold expiry job
The API runs the job every five minutes. Its log line is `expired unpaid holds` (info) or `expireHolds failed` (error). A repeated failure means the database is unreachable. Check Atlas first.

## Incidents
- **Site down:** check `https://api.<domain>/api/v1/health`. If it returns 503, the database is unreachable. If it does not respond, restart the API host.
- **Double booking reported:** this should be impossible. Check the seat locks for the slot in the database and the booking events, and record the refs. Escalate to the developer.
- **Email not arriving:** check SPF, DKIM and DMARC on the domain, and the SMTP provider's dashboard. Emails are not sent until the notification work is built.
