import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import Tourism from './pages/Tourism';
import Rooms from './pages/Rooms';
import Reservation from './pages/Reservation';
import Contact from './pages/Contact';
import Comment from './pages/Comment';
import ChatWidget from './components/ChatWidget';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRooms from './pages/admin/AdminRooms';
import AdminBookings from './pages/admin/AdminBookings';
import CheckRoom from './pages/admin/CheckRoom';
import AdminCurrency from './pages/admin/AdminCurrency';
import AdminComments from './pages/admin/AdminComments';
import ProtectedAdminLayout from './components/admin/ProtectedAdminLayout';

const TikTokIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .6.05.88.14V9.4a6.3 6.3 0 0 0-1-.08A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52V6.74c-.35.03-.7.01-1.04-.05Z" />
  </svg>
);

// Extract Footer to a component to use useLocation hook
const Footer: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/';
  const tiktokUrl = import.meta.env.VITE_TIKTOK_URL || 'https://www.tiktok.com/';
  
  // Các trang không hiển thị footer
  const hiddenPaths = ['/about', '/tourism', '/rooms', '/reservation', '/contact'];

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="bg-[#835004] text-brown-100 py-12 border-t-4 border-gold-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột 1: Thông tin chung */}
          <div>
            <h3 className="text-2xl font-serif text-white font-bold mb-4">{t('common.brandName')}</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-4">
              {t('footer.description')}
            </p>
          </div>

          {/* Cột 2: Liên hệ chi tiết */}
          <div>
            <h4 className="text-lg font-bold text-gold-500 mb-4 uppercase tracking-wider">
              {t('footer.contactHeading')}
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <span>{t('common.address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a href="mailto:motelhienphuong@gmail.com" className="hover:text-gold-400 transition">motelhienphuong@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:0345011468" className="hover:text-gold-400 transition">0345 011 468</a>
                  <a href="tel:0377586258" className="hover:text-gold-400 transition">0377 586 258</a>
                </div>
              </li>
            </ul>
          </div>

          {/* Cột 3: Mạng xã hội */}
          <div>
            <h4 className="text-lg font-bold text-gold-500 mb-4 uppercase tracking-wider">
              {t('footer.socialHeading')}
            </h4>
            <div className="flex gap-4">
              {/* Facebook Button */}
              <a 
                href="https://www.facebook.com/profile.php?id=61577722349701&locale=vi_VN" 
                target="_blank" 
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition shadow-lg"
                title={t('footer.facebookTitle')}
              >
                <Facebook size={24} />
              </a>

              {/* Zalo Button (Custom Style) */}
              <a 
                href="https://zalo.me/0345011468" 
                target="_blank" 
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-[#0068FF] text-white flex items-center justify-center hover:scale-110 transition shadow-lg font-bold text-lg font-sans italic"
                title={t('footer.zaloTitle')}
              >
                Z
              </a>

              {/* Instagram Button */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white flex items-center justify-center hover:scale-110 transition shadow-lg"
                title={t('footer.instagramTitle')}
              >
                <Instagram size={24} />
              </a>

              {/* TikTok Button */}
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-[#010101] text-white flex items-center justify-center hover:scale-110 transition shadow-lg"
                title={t('footer.tiktokTitle')}
              >
                <TikTokIcon size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 text-center text-xs opacity-60">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppShell />
    </Router>
  );
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/private/hp/admin');

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {!isAdminRoute && <Navigation />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/tourism" element={<Tourism />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/comment" element={<Comment />} />
          <Route path="/private/hp/admin" element={<AdminLogin />} />
          <Route element={<ProtectedAdminLayout />}>
            <Route path="/private/hp/admin/room" element={<AdminRooms />} />
            <Route path="/private/hp/admin/check-room" element={<CheckRoom />} />
            <Route path="/private/hp/admin/booking" element={<AdminBookings />} />
            <Route path="/private/hp/admin/currency" element={<AdminCurrency />} />
            <Route path="/private/hp/admin/comments" element={<AdminComments />} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ChatWidget />}
    </div>
  );
};

export default App;
