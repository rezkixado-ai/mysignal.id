'use client';

import { useState } from 'react';

const P = {
  x: 'M18.9 2H22l-7.2 8.2L23 22h-6.6l-5.2-6.8L5.2 22H2l7.7-8.8L1.5 2h6.7l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.3 3.9H5.4L17.7 20Z',
  fb: 'M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.4-1.7 1.8-1.7H17V3.8c-.3 0-1.3-.2-2.4-.2-2.5 0-4.1 1.5-4.1 4.2v2.7H7.7v3.3h2.8V22h3Z',
  in: 'M4.5 8.5h3.9V21H4.5V8.5ZM6.5 2.8a2.3 2.3 0 1 1 0 4.5 2.3 2.3 0 0 1 0-4.5ZM10.8 8.5h3.7v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-3.9v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21h-3.9V8.5Z'
};

export default function ShareButtons({ title, path }) {
  const [done, setDone] = useState(false);
  const url = () => (typeof window !== 'undefined' ? `${window.location.origin}${path}` : path);
  const open = (href) => window.open(href, '_blank', 'noopener,noreferrer,width=640,height=560');
  const copy = async () => {
    try { await navigator.clipboard.writeText(url()); }
    catch { const t = document.createElement('textarea'); t.value = url(); document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch { /* abaikan */ } t.remove(); }
    setDone(true); setTimeout(() => setDone(false), 1800);
  };
  const enc = encodeURIComponent;
  return (
    <div className="x-share" aria-label="Bagikan artikel">
      <span>Bagikan:</span>
      <button type="button" aria-label="Bagikan ke X" className="s-x" onClick={() => open(`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url())}`)}><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d={P.x} /></svg></button>
      <button type="button" aria-label="Bagikan ke Facebook" className="s-fb" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${enc(url())}`)}><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d={P.fb} /></svg></button>
      <button type="button" aria-label="Bagikan ke LinkedIn" className="s-in" onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url())}`)}><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d={P.in} /></svg></button>
      <button type="button" aria-label="Salin link" className="s-ln" onClick={copy}>
        {done
          ? <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>
          : <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" /></svg>}
      </button>
      {done ? <em className="x-share-ok" role="status">Link disalin</em> : null}
    </div>
  );
}
