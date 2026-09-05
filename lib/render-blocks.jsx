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
