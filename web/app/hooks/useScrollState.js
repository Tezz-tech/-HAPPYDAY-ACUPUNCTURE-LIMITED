import { useEffect, useState } from 'react';

/**
 * Scroll position summary for the header and mobile action bar.
 * `scrolled` turns true after 40 px. `hidden` is true while scrolling down quickly past 200 px,
 * and returns as soon as the visitor scrolls up (docs/02 §6).
 * @returns {{ scrolled: boolean, hidden: boolean, pastHero: boolean }}
 */
export function useScrollState() {
  const [state, setState] = useState({ scrolled: false, hidden: false, pastHero: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      setState((prev) => {
        const scrolled = y > 40;
        const pastHero = y > window.innerHeight * 0.8;
        let hidden = prev.hidden;
        if (y < 200) hidden = false;
        else if (delta > 8) hidden = true;
        else if (delta < -4) hidden = false;
        if (prev.scrolled === scrolled && prev.hidden === hidden && prev.pastHero === pastHero) return prev;
        return { scrolled, hidden, pastHero };
      });
      lastY = y;
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return state;
}
