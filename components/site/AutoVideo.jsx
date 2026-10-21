'use client';

import { useEffect, useRef } from 'react';

// Video cover yang selalu autoplay (muted, loop), tanpa perlu hover.
// muted di-set lewat properti DOM karena atribut muted dari SSR React tidak selalu terbaca browser.
// Hanya diputar saat terlihat di layar, supaya hemat baterai dan data.
export default function AutoVideo({ src, className = '', ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    v.muted = true;
    v.defaultMuted = true;
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    if (!('IntersectionObserver' in window)) { play(); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) play(); else v.pause(); }, { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return <video ref={ref} className={className} src={src} muted loop autoPlay playsInline preload="metadata" disablePictureInPicture {...rest} />;
}
