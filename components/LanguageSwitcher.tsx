import React from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import { defaultLanguage, supportedLanguages, type AppLanguage } from "../i18n";

interface LanguageSwitcherProps {
  mobile?: boolean;
  onLanguageChange?: () => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  mobile = false,
  onLanguageChange,
}) => {
  const { t, i18n } = useTranslation();

  const activeLanguage = supportedLanguages.includes(
    i18n.resolvedLanguage as AppLanguage,
  )
    ? (i18n.resolvedLanguage as AppLanguage)
    : defaultLanguage;

  const handleLanguageChange = async (language: AppLanguage) => {
    await i18n.changeLanguage(language);
    onLanguageChange?.();
  };

  return (
    <div
      className={`flex items-center ${
        mobile
          ? "w-full justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
          : "gap-3"
      }`}
    >
      <div
        className={`flex items-center gap-2 ${mobile ? "text-sm font-semibold text-white" : "text-white/80"}`}
      >
        <Globe size={16} className="text-gold-400" />
        {mobile ? <span>{t("common.languageLabel")}</span> : null}
      </div>
      <div
        className={`relative z-10 inline-flex rounded-full border border-white/20 bg-white/10 p-1 pointer-events-auto ${mobile ? "ml-auto" : "backdrop-blur-sm"}`}
      >
        {supportedLanguages.map((language) => (
          <button
            key={language}
            type="button"
            onClick={!mobile ? () => {
              void handleLanguageChange(language);
            } : undefined}
            onPointerUp={mobile ? () => {
              void handleLanguageChange(language);
            } : undefined}
            title={t(`common.languageNames.${language}`)}
            aria-label={t(`common.languageNames.${language}`)}
            aria-pressed={activeLanguage === language}
            className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.2em] transition-colors ${
              activeLanguage === language
                ? "bg-gold-500 text-brown-900"
                : "text-white hover:bg-white/10"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            {language.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
