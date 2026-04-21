import React from 'react';
import { Facebook, Instagram, MessageCircle, Music2, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@smastrom/react-rating/style.css';

const primaryPhoneNumber = '0345011468';
const facebookUrl =
  import.meta.env.VITE_FACEBOOK_URL?.trim() ||
  'https://www.facebook.com/profile.php?id=61577722349701&locale=vi_VN';
const zaloUrl = import.meta.env.VITE_ZALO_URL?.trim() || 'https://zalo.me/0345011468';
const instagramUrl = 'https://www.instagram.com/hienphuongmotel/';
const tiktokUrl = 'https://www.tiktok.com/@motelhienphuong';

const About: React.FC = () => {
  const { t, i18n } = useTranslation();

  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
 
  const contactChannels = [
    {
      label: t('about.ctaPhone'),
      value: '0345 011 468',
      href: `tel:${primaryPhoneNumber}`,
      Icon: Phone,
      className: 'bg-[#c59f58] text-[#2f241c]',
      external: false,
    },
    {
      label: t('about.ctaZalo'),
      value: 'Zalo 0345 011 468',
      href: zaloUrl,
      Icon: MessageCircle,
      className: 'bg-[#0068FF] text-white',
      external: true,
    },
    {
      label: t('about.ctaFacebook'),
      value: 'Hiền Phương Motel',
      href: facebookUrl,
      Icon: Facebook,
      className: 'bg-[#1877F2] text-white',
      external: true,
    },
    {
      label: t('about.ctaInstagram'),
      value: '@hienphuongmotel',
      href: instagramUrl,
      Icon: Instagram,
      className: 'bg-[linear-gradient(135deg,#feda75_0%,#d62976_50%,#4f5bd5_100%)] text-white',
      external: true,
    },
    {
      label: t('about.ctaTiktok'),
      value: '@hienphuongmotel',
      href: tiktokUrl,
      Icon: Music2,
      className: 'bg-[#111111] text-white',
      external: true,
    },
  ];

  const formatCommentDate = (value?: string) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div>
      <style>{`
        @keyframes about-comments-marquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(calc(-50% - 0.625rem));
          }
        }
      `}</style>

      <div className="relative flex h-[50vh] items-center justify-center bg-brown-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://i.ibb.co/84KXpvhs/7.png")' }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 animate-fade-in-up px-4 text-center">
          <h1 className="mb-4 text-5xl font-serif font-bold text-white drop-shadow-lg md:text-6xl">
            {t('about.heroTitle')}
          </h1>
          <div className="mx-auto h-1 w-24 bg-[#BFA15A]"></div>
          <p className="mt-4 text-lg font-bold uppercase tracking-wider text-[#BFA15A] drop-shadow-sm">
            {t('about.heroSubtitle')}
          </p>
        </div>
      </div>

      <div className="flex min-h-screen items-center bg-brown-50 py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-lg border-2 border-gold-500"></div>
              <img
                src="https://i.ibb.co/Qv9588F0/4.png"
                alt={t('about.imageAlt')}
                className="relative h-[500px] w-full rounded-lg object-cover shadow-2xl"
              />
            </div>

            <div className="w-full space-y-6 md:w-1/2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gold-600">
                {t('about.sectionEyebrow')}
              </h3>
              <h1 className="text-5xl font-serif font-bold leading-tight text-brown-900">
                {t('about.title')} <span className="text-gold-500">{t('about.titleAccent')}</span>
              </h1>
              <p className="text-lg leading-relaxed text-brown-700">{t('about.paragraphOne')}</p>
              <p className="leading-relaxed text-brown-600">{t('about.paragraphTwo')}</p>

              <div className="grid grid-cols-2 gap-4 border-t border-brown-200 pt-6">
                <div>
                  <span className="block text-3xl font-serif font-bold text-gold-600">14+</span>
                  <span className="text-sm uppercase tracking-wider text-brown-500">
                    {t('about.premiumRooms')}
                  </span>
                </div>
                <div>
                  <span className="block text-3xl font-serif font-bold text-gold-600">24/7</span>
                  <span className="text-sm uppercase tracking-wider text-brown-500">
                    {t('about.support')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-[#2f241c] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#d7c29a]">
                {t('about.ctaEyebrow')}
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-serif font-bold leading-tight text-white sm:text-5xl">
                {t('about.ctaTitle')}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
                {t('about.ctaDescription')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {contactChannels.map(({ label, value, href, Icon, className, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  className="group rounded-[26px] border border-white/10 bg-white/[0.07] p-5 transition hover:-translate-y-1 hover:border-[#d7c29a]/50 hover:bg-white/10"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${className}`}>
                    <Icon size={22} />
                  </div>
                  <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-[#d7c29a]">
                    {label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white transition group-hover:text-[#f1d79d]">
                    {value}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
