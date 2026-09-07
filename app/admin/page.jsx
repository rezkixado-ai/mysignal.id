'use client';

import { useEffect, useState } from 'react';
import { getSitePage, updateSitePage } from '../../../../lib/api.js';
import BlockEditor from '../../../../components/BlockEditor.jsx';

const PAGES = [
  { slug: 'about', label: 'About Xi:gnal' },
  { slug: 'contact', label: 'Contact Us' }
];

const EMPTY = { slug: 'about', title: '', content_blocks: { blocks: [] }, meta_title: '', meta_description: '' };

function Toast({ toast }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}

export default function AdminPages() {
  const [activeSlug, setActiveSlug] = useState('about');
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function notify(message, type = 'ok') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSitePage(activeSlug)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setForm({ ...EMPTY, slug: activeSlug });
          return;
        }
        let contentBlocks = { blocks: [] };
        if (data.content_blocks) {
          try { contentBlocks = JSON.parse(data.content_blocks); } catch { /* keep empty */ }
        }
        setForm({
          slug: data.slug,
          title: data.title || '',
          content_blocks: contentBlocks,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || ''
        });
      })
      .catch((err) => !cancelled && notify(err.message, 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [activeSlug]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSitePage(form);
      notify('Page updated');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin-topbar">
        <h1 style={{ fontSize: 24 }}>Pages</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {PAGES.map((p) => (
          <button
            key={p.slug}
            type="button"
            className={p.slug === activeSlug ? 'btn' : 'btn btn-ghost'}
            onClick={() => setActiveSlug(p.slug)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-faint)' }}>Loading…</p>
      ) : (
        <form onSubmit={handleSave} className="card" style={{ padding: 28, maxWidth: 880 }}>
          <div className="field">
            <label>Page Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="field">
            <label>Body</label>
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 8 }}>
              Sama kayak editor artikel — klik lalu <code>Tab</code>/<code>Enter</code> buat pilih block. Ada 3 block tambahan khusus halaman ini: <strong>Process Steps</strong>, <strong>Logo Marquee</strong>, dan <strong>Contact Card</strong>.
            </p>
            {/* key forces a clean remount when switching between About/Contact,
                since BlockEditor only reads its initial value once on mount. */}
            <BlockEditor
              key={activeSlug}
              value={form.content_blocks}
              onChange={(blocks) => setForm((f) => ({ ...f, content_blocks: blocks }))}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 18 }}>
            <p style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-faint)', marginBottom: 12 }}>SEO</p>
            <div className="field">
              <label>SEO Title</label>
              <input type="text" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} maxLength={70} />
            </div>
            <div className="field">
              <label>Meta Description</label>
              <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} maxLength={170} />
            </div>
          </div>

          <button className="btn" type="submit" disabled={saving} style={{ marginTop: 16 }}>
            {saving ? 'Saving…' : 'Save Page'}
          </button>
        </form>
      )}

      <Toast toast={toast} />
    </div>
  );
}
