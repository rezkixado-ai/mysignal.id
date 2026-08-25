'use client';

import { analyzeArticleSEO, scoreLabel } from '../lib/seoAnalyzer.js';

const DOT_COLOR = { good: '#34d399', ok: '#f5b942', bad: '#ef4a4a' };

export default function SEOPanel({ article, siteUrl = 'https://mysignal.id' }) {
  const { checks, score, seoTitle, seoDesc, words } = analyzeArticleSEO(article);
  const label = scoreLabel(score);
  const url = `${siteUrl}/article/${article.slug || 'your-article-slug'}`;

  return (
    <div className="card" style={{ position: 'sticky', top: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15 }}>SEO Analysis</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: label.color, display: 'inline-block' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: label.color }}>{label.text}</span>
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>({score}/100)</span>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: '14px 16px', marginBottom: 18 }}>
        <div style={{ fontFamily: 'arial, sans-serif', fontSize: 13, color: '#202124', marginBottom: 2 }}>{url}</div>
        <div style={{ fontFamily: 'arial, sans-serif', fontSize: 18, color: '#1a0dab', lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {seoTitle || 'Your SEO title will appear here'}
        </div>
        <div style={{ fontFamily: 'arial, sans-serif', fontSize: 13.5, color: '#4d5156', lineHeight: 1.5 }}>
          {seoDesc || 'Your meta description will appear here — write one so Google shows something useful instead of a random snippet.'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {checks.map((c) => (
          <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: DOT_COLOR[c.status], marginTop: 5, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>{c.label}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 16, fontFamily: 'var(--font-mono)' }}>
        {words} words in body
      </p>
    </div>
  );
}
