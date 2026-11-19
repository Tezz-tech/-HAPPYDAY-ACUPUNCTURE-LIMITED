import { useRef, useState } from 'react';
import { Picture } from '../ui/Picture.jsx';
import { VISIT_STEPS } from './VisitSteps.jsx';

/** The photo for each step, chosen to show what happens at that point in the visit. */
const STEP_PHOTOS = ['clinic-treatment-room', 'treatment-forehead-points', 'treatment-lower-leg', 'treatment-abdomen-ring'];

/**
 * The four steps of a first visit as tabs. Choosing a step changes the words and the photograph beside them.
 * Arrow keys move between tabs, as the ARIA tabs pattern expects.
 */
export function VisitExplorer() {
  const [index, setIndex] = useState(0);
  const tabs = useRef([]);
  const step = VISIT_STEPS[index];

  function choose(next) {
    setIndex(next);
    tabs.current[next]?.focus();
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowRight') choose((index + 1) % VISIT_STEPS.length);
    if (e.key === 'ArrowLeft') choose((index - 1 + VISIT_STEPS.length) % VISIT_STEPS.length);
    if (e.key === 'Home') choose(0);
    if (e.key === 'End') choose(VISIT_STEPS.length - 1);
  }

  return (
    <div className="explorer" data-reveal>
      <div className="explorer-tabs" role="tablist" aria-label="The four steps of your visit" onKeyDown={onKeyDown}>
        {VISIT_STEPS.map((s, i) => (
          <button
            key={s.title}
            ref={(el) => (tabs.current[i] = el)}
            type="button"
            role="tab"
            id={`visit-tab-${i}`}
            aria-selected={i === index}
            aria-controls="visit-panel"
            tabIndex={i === index ? 0 : -1}
            className={`explorer-tab ${i === index ? 'is-active' : ''}`}
            onClick={() => setIndex(i)}
          >
            <span className="explorer-tab-n">Step {i + 1}</span>
            <span className="explorer-tab-title">{s.title}</span>
          </button>
        ))}
      </div>
      <div className="explorer-panel" role="tabpanel" id="visit-panel" aria-labelledby={`visit-tab-${index}`}>
        <div className="explorer-media" key={index}>
          <Picture id={STEP_PHOTOS[index]} sizes="(min-width: 900px) 52vw, 92vw" />
        </div>
        <div className="explorer-text">
          <h3 className="type-display-s">{step.title}</h3>
          <p className="type-body">{step.body}</p>
        </div>
      </div>
    </div>
  );
}
