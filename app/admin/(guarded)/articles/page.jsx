'use client';

import { useEffect, useState } from 'react';
import {
  getArticles, createArticle, updateArticle, deleteArticle, uploadMedia
} from '../../../../lib/api.js';
import RichTextEditor from '../../../../components/RichTextEditor.jsx';
import MediaEmbedList from '../../../../components/MediaEmbedList.jsx';
import SEOPanel from '../../../../components/SEOPanel.jsx';

const CATEGORIES = ['Cybersecurity', 'Cloud', 'Network', 'Fiber Optic', 'AI', 'Big Tech', 'Tech Business', 'Hardware'];
const TYPES = [
  { value: 'news', label: 'News (Latest Signals)' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'explainer', label: 'Explainer' },
  { value: 'insight', label: 'Insight' },
  { value: 'opinion', label: 'Opinion' }
];

const EMPTY = {
  id: null, slug: '', title: '', excerpt: '', body_html: '', category: 'Cybersecurity', article_type: 'news',
  cover_media_type: 'image', cover_media_url: '', read_minutes: 5, is_featured: 0, is_breaking: 0, is_published: 1,
  meta_title: '', meta_description: '', focus_keyword: '', media: []
};

function Toast({ toast }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

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
      setForm({ ...EMPTY, ...a, media: full.media || [] });
    } catch {
      setForm({ ...EMPTY, ...a, media: [] });
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
      if (form.id) { await updateArticle(form); notify('Article updated'); }
      else { await createArticle(form); notify('Article created'); }
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, alignItems: 'start' }}>
        <form className="card" onSubmit={handleSubmit}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>{form.id ? 'Edit Article' : 'New Article'}</h3>

          <div className="field">
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className="field">
            <label>Slug (leave blank to auto-generate from title)</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="why-cloud-infrastructure-matters" />
          </div>

          <div className="field">
            <label>Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="One or two sentences shown on cards" />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '18px 0', paddingTop: 18 }}>
            <p style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-faint)', marginBottom: 12 }}>SEO</p>

            <div className="field">
              <label>Focus Keyword</label>
              <input type="text" placeholder="e.g. zero-day attack" value={form.focus_keyword} onChange={(e) => setForm({ ...form, focus_keyword: e.target.value })} />
            </div>
            <div className="field">
              <label>SEO Title (leave blank to use the title above)</label>
              <input type="text" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} maxLength={70} />
            </div>
            <div className="field">
              <label>Meta Description (leave blank to use the excerpt)</label>
              <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} maxLength={170} />
            </div>
          </div>

          <div className="form-row">
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

          <div className="field">
            <label>Cover Media</label>
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

          <div className="field">
            <label>Body</label>
            <RichTextEditor value={form.body_html} onChange={(html) => setForm({ ...form, body_html: html })} />
          </div>

          <div className="field">
            <label>Embedded Media (shown within the article)</label>
            <MediaEmbedList items={form.media} onChange={(media) => setForm({ ...form, media })} />
          </div>

          <div className="form-row">
            <div className="field">
              <label>Read Time (minutes)</label>
              <input type="number" value={form.read_minutes} onChange={(e) => setForm({ ...form, read_minutes: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.is_published} onChange={(e) => setForm({ ...form, is_published: Number(e.target.value) })}>
                <option value={1}>Published</option>
                <option value={0}>Draft</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-dim)' }}>
              <input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked ? 1 : 0 })} />
              Featured (Deeper Signals highlight)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-dim)' }}>
              <input type="checkbox" checked={!!form.is_breaking} onChange={(e) => setForm({ ...form, is_breaking: e.target.checked ? 1 : 0 })} />
              Breaking (Latest Signals feature slot)
            </label>
          </div>

          <button className="btn" type="submit" disabled={saving || uploadingCover} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {saving ? 'Saving…' : form.id ? 'Update Article' : 'Publish Article'}
          </button>
        </form>

        <SEOPanel article={form} />

        <div className="slide-list">
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
      </div>

      <Toast toast={toast} />
    </div>
  );
}
