import { Logo } from '../../brand/Logo.jsx';

/**
 * The standard admin frame: a sidebar with the sections, a top bar with the page title and the signed-in user,
 * and the page underneath. On phones the sidebar becomes a row of tabs under the top bar.
 * @param {{
 *   user: { email: string, role: string }, tabs: Array<{ id: string, label: string }>,
 *   active: string, counts: Record<string, number>, onSelect: (id: string) => void,
 *   onSignOut: () => void, children: import('react').ReactNode
 * }} props
 */
export function AdminShell({ user, tabs, active, counts, onSelect, onSignOut, children }) {
  const current = tabs.find((t) => t.id === active);
  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">
          <Logo variant="horizontal" link={false} />
        </div>
        <nav aria-label="Admin sections" className="adm-nav">
          {tabs.map((t) => (
            <button key={t.id} type="button" className="adm-nav-item" aria-current={active === t.id ? 'page' : undefined} onClick={() => onSelect(t.id)}>
              <span>{t.label}</span>
              {counts[t.id] ? <span className={`adm-count ${t.id === 'today' ? 'is-alert' : ''}`.trim()}>{counts[t.id]}</span> : null}
            </button>
          ))}
        </nav>
      </aside>
      <div className="adm-main">
        <header className="adm-topbar">
          <div className="adm-topbar-title">
            <div className="adm-topbar-logo">
              <Logo variant="horizontal" link={false} />
            </div>
            <h2>{current?.label}</h2>
          </div>
          <div className="adm-topbar-user">
            <span className="adm-user-email">{user.email}</span>
            <span className="adm-role">{user.role === 'owner' ? 'Owner' : 'Staff'}</span>
            <button type="button" className="adm-signout" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </header>
        <nav aria-label="Admin sections, mobile" className="adm-tabs">
          {tabs.map((t) => (
            <button key={t.id} type="button" className="adm-tab" aria-current={active === t.id ? 'page' : undefined} onClick={() => onSelect(t.id)}>
              {t.label}
              {counts[t.id] ? <span className="adm-count">{counts[t.id]}</span> : null}
            </button>
          ))}
        </nav>
        <div className="adm-content" key={active}>
          {children}
        </div>
      </div>
    </div>
  );
}
