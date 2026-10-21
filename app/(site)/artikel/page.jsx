import Link from 'next/link';
import { getArticleList, getArticleCategories, fmtDate } from '../../../lib/xdata.js';
import { ArticleCard } from '../../../components/site/Cards.jsx';
import Media from '../../../components/site/Media.jsx';
import SIcon from '../../../components/site/SIcon.jsx';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Artikel — Wawasan & Eksplorasi Teknologi',
  description: 'Informasi, panduan dan insight seputar fiber optik, jaringan, cybersecurity dan teknologi masa depan.',
  alternates: { canonical: '/artikel' }
};

const PER = 9;
const href = (kategori, q, hal) => {
  const p = new URLSearchParams();
  if (kategori) p.set('kategori', kategori);
  if (q) p.set('q', q);
  if (hal && hal > 1) p.set('hal', String(hal));
  const qs = p.toString();
  return `/artikel${qs ? `?${qs}` : ''}`;
};

export default async function ArtikelPage({ searchParams }) {
  const kategori = typeof searchParams?.kategori === 'string' ? searchParams.kategori : '';
  const q = typeof searchParams?.q === 'string' ? searchParams.q.slice(0, 80) : '';
  const hal = Math.max(1, parseInt(searchParams?.hal, 10) || 1);
  const [cats, list] = await Promise.all([
    getArticleCategories(),
    getArticleList({ limit: PER + (hal === 1 && !kategori && !q ? 1 : 0), offset: (hal - 1) * PER + (hal > 1 && !kategori && !q ? 1 : 0), category: kategori, q })
  ]);
  const showFeatured = hal === 1 && !kategori && !q && list.items.length > 0;
  const featured = showFeatured ? list.items[0] : null;
  const rest = showFeatured ? list.items.slice(1) : list.items;
  const pages = Math.max(1, Math.ceil(list.total / PER));

  return (
    <>
      <header className="x-phead">
        <div className="x-wrap">
          <nav className="x-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><SIcon name="chevronR" size={12} /><span>Artikel</span></nav>
          <h1>Wawasan &amp; <span className="x-grad-text">Eksplorasi Teknologi</span></h1>
          <p>Informasi, panduan dan insight seputar fiber optik, jaringan, cybersecurity dan teknologi masa depan.</p>
        </div>
      </header>

      <section className="x-sec">
        <div className="x-wrap">
          {featured && (
            <Link href={featured.slug ? `/article/${featured.slug}` : '/artikel'} className="x-card x-feat" style={{ marginBottom: 26 }}>
              <div className="x-feat-img"><Media src={featured.cover_media_url} video={featured.cover_media_type === 'video'} alt={featured.title} icon="file" /></div>
              <div className="x-feat-body">
                <span className="x-kicker"><SIcon name="star" size={12} /> ARTIKEL UTAMA</span>
                <h2>{featured.title}</h2>
                {featured.excerpt ? <p>{featured.excerpt}</p> : null}
                <div className="x-by"><i /> <span>Admin Xi:gnal</span><span>|</span><span>{fmtDate(featured.published_at)}</span>{featured.read_minutes ? <><span>|</span><span>{featured.read_minutes} menit baca</span></> : null}</div>
                <div className="x-feat-actions"><span className="x-btn x-btn-line">BACA ARTIKEL <SIcon name="arrow" size={14} /></span></div>
              </div>
            </Link>
          )}

          <form className="x-find" action="/artikel" method="get" role="search">
            {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
            <input type="search" name="q" defaultValue={q} placeholder="Cari artikel…" aria-label="Cari artikel" />
            <button type="submit" className="x-btn x-btn-line">Cari</button>
          </form>

          <div className="x-pills" role="tablist" aria-label="Kategori artikel">
            <Link href={href('', q, 1)} className={`x-pill${!kategori ? ' on' : ''}`}>Semua</Link>
            {cats.map((c) => <Link key={c} href={href(c, q, 1)} className={`x-pill${kategori === c ? ' on' : ''}`}>{c}</Link>)}
          </div>

          <div className="x-sub">{q ? `Hasil untuk “${q}”` : kategori || 'Artikel Terbaru'}</div>
          {rest.length ? (
            <div className="x-agrid x-agrid-3">{rest.map((a) => <ArticleCard a={a} key={a.id} full />)}</div>
          ) : (
            !featured && <p className="x-empty">Belum ada artikel yang cocok.</p>
          )}

          {pages > 1 && (
            <nav className="x-pager" aria-label="Halaman">
              {hal > 1 && <Link href={href(kategori, q, hal - 1)} aria-label="Sebelumnya"><SIcon name="chevronL" size={16} /></Link>}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                n === hal ? <span key={n} className="on" aria-current="page">{n}</span> : <Link key={n} href={href(kategori, q, n)}>{n}</Link>
              ))}
              {hal < pages && <Link href={href(kategori, q, hal + 1)} aria-label="Berikutnya"><SIcon name="chevronR" size={16} /></Link>}
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
