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
              .xi-logo-marquee img { height: 34px; width: auto; opacity: 0.9; }
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
        const ICONS = {
          email: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="white" stroke-width="2"/><path d="M3 7l9 6 9-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          phone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.9c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8z" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>',
          whatsapp: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" stroke="white" stroke-width="2"/><path d="M8.7 8.2c-.3-.6-.5-.6-.8-.6h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.3 3.2.2.2 2.1 3.3 5.2 4.4 2.6.9 3.1.7 3.7.7.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.6.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.6-.9-2.1z" fill="white"/></svg>',
          address: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z" stroke="white" stroke-width="2"/><circle cx="12" cy="10" r="2.5" stroke="white" stroke-width="2"/></svg>',
          instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="white" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1" fill="white"/></svg>',
          tiktok: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3v10.5a3.5 3.5 0 1 1-3-3.46" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M15 3a5 5 0 0 0 5 5" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>',
          youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="3" stroke="white" stroke-width="2"/><path d="M11 10l4 2-4 2z" fill="white"/></svg>',
          other: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 15l6-6M10 6h5a3 3 0 0 1 3 3v0M14 18H9a3 3 0 0 1-3-3v0" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>'
        };
        return (
          <div key={key} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, margin: '32px 0' }}>
            {block.data.items.map((item, ci) => {
              const href = item.type === 'email'
                ? `mailto:${item.value}`
                : item.type === 'phone' || item.type === 'whatsapp'
                  ? `tel:${item.value}`
                  : item.value;
              const isExternal = !['email', 'phone', 'whatsapp'].includes(item.type);
              return (
                <a
                  key={ci}
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  style={{
                    position: 'relative', display: 'block', padding: 22, borderRadius: 16,
                    background: 'linear-gradient(160deg, rgba(96,165,250,0.14) 0%, rgba(52,211,153,0.07) 55%, rgba(0,0,0,0) 100%)',
                    border: '1px solid var(--border)', color: 'inherit', textDecoration: 'none', overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: 42, height: 42, borderRadius: 12, marginBottom: 14,
                      background: 'linear-gradient(135deg, #34d399 0%, #38bdf8 55%, #818cf8 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    dangerouslySetInnerHTML={{ __html: ICONS[item.type] || ICONS.other }}
                  />
                  <div style={{ fontSize: 12.5, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                    {item.label || item.type}
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 500, wordBreak: 'break-word' }}>{item.value}</div>
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
