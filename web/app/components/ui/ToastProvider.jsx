import { createContext, useCallback, useMemo, useRef, useState } from 'react';

/** @type {import('react').Context<{ show: (text: string) => void } | null>} */
export const ToastContext = createContext(null);

/**
 * Provides a single polite status message at the bottom of the screen (docs/05 Toast).
 * The region is always in the DOM so screen readers announce every message.
 * @param {{ children: import('react').ReactNode }} props
 */
export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [version, setVersion] = useState(0);
  const timer = useRef(null);

  const show = useCallback((text) => {
    setMessage(text);
    setVersion((v) => v + 1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), 4200);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="toast-region">
        {message ? (
          <div key={version} className="toast">
            {message}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}
