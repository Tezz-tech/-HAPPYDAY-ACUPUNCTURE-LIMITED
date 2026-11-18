import { CLINIC_WA, general, aboutTreatment, bookingStart } from '@happyday/shared/whatsapp';
import { clinic } from '../content/index.js';

export { SITE_URL } from './site-url.js';

export const PHONE_TEL = `tel:${clinic.contact.phoneE164}`;
export const PHONE_DISPLAY = clinic.contact.phoneDisplay;
export const ADDRESS = clinic.address.display;
export const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(clinic.address.display)}&output=embed`;
export const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address.display)}`;
export const HOURS_PLACEHOLDER = clinic.hours.isPlaceholder;
export const DISCLAIMER =
  'Happyday Acupuncture Limited provides acupuncture and Traditional Chinese Medicine as complementary care. It does not replace diagnosis or treatment by a medical doctor.';
export const CARE_NOTE =
  "Acupuncture works alongside your doctor's care. Please keep taking any prescribed medication unless your doctor advises otherwise.";
export const STROKE_NOTE =
  'A stroke is a medical emergency. Go to hospital immediately. Acupuncture can support rehabilitation afterwards.';

export const WA_LINKS = {
  general: general(),
  book: bookingStart(),
  about: (name) => aboutTreatment(name),
};

export { CLINIC_WA };
