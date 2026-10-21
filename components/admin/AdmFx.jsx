'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

/* Bar tipis di atas layar: muncul saat pindah menu, selesai saat halaman baru tampil */
export function NavProgress() {
  const pathname = usePathname();
  const [on, setOn] = useState(false);
  const last = useRef(pathname);
  const timer = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('/admin')) return;
      if (href.split('?')[0] === window.location.pathname) return;
      setOn(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setOn(false), 9000);
    };
    document.addEventListener('click', onClick, true);
    return () => { document.removeEventListener('click', onClick, true); clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    if (last.current !== pathname) { last.current = pathname; clearTimeout(timer.current); setOn(false); }
  }, [pathname]);

  return (
    <AnimatePresence>
      {on && (
        <motion.div key="bar" className="xa-prog" initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.88, transition: { duration: 6, ease: [0.1, 0.7, 0.2, 1] } }}
          exit={{ scaleX: 1, opacity: 0, transition: { scaleX: { duration: 0.25 }, opacity: { duration: 0.3, delay: 0.2 } } }} />
      )}
    </AnimatePresence>
  );
}

/* Efek riak (ripple) saat tombol / menu ditekan */
export function useRipple() {
  useEffect(() => {
    const SEL = '.adm .btn, .adm .nl, .adm .sheet-item, .bnav a, .bnav button, .adm .pill, .adm .xa-acc-h';
    const onDown = (e) => {
      const el = e.target.closest && e.target.closest(SEL);
      if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const s = document.createElement('span');
      s.className = 'xa-rip';
      s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      el.appendChild(s);
      setTimeout(() => s.remove(), 650);
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);
}

/* Penanda menu aktif yang meluncur antar item */
export function NavPill({ id = 'adm-pill', className = 'nl-pill' }) {
  return <motion.span layoutId={id} className={className} transition={{ type: 'spring', stiffness: 460, damping: 38, mass: 0.9 }} />;
}

/* Ledakan kecil saat aksi berhasil (toast sukses muncul). Dipicu dari posisi tombol yang terakhir ditekan. */
const COLORS = ['#4ADE80', '#2DD4BF', '#22D3EE', '#3B82F6', '#ffffff'];
function burst(x, y, big) {
  const layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;overflow:hidden';
  document.body.appendChild(layer);
  const ring = document.createElement('i');
  ring.style.cssText = `position:absolute;left:${x - 16}px;top:${y - 16}px;width:32px;height:32px;border:2px solid #4ADE80;box-sizing:border-box`;
  layer.appendChild(ring);
  ring.animate([{ transform: 'scale(.3)', opacity: 0.9 }, { transform: `scale(${big ? 5.5 : 3.6})`, opacity: 0 }], { duration: 560, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
  const n = big ? 46 : 18;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    const s = 5 + Math.random() * (big ? 7 : 5);
    const a = big ? -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25 : Math.random() * Math.PI * 2;
    const d = (big ? 90 : 46) + Math.random() * (big ? 170 : 62);
    const dx = Math.cos(a) * d, dy = Math.sin(a) * d;
    p.style.cssText = `position:absolute;left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s * (Math.random() > 0.6 ? 2.2 : 1)}px;background:${COLORS[i % COLORS.length]}`;
    layer.appendChild(p);
    p.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx}px,${dy + (big ? 70 : 12)}px) rotate(${(Math.random() - 0.5) * 720}deg)`, opacity: 0 }
    ], { duration: (big ? 950 : 640) + Math.random() * 260, easing: 'cubic-bezier(.15,.7,.3,1)', fill: 'forwards' });
  }
  setTimeout(() => layer.remove(), 1500);
}

export function useSuccessBurst() {
  useEffect(() => {
    let pos = null;
    const onDown = (e) => {
      const el = e.target.closest && e.target.closest('.adm .btn, .xa-save button, .ed-bar button');
      if (el) { const r = el.getBoundingClientRect(); pos = { x: r.left + r.width / 2, y: r.top + r.height / 2, t: Date.now() }; }
    };
    document.addEventListener('pointerdown', onDown, { passive: true, capture: true });
    const seen = new WeakSet();
    const obs = new MutationObserver((list) => {
      for (const m of list) for (const n of m.addedNodes) {
        if (!(n instanceof HTMLElement)) continue;
        const t = n.matches('.toast.ok') ? n : n.querySelector && n.querySelector('.toast.ok');
        if (!t || seen.has(t)) continue;
        seen.add(t);
        const txt = t.textContent || '';
        if (/upload|ter-upload|dihapus|hapus/i.test(txt)) continue; // hanya untuk simpan / terbit
        const big = /terbit|publish|tayang/i.test(txt);
        const fresh = pos && Date.now() - pos.t < 15000;
        const r = t.getBoundingClientRect();
        burst(fresh ? pos.x : r.left + r.width / 2, fresh ? pos.y : r.top + r.height / 2, big);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => { document.removeEventListener('pointerdown', onDown, true); obs.disconnect(); };
  }, []);
}
