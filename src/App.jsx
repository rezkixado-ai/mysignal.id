import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Placeholder from './pages/Placeholder.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminHeroSlides from './pages/admin/AdminHeroSlides.jsx';

function PublicSite() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Placeholder title="About MySignal" />} />
        <Route path="/gallery" element={<Placeholder title="Gallery" />} />
        <Route path="/news" element={<Placeholder title="News" />} />
        <Route path="/contact" element={<Placeholder title="Contact Us" />} />
        <Route path="/article/:slug" element={<Placeholder title="Article" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="hero-slides" element={<AdminHeroSlides />} />
      </Route>
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}
