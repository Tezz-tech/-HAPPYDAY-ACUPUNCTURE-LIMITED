import { useEffect, useId, useRef } from 'react';
import { Icon } from './Icon.jsx';

/**
 * A modal sheet built on the native <dialog>, which gives a focus trap, Esc to close,
 * and focus return for free (docs/02 §7).
 * @param {{
 *   open: boolean, onClose?: () => void, title: string, children: import('react').ReactNode
 * }} props
 */
export function Sheet({ open, onClose, title, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !onClose) return undefined;
    const handle = () => onClose();
    dialog.addEventListener('close', handle);
    return () => dialog.removeEventListener('close', handle);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="sheet-inner">
        <header className="sheet-head">
          <h2 id={titleId} className="type-display-s">
            {title}
          </h2>
          <button
            type="button"
            className="btn btn-ghost btn-icon-only"
            aria-label="Close"
            onClick={() => ref.current?.close()}
          >
            <Icon name="close" size={22} />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </dialog>
  );
}
