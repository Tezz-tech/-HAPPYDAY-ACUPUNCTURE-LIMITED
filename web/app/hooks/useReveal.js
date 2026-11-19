import { useEffect } from 'react';

/**
 * Makes [data-reveal] elements rise into place as they scroll into view. Hidden state is applied only
 * once JavaScript runs (the js-reveal class on <html>), so the prerendered page is fully visible without it.
 * Reduced motion skips the observer: everything is shown straight away.
 * @param {string} key a value that changes when the route changes, so new content is observed
 */
export function useReveal(key) {
  useEffect(() => {
    const root = document.documentElement;
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return undefined;
    }

    root.classList.add('js-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px', threshold: 0.08 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [key]);
}
