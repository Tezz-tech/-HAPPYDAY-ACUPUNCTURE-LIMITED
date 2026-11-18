import { useRef } from 'react';

/**
 * A single-choice segmented control (radio group). Arrow keys move the selection (roving tab index).
 * @param {{
 *   label: string, name?: string, value: string,
 *   options: { value: string, label: string }[],
 *   onChange: (value: string) => void, className?: string
 * }} props
 */
export function SegmentedControl({ label, options, value, onChange, className = '' }) {
  const refs = useRef([]);

  function move(index, delta) {
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  function handleKey(event, index) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(index, 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(index, -1);
    }
  }

  return (
    <div role="radiogroup" aria-label={label} className={`segmented ${className}`.trim()}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className="segmented-item"
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKey(e, index)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
