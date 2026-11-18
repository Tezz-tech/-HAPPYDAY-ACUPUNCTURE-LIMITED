import { useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { Input } from '../../ui/Input.jsx';
import { Button } from '../../ui/Button.jsx';

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
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={submit} noValidate>
      <h1 className="type-display-s">Sign in</h1>
      <Input label="Email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={error || undefined} />
      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

/** Forced password change on first sign-in (docs/04 Admin auth). */
export function ChangePassword({ onChanged }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/auth/change-password', { method: 'POST', body: { current, next } });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    }
  }

  return (
    <form className="admin-card" onSubmit={submit} noValidate>
      <h1 className="type-display-s">Choose a new password</h1>
      <p className="type-small">You need to do this before the first sign-in can continue. Use at least 12 characters.</p>
      <Input label="Current password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <Input label="New password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={error || undefined} />
      <Button type="submit" variant="primary">
        Save new password
      </Button>
    </form>
  );
}
