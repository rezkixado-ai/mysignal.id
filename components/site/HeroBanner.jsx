'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1];
const FADE = 1.2;          // detik, durasi crossfade
const KB = ['in-tl', 'in-br', 'out-tr', 'in-bl'];

// Ken Burns: zoom pelan + geser tipis, arahnya bergantian tiap slide
function kb(i) {
  const m = KB[i % KB.length];
  const zoomIn = m.startsWith('in');
  const x = m.endsWith('tl') || m.endsWith('bl') ? [-1.2, 1.2] : [1.2, -1.2];
  const y = m.endsWith('tl') || m.endsWith('tr') ? [-0.8, 0.8] : [0.8, -0.8];
  return { s: zoomIn ? [1.02, 1.085] : [1.085, 1.02], x, y };
}

export default function HeroBanner({ slides, interval = 5600 }) {
  const n = slides.length;
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [hold, setHold] = useState(false);
  const [visible, setVisible] = useState(true);
  const root = useRef(null);
  const first = useRef(true);
  useEffect(() => { first.current = false; }, []);

  const go = useCallback((to, d) => {
    setDir(d ?? (to >= idx ? 1 : -1));
    setIdx(((to % n) + n) % n);
  }, [idx, n]);
  const next = useCallback(() => go(idx + 1, 1), [go, idx]);
  const prev = useCallback(() => go(idx - 1, -1), [go, idx]);

  // muat gambar berikutnya lebih dulu supaya transisi tidak tersendat
  useEffect(() => {
    [1, 2].forEach((k) => { const im = new window.Image(); im.src = slides[(idx + k) % n].src; });
  }, [idx, n, slides]);

  // autoplay: berhenti saat di-hover / tab tersembunyi / banner di luar layar
  useEffect(() => {
    const onVis = () => setHold(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    let io;
    if ('IntersectionObserver' in window && root.current) {
      io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
      io.observe(root.current);
    }
    return () => { document.removeEventListener('visibilitychange', onVis); io && io.disconnect(); };
  }, []);
  const [hover, setHover] = useState(false);
  const paused = hover || hold || !visible;
  useEffect(() => {
    if (n < 2 || paused) return undefined;
    const t = setTimeout(next, interval);
    return () => clearTimeout(t);
  }, [idx, paused, n, next, interval]);

  const s = slides[idx];
  const k = kb(idx);
  const link = s.href && s.href !== '#' ? s.href : null;
  const external = link && /^https?:/i.test(link);
  const Img = (
    <motion.img
      src={s.src} alt={s.title || 'Banner Xignal'} draggable={false}
      initial={{ scale: k.s[0], x: `${k.x[0]}%`, y: `${k.y[0]}%` }}
      animate={{ scale: k.s[1], x: `${k.x[1]}%`, y: `${k.y[1]}%` }}
      transition={{ duration: interval / 1000 + FADE + 0.6, ease: 'linear' }}
      className="x-hbn-img" loading="eager" decoding="async"
    />
  );

  return (
    <MotionConfig reducedMotion="never">
      <div
        ref={root} className="x-hbn" role="region" aria-roledescription="carousel" aria-label="Banner Xignal"
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); }}
      >
        <motion.div
          className="x-hbn-stage"
          onPanEnd={(_, info) => { if (n < 2) return; if (info.offset.x < -40) next(); else if (info.offset.x > 40) prev(); }}
        >
          <AnimatePresence>
            <motion.div
              key={idx} className="x-hbn-slide" aria-live="polite"
              initial={first.current ? false : { opacity: 0, x: dir * 28 }}
              animate={{ opacity: 1, x: 0, transition: { duration: FADE, ease: EASE } }}
              exit={{ opacity: 0, x: dir * -28, transition: { duration: FADE, ease: EASE } }}
            >
              {link ? (external
                ? <a href={link} target="_blank" rel="noopener noreferrer" className="x-hbn-link" tabIndex={-1}>{Img}</a>
                : <Link href={link} className="x-hbn-link" tabIndex={-1}>{Img}</Link>) : Img}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {n > 1 && (
          <>
            <button type="button" className="x-hbn-nav prev" onClick={prev} aria-label="Slide sebelumnya">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" className="x-hbn-nav next" onClick={next} aria-label="Slide berikutnya">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="x-hbn-bar" role="tablist" aria-label="Pilih slide">
              {slides.map((sl, i) => (
                <button key={sl.src + i} type="button" role="tab" aria-selected={i === idx} aria-label={`Slide ${i + 1}`} className={`x-hbn-seg${i === idx ? ' on' : ''}${i < idx ? ' done' : ''}`} onClick={() => go(i)}>
                  <span className="x-hbn-fill">
                    {i === idx && (
                      <motion.i key={`${idx}-${paused}`} initial={{ scaleX: paused ? 0 : 0 }} animate={{ scaleX: 1 }}
                        transition={{ duration: paused ? 9999 : interval / 1000, ease: 'linear' }} />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <span className="x-hbn-count" aria-hidden><b>{String(idx + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}</span>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
