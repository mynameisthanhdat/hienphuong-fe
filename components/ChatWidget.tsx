import React, { useState } from 'react';
import { Phone, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Phone Numbers Popover */}
      <div 
        className={`
          mb-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-brown-100 transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
        `}
      >
        <div className="bg-brown-800 p-3 text-white text-center font-bold font-serif text-sm tracking-wider">
          {t('chatWidget.title')}
        </div>
        <div className="p-2 space-y-2 min-w-[220px]">
           {/* Phone Option 1 */}
           <a 
             href="tel:0345011468" 
             className="flex items-center space-x-3 p-3 hover:bg-gold-50 rounded-xl transition group border border-transparent hover:border-gold-200"
           >
             <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 group-hover:bg-gold-500 group-hover:text-white transition shadow-sm">
               <Phone size={18} />
             </div>
             <div className="flex flex-col">
                <span className="text-xs text-brown-400 font-bold uppercase">{t('chatWidget.reception1')}</span>
                <span className="font-bold text-brown-800 text-lg leading-none">0345 011 468</span>
             </div>
           </a>
           
           {/* Phone Option 2 */}
           <a 
             href="tel:0377586258" 
             className="flex items-center space-x-3 p-3 hover:bg-gold-50 rounded-xl transition group border border-transparent hover:border-gold-200"
           >
             <div className="w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center text-brown-600 group-hover:bg-brown-800 group-hover:text-white transition shadow-sm">
               <Phone size={18} />
             </div>
             <div className="flex flex-col">
                <span className="text-xs text-brown-400 font-bold uppercase">{t('chatWidget.reception2')}</span>
                <span className="font-bold text-brown-800 text-lg leading-none">0377 586 258</span>
             </div>
           </a>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t('chatWidget.close') : t('chatWidget.open')}
        className={`
          w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border-4 border-white
          ${isOpen ? 'bg-gray-100 text-gray-500 rotate-45 hover:bg-gray-200' : 'bg-gold-500 text-white hover:bg-gold-600 hover:scale-105'}
        `}
      >
         {isOpen ? <X size={32} /> : <Phone size={32} className="animate-[pulse_2s_infinite]" />}
      </button>
    </div>
  );
};

export default ChatWidget;
