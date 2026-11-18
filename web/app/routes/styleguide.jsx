import { useState } from 'react';
import { Button } from '../components/ui/Button.jsx';
import { TextLink } from '../components/ui/TextLink.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Checkbox } from '../components/ui/Checkbox.jsx';
import { PhoneInput } from '../components/ui/PhoneInput.jsx';
import { Chip } from '../components/ui/Chip.jsx';
import { SegmentedControl } from '../components/ui/SegmentedControl.jsx';
import { Accordion } from '../components/ui/Accordion.jsx';
import { Sheet } from '../components/ui/Sheet.jsx';
import { Picture } from '../components/ui/Picture.jsx';
import { AcupointLabel } from '../components/ui/AcupointLabel.jsx';
import { Rule } from '../components/ui/Rule.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Logo } from '../components/brand/Logo.jsx';
import { Mark } from '../components/brand/Mark.jsx';
import { Seal } from '../components/brand/Seal.jsx';
import { useToast } from '../hooks/useToast.js';

export function meta() {
  return [{ title: 'Styleguide (dev only)' }, { name: 'robots', content: 'noindex' }];
}

/** Development-only page that shows every primitive on paper and on forest-900. */
export default function Styleguide() {
  if (import.meta.env.PROD) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24">
        <h1 className="type-display-m">Not found</h1>
      </main>
    );
  }
  return <StyleguideContent />;
}

function StyleguideContent() {
  const toast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [segment, setSegment] = useState('first');
  const [chip, setChip] = useState('pain');
  const [phone, setPhone] = useState('');
  const [phoneE164, setPhoneE164] = useState(null);
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState('');

  return (
    <main className="styleguide">
      <section className="sg-section">
        <p className="label">Styleguide · Phase 1</p>
        <h1 className="type-display-l">
          Points and <em>channels.</em>
        </h1>
        <p className="type-lead">
          Every primitive on paper, then on forest-900. The dark sections need their own check for contrast.
        </p>
      </section>

      <section className="sg-section">
        <Rule label={<AcupointLabel code="GV20" pinyin="Bǎihuì" />} />
        <h2 className="type-display-m">Type scale</h2>
        <p className="type-display-xl">Heal naturally.</p>
        <p className="type-display-m">
          Live <em>better.</em>
        </p>
        <p className="type-display-s">Thinner than you think</p>
        <p className="type-lead">Personalised acupuncture for pain, nerve problems, fertility, sleep and more.</p>
        <p className="type-body">
          Every plan starts with a proper Traditional Chinese Medicine assessment of you, not just your symptoms.
          Acupuncture works alongside your medical care.
        </p>
        <p className="type-small">Small text for footnotes and hints, 14 px.</p>
      </section>

      <section className="sg-section">
        <Rule label={<AcupointLabel code="ST36" pinyin="Zúsānlǐ" />} />
        <h2 className="type-display-m">Buttons</h2>
        <div className="sg-row">
          <Button variant="primary" to="/book">
            Book a consultation
          </Button>
          <Button variant="secondary" to="/book">
            See availability
          </Button>
          <Button variant="whatsapp" icon="whatsapp" href="https://wa.me/2348036404321">
            Chat on WhatsApp
          </Button>
          <TextLink to="/treatments">See all treatment areas</TextLink>
          <Button variant="ghost">Ghost action</Button>
        </div>
        <div className="sg-row">
          <Button variant="primary" cta>
            Book a visit (CTA)
          </Button>
          <Button variant="primary" icon="phone" href="tel:+2348036404321">
            Call 0803 640 4321
          </Button>
        </div>
      </section>

      <section className="sg-section">
        <Rule label={<AcupointLabel code="HT7" pinyin="Shénmén" />} />
        <h2 className="type-display-m">Fields</h2>
        <div className="sg-grid">
          <Input label="Full name" name="name" autoComplete="name" />
          <PhoneInput value={phone} onChange={setPhone} onNormalized={setPhoneE164} />
          <Input label="Email (optional)" type="email" name="email" error="Enter an email address like name@example.com" />
          <Select
            label="What's it about?"
            name="topic"
            options={[
              { value: 'treatment', label: 'A treatment area' },
              { value: 'booking', label: 'A booking question' },
              { value: 'other', label: 'Something else' },
            ]}
          />
          <Textarea label="Message" name="message" hint="Please don't include anything you'd rather tell us in person." />
          <div>
            <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} error={agreeError}>
              I agree to Happyday Acupuncture using these details to reply to me.
            </Checkbox>
            <Button variant="secondary" className="mt-3" onClick={() => setAgreeError(agree ? '' : 'Please tick to continue')}>
              Check consent
            </Button>
          </div>
        </div>
        <p className="type-small">Normalised phone: {phoneE164 ?? 'not yet valid'}</p>
      </section>

      <section className="sg-section">
        <Rule label={<AcupointLabel code="LI4" pinyin="Hégǔ" />} />
        <h2 className="type-display-m">Chips, segments, toast and sheet</h2>
        <div className="sg-row">
          {['Back pain', 'Sleep', 'Fertility'].map((label) => (
            <Chip key={label} selected={chip === label} onClick={() => setChip(label)}>
              {label}
            </Chip>
          ))}
        </div>
        <SegmentedControl
          label="Visit type"
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'first', label: 'First visit' },
            { value: 'follow', label: 'Follow-up' },
          ]}
        />
        <div className="sg-row">
          <Button variant="secondary" onClick={() => toast.show('Thank you. We will be in touch soon.')}>
            Show toast
          </Button>
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>
            Open sheet
          </Button>
        </div>
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Sheet title">
          <p className="type-body">A modal sheet. Press Escape or Close to dismiss it.</p>
          <Button variant="primary" onClick={() => setSheetOpen(false)}>
            Done
          </Button>
        </Sheet>
      </section>

      <section className="sg-section">
        <Rule label={<AcupointLabel code="KI1" pinyin="Yǒngquán" />} />
        <h2 className="type-display-m">Accordion</h2>
        <Accordion
          label="Frequently asked questions"
          items={[
            { id: 'hurt', q: 'Does acupuncture hurt?', a: 'Most people feel a quick tap, or a small pinch, as the needle goes in.' },
            { id: 'how-many', q: 'How many sessions will I need?', a: 'It depends on you and on how long you have had the problem.' },
          ]}
        />
      </section>

      <section className="sg-section">
        <Rule label={<AcupointLabel code="BL40" pinyin="Wěizhōng" />} />
        <h2 className="type-display-m">Photography and the mark</h2>
        <div className="sg-grid sg-grid-2">
          <Picture id="abdomen-ring-duotone" sizes="(min-width: 768px) 420px, 80vw" caption="Eight needles around one point." />
          <Picture id="knee-needles" sizes="(min-width: 768px) 380px, 80vw" alt="Close-up of needles around the knee." />
        </div>
        <div className="sg-row">
          <Logo variant="horizontal" />
          <Logo variant="stacked" link={false} />
          <Mark size={48} />
          <Seal size={72} stamp />
          <Icon name="whatsapp" size={22} />
          <Icon name="phone" size={22} />
          <Icon name="pin" size={22} />
          <Icon name="chevron" size={22} />
        </div>
      </section>

      <section className="sg-section sg-dark">
        <Rule dark label={<AcupointLabel code="PC6" pinyin="Nèiguān" />} />
        <h2 className="type-display-m">Dark section (forest-900)</h2>
        <p className="type-lead">Thinner than <em>you think.</em></p>
        <div className="sg-row">
          <Button variant="primary" onDark>
            Book on dark
          </Button>
          <Button variant="secondary" onDark>
            Secondary on dark
          </Button>
          <Logo variant="horizontal" tone="dark" link={false} />
          <Seal size={64} />
        </div>
      </section>
    </main>
  );
}
