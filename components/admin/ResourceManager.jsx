'use client';

import { useEffect, useMemo, useState } from 'react';
import { xList, xCreate, xUpdate, xDelete } from '../../lib/xapi.js';
import { uploadMedia } from '../../lib/api.js';
import Icon from '../Icon.jsx';
import RowMenu from './RowMenu.jsx';
import useNewTrigger from './useNewTrigger.js';

// Halaman kelola generik, berbasis konfigurasi.
// config = { resource, title, singular, fields:[{key,label,type,options,placeholder,hint,half,required}],
//            thumb:'image_url', primary:'name', meta:(row)=>[...], badge:(row)=>..., defaults:{}, publishKey:'is_published' }
// type: text | textarea | number | select | image | date | toggle | url

export default function ResourceManager({ config }) {
  const { resource, title, singular, fields, thumb, primary, meta, defaults = {}, publishKey, sortKey } = config;
  const blank = useMemo(() => {
    const o = {};
    fields.forEach((f) => { o[f.key] = f.type === 'toggle' ? 0 : ''; });
    return { id: null, ...o, ...defaults };
  }, [fields, defaults]);

  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [toast, setToast] = useState(null);

  function notify(message, type = 'ok') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }
  async function refresh() {
    try { setRows(await xList(resource)); } catch (e) { notify(e.message, 'error'); }
    setLoaded(true);
  }
  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function startNew() {
    const next = { ...blank };
    if (sortKey) next[sortKey] = rows.length;
    setForm(next); setOpen(true); window.scrollTo({ top: 0 });
  }
  useNewTrigger(startNew);

  function edit(row) {
    const next = { ...blank };
    Object.keys(row).forEach((k) => { next[k] = row[k] == null ? '' : row[k]; });
    setForm(next); setOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function close() { setOpen(false); setForm(blank); }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function upload(key, file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { notify('Pilih file gambar', 'error'); return; }
    setUploadingKey(key);
    try { const r = await uploadMedia(file); set(key, r.url); notify('Gambar ter-upload'); }
    catch (e) { notify(e.message, 'error'); }
    finally { setUploadingKey(null); }
  }

  async function submit(e) {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !String(form[f.key] ?? '').trim());
    if (missing) { notify(`${missing.label} wajib diisi`, 'error'); return; }
    setSaving(true);
    try {
      if (form.id) { await xUpdate(resource, form); notify(`${singular} di-update`); }
      else { await xCreate(resource, form); notify(`${singular} ditambahkan`); }
      close(); refresh();
    } catch (err) { notify(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function remove(row) {
    if (!confirm(`Hapus ${singular.toLowerCase()} "${row[primary]}"?`)) return;
    try { await xDelete(resource, row.id); notify(`${singular} dihapus`); refresh(); } catch (e) { notify(e.message, 'error'); }
  }
  async function togglePub(row) {
    try { await xUpdate(resource, { ...row, [publishKey]: row[publishKey] ? 0 : 1 }); refresh(); } catch (e) { notify(e.message, 'error'); }
  }

  function renderField(f) {
    const v = form[f.key] ?? '';
    const common = { id: `f-${f.key}`, value: v, onChange: (e) => set(f.key, e.target.value) };
    let control;
    if (f.type === 'textarea') control = <textarea {...common} rows={f.rows || 4} placeholder={f.placeholder} />;
    else if (f.type === 'select') control = (
      <select {...common}>{f.options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}</select>
    );
    else if (f.type === 'number') control = <input type="number" inputMode="numeric" {...common} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />;
    else if (f.type === 'date') control = <input type="date" {...common} value={String(v).slice(0, 10)} />;
    else if (f.type === 'url') control = <input type="text" inputMode="url" {...common} placeholder={f.placeholder || 'https://'} />;
    else if (f.type === 'toggle') {
      return (
        <label className="xa-toggle" key={f.key}>
          <span>{f.label}</span>
          <input type="checkbox" checked={!!Number(v)} onChange={(e) => set(f.key, e.target.checked ? 1 : 0)} />
        </label>
      );
    } else if (f.type === 'image') {
      return (
        <div className="field" key={f.key}>
          <label>{f.label}</label>
          <label className={`xa-imgbox${v ? ' has' : ''}${f.square ? ' sq' : ''}`}>
            {v ? <img src={v} alt="preview" /> : (
              <span className="empty"><Icon name="upload" size={24} />{uploadingKey === f.key ? 'Uploading…' : 'Ketuk untuk upload gambar'}</span>
            )}
            <input type="file" accept="image/*" hidden onChange={(e) => { upload(f.key, e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          {v && <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => set(f.key, '')}>Hapus gambar</button>}
          {f.hint && <p className="xa-hint">{f.hint}</p>}
        </div>
      );
    } else control = <input type="text" {...common} placeholder={f.placeholder} />;

    return (
      <div className="field" key={f.key}>
        <label htmlFor={`f-${f.key}`}>{f.label}</label>
        {control}
        {f.hint && <p className="xa-hint">{f.hint}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1 hl">{title}</h1>
          <p className="adm-sub">{loaded ? `${rows.length} item` : 'Memuat…'}</p>
        </div>
        <button type="button" className="btn" onClick={startNew}><Icon name="plus" size={18} /> Baru</button>
      </div>

      <div className="admin-split">
        <form className={`editor-panel card${open ? '' : ' closed'}`} onSubmit={submit}>
          <div className="ep-head">
            <h3>{form.id ? `Edit ${singular.toLowerCase()}` : `${singular} baru`}</h3>
            <button type="button" className="icon-btn plain ep-close" onClick={close} aria-label="Tutup"><Icon name="close" /></button>
          </div>
          <div className="xa-fgrid">
            {fields.map((f) => renderField(f))}
          </div>
          <div className="xa-save">
            <button type="button" className="btn btn-ghost ep-close" onClick={close}>Batal</button>
            <button className="btn" type="submit" disabled={saving || !!uploadingKey}>{saving ? 'Menyimpan…' : form.id ? 'Update' : `Tambah ${singular.toLowerCase()}`}</button>
          </div>
        </form>

        <div className="clist">
          {loaded && rows.length === 0 && <p className="adm-sub">Belum ada data — tambah yang pertama.</p>}
          {rows.map((r) => (
            <div className="crow" key={r.id}>
              <button type="button" className="crow-main" onClick={() => edit(r)}>
                {thumb && (
                  <span className="crow-thumb">{r[thumb] ? <img src={r[thumb]} alt="" loading="lazy" /> : <span className="crow-ph"><Icon name="image" size={18} /></span>}</span>
                )}
                <span className="crow-body">
                  <strong>{r[primary] || '(tanpa judul)'}</strong>
                  <span className="crow-meta">
                    {publishKey && <em className={`badge ${r[publishKey] ? 'pub' : 'draft'}`}>{r[publishKey] ? 'PUBLISH' : 'DRAFT'}</em>}
                    {(meta ? meta(r) : []).filter(Boolean).map((m, i) => <span key={i}>{m}</span>)}
                  </span>
                </span>
              </button>
              <RowMenu items={[
                { label: 'Edit', onClick: () => edit(r) },
                ...(publishKey ? [{ label: r[publishKey] ? 'Jadikan draft' : 'Publish', onClick: () => togglePub(r) }] : []),
                { label: 'Hapus', danger: true, onClick: () => remove(r) }
              ]} />
            </div>
          ))}
        </div>
      </div>
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
