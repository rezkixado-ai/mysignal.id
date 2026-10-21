'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getArticles } from '../../../lib/api.js';
import { xStats } from '../../../lib/xapi.js';
import Icon from '../../../components/Icon.jsx';
import TrafficChart from '../../../components/admin/TrafficChart.jsx';
import Donut from '../../../components/admin/Donut.jsx';

const nf = (n) => (n == null ? '–' : Number(n).toLocaleString('id-ID'));
const dateFmt = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const DEVICE = { MOBILE: 'Mobile', DESKTOP: 'Desktop', TABLET: 'Tablet' };
const shortPath = (u) => { try { const x = new URL(u); return x.pathname === '/' ? x.hostname : x.pathname; } catch { return u; } };

export default function AdminDashboard() {
  const [days, setDays] = useState(28);
  const [stats, setStats] = useState(null);
  const [statsErr, setStatsErr] = useState('');
  const [articles, setArticles] = useState(null);

  useEffect(() => {
    let alive = true;
    setStats(null); setStatsErr('');
    xStats(days).then((d) => alive && setStats(d)).catch((e) => alive && setStatsErr(e.message));
    return () => { alive = false; };
  }, [days]);

  useEffect(() => {
    getArticles({ all: '1', limit: 5 }).then(setArticles).catch(() => setArticles([]));
  }, []);

  const gsc = stats?.gsc;
  const ga4 = stats?.ga4;
  const c = stats?.counts || {};
  const useGA = !!ga4?.connected;

  const cards = useGA
    ? [
      { cls: 'g1', icon: 'users', l: 'Pengunjung (GA4)', v: nf(ga4.totals.visitors), s: `${days} hari terakhir` },
      { cls: 'g2', icon: 'eye', l: 'Page View (GA4)', v: nf(ga4.totals.views), s: `${days} hari terakhir` }
    ]
    : [
      { cls: 'g1', icon: 'trend', l: 'Klik dari Google', v: gsc?.connected ? nf(gsc.totals.clicks) : '–', s: gsc?.connected ? `CTR ${(gsc.totals.ctr * 100).toFixed(1)}%` : 'Search Console' },
      { cls: 'g2', icon: 'eye', l: 'Tayangan', v: gsc?.connected ? nf(gsc.totals.impressions) : '–', s: gsc?.connected ? `Posisi rata-rata ${gsc.totals.position.toFixed(1)}` : 'Search Console' }
    ];
  cards.push(
    { cls: 'g3', icon: 'file', l: 'Artikel terbit', v: nf(c.articles), s: c.drafts ? `${c.drafts} draft` : '' },
    { cls: 'g4', icon: 'cube', l: 'Produk ditampilkan', v: nf(c.products), s: c.events != null ? `${c.events} event · ${c.videos ?? 0} video` : '' }
  );

  const series = useGA ? ga4.series : gsc?.series;
  const A = useGA ? { key: 'visitors', label: 'Pengunjung', color: '#4ADE80' } : { key: 'clicks', label: 'Klik', color: '#4ADE80' };
  const B = useGA ? { key: 'views', label: 'Page View', color: '#8B5CF6' } : { key: 'impressions', label: 'Tayangan', color: '#8B5CF6' };
  const donut = useGA
    ? { title: 'Sumber Traffic', unit: 'sesi', items: ga4.channels }
    : { title: 'Perangkat (klik)', unit: 'klik', items: (gsc?.devices || []).map((d) => ({ label: DEVICE[d.label] || d.label, value: d.value })) };

  return (
    <div>
      <div className="xa-hello">
        <small>CMS DASHBOARD</small>
        <h1>Selamat datang, <span className="grad">Admin</span></h1>
        <p>Kelola konten, pantau performa, dan kembangkan Xignal.</p>
      </div>

      <div className="xa-range" role="tablist" aria-label="Rentang waktu">
        {[7, 28, 90].map((d) => <button key={d} type="button" role="tab" aria-selected={days === d} className={days === d ? 'on' : ''} onClick={() => setDays(d)}>{d} hari</button>)}
      </div>

      <div className="xa-stats">
        {cards.map((s) => (
          <div className={`xa-stat ${s.cls}`} key={s.l}>
            <span className="ic"><Icon name={s.icon} size={20} /></span>
            <span className="l">{s.l}</span>
            <b>{stats || statsErr ? s.v : '…'}</b>
            {s.s ? <em>{s.s}</em> : null}
          </div>
        ))}
      </div>

      {statsErr && <div className="xa-note"><b>Gagal memuat statistik.</b> <span className="xa-err">{statsErr}</span></div>}

      {stats && !gsc.connected && !ga4.connected && (
        <div className="xa-note">
          <b>Hubungkan Google Search Console</b> supaya grafik trafik tampil di sini.
          {gsc.error ? <div className="xa-err">Error: {gsc.error}</div> : null}
          <ol>
            <li>Google Cloud → buat <b>Service Account</b>, buat key JSON.</li>
            <li>Aktifkan <b>Search Console API</b> (dan <b>Analytics Data API</b> kalau mau GA4).</li>
            <li>Search Console → Settings → Users → tambahkan email service account sebagai user.</li>
            <li>Isi environment variable di Netlify (dan <code>.env</code> lokal):
              <br /><code>GOOGLE_CLIENT_EMAIL</code> <code>GOOGLE_PRIVATE_KEY</code> <code>GSC_SITE_URL</code>
              <br />GA4 (opsional): <code>GA4_PROPERTY_ID</code> — jangan lupa tambahkan service account sebagai Viewer di properti GA4.</li>
          </ol>
        </div>
      )}

      <div className="xa-split">
        <div className="xa-panel">
          <h3>{useGA ? 'Grafik Traffic Website' : 'Grafik Pencarian Google'}</h3>
          <div className="xa-legend"><span><i style={{ background: A.color }} />{A.label}</span><span><i style={{ background: B.color }} />{B.label}</span></div>
          {stats ? <TrafficChart data={series} a={A} b={B} /> : <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>Memuat…</p>}
        </div>
        <div className="xa-panel">
          <h3>{donut.title}</h3>
          {stats ? <Donut items={donut.items} unit={donut.unit} /> : <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>Memuat…</p>}
        </div>
      </div>

      {gsc?.connected && (
        <div className="xa-split xa-split-2">
          <div className="xa-panel">
            <h3>Kata kunci teratas</h3>
            <ul className="xa-toplist">
              {gsc.queries.length === 0 && <li><span className="t">Belum ada data.</span></li>}
              {gsc.queries.map((q) => <li key={q.label}><span className="t">{q.label}</span><b>{nf(q.clicks)} klik</b><small>{nf(q.impressions)} tayang</small></li>)}
            </ul>
          </div>
          <div className="xa-panel">
            <h3>Halaman teratas</h3>
            <ul className="xa-toplist">
              {gsc.pages.length === 0 && <li><span className="t">Belum ada data.</span></li>}
              {gsc.pages.map((p) => <li key={p.label}><span className="t">{shortPath(p.label)}</span><b>{nf(p.clicks)}</b><small>{nf(p.impressions)}</small></li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="xa-panel">
        <h3>Artikel Terbaru <Link href="/admin/articles">Lihat semua</Link></h3>
        {articles && articles.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>Belum ada artikel.</p>}
        <div className="clist xa-list-m">
          {(articles || []).map((a) => (
            <Link key={a.id} href="/admin/articles" className="crow">
              <span className="crow-main">
                <span className="crow-thumb">{a.cover_media_url && a.cover_media_type !== 'video' ? <img src={a.cover_media_url} alt="" /> : <Icon name="file" size={22} />}</span>
                <span className="crow-body"><strong>{a.title}</strong>
                  <span className="crow-meta"><em className={`badge ${a.is_published ? 'pub' : 'draft'}`}>{a.is_published ? 'PUBLISH' : 'DRAFT'}</em><span>{a.category}</span><span>{dateFmt(a.published_at)}</span></span>
                </span>
              </span>
            </Link>
          ))}
        </div>
        <table className="xa-table">
          <thead><tr><th>Thumbnail</th><th>Judul</th><th>Kategori</th><th>Tanggal</th><th>Status</th></tr></thead>
          <tbody>
            {(articles || []).map((a) => (
              <tr key={a.id}>
                <td>{a.cover_media_url && a.cover_media_type !== 'video' ? <img src={a.cover_media_url} alt="" /> : <span className="th" />}</td>
                <td><Link href="/admin/articles">{a.title}</Link></td>
                <td>{a.category}</td><td>{dateFmt(a.published_at)}</td>
                <td><em className={`badge ${a.is_published ? 'pub' : 'draft'}`}>{a.is_published ? 'Published' : 'Draft'}</em></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="xa-split xa-split-2">
        <div className="xa-panel">
          <h3>Quick Actions</h3>
          <div className="xa-quick">
            <Link href="/admin/articles?new=1"><Icon name="file" size={22} />Tulis Artikel</Link>
            <Link href="/admin/produk?new=1"><Icon name="cube" size={22} />Tambah Produk</Link>
            <Link href="/admin/event?new=1"><Icon name="calendar" size={22} />Tambah Event</Link>
            <Link href="/admin/video?new=1"><Icon name="reels" size={22} />Upload Video</Link>
            <Link href="/admin/hero-slides"><Icon name="layers" size={22} />Atur Banner</Link>
            <Link href="/admin/tentang"><Icon name="users" size={22} />Edit Tentang</Link>
          </div>
        </div>
        <div className="xa-panel">
          <h3>Status Sistem</h3>
          <div className={`xa-conn${gsc?.connected ? ' ok' : ''}`}><i />Search Console {gsc?.connected ? 'terhubung' : 'belum terhubung'}</div>
          <div className={`xa-conn${ga4?.connected ? ' ok' : ''}`}><i />Google Analytics 4 {ga4?.connected ? 'terhubung' : 'belum terhubung'}</div>
          <div className="xa-sys">
            <div><b>{nf(c.articles)}</b><span>Artikel</span></div>
            <div><b>{nf(c.products)}</b><span>Produk</span></div>
            <div><b>{nf(c.events)}</b><span>Event</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
