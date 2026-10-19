// Ilustrasi hero: pakai gambar dari CMS kalau ada, kalau tidak pakai ilustrasi serat optik (SVG) sementara.
import HeroBanner from './HeroBanner.jsx';

export default function HeroArt({ slides = [] }) {
  if (slides.length) return <HeroBanner slides={slides} />;
  const strands = [
    ['#4ADE80', 'M40 330 C 140 330, 170 120, 300 150 S 430 90, 560 40'],
    ['#22D3EE', 'M40 340 C 150 330, 190 170, 310 190 S 440 120, 570 80'],
    ['#3B82F6', 'M40 350 C 160 340, 200 210, 320 220 S 450 160, 580 130'],
    ['#8B5CF6', 'M40 360 C 170 350, 210 250, 330 250 S 460 200, 590 180'],
    ['#EC4899', 'M40 345 C 150 335, 180 140, 300 120 S 440 60, 575 20']
  ];
  return (
    <svg className="x-heroart-svg" viewBox="0 0 640 400" role="img" aria-label="Ilustrasi serat optik" fill="none">
      <defs>
        <radialGradient id="xg-ring" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#22D3EE" stopOpacity="0" />
          <stop offset="85%" stopColor="#22D3EE" stopOpacity=".55" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
        <filter id="xg-blur"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      <circle cx="380" cy="200" r="170" fill="url(#xg-ring)" />
      <ellipse cx="320" cy="372" rx="260" ry="16" fill="#22D3EE" opacity=".18" filter="url(#xg-blur)" />
      <g strokeLinecap="round" strokeWidth="3">
        {strands.map(([c, d], i) => (
          <g key={c}>
            <path d={d} stroke={c} opacity=".35" strokeWidth="9" filter="url(#xg-blur)" />
            <path d={d} stroke={c} strokeDasharray="8 14" style={{ animation: `x-flow ${5 + i}s linear infinite` }} />
          </g>
        ))}
      </g>
      <rect x="34" y="318" width="86" height="64" rx="10" fill="#06101C" stroke="#22D3EE" strokeOpacity=".6" />
      <circle cx="77" cy="350" r="16" stroke="#4ADE80" strokeOpacity=".8" />
      <style>{`@keyframes x-flow{to{stroke-dashoffset:-220;}}`}</style>
    </svg>
  );
}
