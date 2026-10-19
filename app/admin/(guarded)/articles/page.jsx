'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getArticles, createArticle, updateArticle, deleteArticle, uploadMedia
} from '../../../../lib/api.js';
import BlockEditor from '../../../../components/BlockEditor.jsx';
import SEOPanel from '../../../../components/SEOPanel.jsx';
import ArticlePreviewModal from '../../../../components/ArticlePreviewModal.jsx';
import Icon from '../../../../components/Icon.jsx';
import RowMenu from '../../../../components/admin/RowMenu.jsx';
import useNewTrigger from '../../../../components/admin/useNewTrigger.js';

const CATEGORIES = ['Edukasi', 'Panduan', 'Produk', 'Teknis', 'Troubleshooting', 'Fiber Optik', 'Networking', 'Internet', 'Cybersecurity', 'Artificial Intelligence', 'Cloud', 'Hardware'];
const TYPES = [
  { value: 'news', label: 'News (Latest Signals)' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'explainer', label: 'Explainer' },
  { value: 'insight', label: 'Insight' },
  { value: 'opinion', label: 'Opinion' }
];

const EMPTY = {
  id: null, slug: '', title: '', excerpt: '', body_html: '', content_blocks: { blocks: [] },
  category: 'Cybersecurity', article_type: 'news',
  cover_media_type: 'image', cover_media_url: '', read_minutes: 5, is_featured: 0, is_breaking: 0, is_published: 1,
  meta_title: '', meta_description: '', focus_keyword: ''
};

const dateFmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export default function AdminArticles() {
  const editorRef = useRef(null);
  const [articles, setArticles] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [opening, setOpening] = useState(null);

  function notify(message, type = 'ok') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function refresh() {
    try { setArticles(await getArticles({ all: '1', limit: 100 })); } catch (err) { notify(err.message, 'error'); }
    setLoaded(true);
  }
  useEffect(() => { refresh(); }, []);

  // hide bottom nav + top bar while the editor is open
  useEffect(() => {
    document.body.classList.toggle('adm-editing', editing);
    return () => document.body.classList.remove('adm-editing');
  }, [editing]);

  // warn before leaving the tab with unsaved changes
  useEffect(() => {
    if (!editing || !dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [editing, dirty]);

  const set = (patch) => { setDirty(true); setForm((f) => ({ ...f, ...patch })); };

  function newArticle() {
    setForm(EMPTY);
    setDirty(false);
    setEditing(true);
    window.scrollTo({ top: 0 });
  }
  useNewTrigger(newArticle);

  async function editArticle(a) {
    setOpening(a.id);
    try {
      const full = await getArticles({ slug: a.slug });
      // content_blocks arrives from the DB as a JSON string. If the fetch fails we
      // refuse to open the editor, so a later save can never overwrite the body with an empty block list.
      let contentBlocks = { blocks: [] };
      if (full && full.content_blocks) {
        try { contentBlocks = typeof full.content_blocks === 'string' ? JSON.parse(full.content_blocks) : full.content_blocks; } catch { /* pre-migration article: keep empty */ }
      }
      setForm({ ...EMPTY, ...a, content_blocks: contentBlocks });
      setDirty(false);
      setEditing(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      notify('Gagal membuka artikel: ' + err.message, 'error');
    } finally {
      setOpening(null);
    }
  }

  function closeEditor() {
    if (dirty && !confirm('Perubahan belum disimpan. Keluar tanpa simpan?')) return;
    setEditing(false);
    setDirty(false);
    setForm(EMPTY);
  }

  async function handleCoverUpload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { notify('Pilih file gambar atau video', 'error'); return; }
    setUploadingCover(true);
    try {
      const result = await uploadMedia(file);
      set({ cover_media_url: result.url, cover_media_type: result.mediaType });
      notify('Cover ter-upload');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setUploadingCover(false);
    }
  }

  async function save(publishState) {
    if (!form.title.trim()) { notify('Judul wajib diisi', 'error'); return; }
    setSaving(true);
    try {
      // Pull the current blocks straight from Editor.js; form.content_blocks can lag behind its debounce.
      const freshBlocks = editorRef.current ? await editorRef.current.getBlocks() : form.content_blocks;
      const payload = { ...form, is_published: publishState, content_blocks: freshBlocks };
      if (form.id) { await updateArticle(payload); notify('Artikel di-update'); }
      else { await createArticle(payload); notify(publishState ? 'Artikel terbit' : 'Draft tersimpan'); }
      setEditing(false);
      setDirty(false);
      setForm(EMPTY);
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a) {
    if (!confirm(`Hapus artikel "${a.title}"?`)) return;
    try { await deleteArticle(a.id); notify('Terhapus'); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  async function togglePublish(a) {
    try { await updateArticle({ ...a, is_published: a.is_published ? 0 : 1 }); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return articles.filter((a) => {
      if (filter === 'pub' && !a.is_published) return false;
      if (filter === 'draft' && a.is_published) return false;
      if (s && !`${a.title} ${a.category}`.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [articles, q, filter]);

  const toastEl = toast ? <div className={`toast ${toast.type}`}>{toast.message}</div> : null;

  /* ------------------------------ EDITOR ------------------------------ */
  if (editing) {
    return (
      <div>
        <div className="ed-head">
          <button type="button" className="icon-btn plain" onClick={closeEditor} aria-label="Kembali"><Icon name="back" /></button>
          <h1>{form.id ? 'Edit artikel' : 'Artikel baru'}</h1>
          <button type="button" className="icon-btn" onClick={() => setShowPreview(true)} aria-label="Preview"><Icon name="eye" /></button>
        </div>

        <div className="ed-grid">
          <div className="ed-main">
            <div className="ed-title">
              <input
                type="text" className="title-input" placeholder="Judul artikel"
                value={form.title} onChange={(e) => set({ title: e.target.value })}
              />
            </div>

            <div className="field ed-excerpt">
              <label>Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} placeholder="1–2 kalimat yang tampil di kartu" />
            </div>

            <div className="field ed-body">
              <label>Isi artikel</label>
              <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '2px 0 8px' }}>
                Ketuk area di bawah, lalu tombol <b>+</b> di kiri baris untuk pilih blok (heading, paragraf, gambar, tabel, FAQ, dll).
              </p>
              {/* key forces a clean remount per article; BlockEditor reads `value` only on mount. */}
              <BlockEditor
                ref={editorRef}
                key={form.id || 'new'}
                value={form.content_blocks}
                onChange={(blocks) => set({ content_blocks: blocks })}
              />
            </div>

            <details className="acc ed-seo">
              <summary>SEO</summary>
              <div className="acc-body">
                <div className="field">
                  <label>Focus keyword</label>
                  <input type="text" placeholder="mis. zero-day attack" value={form.focus_keyword} onChange={(e) => set({ focus_keyword: e.target.value })} />
                </div>
                <div className="field" style={{ marginTop: 14 }}>
                  <label>SEO title (kosong = pakai judul)</label>
                  <input type="text" value={form.meta_title} onChange={(e) => set({ meta_title: e.target.value })} maxLength={70} />
                </div>
                <div className="field" style={{ marginTop: 14 }}>
                  <label>Meta description (kosong = pakai excerpt)</label>
                  <textarea value={form.meta_description} onChange={(e) => set({ meta_description: e.target.value })} maxLength={170} />
                </div>
                <div style={{ marginTop: 14 }}><SEOPanel article={form} onApply={(patch) => set(patch)} /></div>
              </div>
            </details>
          </div>

          <aside>
            <div className="ed-cover">
              <label className={`cover-box${form.cover_media_url ? " has" : ""}`}>
                {form.cover_media_url ? (
                  form.cover_media_type === 'video'
                    ? <video src={form.cover_media_url} muted loop autoPlay playsInline />
                    : <img src={form.cover_media_url} alt="cover" />
                ) : (
                  <span className="cover-empty"><Icon name="upload" size={26} />{uploadingCover ? 'Uploading…' : 'Ketuk untuk upload cover (gambar / video)'}</span>
                )}
                <input type="file" accept="image/*,video/*" hidden onChange={(e) => { handleCoverUpload(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
              {form.cover_media_url && (
                <div className="cover-actions">
                  <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                    {uploadingCover ? 'Uploading…' : 'Ganti cover'}
                    <input type="file" accept="image/*,video/*" hidden onChange={(e) => { handleCoverUpload(e.target.files?.[0]); e.target.value = ''; }} />
                  </label>
                  <button type="button" className="btn btn-ghost" onClick={() => set({ cover_media_url: '', cover_media_type: 'image' })}>Hapus cover</button>
                </div>
              )}
            </div>

            <div className="ed-meta">
              <div className="form-row">
                <div className="field">
                  <label>Kategori</label>
                  <select value={form.category} onChange={(e) => set({ category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Tipe</label>
                  <select value={form.article_type} onChange={(e) => set({ article_type: e.target.value })}>
                    {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <details className="acc ed-settings">
              <summary>Pengaturan</summary>
              <div className="acc-body">
                <div className="field">
                  <label>Slug (kosong = otomatis dari judul)</label>
                  <input type="text" value={form.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="why-cloud-infrastructure-matters" />
                </div>
                <div className="field" style={{ marginTop: 14 }}>
                  <label>Waktu baca (menit)</label>
                  <input type="number" inputMode="numeric" value={form.read_minutes} onChange={(e) => set({ read_minutes: Number(e.target.value) })} />
                </div>
                <label className="check" style={{ marginTop: 6 }}>
                  <input type="checkbox" checked={!!form.is_featured} onChange={(e) => set({ is_featured: e.target.checked ? 1 : 0 })} />
                  Featured (sorotan Deeper Signals)
                </label>
                <label className="check">
                  <input type="checkbox" checked={!!form.is_breaking} onChange={(e) => set({ is_breaking: e.target.checked ? 1 : 0 })} />
                  Breaking (slot utama Latest Signals)
                </label>
              </div>
            </details>
          </aside>
        </div>

        <div className="ed-bar">
          <button type="button" className="btn btn-ghost" disabled={saving || uploadingCover} onClick={() => save(0)}>
            {saving ? 'Menyimpan…' : 'Simpan draft'}
          </button>
          <button type="button" className="btn" disabled={saving || uploadingCover} onClick={() => save(1)}>
            {saving ? 'Menyimpan…' : form.id && form.is_published ? 'Update' : 'Publish'}
          </button>
        </div>

        {showPreview && <ArticlePreviewModal article={form} onClose={() => setShowPreview(false)} />}
        {toastEl}
      </div>
    );
  }

  /* ------------------------------- LIST ------------------------------- */
  return (
    <div>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1 hl">Artikel</h1>
          <p className="adm-sub">{loaded ? `${articles.length} artikel` : 'Memuat…'}</p>
        </div>
        <button type="button" className="btn" onClick={newArticle}><Icon name="plus" size={18} /> Baru</button>
      </div>

      <div className="search">
        <Icon name="search" size={18} />
        <input type="search" placeholder="Cari judul atau kategori" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="pills">
        {[['all', 'Semua'], ['pub', 'Publish'], ['draft', 'Draft']].map(([v, l]) => (
          <button key={v} type="button" className={`pill${filter === v ? ' on' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      <div className="clist">
        {loaded && shown.length === 0 && (
          <p className="adm-sub">{articles.length === 0 ? 'Belum ada artikel — tulis yang pertama.' : 'Tidak ada yang cocok.'}</p>
        )}
        {shown.map((a) => (
          <div className="crow" key={a.id}>
            <button type="button" className="crow-main" onClick={() => editArticle(a)} disabled={opening === a.id}>
              <span className="crow-thumb">
                {a.cover_media_url
                  ? (a.cover_media_type === 'video' ? <video src={a.cover_media_url} muted /> : <img src={a.cover_media_url} alt="" loading="lazy" />)
                  : <Icon name="file" size={22} />}
              </span>
              <span className="crow-body">
                <strong>{opening === a.id ? 'Membuka…' : a.title}</strong>
                <span className="crow-meta">
                  <em className={`badge ${a.is_published ? 'pub' : 'draft'}`}>{a.is_published ? 'PUBLISH' : 'DRAFT'}</em>
                  <span>{a.category}</span>
                  {a.is_breaking ? <em className="badge info">BREAKING</em> : null}
                  {a.is_featured ? <em className="badge info">FEATURED</em> : null}
                  <span>{dateFmt(a.published_at)}</span>
                </span>
              </span>
            </button>
            <RowMenu items={[
              { label: 'Edit', onClick: () => editArticle(a) },
              { label: a.is_published ? 'Jadikan draft' : 'Publish', onClick: () => togglePublish(a) },
              ...(a.is_published ? [{ label: 'Lihat di situs', onClick: () => window.open(`/article/${a.slug}`, '_blank') }] : []),
              { label: 'Hapus', danger: true, onClick: () => handleDelete(a) }
            ]} />
          </div>
        ))}
      </div>
      {toastEl}
    </div>
  );
}
