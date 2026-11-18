/**
 * WhatsApp link builders (docs/04 §WhatsApp). Every wa.me link in the product is built here.
 */
import { waDigits } from './phone.js';

/** The clinic's WhatsApp number, E.164 without the plus sign. */
export const CLINIC_WA = '2348036404321';

/**
 * @param {string} text
 * @param {string} [number] digits only; defaults to the clinic
 * @returns {string}
 */
export function waLink(text, number = CLINIC_WA) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Visitor to clinic: general question. */
export function general() {
  return waLink("Hello Happyday Acupuncture, I'd like to ask about a consultation.");
}

/** Visitor to clinic: question about one treatment area. */
export function aboutTreatment(name) {
  return waLink(`Hello, I'd like to ask about acupuncture for ${name}.`);
}

/**
 * Visitor to clinic: start of a booking, optionally for a concern.
 * @param {string} [concern] treatment name
 */
export function bookingStart(concern) {
  const about = concern ? ` for ${concern}` : '';
  return waLink(`Hello, I'd like to book an appointment${about}. What times do you have?`);
}

/**
 * Visitor to clinic: sending a transfer receipt.
 * @param {{ ref: string, date: string, time: string }} booking
 */
export function receipt(booking) {
  return waLink(
    `Hello, here is my transfer receipt for booking ${booking.ref} on ${booking.date} at ${booking.time}.`,
  );
}

/**
 * Visitor to clinic: wants to change a booking.
 * @param {{ ref: string, date: string, time: string }} booking
 */
export function changeBooking(booking) {
  return waLink(`Hello, I need to change my booking ${booking.ref} (${booking.date}, ${booking.time}).`);
}

/**
 * Clinic to patient (admin click-to-send). The number is the patient's E.164.
 * @param {string} e164
 * @param {string} text
 */
export function toPatient(e164, text) {
  return waLink(text, waDigits(e164));
}

/**
 * Admin click-to-send: appointment confirmation to the patient.
 * @param {string} e164 the patient's number
 * @param {{ firstName: string, day: string, date: string, time: string, address: string }} b
 */
export function confirmPatient(e164, b) {
  return toPatient(
    e164,
    `Hello ${b.firstName}, your appointment at Happyday Acupuncture is confirmed for ${b.day}, ${b.date} at ${b.time}. Address: ${b.address}. Reply here if you need anything.`,
  );
}

/**
 * Admin click-to-send: reminder for tomorrow's appointment.
 * @param {string} e164 the patient's number
 * @param {{ firstName: string, date: string, time: string }} b
 */
export function remindPatient(e164, b) {
  return toPatient(
    e164,
    `Hello ${b.firstName}, a reminder of your acupuncture appointment tomorrow, ${b.date}, at ${b.time}. Please wear loose clothing and eat a light meal beforehand. See you soon.`,
  );
}
