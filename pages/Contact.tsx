import React from 'react';
import { Facebook, Instagram, MapPin, MessageCircle, Music2, Navigation, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const primaryPhoneNumber = '0345011468';
const secondaryPhoneNumber = '0377586258';
const facebookUrl =
  import.meta.env.VITE_FACEBOOK_URL?.trim() ||
  'https://www.facebook.com/profile.php?id=61577722349701&locale=vi_VN';
const zaloUrl = import.meta.env.VITE_ZALO_URL?.trim() || 'https://zalo.me/0345011468';
const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL?.trim() || 'https://www.instagram.com/hienphuongmotel/';
const tiktokUrl = import.meta.env.VITE_TIKTOK_URL?.trim() || 'https://www.tiktok.com/@motelhienphuong';

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const contactChannels = [
    {
      label: t('contact.socialPhone'),
      value: '0345 011 468',
      href: `tel:${primaryPhoneNumber}`,
      Icon: Phone,
      className: 'bg-[#c59f58] text-[#2f241c]',
      external: false,
    },
    {
      label: t('contact.socialZalo'),
      value: 'Zalo 0345 011 468',
      href: zaloUrl,
      Icon: MessageCircle,
      className: 'bg-[#0068FF] text-white',
      external: true,
    },
    {
      label: t('contact.socialFacebook'),
      value: 'Hiền Phương Motel',
      href: facebookUrl,
      Icon: Facebook,
      className: 'bg-[#1877F2] text-white',
      external: true,
    },
    {
      label: t('contact.socialInstagram'),
      value: '@hienphuongmotel',
      href: instagramUrl,
      Icon: Instagram,
      className: 'bg-[linear-gradient(135deg,#feda75_0%,#d62976_50%,#4f5bd5_100%)] text-white',
      external: true,
    },
    {
      label: t('contact.socialTiktok'),
      value: '@motelhienphuong',
      href: tiktokUrl,
      Icon: Music2,
      className: 'bg-[#111111] text-white',
      external: true,
    },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[50vh] flex items-center justify-center bg-brown-900">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://i.ibb.co/3Y7n891v/9.png")' }}></div>
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
                      <a href={`tel:${primaryPhoneNumber}`} className="text-brown-600 hover:text-gold-600 transition">0345 011 468</a>
                      <a href={`tel:${secondaryPhoneNumber}`} className="text-brown-600 hover:text-gold-600 transition">0377 586 258</a>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-brown-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">
                    {t('contact.quickChannels')}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {contactChannels.map(({ label, value, href, Icon, className, external }) => (
                      <a
                        key={label}
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noreferrer' : undefined}
                        className="group flex items-center gap-4 rounded-2xl border border-brown-100 bg-[#fffaf2] p-4 transition hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md"
                      >
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${className}`}>
                          <Icon size={20} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-brown-400">
                            {label}
                          </span>
                          <span className="mt-1 block truncate text-sm font-bold text-brown-900 transition group-hover:text-gold-700">
                            {value}
                          </span>
                        </span>
                      </a>
                    ))}
                  </div>
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
