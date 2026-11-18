/**
 * The four steps of a first visit (docs/03 home §4). Phase 3 pins these horizontally on desktop.
 * Here they read as a vertical timeline on every width.
 */
export const VISIT_STEPS = [
  {
    n: 1,
    title: 'Talk.',
    body: "We start with your story: what's wrong, how long it's been going on, what you've already tried, and what you want to get back to.",
  },
  {
    n: 2,
    title: 'Look and feel.',
    body: 'A traditional tongue and pulse assessment. It takes a few minutes and does not hurt.',
  },
  {
    n: 3,
    title: 'Treat.',
    body: 'Hair-fine, sterile needles are placed at chosen points. You rest for 20 to 30 minutes. Most people find it deeply relaxing.',
  },
  {
    n: 4,
    title: 'Plan.',
    body: 'You leave knowing what we found, how many sessions we suggest, and what you can do at home.',
  },
];

/** @param {{ compact?: boolean }} props */
export function VisitSteps({ compact = false }) {
  return (
    <ol className={`visit-steps ${compact ? 'is-compact' : ''}`.trim()}>
      {VISIT_STEPS.map((step) => (
        <li key={step.n} className="visit-step">
          <span className="visit-step-point" aria-hidden="true" />
          <span className="label visit-step-n">Step {step.n}</span>
          <h3 className="type-display-s">{step.title}</h3>
          <p className="type-body">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
