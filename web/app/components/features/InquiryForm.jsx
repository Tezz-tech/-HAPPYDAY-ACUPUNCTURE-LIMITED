import { useEffect, useRef, useState } from 'react';
import { normalizeNgPhone } from '@happyday/shared/phone';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { Checkbox } from '../ui/Checkbox.jsx';
import { SegmentedControl } from '../ui/SegmentedControl.jsx';
import { PhoneInput } from '../ui/PhoneInput.jsx';
import { Button } from '../ui/Button.jsx';
import { TextLink } from '../ui/TextLink.jsx';
import { useToast } from '../../hooks/useToast.js';
import { WA_LINKS } from '../../lib/site.js';

const TOPICS = [
  { value: 'treatment', label: 'A treatment area' },
  { value: 'booking', label: 'A booking question' },
  { value: 'other', label: 'Something else' },
];

const REPLY = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
];

/** Minimum time between page load and submit. Quicker submits are treated as bots (docs/05 Bots). */
const MIN_FILL_MS = 3000;

/**
 * Contact inquiry form, UI only in Phase 2. Validation, the honeypot and the time check run now.
 * Sending is wired to the API in Phase 5.
 */
export function InquiryForm() {
  const toast = useToast();
  const loadedAt = useRef(0);
  const [values, setValues] = useState({ name: '', phone: '', email: '', topic: 'treatment', message: '', website: '' });
  const [reply, setReply] = useState('whatsapp');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [phoneNormalized, setPhoneNormalized] = useState(null);

  useEffect(() => {
    loadedAt.current = Date.now();
  }, []);

  function set(name) {
    return (e) => setValues((v) => ({ ...v, [name]: e.target.value }));
  }

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = 'Please tell us your name.';
    if (!normalizeNgPhone(values.phone)) next.phone = 'Enter a Nigerian mobile number, for example 0803 640 4321.';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter an email address like name@example.com.';
    if (values.message.trim().length < 5) next.message = 'Tell us a little about what you would like to ask.';
    if (!consent) next.consent = 'Please tick the box so we can reply to you.';
    return next;
  }

  function onSubmit(event) {
    event.preventDefault();
    // Honeypot: a filled hidden field means a bot. Pretend success without doing anything.
    if (values.website) {
      toast.show('Thank you. We will be in touch soon.');
      return;
    }
    if (Date.now() - loadedAt.current < MIN_FILL_MS) {
      toast.show('Please take a moment, then try again.');
      return;
    }
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    // Phase 5 posts this to POST /inquiries. Until then the visitor is pointed to WhatsApp, not told it was sent.
    toast.show('Sending through the website is not switched on yet. WhatsApp us and we will reply quickly.');
  }

  return (
    <form className="inquiry-form" onSubmit={onSubmit} noValidate aria-labelledby="inquiry-title">
      <h2 id="inquiry-title" className="type-display-s">
        Send us a message
      </h2>
      <Input label="Your name" name="name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} />
      <PhoneInput
        name="phone"
        value={values.phone}
        onChange={(v) => setValues((s) => ({ ...s, phone: v }))}
        onNormalized={setPhoneNormalized}
        error={errors.phone}
      />
      <Input
        label="Email (optional)"
        name="email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={set('email')}
        error={errors.email}
      />
      <Select label="What is it about?" name="topic" options={TOPICS} value={values.topic} onChange={set('topic')} />
      <Textarea label="Your message" name="message" value={values.message} onChange={set('message')} error={errors.message} />
      <fieldset className="inquiry-reply">
        <legend className="label">How should we reply?</legend>
        <SegmentedControl label="How should we reply?" value={reply} onChange={setReply} options={REPLY} />
      </fieldset>
      <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} error={errors.consent}>
        I agree to Happyday Acupuncture using these details to reply to me.{' '}
        <TextLink to="/privacy">Privacy</TextLink>
      </Checkbox>
      {/* Honeypot: hidden from people and from password managers, visible to naive bots. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </div>
      <div className="inquiry-actions">
        <Button type="submit" variant="primary">
          Send message
        </Button>
        <TextLink href={WA_LINKS.general}>Want a faster answer? WhatsApp us.</TextLink>
      </div>
      {phoneNormalized ? <p className="type-small">We will use {phoneNormalized} to reply.</p> : null}
    </form>
  );
}
