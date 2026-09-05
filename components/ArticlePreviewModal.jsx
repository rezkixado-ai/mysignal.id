'use client';

import { renderBlocks } from '../lib/render-blocks.jsx';

const dateFmtPreview = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Shows the article exactly as renderBlocks() will output it on the public
// site — same function, same block-to-JSX mapping — so what you see here is
// what visitors will see once published (images/video included, once media
// upload works — i.e. on production or under `netlify dev`).
export default function ArticlePreviewModal({ article, onClose }) {
  const hasBlocks = article.content_blocks && Array.isArray(article.content_blocks.blocks) && article.content_blocks.blocks.length > 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 999,
        display: 'flex', justifyContent: 'center', overflowY: 'auto', padding: '40px 16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          maxWidth: 760, width: '100%', padding: '32px 36px', height: 'fit-content', position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute', top: 16, right: 16, background: 'var(--bg-soft)', border: '1px solid var(--border)',
            borderRadius: 8, width: 32, height: 32, color: 'var(--text-dim)', cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <span className="eyebrow">{article.category || 'Category'}</span>
        <h1 style={{ fontSize: 'clamp(24px,3.6vw,38px)', margin: '14px 0 12px' }}>{article.title || 'Untitled article'}</h1>
        {article.excerpt && <p style={{ color: 'var(--text-dim)', fontSize: 16, marginBottom: 14 }}>{article.excerpt}</p>}
        <div className="meta-row" style={{ marginBottom: 20 }}>
          <span>{dateFmtPreview()}</span>
          <span>·</span>
          <span>{article.read_minutes || 5} min read</span>
        </div>

        {article.cover_media_url && (
          <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 24 }}>
            {article.cover_media_type === 'video'
              ? <video src={article.cover_media_url} controls style={{ width: '100%', display: 'block' }} />
              : <img src={article.cover_media_url} alt={article.title} style={{ width: '100%', display: 'block' }} />}
          </div>
        )}

        <div className="article-prose" style={{ color: 'var(--text-dim)', fontSize: 16, lineHeight: 1.75 }}>
          {hasBlocks
            ? renderBlocks(article.content_blocks)
            : <p style={{ color: 'var(--text-faint)' }}>Belum ada konten di body — mulai nulis block di editor untuk lihat preview di sini.</p>}
        </div>
      </div>
    </div>
  );
}
