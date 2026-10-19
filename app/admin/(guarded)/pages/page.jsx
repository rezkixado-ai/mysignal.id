'use client';

import { useEffect, useRef, useState } from 'react';
import { getSitePage, updateSitePage } from '../../../../lib/api.js';
import BlockEditor from '../../../../components/BlockEditor.jsx';

const PAGES = [
  { slug: 'about', label: 'About Xi:gnal' },
  { slug: 'contact', label: 'Contact Us' }
];

const EMPTY = { slug: 'about', title: '', content_blocks: { blocks: [] }, meta_title: '', meta_description: '' };

export default function AdminPages() {
  const editorRef = useRef(null);
  const [activeSlug, setActiveSlug] = useState('about');
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function notify(message, type = 'ok') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadFailed(false);
    getSitePage(activeSlug)
      .then((data) => {
        if (cancelled) return;
        if (!data) { setForm({ ...EMPTY, slug: activeSlug }); return; }
        let contentBlocks = { blocks: [] };
        if (data.content_blocks) {
          try { contentBlocks = typeof data.content_blocks === 'string' ? JSON.parse(data.content_blocks) : data.content_blocks; } catch { /* keep empty */ }
        }
        setForm({
          slug: data.slug,
          title: data.title || '',
          content_blocks: contentBlocks,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || ''
        });
      })
      .catch((err) => { if (!cancelled) { setLoadFailed(true); notify(err.message, 'error'); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeSlug]);

  async function handleSave() {
    if (loadFailed) { notify('Halaman gagal dimuat — reload dulu supaya isinya tidak tertimpa kosong', 'error'); return; }
    setSaving(true);
    try {
      // Take the blocks straight from Editor.js; form.content_blocks can lag its debounce.
      const freshBlocks = editorRef.current ? await editorRef.current.getBlocks() : form.content_blocks;
      await updateSitePage({ ...form, content_blocks: freshBlocks });
      setForm((f) => ({ ...f, content_blocks: freshBlocks }));
      notify('Halaman tersimpan');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1 hl">Pages</h1>
          <p className="adm-sub">Edit halaman statis situs.</p>
        </div>
      </div>

      <div className="pills">
        {PAGES.map((p) => (
          <button key={p.slug} type="button" className={`pill${p.slug === activeSlug ? ' on' : ''}`} onClick={() => setActiveSlug(p.slug)}>{p.label}</button>
        ))}
      </div>

      {loading ? (
        <p className="adm-sub">Memuat…</p>
      ) : (
        <div className="ed-grid" style={{ maxWidth: 900 }}>
          <div className="ed-main">
            <div className="field ed-title">
              <label>Judul halaman</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="field ed-body">
              <label>Isi halaman</label>
              <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '2px 0 8px' }}>
                Sama seperti editor artikel. Ada 3 blok khusus halaman: <b>Process Steps</b>, <b>Logo Marquee</b>, <b>Contact Card</b>.
              </p>
              {/* key remounts the editor when switching between About / Contact. */}
              <BlockEditor
                ref={editorRef}
                key={activeSlug}
                value={form.content_blocks}
                onChange={(blocks) => setForm((f) => ({ ...f, content_blocks: blocks }))}
              />
            </div>

            <details className="acc ed-seo">
              <summary>SEO</summary>
              <div className="acc-body">
                <div className="field">
                  <label>SEO title</label>
                  <input type="text" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} maxLength={70} />
                </div>
                <div className="field" style={{ marginTop: 14 }}>
                  <label>Meta description</label>
                  <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} maxLength={170} />
                </div>
              </div>
            </details>
          </div>
        </div>
      )}

      {!loading && (
        <>
          <div style={{ height: 84 }} />
          <div className="ed-bar above-nav">
            <button type="button" className="btn" disabled={saving} onClick={handleSave}>{saving ? 'Menyimpan…' : 'Simpan halaman'}</button>
          </div>
        </>
      )}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
