import '../../styles/xignal-site.css';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import PromoPopup from '../../components/site/PromoPopup.jsx';
import { getSettings, waLink } from '../../lib/xdata.js';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const settings = await getSettings();
  const waHref = waLink(settings, 'Halo Xignal, saya ingin berkonsultasi tentang kebutuhan jaringan.');
  const promo = settings.promo_enabled === '1'
    ? Object.fromEntries(Object.entries(settings).filter(([k]) => k.startsWith('promo_')))
    : null;
  const promoHref = settings.promo_cta_url || waLink(settings, `Halo Xignal, saya ingin klaim voucher ${settings.promo_code}.`);
  return (
    <div className="xs">
      <Navbar waHref={waHref} />
      <main className="x-main">{children}</main>
      <Footer settings={settings} waHref={waHref} />
      {promo && <PromoPopup p={promo} ctaHref={promoHref} />}
    </div>
  );
}
