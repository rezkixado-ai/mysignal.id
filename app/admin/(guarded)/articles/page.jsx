'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getArticles, createArticle, updateArticle, deleteArticle, uploadMedia
} from '../../../../lib/api.js';
import BlockEditor from '../../../../components/BlockEditor.jsx';
import SEOPanel from '../../../../components/SEOPanel.jsx';
import ArticlePreviewModal from '../../../../components/ArticlePreviewModal.jsx';

const CATEGORIES = ['Cybersecurity', 'Cloud', 'Network', 'Fiber Optic', 'AI', 'Big Tech', 'Tech Business', 'Hardware'];
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

function Toast({ toast }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}

export default function AdminArticles() {
  const editorRef = useRef(null);
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  function notify(message, type = 'ok') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function refresh() {
    try { setArticles(await getArticles({ all: '1', limit: 100 })); } catch (err) { notify(err.message, 'error'); }
  }
  useEffect(() => { refresh(); }, []);

  function resetForm() { setForm(EMPTY); }

  async function editArticle(a) {
    try {
      const full = await getArticles({ slug: a.slug });
      // content_blocks comes back from the DB as a JSON string — parse it,
      // falling back to an empty block list for pre-migration articles.
      let contentBlocks = { blocks: [] };
      if (full.content_blocks) {
        try { contentBlocks = JSON.parse(full.content_blocks); } catch { /* keep empty */ }
      }
      setForm({ ...EMPTY, ...a, content_blocks: contentBlocks });
    } catch {
      setForm({ ...EMPTY, ...a, content_blocks: { blocks: [] } });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleCoverUpload(file) {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) { notify('Please upload an image or video file', 'error'); return; }
    setUploadingCover(true);
    try {
      const result = await uploadMedia(file);
      setForm((f) => ({ ...f, cover_media_url: result.url, cover_media_type: result.mediaType }));
      notify('Cover uploaded');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) { notify('Title is required', 'error'); return; }
    setSaving(true);
    try {
      // Pull the guaranteed-current state directly from Editor.js instead of
      // trusting form.content_blocks, which can lag behind by Editor.js's
      // own ~400ms onChange debounce if Publish/Update is clicked right
      // after typing or adding a block.
      const freshBlocks = editorRef.current ? await editorRef.current.getBlocks() : form.content_blocks;
      const payload = { ...form, content_blocks: freshBlocks };
      if (form.id) { await updateArticle(payload); notify('Article updated'); }
      else { await createArticle(payload); notify('Article created'); }
      resetForm();
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this article?')) return;
    try { await deleteArticle(id); notify('Deleted'); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  async function togglePublish(a) {
    try { await updateArticle({ ...a, is_published: a.is_published ? 0 : 1 }); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  return (
    <div>
      <div className="admin-topbar">
        <h1 style={{ fontSize: 24 }}>Articles</h1>
        {form.id && <button className="btn btn-ghost" onClick={resetForm}>+ New Article</button>}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 24, alignItems: 'start' }}>
          {/* Main column — title, excerpt, body editor, then the SEO metabox underneath it */}
          <div className="card" style={{ padding: 28 }}>
            <div className="field">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Add title"
                required
                style={{ fontSize: 26, fontWeight: 600, padding: '10px 4px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', width: '100%' }}
              />
            </div>

            <div className="field">
              <label>Slug (leave blank to auto-generate from title)</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="why-cloud-infrastructure-matters" />
            </div>

            <div className="field">
              <label>Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="One or two sentences shown on cards" />
            </div>

            <div className="field">
              <label>Body</label>
              <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 8 }}>
                Klik area di bawah lalu tekan <code>Tab</code> atau <code>Enter</code> untuk pilih jenis block (heading, paragraf, gambar, image grid, tabel, FAQ, dll) — bisa disusun bebas di posisi manapun.
              </p>
              {/* key forces a clean remount when switching which article is being edited,
                  since BlockEditor only reads its initial `value` once on mount. */}
              <BlockEditor
                ref={editorRef}
                key={form.id || 'new'}
                value={form.content_blocks}
                onChange={(blocks) => setForm((f) => ({ ...f, content_blocks: blocks }))}
              />
            </div>

            {/* SEO metabox — WordPress/Yoast style: sits below the editor, full width of the main column */}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 28, paddingTop: 20 }}>
              <p style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-faint)', marginBottom: 12 }}>SEO</p>

              <div className="form-row">
                <div className="field">
                  <label>Focus Keyword</label>
                  <input type="text" placeholder="e.g. zero-day attack" value={form.focus_keyword} onChange={(e) => setForm({ ...form, focus_keyword: e.target.value })} />
                </div>
                <div className="field">
                  <label>SEO Title (leave blank to use the title above)</label>
                  <input type="text" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} maxLength={70} />
                </div>
              </div>
              <div className="field">
                <label>Meta Description (leave blank to use the excerpt)</label>
                <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} maxLength={170} />
              </div>

              <SEOPanel article={form} />
            </div>
          </div>

          {/* Sidebar — Publish box, Category & Type, Cover Media (WordPress-style right rail) */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, marginBottom: 14 }}>Publish</h3>

              <div className="field">
                <label>Status</label>
                <select value={form.is_published} onChange={(e) => setForm({ ...form, is_published: Number(e.target.value) })}>
                  <option value={1}>Published</option>
                  <option value={0}>Draft</option>
                </select>
              </div>
              <div className="field">
                <label>Read Time (minutes)</label>
                <input type="number" value={form.read_minutes} onChange={(e) => setForm({ ...form, read_minutes: Number(e.target.value) })} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-dim)', marginBottom: 8 }}>
                <input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked ? 1 : 0 })} />
                Featured (Deeper Signals highlight)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-dim)', marginBottom: 16 }}>
                <input type="checkbox" checked={!!form.is_breaking} onChange={(e) => setForm({ ...form, is_breaking: e.target.checked ? 1 : 0 })} />
                Breaking (Latest Signals feature slot)
              </label>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowPreview(true)}
                style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
              >
                Preview
              </button>
              <button className="btn" type="submit" disabled={saving || uploadingCover} style={{ width: '100%', justifyContent: 'center' }}>
                {saving ? 'Saving…' : form.id ? 'Update Article' : 'Publish Article'}
              </button>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, marginBottom: 14 }}>Category & Type</h3>
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Type</label>
                <select value={form.article_type} onChange={(e) => setForm({ ...form, article_type: e.target.value })}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: 14, marginBottom: 14 }}>Cover Media</h3>
              <div className="upload-box" onClick={() => document.getElementById('coverFile').click()}>
                {uploadingCover ? 'Uploading…' : 'Click to upload cover image / video'}
                <input id="coverFile" type="file" accept="image/*,video/*" hidden onChange={(e) => handleCoverUpload(e.target.files?.[0])} />
              </div>
              {form.cover_media_url && (
                <div className="preview-media">
                  {form.cover_media_type === 'video'
                    ? <video src={form.cover_media_url} muted loop autoPlay playsInline />
                    : <img src={form.cover_media_url} alt="cover preview" />}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      <div className="slide-list" style={{ marginTop: 24 }}>
        {articles.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: 13.5 }}>No articles yet — write your first one.</p>}
        {articles.map((a) => (
          <div className="slide-row" key={a.id}>
            <div className="thumb">
              {a.cover_media_type === 'video' ? <video src={a.cover_media_url} muted /> : <img src={a.cover_media_url} alt={a.title} />}
            </div>
            <div className="meta">
              <strong>{a.title}</strong>
              <span>{a.category} · {a.article_type}{a.is_breaking ? ' · Breaking' : ''}{a.is_featured ? ' · Featured' : ''} · {a.is_published ? 'Published' : 'Draft'}</span>
            </div>
            <div className="row-actions">
              <button onClick={() => togglePublish(a)}>{a.is_published ? 'Unpublish' : 'Publish'}</button>
              <button onClick={() => editArticle(a)}>Edit</button>
              <button onClick={() => handleDelete(a.id)} style={{ color: 'var(--red)' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showPreview && <ArticlePreviewModal article={form} onClose={() => setShowPreview(false)} />}

      <Toast toast={toast} />
    </div>
  );
}
