'use client';

import { useEffect, useCallback } from 'react';

// Smooth fade+zoom lightbox with keyboard (Esc/arrow) and click-outside support.
export default function Lightbox({ items, index, onClose, onNavigate }) {
  const item = items[index];

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight' && index < items.length - 1) onNavigate(index + 1);
    if (e.key === 'ArrowLeft' && index > 0) onNavigate(index - 1);
  }, [index, items.length, onClose, onNavigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleKey]);

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        animation: 'xiLightboxFadeIn 0.25s ease'
      }}
    >
      <style>{`
        @keyframes xiLightboxFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes xiLightboxZoomIn { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <button
        onClick={onClose}
        aria-label="Close"
        type="button"
        style={{
          position: 'absolute', top: 20, right: 24, width: 40, height: 40, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff',
          fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        ✕
      </button>

      {index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(index - 1); }}
          aria-label="Previous"
          type="button"
          style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44,
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
            color: '#fff', fontSize: 20, cursor: 'pointer'
          }}
        >
          ‹
        </button>
      )}
      {index < items.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(index + 1); }}
          aria-label="Next"
          type="button"
          style={{
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44,
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
            color: '#fff', fontSize: 20, cursor: 'pointer'
          }}
        >
          ›
        </button>
      )}

      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', animation: 'xiLightboxZoomIn 0.25s ease' }}>
        {item.media_type === 'video' ? (
          <video src={item.media_url} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '78vh', borderRadius: 12 }} />
        ) : (
          <img
            src={item.media_url}
            alt={item.title || item.tag || 'Gallery item'}
            style={{ maxWidth: '90vw', maxHeight: '78vh', borderRadius: 12, display: 'block', margin: '0 auto' }}
          />
        )}
        {(item.title || item.tag) && (
          <div style={{ textAlign: 'center', marginTop: 14, color: '#fff' }}>
            {item.tag && <span style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9ca3af' }}>{item.tag}</span>}
            {item.title && <p style={{ marginTop: 4, fontSize: 15 }}>{item.title}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
