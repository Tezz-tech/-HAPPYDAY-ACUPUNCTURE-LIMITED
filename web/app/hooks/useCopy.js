import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copies text to the clipboard. `last` holds the value copied most recently, for 1.5 seconds, so the button can show a check.
 * Clipboard access can be refused, in which case the visitor still sees the value on screen.
 * @returns {{ copy: (value: string) => Promise<void>, last: string | null, message: string }}
 */
export function useCopy() {
  const [last, setLast] = useState(null);
  const [message, setMessage] = useState('');
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setLast(value);
      setMessage('Copied');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setLast(null);
        setMessage('');
      }, 1500);
    } catch {
      setMessage('Could not copy. Please select the text instead.');
    }
  }, []);

  return { copy, last, message };
}
