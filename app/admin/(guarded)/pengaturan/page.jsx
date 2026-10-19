'use client';

import { useEffect, useState } from 'react';
import { xGetSettings, xSaveSettings } from '../../../../lib/xapi.js';
import { uploadMedia } from '../../../../lib/api.js';
import Icon from '../../../../components/Icon.jsx';

const T = 'text', A = 'textarea';
const GROUPS = [
  { id: 'kontak', title: 'Kontak & WhatsApp', fields: [
    ['wa_number', 'Nomor WhatsApp', T, 'Format 62812xxxx tanpa + atau spasi. Dipakai semua tombol WhatsApp.'],
    ['footer_tagline', 'Tagline footer', A],
    ['social_instagram', 'Link Instagram', T], ['social_youtube', 'Link YouTube', T], ['social_linkedin', 'Link LinkedIn', T]
  ] },
  { id: 'hero', title: 'Hero Beranda', fields: [
    ['hero_image_url', 'Gambar hero', 'image', 'Kosongkan untuk memakai ilustrasi bawaan.'],
    ['hero_eyebrow', 'Teks kecil atas', T], ['hero_title_1', 'Judul baris 1', T], ['hero_title_2', 'Judul baris 2 (gradasi)', T],
    ['hero_desc', 'Deskripsi', A], ['hero_side_text', 'Teks samping', T]
  ] },
  { id: 'stats', title: 'Angka Statistik', fields: [1, 2, 3].flatMap((n) => [
    [`stat_${n}_value`, `Statistik ${n} — angka`, T], [`stat_${n}_label`, `Statistik ${n} — label`, T], [`stat_${n}_sub`, `Statistik ${n} — keterangan`, T]
  ]) },
  { id: 'visi', title: 'Visi & Misi', fields: [
    ['vision_title', 'Judul visi', T], ['vision_body', 'Isi visi', A], ['mission_title', 'Judul misi', T], ['mission_body', 'Isi misi', A]
  ] },
  { id: 'tentang', title: 'Halaman Tentang', fields: [
    ['about_hero_title', 'Judul utama', T], ['about_hero_desc', 'Deskripsi', A], ['about_cta_title', 'Judul CTA bawah', T], ['about_cta_body', 'Isi CTA bawah', A]
  ] }
];

export default function Pengaturan() {
  const [vals, setVals] = useState(null);
  const [openId, setOpenId] = useState('kontak');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const notify = (message, type = 'ok') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { xGetSettings().then(setVals).catch((e) => notify(e.message, 'error')); }, []);
  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try { await xSaveSettings(vals); notify('Pengaturan tersimpan'); } catch (err) { notify(err.message, 'error'); } finally { setSaving(false); }
  }
  async function upload(file) {
    if (!file) return;
    setUploading(true);
    try { const r = await uploadMedia(file); set('hero_image_url', r.url); } catch (err) { notify(err.message, 'error'); } finally { setUploading(false); }
  }

  return (
    <form onSubmit={save}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1 hl">Pengaturan</h1>
          <p className="adm-sub">Teks dan kontak yang tampil di website</p>
        </div>
      </div>
      {!vals && <p className="adm-sub">Memuat…</p>}
      {vals && GROUPS.map((g) => (
        <section className="card xa-acc" key={g.id}>
          <button type="button" className="xa-acc-h" aria-expanded={openId === g.id} onClick={() => setOpenId(openId === g.id ? '' : g.id)}>
            <span>{g.title}</span><span className={`xa-acc-c${openId === g.id ? ' on' : ''}`}><Icon name="chevron" size={18} /></span>
          </button>
          {openId === g.id && (
            <div className="xa-fgrid xa-acc-b">
              {g.fields.map(([key, label, type, hint]) => {
                if (type === 'image') {
                  const v = vals[key] || '';
                  return (
                    <div className="field" key={key}>
                      <label>{label}</label>
                      <label className={`xa-imgbox${v ? ' has' : ''}`}>
                        {v ? <img src={v} alt="" /> : <span className="empty"><Icon name="upload" size={24} />{uploading ? 'Uploading…' : 'Ketuk untuk upload'}</span>}
                        <input type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
                      </label>
                      {v && <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => set(key, '')}>Hapus gambar</button>}
                      {hint && <p className="xa-hint">{hint}</p>}
                    </div>
                  );
                }
                return (
                  <div className="field" key={key}>
                    <label htmlFor={`s-${key}`}>{label}</label>
                    {type === 'textarea'
                      ? <textarea id={`s-${key}`} rows={3} value={vals[key] ?? ''} onChange={(e) => set(key, e.target.value)} />
                      : <input id={`s-${key}`} type="text" value={vals[key] ?? ''} onChange={(e) => set(key, e.target.value)} inputMode={key === 'wa_number' ? 'numeric' : undefined} />}
                    {hint && <p className="xa-hint">{hint}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}
      {vals && (
        <div className="xa-save"><button className="btn" type="submit" disabled={saving || uploading}>{saving ? 'Menyimpan…' : 'Simpan pengaturan'}</button></div>
      )}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </form>
  );
}
