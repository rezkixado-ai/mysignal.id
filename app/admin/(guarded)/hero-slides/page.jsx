'use client';

import { useEffect, useState } from 'react';
import {
  getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, uploadMedia
} from '../../../../lib/api.js';
import Icon from '../../../../components/Icon.jsx';
import RowMenu from '../../../../components/admin/RowMenu.jsx';
import useNewTrigger from '../../../../components/admin/useNewTrigger.js';

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

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false); // phone: editor panel visible
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function notify(message, type = 'ok') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function refresh() {
    try { setSlides(await getHeroSlides(true)); } catch (err) { notify(err.message, 'error'); }
    setLoaded(true);
  }
  useEffect(() => { refresh(); }, []);

  function newSlide() {
    setForm({ ...EMPTY, sort_order: slides.length });
    setOpen(true);
    window.scrollTo({ top: 0 });
  }
  useNewTrigger(newSlide);

  function editSlide(s) {
    setForm({ ...EMPTY, ...s });
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function closePanel() {
    setOpen(false);
    setForm({ ...EMPTY, sort_order: slides.length });
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
    if (!form.title || !form.media_url) { notify('Judul dan media wajib diisi', 'error'); return; }
    setSaving(true);
    try {
      if (form.id) { await updateHeroSlide(form); notify('Slide di-update'); }
      else { await createHeroSlide(form); notify('Slide ditambahkan'); }
      closePanel();
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s) {
    if (!confirm(`Hapus slide "${s.title}"?`)) return;
    try { await deleteHeroSlide(s.id); notify('Slide dihapus'); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  async function togglePublish(s) {
    try { await updateHeroSlide({ ...s, is_published: s.is_published ? 0 : 1 }); refresh(); } catch (err) { notify(err.message, 'error'); }
  }

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1 hl">Hero Slider</h1>
          <p className="adm-sub">{loaded ? `${slides.length} slide` : 'Memuat…'}</p>
        </div>
        <button type="button" className="btn" onClick={newSlide}><Icon name="plus" size={18} /> Baru</button>
      </div>

      <div className="admin-split">
        <form className={`editor-panel card${open ? '' : ' closed'}`} onSubmit={handleSubmit}>
          <div className="ep-head">
            <h3>{form.id ? 'Edit slide' : 'Slide baru'}</h3>
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
            <label>Efek Ken Burns</label>
            <select value={form.ken_burns} onChange={(e) => setForm({ ...form, ken_burns: e.target.value })}>
              {KB_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Eyebrow / kategori</label>
            <input type="text" placeholder="Cybersecurity" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Judul</label>
            <input type="text" placeholder="The New Threats, Behind Our Digital World" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-row" style={{ marginTop: 14 }}>
            <div className="field">
              <label>Label tombol</label>
              <input type="text" value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} />
            </div>
            <div className="field">
              <label>Link tombol</label>
              <input type="text" inputMode="url" value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} placeholder="/article/slug-artikel" />
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
            <button className="btn" type="submit" disabled={saving || uploading}>{saving ? 'Menyimpan…' : form.id ? 'Update' : 'Tambah slide'}</button>
          </div>
        </form>

        <div className="clist">
          {loaded && slides.length === 0 && <p className="adm-sub">Belum ada slide — tambah yang pertama.</p>}
          {slides.map((s) => (
            <div className="crow" key={s.id}>
              <button type="button" className="crow-main" onClick={() => editSlide(s)}>
                <span className="crow-thumb">
                  {s.media_type === 'video' ? <video src={s.media_url} muted /> : <img src={s.media_url} alt="" loading="lazy" />}
                </span>
                <span className="crow-body">
                  <strong>{s.title}</strong>
                  <span className="crow-meta">
                    <em className={`badge ${s.is_published ? 'pub' : 'draft'}`}>{s.is_published ? 'PUBLISH' : 'DRAFT'}</em>
                    <span>{s.eyebrow}</span><span>#{s.sort_order}</span>
                  </span>
                </span>
              </button>
              <RowMenu items={[
                { label: 'Edit', onClick: () => editSlide(s) },
                { label: s.is_published ? 'Jadikan draft' : 'Publish', onClick: () => togglePublish(s) },
                { label: 'Hapus', danger: true, onClick: () => handleDelete(s) }
              ]} />
            </div>
          ))}
        </div>
      </div>
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
