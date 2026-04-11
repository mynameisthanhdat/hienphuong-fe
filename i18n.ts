import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  defaultLanguage,
  languageStorageKey,
  resources,
  supportedLanguages,
  type AppLanguage,
} from './translations';

const isSupportedLanguage = (language: string): language is AppLanguage =>
  supportedLanguages.includes(language as AppLanguage);

const getSavedLanguage = (): AppLanguage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const savedLanguage = window.localStorage.getItem(languageStorageKey);
  return savedLanguage && isSupportedLanguage(savedLanguage) ? savedLanguage : null;
};

const getBrowserLanguage = (): AppLanguage | null => {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const browserLanguage = navigator.language.split('-')[0];
  return isSupportedLanguage(browserLanguage) ? browserLanguage : null;
};

const initialLanguage = getSavedLanguage() ?? getBrowserLanguage() ?? defaultLanguage;

if (typeof window !== 'undefined') {
  window.localStorage.setItem(languageStorageKey, initialLanguage);
}

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => {
  if (!isSupportedLanguage(language)) {
    return;
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(languageStorageKey, language);
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
});

export { defaultLanguage, supportedLanguages };
export type { AppLanguage };
export default i18n;
