'use client';
// Popup voucher promo interaktif.
// - <PromoPopup>   : dipasang di layout situs; mengatur kapan muncul (jadwal, halaman, perangkat, pemicu, frekuensi).
// - <PromoCard>    : kartu popup (dipakai juga untuk pratinjau di admin).
// - <PromoOverlay> : kartu + backdrop (dipakai untuk "Tes popup" di admin).
import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import '../../styles/xignal-promo.css';

const pad = (n) => String(Math.max(0, n)).padStart(2, '0');
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i); return (h >>> 0).toString(36); };
const store = {
  get: (k, session) => { try { return (session ? sessionStorage : localStorage).getItem(k); } catch { return null; } },
  set: (k, v, session) => { try { (session ? sessionStorage : localStorage).setItem(k, v); } catch { /* storage diblokir: abaikan */ } }
};
const SEG = { produk: 'produk', artikel: 'artikel', article: 'artikel', news: 'artikel', event: 'event', video: 'video', tentang: 'tentang', about: 'tentang', contact: 'kontak', kontak: 'kontak', gallery: 'gallery' };
export const pageGroup = (path) => (path === '/' ? 'home' : SEG[path.split('/')[1]] || 'lain');

/* ───────── hitung mundur ───────── */
function Countdown({ target, label, onExpire }) {
  const [left, setLeft] = useState(() => (target ? target - Date.now() : null));
  useEffect(() => {
    if (!target) { setLeft(null); return undefined; }
    const tick = () => setLeft(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  useEffect(() => { if (left != null && left <= 0 && onExpire) onExpire(); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  if (left == null) return null;
  const s = Math.max(0, Math.floor(left / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  const groups = [['HARI', d], ['JAM', h], ['MENIT', m], ['DETIK', s % 60]].slice(d > 0 ? 0 : h > 0 ? 1 : 2);
  return (
    <div className="xpm-cd" role="timer" aria-label={`${label || 'Sisa waktu'}: ${groups.map(([l, v]) => `${v} ${l.toLowerCase()}`).join(' ')}`}>
      <div className="xpm-cd-row">
        {groups.map(([l, v], i) => (
          <Fragment key={l}>
            {i > 0 && <span className="xpm-sep" aria-hidden>:</span>}
            <div className="xpm-grp">
              <div className="xpm-digits" aria-hidden>{pad(v).split('').map((c, j) => <b key={`${j}${c}`}>{c}</b>)}</div>
              <small aria-hidden>{l}</small>
            </div>
          </Fragment>
        ))}
      </div>
      {label && <p className="xpm-cd-l">{label}</p>}
    </div>
  );
}

function Art() {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="xpm-art" viewBox="0 0 400 360" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4ADE80" /><stop offset=".5" stopColor="#2DD4BF" /><stop offset="1" stopColor="#3B82F6" /></linearGradient>
        <radialGradient id={`r${id}`} cx=".5" cy=".45" r=".6"><stop offset="0" stopColor="#22D3EE" stopOpacity=".28" /><stop offset="1" stopColor="#22D3EE" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="400" height="360" fill="#06101C" />
      <rect width="400" height="360" fill={`url(#r${id})`} />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M-20 ${300 - i * 14} C120 ${250 - i * 16} 240 ${130 - i * 6} 430 ${40 + i * 18}`} fill="none" stroke={`url(#g${id})`} strokeWidth="1.4" opacity={0.22 + i * 0.1} />)}
    </svg>
  );
}

export const visualMode = (p) => (['image', 'number', 'both'].includes(p.promo_visual) ? p.promo_visual : p.promo_image_url ? 'image' : 'number');

function Scissors({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden>
      <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
    </svg>
  );
}

/* gunting yang berjalan menyusuri garis sobekan, bilahnya membuka-menutup terus */
function CutRunner() {
  return (
    <div className="xpm-track" aria-hidden>
      <svg className="xpm-run" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
        <g className="xpm-bl a"><circle cx="4.5" cy="7.5" r="2.6" /><path d="M6.6 9 L12 12 L23 12" /></g>
        <g className="xpm-bl b"><circle cx="4.5" cy="16.5" r="2.6" /><path d="M6.6 15 L12 12 L23 12" /></g>
      </svg>
    </div>
  );
}

/* latar abstrak (placeholder) di belakang angka */
function AbstractBg() {
  return (
    <div className="xpm-abs" aria-hidden>
      <i className="b1" /><i className="b2" /><i className="b3" />
      <svg viewBox="0 0 400 360" preserveAspectRatio="xMidYMid slice">
        {[0, 1, 2, 3, 4].map((i) => <path key={i} className="fl" style={{ animationDelay: `${-i * 1.1}s` }} d={`M-20 ${290 - i * 22} C110 ${230 - i * 20} 250 ${150 - i * 4} 430 ${60 + i * 22}`} />)}
      </svg>
      {[0, 1, 2, 3, 4, 5].map((i) => <u key={i} style={{ left: `${10 + i * 15}%`, animationDelay: `${-i * 1.3}s`, animationDuration: `${6 + (i % 3) * 2}s` }} />)}
    </div>
  );
}

function NumberBg({ p }) {
  const [bad, setBad] = useState(false);
  const src = p.promo_bg_video_url;
  return (
    <div className="xpm-bgv">
      {src && !bad ? (
        <video className="xpm-vid" src={src} autoPlay muted loop playsInline preload="auto" onError={() => setBad(true)} />
      ) : <AbstractBg />}
    </div>
  );
}

/* ───────── angka besar dengan efek hit counter ───────── */
const ease = (t) => 1 - Math.pow(1 - t, 3);
function PromoNumber({ p }) {
  const raw = String(p.promo_number ?? '').trim().replace(',', '.');
  const target = parseFloat(raw);
  const valid = Number.isFinite(target);
  const decM = raw.match(/\.(\d+)$/);
  const dec = decM ? Math.min(2, decM[1].length) : 0;
  const fmtN = (v) => v.toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const anim = ['loop', 'once', 'off'].includes(p.promo_number_anim) ? p.promo_number_anim : 'loop';
  const secs = Math.min(8, Math.max(0.5, parseFloat(p.promo_number_secs) || 2.2));
  const final = valid ? fmtN(target) : raw;
  const [live, setLive] = useState(anim === 'off' || !valid ? final : fmtN(0));

  // Sengaja tidak mengikuti prefers-reduced-motion (sama seperti counter statistik di beranda).
  useEffect(() => {
    if (!valid) { setLive(raw); return undefined; }
    if (anim === 'off') { setLive(fmtN(target)); return undefined; }
    const COUNT = secs * 1000, HOLD = 2200, GAP = 350;
    let raf = 0, start = 0;
    const tick = (now) => {
      if (!start) start = now;
      const t = now - start;
      if (anim === 'once') {
        const k = Math.min(1, t / COUNT);
        setLive(fmtN(target * ease(k)));
        if (k < 1) raf = requestAnimationFrame(tick);
        return;
      }
      const c = t % (COUNT + HOLD + GAP);
      setLive(fmtN(target * (c < GAP ? 0 : c < GAP + COUNT ? ease((c - GAP) / COUNT) : 1)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [raw, anim, secs]); // eslint-disable-line react-hooks/exhaustive-deps

  const pre = (p.promo_number_prefix || '').trim(), suf = (p.promo_number_suffix || '').trim(), label = (p.promo_number_label || '').trim();
  if (!final) return null;
  const size = final.length <= 2 ? 'n2' : final.length === 3 ? 'n3' : final.length <= 5 ? 'n5' : 'n7';
  return (
    <div className={`xpm-num ${size}`} role="img" aria-label={`${label} ${pre} ${final}${suf}`.trim()}>
      {label && <span className="xpm-num-l">{label}</span>}
      <div className="xpm-num-m" aria-hidden>
        {pre && <em>{pre}</em>}
        <b><i className="g">{final}</i><i className="v">{live}</i></b>
        {suf && <em>{suf}</em>}
      </div>
    </div>
  );
}

/* ───────── kartu popup ───────── */
export function PromoCard({ p, ctaHref, target, onClose, onCta, onExpire, preview }) {
  const [burst, setBurst] = useState(0);
  const [done, setDone] = useState(false);
  const code = p.promo_code || '';
  async function copy() {
    try { await navigator.clipboard.writeText(code); } catch {
      const t = document.createElement('textarea'); t.value = code; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch { /* abaikan */ }
      t.remove();
    }
    setBurst((n) => n + 1); setDone(true); setTimeout(() => setDone(false), 2000);
  }
  const external = /^https?:/i.test(ctaHref || '');
  const mode = visualMode(p);
  return (
    <div className={`xpm-card${preview ? ' static' : ''}`}>
      {onClose && (
        <button type="button" className="xpm-x" onClick={onClose} aria-label="Tutup promo">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>
      )}
      <div className="xpm-body">
        {p.promo_eyebrow && <p className="xpm-eyebrow">{p.promo_eyebrow}</p>}
        <h2 className="xpm-title" id="xpm-title">{p.promo_title}</h2>
        <button type="button" className={`xpm-code${done ? ' done' : ''}`} onClick={copy} aria-label={`Salin kode voucher ${code}`}>
          <Scissors className="xpm-scis" />
          <span className="xpm-codetxt">{code}</span>
          {burst > 0 && <span className="xpm-burst" key={burst} aria-hidden>{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--a': `${i * 30}deg`, '--d': `${52 + (i % 3) * 16}px` }} />)}</span>}
        </button>
        <p className={`xpm-hint${done ? ' ok' : ''}`} aria-live="polite">{done ? 'Kode tersalin ✓' : 'Ketuk kode untuk menyalin'}</p>
        {p.promo_desc && <p className="xpm-desc">{p.promo_desc}</p>}
        <Countdown target={target} label={p.promo_countdown_label} onExpire={onExpire} />
        {p.promo_cta_label && (
          <a className="xpm-cta" href={ctaHref || '#'} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            onClick={(e) => { if (preview) e.preventDefault(); else if (onCta) onCta(); }}>
            {p.promo_cta_label}<span aria-hidden>→</span>
          </a>
        )}
      </div>
      <div className={`xpm-media m-${mode}`}>
        {(mode === 'image' || mode === 'both') && p.promo_image_url ? <img src={p.promo_image_url} alt="" />
          : mode === 'number' && p.promo_bg_mode !== 'off' ? <NumberBg p={p} /> : <Art />}
        {(mode === 'number' || mode === 'both') && <PromoNumber p={p} />}
      </div>
      <CutRunner />
    </div>
  );
}

/* ───────── kartu + backdrop ───────── */
export function PromoOverlay({ p, ctaHref, target, onClose, onExpire }) {
  const [shown, setShown] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => { setShown(true); ref.current?.focus(); });
    const key = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(raf); document.removeEventListener('keydown', key);
      document.body.style.overflow = overflow; if (prev && prev.focus) prev.focus();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={`xpm-ov${shown ? ' in' : ''}`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="xpm-wrap" ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="xpm-title">
        <PromoCard p={p} ctaHref={ctaHref} target={target} onClose={onClose} onCta={onClose} onExpire={onExpire} />
      </div>
    </div>
  );
}

/* ───────── pengatur kemunculan ───────── */
export default function PromoPopup({ p, ctaHref }) {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const shownRef = useRef(false);
  const sig = useMemo(() => hash([p.promo_code, p.promo_title, p.promo_start, p.promo_end, p.promo_countdown, p.promo_countdown_minutes].join('|')), [p]);

  useEffect(() => {
    if (shownRef.current || p.promo_enabled !== '1') return undefined;
    const now = Date.now();
    const start = Date.parse(p.promo_start), end = Date.parse(p.promo_end);
    if (!Number.isNaN(start) && now < start) return undefined;
    if (!Number.isNaN(end) && now >= end) return undefined;

    const pages = String(p.promo_pages || 'all').split(',').map((x) => x.trim()).filter(Boolean);
    if (!pages.includes('all') && !pages.includes(pageGroup(pathname))) return undefined;

    const narrow = window.matchMedia('(max-width: 767px)').matches;
    if (p.promo_device === 'desktop' && narrow) return undefined;
    if (p.promo_device === 'mobile' && !narrow) return undefined;

    const fq = p.promo_frequency || 'session';
    const key = `xpromo:${sig}`;
    if (fq === 'once' && store.get(key)) return undefined;
    if (fq === 'session' && store.get(key, true)) return undefined;
    if (fq === 'daily') { const t = Number(store.get(key)); if (t && now - t < 86400000) return undefined; }

    const mode = p.promo_countdown || 'off';
    const cdKey = `xpromo-cd:${sig}`;
    const mins = Math.max(1, Number(p.promo_countdown_minutes) || 15);
    if (mode === 'minutes') { const exp = Number(store.get(cdKey)); if (exp && now > exp) return undefined; }

    const show = () => {
      if (shownRef.current) return;
      shownRef.current = true;
      if (fq === 'once' || fq === 'daily') store.set(key, String(Date.now()));
      if (fq === 'session') store.set(key, '1', true);
      let tgt = null;
      if (mode === 'end' && !Number.isNaN(end)) tgt = end;
      if (mode === 'minutes') { tgt = Number(store.get(cdKey)) || Date.now() + mins * 60000; store.set(cdKey, String(tgt)); }
      setTarget(tgt); setOpen(true);
    };

    const off = [];
    const trig = p.promo_trigger || 'delay';
    const delay = Math.max(0, Number(p.promo_delay) || 0) * 1000;
    if (trig === 'scroll') {
      const pct = Math.min(95, Math.max(5, Number(p.promo_scroll) || 40));
      const check = () => {
        const room = document.documentElement.scrollHeight - window.innerHeight;
        if (room > 40 && (window.scrollY / room) * 100 >= pct) show();
      };
      window.addEventListener('scroll', check, { passive: true });
      off.push(() => window.removeEventListener('scroll', check));
      const t = setTimeout(() => { if (document.documentElement.scrollHeight - window.innerHeight <= 40) show(); }, Math.max(delay, 8000)); // halaman pendek
      off.push(() => clearTimeout(t));
    } else if (trig === 'exit') {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let armed = false;
        const a = setTimeout(() => { armed = true; }, 3000);
        const out = (e) => { if (armed && e.clientY <= 0 && !e.relatedTarget) show(); };
        document.addEventListener('mouseout', out);
        off.push(() => { clearTimeout(a); document.removeEventListener('mouseout', out); });
      } else { // HP/tablet tidak punya "mouse keluar": pakai timer
        const t = setTimeout(show, Math.max(delay, 15000));
        off.push(() => clearTimeout(t));
      }
    } else {
      const t = setTimeout(show, delay);
      off.push(() => clearTimeout(t));
    }
    return () => off.forEach((f) => f());
  }, [pathname, p, sig]);

  if (!open) return null;
  return <PromoOverlay p={p} ctaHref={ctaHref} target={target} onClose={() => setOpen(false)} onExpire={() => setOpen(false)} />;
}
