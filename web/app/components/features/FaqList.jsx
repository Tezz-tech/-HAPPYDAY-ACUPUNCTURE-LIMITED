import { Accordion } from '../ui/Accordion.jsx';

/**
 * FAQ list from /content/faqs.json. Pass the subset you need. Answers that depend on clinic practice
 * are flagged `confirm` in the content and remain on the list for the client to check.
 * @param {{ items: { id: string, q: string, a: string }[], label: string, headingLevel?: 2 | 3 | 4 }} props
 */
export function FaqList({ items, label, headingLevel = 3 }) {
  return <Accordion items={items} label={label} headingLevel={headingLevel} />;
}
