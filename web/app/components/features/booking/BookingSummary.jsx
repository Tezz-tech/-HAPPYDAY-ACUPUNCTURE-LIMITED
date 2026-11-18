import { formatDayDate, formatTime } from '@happyday/shared/time';
import { formatNaira } from '@happyday/shared/money';
import { ADDRESS } from '../../../lib/site.js';
import { treatments } from '../../../content/index.js';

/** The running summary beside the steps (desktop) and a compact bar on phones (docs/05 Phase 5). */
export function BookingSummary({ draft }) {
  const concern = treatments.find((t) => t.slug === draft.concern);
  const price = draft.booking?.payment?.amountDue ?? null;
  return (
    <aside className="book-summary surface-dark" aria-label="Your booking so far">
      <p className="label on-dark-soft">Your booking</p>
      <dl className="summary-list">
        <div>
          <dt>What it is about</dt>
          <dd>{concern ? concern.name : draft.concern ? 'Not sure yet' : 'Choose below'}</dd>
        </div>
        <div>
          <dt>Appointment</dt>
          <dd>{draft.typeName ?? 'Choose below'}</dd>
        </div>
        <div>
          <dt>When</dt>
          <dd>
            {draft.start ? `${formatDayDate(draft.start)}, ${formatTime(draft.start)} (Abuja time)` : 'Choose a time'}
          </dd>
        </div>
        {draft.booking ? (
          <div>
            <dt>Amount</dt>
            <dd>{formatNaira(price)}</dd>
          </div>
        ) : null}
      </dl>
      <p className="type-small on-dark-soft summary-address">{ADDRESS}</p>
    </aside>
  );
}
