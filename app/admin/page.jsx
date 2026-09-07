import Link from 'next/link';

const CARDS = [
  { to: '/admin/hero-slides', title: 'Hero Slider', desc: 'Upload images or video for the homepage hero, set Ken Burns transitions and slide copy.' },
  { to: '/admin/articles', title: 'Articles', desc: 'Write Latest Signals / Deeper Signals with a rich text body, SEO fields, and embedded images/video.' },
  { to: '/admin/gallery', title: 'Gallery', desc: 'Upload images or video, and pick each card\'s shape (Normal / Wide / Big) for the Signal Gallery masonry grid.' },
  { to: '/admin/pages', title: 'Pages', desc: 'Edit the About Xi:gnal and Contact Us pages using the same block editor as articles.' }
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="admin-topbar">
        <h1 style={{ fontSize: 24 }}>Dashboard</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
        {CARDS.map((c) => (
          <Link href={c.to} key={c.to} className="card">
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>{c.title}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
