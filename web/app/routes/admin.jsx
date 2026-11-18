import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { AdminLogin, ChangePassword } from '../components/features/admin/AdminAuth.jsx';
import { AdminToday } from '../components/features/admin/AdminToday.jsx';
import { AdminBookings, AdminSettings, AdminPrices, AdminClosures, AdminInquiries } from '../components/features/admin/AdminScreens.jsx';
import { Button } from '../components/ui/Button.jsx';

export function meta() {
  return [{ title: 'Admin | Happyday Acupuncture' }, { name: 'robots', content: 'noindex, nofollow' }];
}

/** Tabs. Settings, prices and hours are owner-only (the API enforces it; staff see a notice). */
const TABS = [
  { id: 'today', label: 'Today', owner: false },
  { id: 'bookings', label: 'Bookings', owner: false },
  { id: 'closures', label: 'Closures', owner: false },
  { id: 'inquiries', label: 'Inquiries', owner: false },
  { id: 'prices', label: 'Prices', owner: true },
  { id: 'settings', label: 'Settings', owner: true },
];

/**
 * The admin dashboard (docs/04 admin, docs/05). Single-page only and noindex. Mobile first, dense, Switzer only.
 * Signed-out visitors see the sign-in form; a forced password change comes before anything else.
 */
export default function Admin() {
  const [me, setMe] = useState(undefined);
  const [tab, setTab] = useState('today');
  const [message, setMessage] = useState('');

  const check = useCallback(async () => {
    try {
      const res = await api('/auth/me');
      setMe(res.user);
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  async function signOut() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setMe(null);
  }

  if (me === undefined) return <main className="admin-page"><p className="type-small">Loading…</p></main>;
  if (me === null) {
    return (
      <main className="admin-page">
        <AdminLogin onSignedIn={(user) => setMe(user)} />
      </main>
    );
  }
  if (me.mustChangePassword) {
    return (
      <main className="admin-page">
        <ChangePassword onChanged={check} />
      </main>
    );
  }

  const isOwner = me.role === 'owner';
  return (
    <main className="admin-page">
      <header className="admin-head">
        <p className="label">Happyday admin · {me.email}</p>
        <Button variant="ghost" onClick={signOut}>
          Sign out
        </Button>
      </header>
      <nav aria-label="Admin sections" className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className="admin-tab" aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      {message ? (
        <p className="admin-message" role="alert" onClick={() => setMessage('')}>
          {message}
        </p>
      ) : null}
      <section className="admin-body" aria-live="polite">
        {tab === 'today' ? <AdminToday onError={setMessage} /> : null}
        {tab === 'bookings' ? <AdminBookings onError={setMessage} /> : null}
        {tab === 'closures' ? <AdminClosures onError={setMessage} /> : null}
        {tab === 'inquiries' ? <AdminInquiries onError={setMessage} /> : null}
        {tab === 'prices' ? (isOwner ? <AdminPrices onError={setMessage} /> : <OwnerOnly />) : null}
        {tab === 'settings' ? (isOwner ? <AdminSettings onError={setMessage} /> : <OwnerOnly />) : null}
      </section>
    </main>
  );
}

function OwnerOnly() {
  return <p className="type-body">Only the owner can change this. Ask the clinic owner.</p>;
}
