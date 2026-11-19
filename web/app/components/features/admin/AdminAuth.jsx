import { useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { Input } from '../../ui/Input.jsx';
import { Button } from '../../ui/Button.jsx';
import { Icon } from '../../ui/Icon.jsx';
import { Logo } from '../../brand/Logo.jsx';

/**
 * The standard sign-in layout: a centred card with the clinic logo, a title and the form.
 * @param {{ title: string, lead?: string, children: import('react').ReactNode }} props
 */
function AuthFrame({ title, lead, children }) {
  return (
    <div className="adm-auth">
      <div className="adm-auth-card">
        <div className="adm-auth-head">
          <div className="adm-auth-logo">
            <Logo variant="horizontal" link={false} />
          </div>
          <h1>{title}</h1>
          {lead ? <p>{lead}</p> : null}
        </div>
        {children}
      </div>
      <p className="adm-auth-foot">Happyday Acupuncture admin</p>
    </div>
  );
}

/** A password field with an in-field show/hide button. */
function PasswordField({ label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="adm-pw">
      <Input label={label} type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={onChange} />
      <button type="button" className="adm-pw-toggle" onClick={() => setShow((s) => !s)} aria-pressed={show}>
        {show ? 'Hide' : 'Show'}
        <span className="visually-hidden"> password</span>
      </button>
    </div>
  );
}

/** Sign-in form. Lockout and rate-limit messages come straight from the API. */
export function AdminLogin({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api('/auth/login', { method: 'POST', body: { email, password } });
      onSignedIn(res.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title="Sign in" lead="Sign in with the email and password from the clinic owner.">
      <form className="adm-form" onSubmit={submit} noValidate>
        {error ? (
          <p className="adm-alert" role="alert">
            <Icon name="alert" size={18} />
            {error}
          </p>
        ) : null}
        <Input label="Email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="primary" className="btn-block adm-submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthFrame>
  );
}

/** Forced password change on first sign-in. The checklist ticks off live as the new password meets each rule. */
export function ChangePassword({ onChanged }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const rules = [
    { label: 'At least 12 characters', ok: next.length >= 12 },
    { label: 'Different from the current password', ok: next.length > 0 && next !== current },
  ];

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/auth/change-password', { method: 'POST', body: { current, next } });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title="Set a new password" lead="Choose a new password before you continue.">
      <form className="adm-form" onSubmit={submit} noValidate>
        {error ? (
          <p className="adm-alert" role="alert">
            <Icon name="alert" size={18} />
            {error}
          </p>
        ) : null}
        <PasswordField label="Current password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <PasswordField label="New password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        <ul className="adm-rules" aria-label="Password rules">
          {rules.map((r) => (
            <li key={r.label} className={r.ok ? 'is-ok' : ''}>
              <span className="adm-rule-mark" aria-hidden="true">
                {r.ok ? <Icon name="check" size={14} /> : null}
              </span>
              {r.label}
            </li>
          ))}
        </ul>
        <Button type="submit" variant="primary" className="btn-block adm-submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save new password'}
        </Button>
      </form>
    </AuthFrame>
  );
}
