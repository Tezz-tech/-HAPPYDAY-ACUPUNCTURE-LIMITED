/** The four steps of a first visit (docs/03 home §4). Plain text in a numbered list, no pinning or animation. */
export const VISIT_STEPS = [
  {
    title: 'Talk.',
    body: "We start with your story: what's wrong, how long it's been going on, what you've already tried, and what you want to get back to.",
  },
  {
    title: 'Look and feel.',
    body: 'A traditional tongue and pulse assessment. It takes a few minutes and does not hurt.',
  },
  {
    title: 'Treat.',
    body: 'Hair-fine, sterile needles are placed at chosen points. You rest for 20 to 30 minutes. Most people find it deeply relaxing.',
  },
  {
    title: 'Plan.',
    body: 'You leave knowing what we found, how many sessions we suggest, and what you can do at home.',
  },
];

/** @param {{ steps?: typeof VISIT_STEPS }} props */
export function VisitSteps({ steps = VISIT_STEPS }) {
  return (
    <ol className="visit-steps">
      {steps.map((s, i) => (
        <li className="visit-step" key={s.title} data-reveal style={{ '--i': i }}>
          <span className="visit-step-n">Step {i + 1}</span>
          <h3 className="type-display-s visit-step-title">{s.title}</h3>
          <p className="type-body visit-step-body">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
