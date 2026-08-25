import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
