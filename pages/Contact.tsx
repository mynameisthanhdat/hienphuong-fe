import React from 'react';
import { MapPin, Phone, Facebook, MessageCircle, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Contact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[50vh] flex items-center justify-center bg-brown-900">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://picsum.photos/1920/1080?random=14")' }}></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center animate-fade-in-up px-4">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg">{t('contact.heroTitle')}</h1>
          <div className="w-24 h-1 bg-[#BFA15A] mx-auto"></div>
          <p className="text-[#BFA15A] mt-4 text-lg tracking-wider uppercase font-bold drop-shadow-sm">{t('contact.heroSubtitle')}</p>
        </div>
      </div>

      <div className="py-20 bg-brown-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-bold text-brown-900">{t('contact.title')}</h2>
              <p className="text-brown-600 text-lg">{t('contact.subtitle')}</p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm border border-brown-100">
                  <div className="bg-gold-100 p-3 rounded-full">
                    <MapPin className="text-gold-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brown-800 text-lg mb-1">{t('contact.addressTitle')}</h4>
                    <p className="text-brown-600 leading-relaxed">{t('common.address')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm border border-brown-100">
                  <div className="bg-gold-100 p-3 rounded-full">
                    <Phone className="text-gold-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brown-800 text-lg mb-1">{t('contact.phoneTitle')}</h4>
                    <div className="flex flex-col space-y-1">
                      <a href="tel:0345011468" className="text-brown-600 hover:text-gold-600 transition">0345 011 468</a>
                      <a href="tel:0377586258" className="text-brown-600 hover:text-gold-600 transition">0377 586 258</a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href="https://www.facebook.com/profile.php?id=61577722349701&locale=vi_VN" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center space-x-2 bg-[#1877F2] text-white p-4 rounded-xl shadow-md hover:opacity-90 transition"
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="font-bold">{t('contact.socialFacebook')}</span>
                  </a>
                  
                  <a 
                    href="https://zalo.me/0345011468" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center space-x-2 bg-[#0068FF] text-white p-4 rounded-xl shadow-md hover:opacity-90 transition"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-bold">{t('contact.socialZalo')}</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="h-[500px] bg-white rounded-2xl overflow-hidden shadow-xl border-4 border-white relative group">
              <a 
                href="https://maps.app.goo.gl/haDDzx9cyGYPmKvU7" 
                target="_blank" 
                rel="noreferrer"
                className="block w-full h-full relative"
              >
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
                   <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl transform scale-0 group-hover:scale-100 transition-transform duration-300 flex items-center gap-2 text-brown-900 font-bold">
                      <Navigation className="text-gold-500" />
                      {t('contact.directions')}
                   </div>
                </div>
                <iframe
                  title={t('home.mapIframeTitle')}
                  src="https://maps.google.com/maps?q=Hiền+Phương+Motel+Duy+Xuyên&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, pointerEvents: 'none' }}
                  allowFullScreen={false}
                  loading="lazy"
                  className="w-full h-full"
                ></iframe>
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
