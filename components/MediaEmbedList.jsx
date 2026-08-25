'use client';

import { uploadMedia } from '../lib/api.js';

export default function MediaEmbedList({ items, onChange }) {
  async function handleAdd(file) {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) return;
    try {
      const result = await uploadMedia(file);
      onChange([...items, { media_type: result.mediaType, media_url: result.url, caption: '' }]);
    } catch (err) {
      alert(err.message);
    }
  }

  function updateCaption(i, caption) {
    const next = [...items];
    next[i] = { ...next[i], caption };
    onChange(next);
  }

  function remove(i) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      {items.map((m, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 10, alignItems: 'center', marginBottom: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ width: 64, height: 44, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-soft)' }}>
            {m.media_type === 'video'
              ? <video src={m.media_url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <img src={m.media_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <input
            type="text" placeholder="Caption (optional)" value={m.caption || ''}
            onChange={(e) => updateCaption(i, e.target.value)}
            style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 10px', borderRadius: 6, fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" onClick={() => move(i, -1)} style={{ padding: '6px 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)' }}>↑</button>
            <button type="button" onClick={() => move(i, 1)} style={{ padding: '6px 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)' }}>↓</button>
            <button type="button" onClick={() => remove(i)} style={{ padding: '6px 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--red)' }}>✕</button>
          </div>
        </div>
      ))}
      <label className="upload-box" style={{ display: 'block', marginTop: 6 }}>
        + Add image / video to article body
        <input type="file" accept="image/*,video/*" hidden onChange={(e) => { handleAdd(e.target.files?.[0]); e.target.value = ''; }} />
      </label>
    </div>
  );
}
