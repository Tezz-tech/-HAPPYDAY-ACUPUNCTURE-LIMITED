import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon } from './Icon.jsx';

/**
 * FAQ accordion (docs/02 §7): hairline rows, a plus that turns into a cross, and a height animation.
 * Only one item is open at a time.
 * @param {{ items: { id: string, q: string, a: string }[], label: string, headingLevel?: 2 | 3 | 4 }} props
 */
export function Accordion({ items, label, headingLevel = 3 }) {
  const [openId, setOpenId] = useState(null);
  const reduced = useReducedMotion();
  const Heading = `h${headingLevel}`;

  return (
    <ul className="accordion" aria-label={label}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `faq-panel-${item.id}`;
        const triggerId = `faq-trigger-${item.id}`;
        return (
          <li key={item.id} className="accordion-item">
            <Heading className="accordion-heading">
              <button
                id={triggerId}
                type="button"
                className="accordion-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span>{item.q}</span>
                <span className="accordion-plus" aria-hidden="true">
                  <Icon name="plus" size={20} />
                </span>
              </button>
            </Heading>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className="accordion-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={
                    reduced
                      ? { duration: 0.2 }
                      : { duration: 0.42, ease: [0.16, 1, 0.3, 1] }
                  }
                >
                  <p className="accordion-answer">{item.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
