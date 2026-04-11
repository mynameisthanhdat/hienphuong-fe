import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import i18n, { defaultLanguage, supportedLanguages, type AppLanguage } from '../i18n';

interface LanguageSwitcherProps {
  mobile?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ mobile = false }) => {
  const { t } = useTranslation();

  const activeLanguage = supportedLanguages.includes(i18n.resolvedLanguage as AppLanguage)
    ? (i18n.resolvedLanguage as AppLanguage)
    : defaultLanguage;

  return (
    <div className={`flex items-center ${mobile ? 'justify-between px-3 py-2' : 'gap-3'}`}>
      <div className="flex items-center gap-2 text-white/80">
        <Globe size={16} className="text-gold-400" />
      </div>

      <div className="inline-flex rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
        {supportedLanguages.map((language) => (
          <button
            key={language}
            type="button"
            onClick={() => {
              void i18n.changeLanguage(language);
            }}
            title={t(`common.languageNames.${language}`)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.2em] transition-colors ${
              activeLanguage === language
                ? 'bg-gold-500 text-brown-900'
                : 'text-white hover:bg-white/10'
            }`}
          >
            {language.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
