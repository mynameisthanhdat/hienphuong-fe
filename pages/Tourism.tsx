import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TouristSpot } from '../types';

const Tourism: React.FC = () => {
  const [curr, setCurr] = useState(0);
  const { t } = useTranslation();

  const spots: TouristSpot[] = [
    { id: 1, name: t('tourism.spots.hoiAn.name'), description: t('tourism.spots.hoiAn.description'), image: 'https://picsum.photos/800/600?random=1' },
    { id: 2, name: t('tourism.spots.mySon.name'), description: t('tourism.spots.mySon.description'), image: 'https://picsum.photos/800/600?random=2' },
    { id: 3, name: t('tourism.spots.dragonBridge.name'), description: t('tourism.spots.dragonBridge.description'), image: 'https://picsum.photos/800/600?random=3' },
    { id: 4, name: t('tourism.spots.bayMau.name'), description: t('tourism.spots.bayMau.description'), image: 'https://picsum.photos/800/600?random=4' },
    { id: 5, name: t('tourism.spots.vinWonders.name'), description: t('tourism.spots.vinWonders.description'), image: 'https://picsum.photos/800/600?random=5' },
  ];

  const prev = () => setCurr((curr) => (curr === 0 ? spots.length - 1 : curr - 1));
  const next = () => setCurr((curr) => (curr === spots.length - 1 ? 0 : curr + 1));

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-[50vh] flex items-center justify-center bg-brown-900">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://picsum.photos/1920/1080?random=11")' }}></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center animate-fade-in-up px-4">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg">{t('tourism.heroTitle')}</h1>
          <div className="w-24 h-1 bg-[#BFA15A] mx-auto"></div>
          <p className="text-[#BFA15A] mt-4 text-lg tracking-wider uppercase font-bold drop-shadow-sm">{t('tourism.heroSubtitle')}</p>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-brown-900">{t('tourism.title')}</h2>
            <p className="text-brown-500 mt-2">{t('tourism.subtitle')}</p>
          </div>

          <div className="relative group max-w-4xl mx-auto">
            {/* Main Image Display */}
            <div className="overflow-hidden rounded-2xl shadow-2xl relative aspect-video">
              <div 
                className="flex transition-transform duration-500 ease-out h-full" 
                style={{ transform: `translateX(-${curr * 100}%)` }}
              >
                {spots.map((s) => (
                  <div key={s.id} className="min-w-full h-full relative">
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brown-900/90 to-transparent p-8 pt-24 text-white">
                      <h3 className="text-3xl font-serif font-bold mb-2 flex items-center gap-2">
                        <MapPin className="text-gold-500" /> {s.name}
                      </h3>
                      <p className="text-gray-200">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Controls */}
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <button 
                  onClick={prev} 
                  type="button"
                  aria-label={t('tourism.previousAria')}
                  className="p-3 rounded-full bg-white/30 backdrop-blur-sm text-white hover:bg-gold-500 hover:text-white transition shadow-lg"
                >
                  <ChevronLeft size={30} />
                </button>
                <button 
                  onClick={next} 
                  type="button"
                  aria-label={t('tourism.nextAria')}
                  className="p-3 rounded-full bg-white/30 backdrop-blur-sm text-white hover:bg-gold-500 hover:text-white transition shadow-lg"
                >
                  <ChevronRight size={30} />
                </button>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center mt-6 gap-3">
              {spots.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurr(i)}
                  className={`w-3 h-3 rounded-full transition-all ${curr === i ? 'bg-gold-500 w-8' : 'bg-brown-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tourism;
