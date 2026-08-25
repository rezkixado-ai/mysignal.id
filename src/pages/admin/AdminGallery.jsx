import { useEffect, useState } from 'react';
import {
  getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem, uploadMedia
} from '../../lib/api.js';

const SHAPE_OPTIONS = [
  { value: 'big', label: 'Big (2×2 — tall feature tile)' },
  { value: 'wide', label: 'Wide (2×1 — horizontal banner tile)' },
  { value: 'normal', label: 'Normal (1×1 — square tile)' }
];

const EMPTY = { id: null, title: '', tag: '', media_type: 'image', media_url: '', layout_span: 'normal', sort_order: 0, is_published: 1 };

function Toast({ toast }) {
  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}

export default function AdminGallery() {
  const [items, setItems] = useState([]);
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
    try { setItems(await getGallery(true)); } catch (err) { notify(err.message, 'error'); }
  }
  useEffect(() => { refresh(); }, []);

  function resetForm() { setForm({ ...EMPTY, sort_order: items.length }); }
  function editItem(item) { setForm({ ...EMPTY, ...item }); window.scrollTo({ top: 0, behavior: 'smooth' }); }

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
    if (!form.media_url) { notify('Upload media first', 'error'); return; }
    setSaving(true);
    try {
      if (form.id) { await updateGalleryItem(form); notify('Item updated'); }
      else { await createGalleryItem(form); notify('Item added'); }
      resetForm();
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this gallery item?')) return;
    try { await deleteGalleryItem(id); notify('Deleted'); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  async function togglePublish(item) {
    try { await updateGalleryItem({ ...item, is_published: item.is_published ? 0 : 1 }); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  return (
    <div>
      <div className="admin-topbar">
        <h1 style={{ fontSize: 24 }}>Gallery</h1>
        {form.id && <button className="btn btn-ghost" onClick={resetForm}>+ New Item</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 24, alignItems: 'start' }}>
        <form className="card" onSubmit={handleSubmit}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>{form.id ? 'Edit Item' : 'New Item'}</h3>

          <div
            className={`upload-box${dragging ? ' dragging' : ''}`}
            onClick={() => document.getElementById('galleryFile').click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
          >
            {uploading ? 'Uploading…' : 'Click or drag an image / video here'}
            <input id="galleryFile" type="file" accept="image/*,video/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {form.media_url && (
            <div className="preview-media">
              {form.media_type === 'video'
                ? <video src={form.media_url} muted loop autoPlay playsInline />
                : <img src={form.media_url} alt="preview" />}
            </div>
          )}

          <div className="field" style={{ marginTop: 16 }}>
            <label>Card Shape</label>
            <select value={form.layout_span} onChange={(e) => setForm({ ...form, layout_span: e.target.value })}>
              {SHAPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Tag / Category</label>
              <input type="text" placeholder="Fiber Optic" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
            </div>
            <div className="field">
              <label>Title (optional, for alt text)</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
            {saving ? 'Saving…' : form.id ? 'Update Item' : 'Add Item'}
          </button>
        </form>

        <div className="slide-list">
          {items.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: 13.5 }}>No gallery items yet — add your first one.</p>}
          {items.map((it) => (
            <div className="slide-row" key={it.id}>
              <div className="thumb">
                {it.media_type === 'video' ? <video src={it.media_url} muted /> : <img src={it.media_url} alt={it.title || it.tag} />}
              </div>
              <div className="meta">
                <strong>{it.tag || it.title || 'Untitled'}</strong>
                <span>{it.layout_span} · {it.is_published ? 'Published' : 'Draft'}</span>
              </div>
              <div className="row-actions">
                <button onClick={() => togglePublish(it)}>{it.is_published ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => editItem(it)}>Edit</button>
                <button onClick={() => handleDelete(it.id)} style={{ color: 'var(--red)' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
