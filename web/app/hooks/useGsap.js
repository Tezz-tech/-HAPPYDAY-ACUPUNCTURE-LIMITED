import { useEffect, useState } from 'react';

/**
 * Loads GSAP after first paint and hands back the module once it is ready (null until then).
 * Components run their animation inside gsap.context(), which reverts on unmount.
 * @returns {typeof import('../lib/gsap-bundle.js') | null}
 */
export function useGsap() {
  const [mod, setMod] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      import('../lib/gsap-bundle.js').then((m) => {
        if (!cancelled) setMod(m);
      });
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200));
    const handle = idle(load);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback && typeof handle === 'number') window.cancelIdleCallback(handle);
    };
  }, []);
  return mod;
}
