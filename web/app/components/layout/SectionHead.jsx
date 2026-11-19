/**
 * A section heading: a display title with an optional lead. `dark` switches to the paper-on-green palette.
 * @param {{ id: string, title: import('react').ReactNode, lead?: string, dark?: boolean }} props
 */
export function SectionHead({ id, title, lead, dark = false }) {
  return (
    <header className="section-head" data-reveal>
      <h2 id={id} className={`type-display-m ${dark ? 'on-dark' : ''}`}>
        {title}
      </h2>
      {lead ? <p className={`type-lead section-lead ${dark ? 'on-dark-soft' : ''}`}>{lead}</p> : null}
    </header>
  );
}
