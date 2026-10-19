'use client';

import { useRef, useState } from 'react';

// Grafik garis 2 seri dalam SVG. Tiap seri diskalakan ke maksimumnya sendiri (supaya klik dan
// tayangan yang selisihnya jauh tetap terbaca); angka asli tampil di tooltip saat disentuh / hover.
const W = 640, H = 220, PX = 8, PT = 14, PB = 24;

export default function TrafficChart({ data, a, b }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  if (!data || data.length < 2) return <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>Belum ada data pada rentang ini.</p>;

  const n = data.length;
  const x = (i) => PX + (i * (W - PX * 2)) / (n - 1);
  const mk = (key) => {
    const max = Math.max(1, ...data.map((d) => d[key] || 0));
    const y = (v) => PT + (1 - (v || 0) / max) * (H - PT - PB);
    const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`);
    return { line: `M${pts.join(' L')}`, area: `M${x(0)},${H - PB} L${pts.join(' L')} L${x(n - 1)},${H - PB} Z`, y };
  };
  const A = mk(a.key), B = mk(b.key);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const labelIdx = [0, Math.round((n - 1) / 4), Math.round((n - 1) / 2), Math.round(((n - 1) * 3) / 4), n - 1];
  const fmtD = (s) => { const d = new Date(s); return `${d.getDate()}/${d.getMonth() + 1}`; };

  function onMove(e) {
    const r = ref.current.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const i = Math.max(0, Math.min(n - 1, Math.round(((cx / r.width) * W - PX) / ((W - PX * 2) / (n - 1)))));
    setHover(i);
  }

  return (
    <div className="xa-chart" ref={ref} onMouseMove={onMove} onTouchMove={onMove} onTouchStart={onMove} onMouseLeave={() => setHover(null)} onTouchEnd={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Grafik ${a.label} dan ${b.label}`}>
        <defs>
          <linearGradient id="xa-ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a.color} stopOpacity=".32" /><stop offset="1" stopColor={a.color} stopOpacity="0" /></linearGradient>
          <linearGradient id="xa-gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={b.color} stopOpacity=".28" /><stop offset="1" stopColor={b.color} stopOpacity="0" /></linearGradient>
        </defs>
        {ticks.map((t) => <line key={t} x1={PX} x2={W - PX} y1={PT + t * (H - PT - PB)} y2={PT + t * (H - PT - PB)} stroke="rgba(255,255,255,.07)" />)}
        <path d={B.area} fill="url(#xa-gb)" />
        <path d={A.area} fill="url(#xa-ga)" />
        <path d={B.line} fill="none" stroke={b.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={A.line} fill="none" stroke={a.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {labelIdx.map((i, k) => (
          <text key={k} x={x(i)} y={H - 6} fontSize="11" fill="#6E8099" textAnchor={k === 0 ? 'start' : k === 4 ? 'end' : 'middle'}>{fmtD(data[i].date)}</text>
        ))}
        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PT} y2={H - PB} stroke="rgba(255,255,255,.25)" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={A.y(data[hover][a.key])} r="4.5" fill={a.color} stroke="#040A12" strokeWidth="2" />
            <circle cx={x(hover)} cy={B.y(data[hover][b.key])} r="4.5" fill={b.color} stroke="#040A12" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover != null && (
        <div className="xa-tip" style={{ left: `${Math.min(86, Math.max(14, (x(hover) / W) * 100))}%` }}>
          <b>{fmtD(data[hover].date)}</b>
          <span style={{ color: a.color }}>● {a.label}: {Number(data[hover][a.key]).toLocaleString('id-ID')}</span><br />
          <span style={{ color: b.color }}>● {b.label}: {Number(data[hover][b.key]).toLocaleString('id-ID')}</span>
        </div>
      )}
    </div>
  );
}
