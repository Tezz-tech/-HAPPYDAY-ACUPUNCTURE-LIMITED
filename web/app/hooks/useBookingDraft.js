import { useCallback, useEffect, useState } from 'react';

const KEY = 'happyday.booking.draft.v1';

/** The booking draft: everything the visitor has chosen so far. Stored without any health notes after submit. */
export const EMPTY_DRAFT = {
  concern: null,
  typeSlug: null,
  typeName: null,
  durationMinutes: null,
  start: null,
  details: { name: '', phone: '', email: '', firstVisit: true, notes: '', consent: false },
  booking: null,
};

function readDraft() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY_DRAFT, ...JSON.parse(raw) } : EMPTY_DRAFT;
  } catch {
    // Private windows and blocked storage: the flow still works, it just starts again on reload.
    return EMPTY_DRAFT;
  }
}

/**
 * Holds the booking draft and mirrors it to sessionStorage, so a reload mid-booking keeps the choices.
 * @returns {[typeof EMPTY_DRAFT, (patch: Partial<typeof EMPTY_DRAFT> | ((d: typeof EMPTY_DRAFT) => typeof EMPTY_DRAFT)) => void, () => void]}
 */
export function useBookingDraft() {
  const [draft, setDraft] = useState(readDraft);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(draft));
    } catch {
      /* storage unavailable: nothing to do */
    }
  }, [draft]);

  const update = useCallback((patch) => {
    setDraft((d) => (typeof patch === 'function' ? patch(d) : { ...d, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return [draft, update, reset];
}
