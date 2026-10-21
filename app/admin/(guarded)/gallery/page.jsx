'use client';

import { useEffect, useState } from 'react';
import {
  getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem, uploadMedia
} from '../../../../lib/api.js';
import Icon from '../../../../components/Icon.jsx';
import RowMenu from '../../../../components/admin/RowMenu.jsx';
import useNewTrigger from '../../../../components/admin/useNewTrigger.js';

const SHAPE_OPTIONS = [
  { value: 'big', label: 'Big (2×2 — tile tinggi)' },
  { value: 'wide', label: 'Wide (2×1 — tile lebar)' },
  { value: 'normal', label: 'Normal (1×1 — kotak)' }
];

const EMPTY = { id: null, title: '', tag: '', media_type: 'image', media_url: '', layout_span: 'normal', sort_order: 0, is_published: 1 };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function notify(message, type = 'ok') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function refresh() {
    try { setItems(await getGallery(true)); } catch (err) { notify(err.message, 'error'); }
    setLoaded(true);
  }
  useEffect(() => { refresh(); }, []);

  function newItem() {
    setForm({ ...EMPTY, sort_order: items.length });
    setOpen(true);
    window.scrollTo({ top: 0 });
  }
  useNewTrigger(newItem);

  function editItem(it) {
    setForm({ ...EMPTY, ...it });
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function closePanel() {
    setOpen(false);
    setForm({ ...EMPTY, sort_order: items.length });
  }

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { notify('Pilih file gambar atau video', 'error'); return; }
    setUploading(true);
    try {
      const result = await uploadMedia(file);
      setForm((f) => ({ ...f, media_url: result.url, media_type: result.mediaType }));
      notify('Media ter-upload');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.media_url) { notify('Upload media dulu', 'error'); return; }
    setSaving(true);
    try {
      if (form.id) { await updateGalleryItem(form); notify('Item di-update'); }
      else { await createGalleryItem(form); notify('Item ditambahkan'); }
      closePanel();
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(it) {
    if (!confirm('Hapus item gallery ini?')) return;
    try { await deleteGalleryItem(it.id); notify('Terhapus'); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  async function togglePublish(it) {
    try { await updateGalleryItem({ ...it, is_published: it.is_published ? 0 : 1 }); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1 hl">Gallery</h1>
          <p className="adm-sub">{loaded ? `${items.length} item` : 'Memuat…'}</p>
        </div>
        <button type="button" className="btn" onClick={newItem}><Icon name="plus" size={18} /> Baru</button>
      </div>

      <div className="admin-split">
        <form className={`editor-panel card${open ? '' : ' closed'}`} onSubmit={handleSubmit}>
          <div className="ep-head">
            <h3>{form.id ? 'Edit item' : 'Item baru'}</h3>
            <button type="button" className="icon-btn plain ep-close" onClick={closePanel} aria-label="Tutup"><Icon name="close" /></button>
          </div>

          <label className={`cover-box${form.media_url ? ' has' : ''}`}>
            {form.media_url ? (
              form.media_type === 'video'
                ? <video src={form.media_url} muted loop autoPlay playsInline />
                : <img src={form.media_url} alt="preview" />
            ) : (
              <span className="cover-empty"><Icon name="upload" size={26} />{uploading ? 'Uploading…' : 'Ketuk untuk upload gambar / video'}</span>
            )}
            <input type="file" accept="image/*,video/*" hidden onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          {form.media_url && (
            <div className="cover-actions">
              <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                {uploading ? 'Uploading…' : 'Ganti media'}
                <input type="file" accept="image/*,video/*" hidden onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
            </div>
          )}

          <div className="field" style={{ marginTop: 16 }}>
            <label>Bentuk kartu</label>
            <select value={form.layout_span} onChange={(e) => setForm({ ...form, layout_span: e.target.value })}>
              {SHAPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <div className="field">
              <label>Tag / kategori</label>
              <input type="text" placeholder="Fiber Optic" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
            </div>
            <div className="field">
              <label>Judul (opsional, alt text)</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <div className="field">
              <label>Urutan</label>
              <input type="number" inputMode="numeric" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.is_published} onChange={(e) => setForm({ ...form, is_published: Number(e.target.value) })}>
                <option value={1}>Published</option>
                <option value={0}>Draft</option>
              </select>
            </div>
          </div>

          <div className="ep-actions" style={{ marginTop: 18 }}>
            <button type="button" className="btn btn-ghost ep-close" onClick={closePanel}>Batal</button>
            <button className="btn" type="submit" disabled={saving || uploading}>{saving ? 'Menyimpan…' : form.id ? 'Update' : 'Tambah item'}</button>
          </div>
        </form>

        <div className="clist">
          {loaded && items.length === 0 && <p className="adm-sub">Belum ada item — tambah yang pertama.</p>}
          {items.map((it) => (
            <div className="crow" key={it.id}>
              <button type="button" className="crow-main" onClick={() => editItem(it)}>
                <span className="crow-thumb">
                  {it.media_type === 'video' ? <video src={it.media_url} muted /> : <img src={it.media_url} alt="" loading="lazy" />}
                </span>
                <span className="crow-body">
                  <strong>{it.tag || it.title || 'Untitled'}</strong>
                  <span className="crow-meta">
                    <em className={`badge ${it.is_published ? 'pub' : 'draft'}`}>{it.is_published ? 'PUBLISH' : 'DRAFT'}</em>
                    <span>{it.layout_span}</span><span>#{it.sort_order}</span>
                  </span>
                </span>
              </button>
              <RowMenu items={[
                { label: 'Edit', onClick: () => editItem(it) },
                { label: it.is_published ? 'Jadikan draft' : 'Publish', onClick: () => togglePublish(it) },
                { label: 'Hapus', danger: true, onClick: () => handleDelete(it) }
              ]} />
            </div>
          ))}
        </div>
      </div>
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
