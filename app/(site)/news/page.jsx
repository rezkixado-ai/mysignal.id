import { db } from '../../../lib/db.js';
import NewsFeed from '../../../components/NewsFeed.jsx';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'News',
  description: 'The latest technology news and analysis from MySignal — cybersecurity, cloud, network, AI and big tech.',
  alternates: { canonical: '/news' }
};

export default async function News() {
  let articles = [];
  try {
    const r = await db().execute("SELECT * FROM articles WHERE is_published = 1 ORDER BY published_at DESC LIMIT 100");
    articles = r.rows;
  } catch {
    // DB unavailable — page still renders with an empty feed
  }

  return (
    <main>
      <section style={{ paddingBottom: 24 }}>
        <div className="wrap">
          <span className="eyebrow">Signal Feed</span>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', marginTop: 14, marginBottom: 24 }}>News</h1>
          <NewsFeed articles={articles} />
        </div>
      </section>
    </main>
  );
}
