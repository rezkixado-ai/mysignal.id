'use client';

import { useState } from 'react';
import { uploadMedia } from '../../lib/api.js';

// SEO lanjutan per artikel: noindex, canonical, dan judul/deskripsi/gambar khusus saat dibagikan (Open Graph).
// Disimpan bersama tombol Simpan/Update artikel (lihat articles/page.jsx).
export default function ArticleSeoExtra({ value, onChange, canSave, onError }) {
  const [up, setUp] = useState(false);
  const set = (patch) => onChange({ ...value, ...patch });

  async function pick(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { onError?.('Pilih file gambar'); return; }
    setUp(true);
    try { const r = await uploadMedia(file); set({ og_image: r.url }); } catch (e) { onError?.(e.message); } finally { setUp(false); }
  }

  return (
    <div className="seo-extra" style={{ display: 'grid', gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
      <strong style={{ fontSize: 14 }}>Pengaturan lanjutan</strong>
      {!canSave && <p className="xa-hint" style={{ margin: 0 }}>Simpan artikel sekali dulu (draft juga boleh). Setelah itu pengaturan di bawah ini bisa diisi.</p>}
      <div style={canSave ? undefined : { opacity: .45, pointerEvents: 'none' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, cursor: 'pointer' }}>
          <input type="checkbox" style={{ width: 20, height: 20 }} checked={!!value.noindex} onChange={(e) => set({ noindex: e.target.checked ? 1 : 0 })} />
          <span>Jangan tampilkan di Google (noindex)</span>
        </label>
        <p className="xa-hint" style={{ marginTop: 0 }}>Artikel tetap bisa dibuka lewat link, tapi tidak masuk hasil pencarian dan sitemap.</p>

        <div className="field" style={{ marginTop: 12 }}>
          <label>Canonical URL (kosong = alamat artikel ini)</label>
          <input type="text" inputMode="url" placeholder="https://… atau /article/slug-lain" value={value.canonical || ''} onChange={(e) => set({ canonical: e.target.value })} />
          <p className="xa-hint">Isi hanya kalau konten ini duplikat dari halaman lain dan lo mau Google menganggap halaman itu sebagai versi utama.</p>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>Judul saat dibagikan (Open Graph)</label>
          <input type="text" maxLength={120} placeholder="Kosong = pakai SEO title" value={value.og_title || ''} onChange={(e) => set({ og_title: e.target.value })} />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Deskripsi saat dibagikan</label>
          <textarea rows={2} maxLength={300} placeholder="Kosong = pakai meta description" value={value.og_description || ''} onChange={(e) => set({ og_description: e.target.value })} />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Gambar saat dibagikan (disarankan 1200×630)</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {value.og_image ? <img src={value.og_image} alt="" style={{ width: 120, height: 63, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} /> : null}
            <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
              {up ? 'Uploading…' : value.og_image ? 'Ganti gambar' : 'Upload gambar'}
              <input type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
            </label>
            {value.og_image ? <button type="button" className="btn btn-ghost" onClick={() => set({ og_image: '' })}>Hapus</button> : null}
          </div>
          <p className="xa-hint">Kosong = pakai cover artikel, atau logo Xignal kalau tidak ada cover.</p>
        </div>
      </div>
    </div>
  );
}
