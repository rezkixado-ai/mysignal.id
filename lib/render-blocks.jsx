// Turns Editor.js OutputData ({ blocks: [...] }) into JSX for the public
// article page. Plain module (no 'use client') — safe to call from a Server
// Component. `blocksData` is expected to already be JSON.parse()'d.
export function renderBlocks(blocksData) {
  if (!blocksData || !Array.isArray(blocksData.blocks) || blocksData.blocks.length === 0) return null;

  return blocksData.blocks.map((block, i) => {
    const key = block.id || i;

    switch (block.type) {
      case 'header': {
        const level = block.data.level || 2;
        const Tag = `h${level}`;
        return <Tag key={key} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
      }

      case 'paragraph':
        return <p key={key} dangerouslySetInnerHTML={{ __html: block.data.text }} />;

      case 'list': {
        const Tag = block.data.style === 'ordered' ? 'ol' : 'ul';
        return (
          <Tag key={key}>
            {block.data.items.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </Tag>
        );
      }

      case 'quote':
        return (
          <blockquote key={key}>
            <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
            {block.data.caption && <cite>{block.data.caption}</cite>}
          </blockquote>
        );

      case 'table':
        return (
          <table key={key}>
            <tbody>
              {block.data.content.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} dangerouslySetInnerHTML={{ __html: cell }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'image':
        return (
          <figure key={key} style={{ margin: '24px 0' }}>
            <img src={block.data.file?.url} alt={block.data.caption || ''} style={{ width: '100%', borderRadius: 8, display: 'block' }} />
            {block.data.caption && <figcaption dangerouslySetInnerHTML={{ __html: block.data.caption }} />}
          </figure>
        );

      case 'imageGrid':
        return (
          <div
            key={key}
            style={{ display: 'grid', gridTemplateColumns: `repeat(${block.data.columns || 2}, 1fr)`, gap: 8, margin: '24px 0' }}
          >
            {block.data.images.map((img, gi) => (
              <div key={gi} style={{ borderRadius: 8, overflow: 'hidden' }}>
                <img src={img.url} alt={img.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
        );

      case 'faq':
        return (
          <div key={key} className="article-faq" style={{ margin: '32px 0' }}>
            {block.data.items.map((item, fi) => (
              <details key={fi} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
                <summary style={{ fontWeight: 600, cursor: 'pointer' }}>{item.q}</summary>
                <p style={{ marginTop: 8, color: 'var(--text-dim)' }}>{item.a}</p>
              </details>
            ))}
          </div>
        );

      case 'processSteps':
        return (
          <div key={key} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, margin: '32px 0' }}>
            {block.data.steps.map((step, si) => (
              <div key={si} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px 20px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: 'var(--blue-2, #6ea8fe)', marginBottom: 10 }}>
                  {String(si + 1).padStart(2, '0')}
                </div>
                <h4 style={{ marginBottom: 6 }}>{step.title}</h4>
                {step.description && <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>{step.description}</p>}
              </div>
            ))}
          </div>
        );

      case 'logoMarquee': {
        if (!block.data.logos || block.data.logos.length === 0) return null;
        // Duplicate the list once so the CSS animation (-50% translateX) loops seamlessly.
        const doubled = [...block.data.logos, ...block.data.logos];
        return (
          <div key={key} style={{ margin: '32px 0', overflow: 'hidden' }}>
            <style>{`
              @keyframes xiLogoMarqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
              .xi-logo-marquee { display: flex; align-items: center; gap: 48px; width: max-content; animation: xiLogoMarqueeScroll 28s linear infinite; }
              .xi-logo-marquee img { height: 34px; width: auto; opacity: 0.75; filter: grayscale(1); }
            `}</style>
            <div className="xi-logo-marquee">
              {doubled.map((logo, li) => (
                <img key={li} src={logo.url} alt={logo.name || ''} />
              ))}
            </div>
          </div>
        );
      }

      case 'contactCard': {
        const ICONS = { email: '✉️', phone: '📞', whatsapp: '💬', address: '📍', instagram: '📷', tiktok: '🎵', youtube: '▶️', other: '🔗' };
        return (
          <div key={key} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, margin: '32px 0' }}>
            {block.data.items.map((item, ci) => {
              const href = item.type === 'email'
                ? `mailto:${item.value}`
                : item.type === 'phone' || item.type === 'whatsapp'
                  ? `tel:${item.value}`
                  : item.value;
              const inner = (
                <>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{ICONS[item.type] || ICONS.other}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                    {item.label || item.type}
                  </div>
                  <div style={{ fontSize: 15, wordBreak: 'break-word' }}>{item.value}</div>
                </>
              );
              return (
                <a
                  key={ci}
                  href={href}
                  target={item.type === 'email' || item.type === 'phone' || item.type === 'whatsapp' ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, display: 'block', color: 'inherit', textDecoration: 'none' }}
                >
                  {inner}
                </a>
              );
            })}
          </div>
        );
      }

      default:
        return null;
    }
  });
}

// Builds a schema.org FAQPage JSON-LD object from the first FAQ block found,
// or null if the article has no FAQ block. Inject with:
// <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
export function getFaqJsonLd(blocksData) {
  if (!blocksData || !Array.isArray(blocksData.blocks)) return null;
  const faqBlock = blocksData.blocks.find((b) => b.type === 'faq' && b.data.items?.length);
  if (!faqBlock) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqBlock.data.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };
}
