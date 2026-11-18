import { useRef, useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { Input } from '../../ui/Input.jsx';
import { PhoneInput } from '../../ui/PhoneInput.jsx';
import { Textarea } from '../../ui/Textarea.jsx';
import { Checkbox } from '../../ui/Checkbox.jsx';
import { SegmentedControl } from '../../ui/SegmentedControl.jsx';
import { Button } from '../../ui/Button.jsx';
import { TextLink } from '../../ui/TextLink.jsx';
import { useToast } from '../../../hooks/useToast.js';
import { WA_LINKS } from '../../../lib/site.js';

const FIRST = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

/**
 * Step 4: your details (docs/03 booking step 4). The booking is created here, so the seat is held while the visitor
 * pays. A time taken in the meantime sends the visitor back to step 3 with a toast (docs/05 Phase 5).
 * @param {{
 *   details: any, onChange: (d: any) => void, draft: any,
 *   onBack: () => void, onSubmitted: (booking: any) => void
 * }} props
 */
export function StepDetails({ details, onChange, draft, onBack, onSubmitted }) {
  const toast = useToast();
  const mountedAt = useRef(Date.now());
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [hp, setHp] = useState('');
  const set = (patch) => onChange({ ...details, ...patch });

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const res = await api('/bookings', {
        method: 'POST',
        body: {
          typeSlug: draft.typeSlug,
          start: draft.start,
          concern: draft.concern ?? 'general',
          notes: details.notes,
          patient: {
            name: details.name,
            phone: details.phone,
            email: details.email,
            firstVisit: details.firstVisit,
          },
          consent: details.consent === true ? true : false,
          hp,
          t: Date.now() - mountedAt.current,
        },
      });
      onSubmitted({ ref: res.ref, status: res.status, manageUrl: res.manageUrl, payment: res.payment });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SLOT_TAKEN') {
        toast.show('Someone just took that time. Please choose another.');
        onBack();
        return;
      }
      if (err instanceof ApiError && err.fields) {
        const mapped = {};
        for (const [k, v] of Object.entries(err.fields)) mapped[k.replace('patient.', '')] = v;
        setErrors(mapped);
        return;
      }
      toast.show(err.message ?? 'Something went wrong. Please try again, or WhatsApp us.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="booking-step" aria-labelledby="details-title">
      <h1 id="details-title" className="type-display-m">
        Your details
      </h1>
      <form className="booking-form" onSubmit={submit} noValidate>
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          value={details.name}
          onChange={(e) => set({ name: e.target.value })}
          error={errors.name}
        />
        <PhoneInput
          name="phone"
          label="Phone number"
          value={details.phone}
          onChange={(v) => set({ phone: v })}
          error={errors.phone}
        />
        <Input
          label="Email (optional, for your confirmation and reminder)"
          name="email"
          type="email"
          autoComplete="email"
          value={details.email}
          onChange={(e) => set({ email: e.target.value })}
          error={errors.email}
        />
        <fieldset className="inquiry-reply">
          <legend className="label">First time at Happyday?</legend>
          <SegmentedControl
            label="First time at Happyday?"
            value={details.firstVisit ? 'yes' : 'no'}
            onChange={(v) => set({ firstVisit: v === 'yes' })}
            options={FIRST}
          />
        </fieldset>
        <Textarea
          label="Anything you would like us to know? (optional)"
          name="notes"
          value={details.notes}
          onChange={(e) => set({ notes: e.target.value })}
          hint="Please do not include anything you would rather tell us in person."
          maxLength={500}
        />
        <Checkbox
          checked={details.consent === true}
          onChange={(e) => set({ consent: e.target.checked })}
          error={errors.consent}
        >
          I agree to Happyday Acupuncture keeping my details and any health information I share, so that they can look
          after my booking. <TextLink to="/privacy">Privacy</TextLink>
        </Checkbox>
        {/* Honeypot: hidden from people, visible to naive bots. */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="booking-website">Leave this empty</label>
          <input id="booking-website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </div>
        <div className="step-nav">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <Button type="submit" variant="primary" cta disabled={busy}>
            {busy ? 'Holding your time…' : 'Continue to payment'}
          </Button>
        </div>
        <p className="type-small">
          Prefer to chat? <TextLink href={WA_LINKS.book}>Book on WhatsApp instead</TextLink>.
        </p>
      </form>
    </section>
  );
}
