import { useState } from 'react';
import { Icon } from './Icon.jsx';

/**
 * FAQ accordion (docs/02 §7): hairline rows, a plus that turns into a cross, and a height animation done in CSS
 * (grid-template-rows, so no measuring is needed). Only one item is open at a time.
 * @param {{ items: { id: string, q: string, a: string }[], label: string, headingLevel?: 2 | 3 | 4 }} props
 */
export function Accordion({ items, label, headingLevel = 3 }) {
  const [openId, setOpenId] = useState(null);
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
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className="accordion-panel"
              data-open={isOpen ? 'true' : 'false'}
            >
              <div className="accordion-panel-inner">
                <p className="accordion-answer">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
