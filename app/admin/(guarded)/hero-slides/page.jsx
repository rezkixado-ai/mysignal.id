'use client';

import { useEffect, useState } from 'react';
import {
  getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, uploadMedia
} from '../../../../lib/api.js';

const KB_OPTIONS = [
  { value: 'zoom-in', label: 'Zoom In' },
  { value: 'zoom-out', label: 'Zoom Out' },
  { value: 'pan-left', label: 'Pan Left' },
  { value: 'pan-right', label: 'Pan Right' },
  { value: 'none', label: 'None (static)' }
];

const EMPTY = {
  id: null, eyebrow: '', title: '', description: '', cta_label: 'Read Article', cta_url: '#',
  media_type: 'image', media_url: '', ken_burns: 'zoom-in', sort_order: 0, is_published: 1
};

function Toast({ toast }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function notify(message, type = 'ok') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function refresh() {
    try { setSlides(await getHeroSlides(true)); } catch (err) { notify(err.message, 'error'); }
  }
  useEffect(() => { refresh(); }, []);

  function editSlide(slide) {
    setForm({ ...EMPTY, ...slide });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetForm() { setForm({ ...EMPTY, sort_order: slides.length }); }

  async function handleFile(file) {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) { notify('Please upload an image or video file', 'error'); return; }
    setUploading(true);
    try {
      const result = await uploadMedia(file);
      setForm((f) => ({ ...f, media_url: result.url, media_type: result.mediaType }));
      notify('Media uploaded');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.media_url) { notify('Title and media are required', 'error'); return; }
    setSaving(true);
    try {
      if (form.id) { await updateHeroSlide(form); notify('Slide updated'); }
      else { await createHeroSlide(form); notify('Slide created'); }
      resetForm();
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this slide?')) return;
    try { await deleteHeroSlide(id); notify('Slide deleted'); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  async function togglePublish(slide) {
    try { await updateHeroSlide({ ...slide, is_published: slide.is_published ? 0 : 1 }); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  return (
    <div>
      <div className="admin-topbar">
        <h1 style={{ fontSize: 24 }}>Hero Slider</h1>
        {form.id && <button className="btn btn-ghost" onClick={resetForm}>+ New Slide</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 24, alignItems: 'start' }}>
        <form className="card" onSubmit={handleSubmit}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>{form.id ? 'Edit Slide' : 'New Slide'}</h3>

          <div
            className={`upload-box${dragging ? ' dragging' : ''}`}
            onClick={() => document.getElementById('mediaInput').click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
          >
            {uploading ? 'Uploading…' : 'Click or drag an image / video here'}
            <input id="mediaInput" type="file" accept="image/*,video/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {form.media_url && (
            <div className="preview-media">
              {form.media_type === 'video'
                ? <video src={form.media_url} muted loop autoPlay playsInline />
                : <img src={form.media_url} alt="preview" />}
            </div>
          )}

          <div className="field" style={{ marginTop: 16 }}>
            <label>Ken Burns Effect</label>
            <select value={form.ken_burns} onChange={(e) => setForm({ ...form, ken_burns: e.target.value })}>
              {KB_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Eyebrow / Category</label>
            <input type="text" placeholder="Cybersecurity" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
          </div>

          <div className="field">
            <label>Title</label>
            <input type="text" placeholder="The New Threats Behind Our Digital World" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="form-row">
            <div className="field">
              <label>CTA Label</label>
              <input type="text" value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} />
            </div>
            <div className="field">
              <label>CTA Link</label>
              <input type="text" value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} placeholder="/article/your-slug" />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.is_published} onChange={(e) => setForm({ ...form, is_published: Number(e.target.value) })}>
                <option value={1}>Published</option>
                <option value={0}>Draft</option>
              </select>
            </div>
          </div>

          <button className="btn" type="submit" disabled={saving || uploading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {saving ? 'Saving…' : form.id ? 'Update Slide' : 'Add Slide'}
          </button>
        </form>

        <div className="slide-list">
          {slides.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: 13.5 }}>No slides yet — add your first one.</p>}
          {slides.map((s) => (
            <div className="slide-row" key={s.id}>
              <div className="thumb">
                {s.media_type === 'video' ? <video src={s.media_url} muted /> : <img src={s.media_url} alt={s.title} />}
              </div>
              <div className="meta">
                <strong>{s.title}</strong>
                <span>{s.eyebrow} · {s.ken_burns} · {s.is_published ? 'Published' : 'Draft'}</span>
              </div>
              <div className="row-actions">
                <button onClick={() => togglePublish(s)}>{s.is_published ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => editSlide(s)}>Edit</button>
                <button onClick={() => handleDelete(s.id)} style={{ color: 'var(--red)' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
