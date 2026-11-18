import { describe, it, expect } from 'vitest';
import { normalizeNgPhone, displayNgPhone } from './phone.js';
import { waLink, general, bookingStart, confirmPatient, CLINIC_WA } from './whatsapp.js';
import { formatNaira, FEE_TBC } from './money.js';
import { periodOf, clinicDateKey, formatTime } from './time.js';

describe('normalizeNgPhone', () => {
  it.each([
    ['0803 640 4321', '+2348036404321'],
    ['08036404321', '+2348036404321'],
    ['8036404321', '+2348036404321'],
    ['+234 803 640 4321', '+2348036404321'],
    ['234-803-640-4321', '+2348036404321'],
    ['+2349012345678', '+2349012345678'],
  ])('accepts %s', (input, expected) => {
    expect(normalizeNgPhone(input)).toBe(expected);
  });

  it.each(['', '12345', '0203 640 4321', '+44 20 7946 0958', '080364043210', 'abc'])('rejects %s', (input) => {
    expect(normalizeNgPhone(input)).toBeNull();
  });

  it('formats for display', () => {
    expect(displayNgPhone('+2348036404321')).toBe('0803 640 4321');
  });
});

describe('whatsapp', () => {
  it('encodes the text and points at the clinic number', () => {
    const url = waLink('Hi & hello');
    expect(url).toBe(`https://wa.me/${CLINIC_WA}?text=Hi%20%26%20hello`);
  });

  it('builds the general link with the documented copy', () => {
    expect(general()).toContain(encodeURIComponent("I'd like to ask about a consultation."));
  });

  it('adds the concern only when one is given', () => {
    expect(bookingStart()).not.toContain('for%20');
    expect(bookingStart('Pain relief')).toContain('for%20Pain%20relief');
  });

  it('builds the patient-directed confirmation to the patient number', () => {
    const url = confirmPatient('+2348036404321', {
      firstName: 'Amaka',
      day: 'Tuesday',
      date: '1 December',
      time: '10:00',
      address: 'Oscar Apartments',
    });
    expect(url.startsWith('https://wa.me/2348036404321?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Hello Amaka'));
  });
});

describe('money', () => {
  it('formats naira with no kobo', () => {
    expect(formatNaira(15000)).toMatch(/15,000/);
    expect(formatNaira(15000)).toContain('₦');
  });

  it('never shows ₦0 for an unset price', () => {
    expect(formatNaira(null)).toBe(FEE_TBC);
    expect(formatNaira(undefined)).toBe(FEE_TBC);
  });
});

describe('time (Africa/Lagos)', () => {
  it('groups by period in clinic time', () => {
    // 10:30 WAT is 09:30 UTC
    expect(periodOf('2026-12-01T09:30:00Z')).toBe('morning');
    // 13:00 WAT
    expect(periodOf('2026-12-01T12:00:00Z')).toBe('afternoon');
    // 17:00 WAT
    expect(periodOf('2026-12-01T16:00:00Z')).toBe('evening');
  });

  it('uses the clinic date, not UTC, near midnight', () => {
    // 23:30 UTC on 30 Nov is 00:30 WAT on 1 Dec
    expect(clinicDateKey('2026-11-30T23:30:00Z')).toBe('2026-12-01');
  });

  it('displays times in WAT', () => {
    expect(formatTime('2026-12-01T09:00:00Z')).toBe('10:00');
  });
});
