'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// Angka "hit counter" yang menghitung naik dari 0 lalu mengulang terus-menerus.
// Mendukung teks campuran: "500+", "24/7", "1,2K" (setiap angka di dalam teks ikut dihitung).
// Lebar dikunci oleh teks akhir yang tersembunyi, jadi layout tidak bergeser saat angka berubah.
const COUNT_MS = 2200;   // durasi menghitung
const HOLD_MS = 2200;    // jeda saat angka sudah penuh
const GAP_MS = 350;      // jeda singkat di angka 0 sebelum mulai lagi
const ease = (t) => 1 - Math.pow(1 - t, 3);

export default function CountUp({ value, className = '' }) {
  const text = String(value ?? '');
  const parts = useMemo(() => {
    const out = [];
    const re = /\d+(?:[.,]\d+)?/g;
    let last = 0; let m;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ t: text.slice(last, m.index) });
      const raw = m[0];
      const dec = /[.,](\d+)$/.exec(raw);
      out.push({ n: parseFloat(raw.replace(',', '.')), dec: dec ? dec[1].length : 0, sep: raw.includes(',') ? ',' : '.' });
      last = m.index + raw.length;
    }
    if (last < text.length) out.push({ t: text.slice(last) });
    return out;
  }, [text]);

  const hasNumber = parts.some((p) => p.n !== undefined);
  const [live, setLive] = useState(text);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNumber) return undefined;
    // Sengaja tidak mengikuti prefers-reduced-motion: hitungan angka bukan gerakan layar, dan di banyak
    // laptop Windows (animasi dimatikan) setting itu aktif sehingga counter tidak pernah jalan.

    const render = (p) => parts.map((x) => {
      if (x.n === undefined) return x.t;
      const v = x.n * p;
      return x.dec ? v.toFixed(x.dec).replace('.', x.sep) : String(Math.round(v));
    }).join('');

    let raf = 0; let start = 0; let visible = false;
    const tick = (now) => {
      if (!start) start = now;
      const t = now - start;
      const total = COUNT_MS + HOLD_MS + GAP_MS;
      const c = t % total;
      if (c < GAP_MS) setLive(render(0));
      else if (c < GAP_MS + COUNT_MS) setLive(render(ease((c - GAP_MS) / COUNT_MS)));
      else setLive(render(1));
      raf = requestAnimationFrame(tick);
    };
    const run = () => { if (!raf) { start = 0; raf = requestAnimationFrame(tick); } };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } setLive(text); };

    if (!('IntersectionObserver' in window)) { run(); return stop; }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) run(); else stop();
    }, { threshold: 0.2 });
    io.observe(el);
    return () => { io.disconnect(); stop(); };
  }, [parts, hasNumber, text]);

  return (
    <i ref={ref} className={`x-cnt ${className}`}>
      <i className="x-cnt-ghost">{text}</i>
      <i className="x-cnt-live" aria-hidden="true">{live}</i>
    </i>
  );
}
