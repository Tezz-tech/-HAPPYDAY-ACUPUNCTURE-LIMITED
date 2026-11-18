import { Chip } from '../../ui/Chip.jsx';
import { treatments } from '../../../content/index.js';

/**
 * Step 1: "What's bothering you?" (docs/03 booking step 1).
 * @param {{ value: string | null, onChoose: (slug: string) => void }} props
 */
export function StepConcern({ value, onChoose }) {
  return (
    <section className="booking-step" aria-labelledby="concern-title">
      <h1 id="concern-title" className="type-display-m">
        What&rsquo;s bothering you?
      </h1>
      <div className="chip-grid" role="group" aria-label="Treatment areas">
        {treatments.map((t) => (
          <Chip key={t.slug} selected={value === t.slug} onClick={() => onChoose(t.slug)}>
            {t.name}
          </Chip>
        ))}
        <Chip selected={value === 'general'} onClick={() => onChoose('general')}>
          Not sure / general check
        </Chip>
      </div>
    </section>
  );
}
