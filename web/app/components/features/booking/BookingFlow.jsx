import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { treatments } from '../../../content/index.js';
import { useBookingDraft } from '../../../hooks/useBookingDraft.js';
import { ProgressMeridian } from './ProgressMeridian.jsx';
import { BookingSummary } from './BookingSummary.jsx';
import { StepConcern } from './StepConcern.jsx';
import { StepType } from './StepType.jsx';
import { StepTime } from './StepTime.jsx';
import { StepDetails } from './StepDetails.jsx';
import { StepPay } from './StepPay.jsx';

/** The five steps from docs/03 booking. The step lives in the URL (?step=) so Back works. */
export const STEPS = ['concern', 'type', 'time', 'details', 'pay'];

/**
 * The booking flow (docs/03 Booking, docs/04). Step state is in the URL, the draft is kept in sessionStorage,
 * and a visitor can always move back. The summary sits beside the steps on desktop.
 */
export function BookingFlow() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [draft, update] = useBookingDraft();
  const [configTypes, setConfigTypes] = useState(null);
  const requested = params.get('step');
  const step = STEPS.includes(requested) ? requested : 'concern';
  const concernParam = params.get('concern');

  // Prefill the concern from ?concern= (docs/03 step 1), only when nothing is chosen yet.
  useEffect(() => {
    if (concernParam && !draft.concern) {
      const match = treatments.find((t) => t.slug === concernParam);
      update({ concern: match ? match.slug : 'general' });
    }
  }, [concernParam, draft.concern, update]);

  function go(next) {
    setParams((p) => {
      const copy = new URLSearchParams(p);
      copy.set('step', next);
      return copy;
    });
  }

  const index = STEPS.indexOf(step);
  const canSee = useMemo(() => {
    if (index >= 1 && !draft.concern) return false;
    if (index >= 2 && !draft.typeSlug) return false;
    if (index >= 3 && !draft.start) return false;
    return true;
  }, [index, draft]);

  useEffect(() => {
    if (!canSee) go(index >= 2 && !draft.typeSlug ? 'type' : 'concern');
  }, [canSee]);

  return (
    <div className="book-layout">
      <div className="book-main">
        <ProgressMeridian current={index} total={STEPS.length} />
        {step === 'concern' ? (
          <StepConcern
            value={draft.concern}
            onChoose={(concern) => {
              update({ concern });
              go('type');
            }}
          />
        ) : null}
        {step === 'type' ? (
          <StepType
            value={draft.typeSlug}
            types={configTypes}
            setTypes={setConfigTypes}
            onChoose={(t) => {
              update({ typeSlug: t.slug, typeName: t.name, durationMinutes: t.durationMinutes, start: null });
              go('time');
            }}
            onBack={() => go('concern')}
          />
        ) : null}
        {step === 'time' ? (
          <StepTime
            typeSlug={draft.typeSlug}
            value={draft.start}
            onChoose={(start) => {
              update({ start });
              go('details');
            }}
            onBack={() => go('type')}
          />
        ) : null}
        {step === 'details' ? (
          <StepDetails
            details={draft.details}
            onChange={(details) => update({ details })}
            onBack={() => go('time')}
            onSubmitted={(booking) => {
              update({ booking });
              go('pay');
            }}
            draft={draft}
          />
        ) : null}
        {step === 'pay' ? (
          <StepPay
            draft={draft}
            onDone={(ref, token) => {
              navigate(`/book/confirmed/${ref}?t=${token}`);
            }}
            onChange={update}
            onBack={() => go('details')}
          />
        ) : null}
      </div>
      <BookingSummary draft={draft} />
    </div>
  );
}
