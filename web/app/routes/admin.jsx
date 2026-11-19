import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { AdminLogin, ChangePassword } from '../components/features/admin/AdminAuth.jsx';
import { AdminShell } from '../components/features/admin/AdminShell.jsx';
import { AdminToday } from '../components/features/admin/AdminToday.jsx';
import { AdminBookings, AdminSettings, AdminPrices, AdminClosures, AdminInquiries } from '../components/features/admin/AdminScreens.jsx';

export function meta() {
  return [{ title: 'Admin | Happyday Acupuncture' }, { name: 'robots', content: 'noindex, nofollow' }];
}

/** Sections. Settings and prices are owner-only; the API enforces it and staff see a notice. */
const TABS = [
  { id: 'today', label: 'Today', owner: false },
  { id: 'bookings', label: 'Bookings', owner: false },
  { id: 'closures', label: 'Closures', owner: false },
  { id: 'inquiries', label: 'Inquiries', owner: false },
  { id: 'prices', label: 'Prices', owner: true },
  { id: 'settings', label: 'Settings', owner: true },
];

/**
 * The admin (docs/04 admin, docs/05). Single-page, noindex. Signed-out visitors see the sign-in screen;
 * a forced password change comes before anything else.
 */
export default function Admin() {
  const [me, setMe] = useState(undefined);
  const [tab, setTab] = useState('today');
  const [message, setMessage] = useState('');
  const [counts, setCounts] = useState({});

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

  const onCounts = useCallback((c) => setCounts((prev) => ({ ...prev, ...c })), []);

  const visibleTabs = useMemo(() => TABS.filter((t) => !t.owner || me?.role === 'owner'), [me]);

  async function signOut() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setMe(null);
  }

  if (me === undefined) {
    return (
      <main className="adm-boot">
        <p className="label">Happyday admin</p>
      </main>
    );
  }
  if (me === null) {
    return (
      <main className="adm-root">
        <AdminLogin onSignedIn={(user) => setMe(user)} />
      </main>
    );
  }
  if (me.mustChangePassword) {
    return (
      <main className="adm-root">
        <ChangePassword onChanged={check} />
      </main>
    );
  }

  const isOwner = me.role === 'owner';
  return (
    <main className="adm-root">
      <AdminShell user={me} tabs={visibleTabs} active={tab} counts={counts} onSelect={setTab} onSignOut={signOut}>
        {message ? (
          <p className="adm-alert" role="alert" onClick={() => setMessage('')}>
            {message}
          </p>
        ) : null}
        {tab === 'today' ? <AdminToday onError={setMessage} onCounts={onCounts} /> : null}
        {tab === 'bookings' ? <AdminBookings onError={setMessage} /> : null}
        {tab === 'closures' ? <AdminClosures onError={setMessage} /> : null}
        {tab === 'inquiries' ? <AdminInquiries onError={setMessage} /> : null}
        {tab === 'prices' && isOwner ? <AdminPrices onError={setMessage} /> : null}
        {tab === 'settings' && isOwner ? <AdminSettings onError={setMessage} /> : null}
      </AdminShell>
    </main>
  );
}
