// Build-time content imports (docs/05). Facts come from /content, never hard-coded in pages.
import clinic from '../../../content/clinic.json';
import treatmentsFile from '../../../content/treatments.json';
import bodyMap from '../../../content/body-map.json';
import faqsFile from '../../../content/faqs.json';

/** @type {Array<any>} */
export const treatments = [...treatmentsFile.treatments].sort((a, b) => a.order - b.order);

/** @param {string} slug */
export function getTreatment(slug) {
  return treatments.find((t) => t.slug === slug) ?? null;
}

/** Treatments after the given one, wrapping round (used for "Other treatment areas"). */
export function nextTreatments(slug, count = 3) {
  const index = treatments.findIndex((t) => t.slug === slug);
  return Array.from({ length: count }, (_, i) => treatments[(index + 1 + i) % treatments.length]);
}

export const faqs = faqsFile.faqs;
export const homeFaqs = faqs.filter((f) => f.home);
export const bodyRegions = bodyMap.regions;
export const bodyMapCopy = { prompt: bodyMap.prompt, subprompt: bodyMap.subprompt, notSure: bodyMap.notSure };

export { clinic };
