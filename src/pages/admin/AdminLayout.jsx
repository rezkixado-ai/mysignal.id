import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { checkAuth, logout } from '../../lib/api.js';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/hero-slides', label: 'Hero Slider' },
  { to: '/admin/articles', label: 'Articles' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/news', label: 'News' }
];

export default function AdminLayout() {
  const [status, setStatus] = useState('checking'); // checking | ok | denied
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth()
      .then((r) => setStatus(r.authorized ? 'ok' : 'denied'))
      .catch(() => setStatus('denied'));
  }, []);

  useEffect(() => {
    if (status === 'denied') navigate('/admin/login');
  }, [status, navigate]);

  if (status !== 'ok') {
    return (
      <div className="login-wrap">
        <p style={{ color: 'var(--text-dim)' }}>Checking session…</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <span className="brand" style={{ padding: '6px 12px 18px' }}>MY<span>SIGNAL</span></span>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>
        ))}
        <button
          onClick={async () => { await logout(); navigate('/admin/login'); }}
          style={{ marginTop: 'auto', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '11px 12px', borderRadius: 8, fontSize: 14 }}
        >
          Log out
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
