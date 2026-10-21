'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { xGetSettings, xSaveSettings } from '../../../../lib/xapi.js';
import { uploadMedia } from '../../../../lib/api.js';
import Icon from '../../../../components/Icon.jsx';
import { PromoCard, PromoOverlay, visualMode } from '../../../../components/site/PromoPopup.jsx';

const PAGES = [['home', 'Beranda'], ['produk', 'Produk'], ['artikel', 'Artikel'], ['event', 'Event'], ['video', 'Video'], ['tentang', 'Tentang'], ['kontak', 'Kontak'], ['gallery', 'Gallery']];
const p2 = (n) => String(n).padStart(2, '0');
const toLocal = (iso) => { const t = Date.parse(iso); if (Number.isNaN(t)) return ''; const d = new Date(t); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`; };
const fromLocal = (v) => (v ? new Date(v).toISOString() : '');
const fmt = (iso) => new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function status(v) {
  if (v.promo_enabled !== '1') return ['off', 'Nonaktif'];
  const now = Date.now(), st = Date.parse(v.promo_start), en = Date.parse(v.promo_end);
  if (!Number.isNaN(st) && now < st) return ['wait', `Terjadwal mulai ${fmt(v.promo_start)}`];
  if (!Number.isNaN(en) && now >= en) return ['end', 'Sudah berakhir'];
  return ['on', Number.isNaN(en) ? 'Sedang tayang' : `Tayang sampai ${fmt(v.promo_end)}`];
}

const Ctx = createContext(null);

function Acc({ id, title, children }) {
  const { openId, setOpenId } = useContext(Ctx);
  return (
    <section className="card xa-acc">
      <button type="button" className="xa-acc-h" aria-expanded={openId === id} onClick={() => setOpenId(openId === id ? '' : id)}>
        <span>{title}</span><span className={`xa-acc-c${openId === id ? ' on' : ''}`}><Icon name="chevron" size={18} /></span>
      </button>
      {openId === id && <div className="xa-fgrid xa-acc-b">{children}</div>}
    </section>
  );
}
function Txt({ k, label, hint, area, ...rest }) {
  const { vals, set } = useContext(Ctx);
  return (
    <div className="field">
      <label htmlFor={`p-${k}`}>{label}</label>
      {area ? <textarea id={`p-${k}`} rows={3} value={vals[k] ?? ''} onChange={(e) => set(k, e.target.value)} /> : <input id={`p-${k}`} type="text" value={vals[k] ?? ''} onChange={(e) => set(k, e.target.value)} {...rest} />}
      {hint && <p className="xa-hint">{hint}</p>}
    </div>
  );
}
function Sel({ k, label, options, hint }) {
  const { vals, set } = useContext(Ctx);
  return (
    <div className="field">
      <label htmlFor={`p-${k}`}>{label}</label>
      <select id={`p-${k}`} value={vals[k] ?? ''} onChange={(e) => set(k, e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      {hint && <p className="xa-hint">{hint}</p>}
    </div>
  );
}
function Num({ k, label, hint, min = 0, max = 999, step }) {
  const { vals, set } = useContext(Ctx);
  return (
    <div className="field">
      <label htmlFor={`p-${k}`}>{label}</label>
      <input id={`p-${k}`} type="number" inputMode={step ? 'decimal' : 'numeric'} step={step} min={min} max={max} value={vals[k] ?? ''} onChange={(e) => set(k, e.target.value)} />
      {hint && <p className="xa-hint">{hint}</p>}
    </div>
  );
}
function When({ k, label, hint }) {
  const { vals, set } = useContext(Ctx);
  return (
    <div className="field">
      <label htmlFor={`p-${k}`}>{label}</label>
      <input id={`p-${k}`} type="datetime-local" value={toLocal(vals[k])} onChange={(e) => set(k, fromLocal(e.target.value))} />
      {vals[k] && <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => set(k, '')}>Kosongkan</button>}
      {hint && <p className="xa-hint">{hint}</p>}
    </div>
  );
}

export default function PromoAdmin() {
  const [vals, setVals] = useState(null);
  const [openId, setOpenId] = useState('konten');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState(null);
  const notify = (message, type = 'ok') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => { xGetSettings().then(setVals).catch((e) => notify(e.message, 'error')); }, []);
  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }));

  const target = useMemo(() => {
    if (!vals) return null;
    if (vals.promo_countdown === 'minutes') return Date.now() + Math.max(1, Number(vals.promo_countdown_minutes) || 15) * 60000;
    if (vals.promo_countdown === 'end') { const e = Date.parse(vals.promo_end); return e > Date.now() ? e : Date.now() + 2 * 86400000 + 3 * 3600000; }
    return null;
  }, [vals?.promo_countdown, vals?.promo_countdown_minutes, vals?.promo_end]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await xSaveSettings(Object.fromEntries(Object.entries(vals).filter(([k]) => k.startsWith('promo_'))));
      notify('Promo tersimpan');
    } catch (err) { notify(err.message, 'error'); } finally { setSaving(false); }
  }
  async function upload(file, key = 'promo_image_url') {
    if (!file) return;
    setUploading(true);
    try { const r = await uploadMedia(file); set(key, r.url); } catch (err) { notify(err.message, 'error'); } finally { setUploading(false); }
  }

  if (!vals) return <p className="adm-sub">Memuat…</p>;
  const [st, stText] = status(vals);
  const mode = visualMode(vals);
  const pages = String(vals.promo_pages || 'all').split(',').filter(Boolean);
  const togglePage = (id) => {
    if (id === 'all') return set('promo_pages', 'all');
    const cur = pages.filter((x) => x !== 'all');
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    set('promo_pages', next.length ? next.join(',') : 'all');
  };

  return (
    <Ctx.Provider value={{ vals, set, openId, setOpenId }}>
    <form onSubmit={save}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1 hl">Promo Popup</h1>
          <p className="adm-sub">Voucher interaktif yang muncul di website</p>
        </div>
      </div>

      <section className="card xa-pstat">
        <label className="xa-toggle">
          <span><b>Popup aktif</b><small className={`xa-pchip ${st}`}>{stText}</small></span>
          <input type="checkbox" checked={vals.promo_enabled === '1'} onChange={(e) => set('promo_enabled', e.target.checked ? '1' : '0')} />
        </label>
      </section>

      <section className="card xa-pv">
        <div className="xa-pv-h"><b>Pratinjau</b><button type="button" className="btn btn-ghost" onClick={() => setTesting(true)}><Icon name="eye" size={16} /> Tes popup di layar</button></div>
        <PromoCard preview p={vals} ctaHref="#" target={target} />
      </section>

      <Acc id="konten" title="Konten voucher">
        <Txt k="promo_eyebrow" label="Teks kecil di atas" />
        <Txt k="promo_title" label="Judul" />
        <Txt k="promo_code" label="Kode voucher" autoCapitalize="characters" spellCheck={false}
          hint="Pengunjung bisa menyalinnya dengan sekali ketuk." onChange={(e) => set('promo_code', e.target.value.toUpperCase().replace(/\s/g, ''))} />
        <Txt k="promo_desc" label="Deskripsi" area />
        <Txt k="promo_cta_label" label="Teks tombol" hint="Kosongkan kalau tidak mau ada tombol." />
        <Txt k="promo_cta_url" label="Link tombol" placeholder="https://…" hint="Kosong = buka WhatsApp (nomor di menu Pengaturan) dengan pesan otomatis berisi kode voucher." />
      </Acc>

      <Acc id="visual" title="Visual sisi kanan">
        <div className="field">
          <label>Tampilan</label>
          <div className="xa-pages">
            {[['image', 'Gambar'], ['number', 'Angka besar'], ['both', 'Gambar + angka']].map(([v, l]) => (
              <button type="button" key={v} className={`pill${mode === v ? ' on' : ''}`} onClick={() => set('promo_visual', v)}>{l}</button>
            ))}
          </div>
          <p className="xa-hint">Ganti kapan saja sesuai kebutuhan promo. Pratinjau di atas langsung ikut berubah.</p>
        </div>
        {(mode === 'image' || mode === 'both') && (
        <div className="field">
          <label>Gambar</label>
          <label className={`xa-imgbox${vals.promo_image_url ? ' has' : ''}`}>
            {vals.promo_image_url ? <img src={vals.promo_image_url} alt="" /> : <span className="empty"><Icon name="upload" size={24} />{uploading ? 'Uploading…' : 'Ketuk untuk upload'}</span>}
            <input type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          {vals.promo_image_url && <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => set('promo_image_url', '')}>Hapus gambar</button>}
          <p className="xa-hint">Rasio mendekati kotak (4:5 atau 1:1) paling pas. Upload gambar baru kapan saja untuk mengganti.</p>
        </div>
        )}
        {(mode === 'number' || mode === 'both') && (
          <>
            {mode === 'number' && (
              <>
                <Sel k="promo_bg_mode" label="Latar di belakang angka" options={[['on', 'Aktif (video looping atau animasi abstrak)'], ['off', 'Polos (tanpa latar bergerak)']]} />
                {vals.promo_bg_mode !== 'off' && (
                  <div className="field">
                    <label>Video latar (opsional)</label>
                    <Txt k="promo_bg_video_url" label="" placeholder="Kosong = pakai animasi abstrak bawaan" />
                    <label className="btn btn-ghost" style={{ marginTop: 8, cursor: 'pointer' }}>
                      {uploading ? 'Uploading…' : 'Upload video (mp4/webm)'}
                      <input type="file" accept="video/mp4,video/webm" hidden onChange={(e) => { upload(e.target.files?.[0], 'promo_bg_video_url'); e.target.value = ''; }} />
                    </label>
                    {vals.promo_bg_video_url && <button type="button" className="btn btn-ghost" style={{ marginTop: 8, marginLeft: 8 }} onClick={() => set('promo_bg_video_url', '')}>Hapus video</button>}
                    <p className="xa-hint">Video diputar otomatis, tanpa suara, berulang, lalu diberi gradasi hijau–biru. Pakai klip siluet 5–10 detik yang ringan (di bawah 3 MB). Jika gagal dimuat, otomatis kembali ke animasi abstrak.</p>
                  </div>
                )}
              </>
            )}
            <Txt k="promo_number" label="Angka" inputMode="decimal" hint="Contoh: 30, 50, 1.5. Angka ini dihitung naik dari 0 seperti hit counter." />
            <div className="xa-fgrid two">
              <Txt k="promo_number_prefix" label="Awalan" placeholder="mis. s/d atau Rp" />
              <Txt k="promo_number_suffix" label="Akhiran" placeholder="mis. % atau rb" />
            </div>
            <Txt k="promo_number_label" label="Label" hint="Contoh: DISKON, CASHBACK, GRATIS ONGKIR. Kosongkan kalau tidak perlu." />
            <Sel k="promo_number_anim" label="Animasi hitung" options={[['loop', 'Berulang terus-menerus'], ['once', 'Sekali saat popup muncul'], ['off', 'Tanpa animasi (angka langsung penuh)']]} />
            {vals.promo_number_anim !== 'off' && <Num k="promo_number_secs" label="Durasi hitung (detik)" min={0.5} max={8} step={0.1} hint="Makin kecil makin cepat." />}
          </>
        )}
      </Acc>

      <Acc id="jadwal" title="Jadwal tayang">
        <When k="promo_start" label="Mulai tayang" hint="Kosong = langsung tayang setelah diaktifkan." />
        <When k="promo_end" label="Berhenti tayang" hint="Kosong = tayang terus sampai dimatikan. Setelah waktu ini popup otomatis hilang." />
      </Acc>

      <Acc id="hitung" title="Hitung mundur">
        <Sel k="promo_countdown" label="Mode" options={[['minutes', 'X menit sejak popup muncul (urgensi per pengunjung)'], ['end', 'Sampai tanggal berhenti tayang'], ['off', 'Tanpa hitung mundur']]}
          hint={vals.promo_countdown === 'end' && !vals.promo_end ? 'Isi “Berhenti tayang” di Jadwal agar hitung mundur muncul.' : 'Saat hitung mundur habis, popup menutup sendiri.'} />
        {vals.promo_countdown === 'minutes' && <Num k="promo_countdown_minutes" label="Durasi (menit)" min={1} max={1440} hint="Per pengunjung. Hitungannya tersimpan, jadi refresh halaman tidak mengulang dari awal." />}
        {vals.promo_countdown !== 'off' && <Txt k="promo_countdown_label" label="Teks di bawah hitung mundur" />}
      </Acc>

      <Acc id="muncul" title="Kapan & di mana muncul">
        <Sel k="promo_trigger" label="Pemicu" options={[['delay', 'Setelah beberapa detik'], ['scroll', 'Setelah scroll sekian persen'], ['exit', 'Saat pengunjung mau meninggalkan halaman']]}
          hint={vals.promo_trigger === 'exit' ? 'Hanya terdeteksi di desktop (mouse keluar ke atas). Di HP popup muncul setelah ±15 detik.' : undefined} />
        {vals.promo_trigger === 'delay' && <Num k="promo_delay" label="Tunda (detik)" min={0} max={300} />}
        {vals.promo_trigger === 'scroll' && <Num k="promo_scroll" label="Scroll (%)" min={5} max={95} />}
        <Sel k="promo_frequency" label="Seberapa sering" options={[['session', 'Sekali per kunjungan (sesi)'], ['daily', 'Sekali per hari'], ['once', 'Sekali saja per pengunjung'], ['always', 'Setiap halaman dimuat ulang']]}
          hint="Mengubah kode, judul, jadwal, atau hitung mundur membuat popup muncul lagi untuk semua pengunjung." />
        <div className="field">
          <label>Halaman</label>
          <div className="xa-pages">
            <button type="button" className={`pill${pages.includes('all') ? ' on' : ''}`} onClick={() => togglePage('all')}>Semua halaman</button>
            {PAGES.map(([id, l]) => <button type="button" key={id} className={`pill${!pages.includes('all') && pages.includes(id) ? ' on' : ''}`} onClick={() => togglePage(id)}>{l}</button>)}
          </div>
        </div>
        <Sel k="promo_device" label="Perangkat" options={[['all', 'Semua perangkat'], ['desktop', 'Hanya desktop'], ['mobile', 'Hanya HP']]} />
      </Acc>

      <div className="xa-save"><button className="btn" type="submit" disabled={saving || uploading}>{saving ? 'Menyimpan…' : 'Simpan promo'}</button></div>
      {testing && <PromoOverlay p={vals} ctaHref="#" target={target} onClose={() => setTesting(false)} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </form>
    </Ctx.Provider>
  );
}
