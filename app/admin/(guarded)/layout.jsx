'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { checkAuth, logout } from '../../../lib/api.js';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/hero-slides', label: 'Hero Slider' },
  { to: '/admin/articles', label: 'Articles' },
  { to: '/admin/gallery', label: 'Gallery' }
];

export default function AdminLayout({ children }) {
  const [status, setStatus] = useState('checking');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth()
      .then((r) => setStatus(r.authorized ? 'ok' : 'denied'))
      .catch(() => setStatus('denied'));
  }, []);

  useEffect(() => {
    if (status === 'denied') router.push('/admin/login');
  }, [status, router]);

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
          <Link key={item.to} href={item.to} className={pathname === item.to ? 'active' : ''}>{item.label}</Link>
        ))}
        <button
          onClick={async () => { await logout(); router.push('/admin/login'); }}
          style={{ marginTop: 'auto', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '11px 12px', borderRadius: 8, fontSize: 14 }}
        >
          Log out
        </button>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
