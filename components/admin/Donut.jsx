const COLORS = ['#4ADE80', '#22D3EE', '#3B82F6', '#8B5CF6', '#F5B942', '#EC4899'];

export default function Donut({ items, unit = '' }) {
  const total = items.reduce((a, i) => a + i.value, 0);
  if (!total) return <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>Belum ada data.</p>;
  const R = 46, C = 2 * Math.PI * R;
  let off = 0;
  return (
    <div className="xa-donut">
      <svg viewBox="0 0 120 120" role="img" aria-label="Grafik donat">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="16" />
        {items.map((it, i) => {
          const len = (it.value / total) * C;
          const el = (
            <circle key={it.label} cx="60" cy="60" r={R} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="16"
              strokeDasharray={`${Math.max(0, len - 1.5)} ${C - Math.max(0, len - 1.5)}`} strokeDashoffset={-off} transform="rotate(-90 60 60)" />
          );
          off += len;
          return el;
        })}
        <text x="60" y="58" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff">{total.toLocaleString('id-ID')}</text>
        <text x="60" y="73" textAnchor="middle" fontSize="8.5" fill="#6E8099">{unit}</text>
      </svg>
      <ul>
        {items.map((it, i) => (
          <li key={it.label}><i style={{ background: COLORS[i % COLORS.length] }} />{it.label}<b>{Math.round((it.value / total) * 100)}%</b></li>
        ))}
      </ul>
    </div>
  );
}
