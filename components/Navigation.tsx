import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Phone,
  Home,
  Info,
  Map,
  Bed,
  CalendarCheck,
  Search,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import logoSrc from "../assets/logo.png";

const fallbackLogoSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="150" viewBox="0 0 100 150">
    <rect width="100" height="150" rx="16" fill="#4e342e" />
    <rect x="10" y="10" width="80" height="130" rx="12" fill="#5d4037" stroke="#f59e0b" stroke-width="3" />
    <text x="50" y="70" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#f59e0b">HP</text>
    <text x="50" y="95" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" letter-spacing="3" fill="#ffffff">MOTEL</text>
  </svg>
`)}`;

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("navigation.home"), path: "/", icon: Home },
    { name: t("navigation.about"), path: "/about", icon: Info },
    { name: t("navigation.tourism"), path: "/tourism", icon: Map },
    { name: t("navigation.rooms"), path: "/rooms", icon: Bed },
    { name: t("navigation.contact"), path: "/contact", icon: Phone },
  ];

  const mobileNavLinks = [
    ...navLinks,
    {
      name: t("navigation.reservation"),
      path: "/reservation",
      icon: CalendarCheck,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const headerClass = `fixed top-0 w-full z-50 transition-all duration-300 ${
    scrolled ? "bg-brown-900/90 backdrop-blur-md shadow-xl" : "bg-transparent"
  }`;

  const textColorClass = "text-white";
  const hoverColorClass = "hover:text-gold-400";
  const activeTextColorClass = "text-gold-400 font-bold";

  return (
    <nav className={headerClass}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-20" : "h-28"}`}
        >
          {/* Logo Section */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
            <img
              src={logoSrc}
              alt={t("navigation.logoAlt")}
              className={`w-auto object-contain drop-shadow-lg group-hover:opacity-90 transition-all duration-300 ${scrolled ? "h-14" : "h-20"}`}
              onError={(e) => {
                const image = e.currentTarget;
                image.onerror = null;
                image.src = fallbackLogoSrc;
              }}
            />
            <div className={`flex flex-col justify-center ${textColorClass}`}>
              <span className="text-gold-500 text-2xl md:text-3xl font-serif font-bold tracking-widest leading-none drop-shadow-md group-hover:text-gold-400 transition-colors">
                Hiền Phương
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-90 font-bold group-hover:text-white/80 transition-colors ml-0.5">
                {t("common.motelLabel")}
              </span>
            </div>
          </Link>

          {/* Desktop Menu & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Separator */}
            <div className="w-px h-8 bg-white/20 transform -skew-x-12"></div>

            {/* Nav Links */}
            <div className="flex items-baseline space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-semibold tracking-wider uppercase transition-colors duration-300 ${
                    isActive(link.path)
                      ? activeTextColorClass
                      : `${textColorClass} ${hoverColorClass}`
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <LanguageSwitcher />

            {/* Reservation Button */}
            <Link
              to="/reservation"
              className="px-6 py-3 rounded-md text-sm font-bold tracking-wide uppercase bg-red-600 text-white hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-px"
            >
              {t("navigation.reservation")}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md hover:bg-white/20 focus:outline-none ${textColorClass}`}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Always dark background for visibility */}
      {isOpen && (
        <div
          className={`md:hidden pb-4 border-t border-white/10 ${scrolled ? "bg-brown-900/90" : "bg-black/90 backdrop-blur-md"}`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {mobileNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors ${textColorClass} ${
                  isActive(link.path)
                    ? "bg-white/20 text-gold-400"
                    : "hover:bg-white/10"
                } ${link.path === "/reservation" ? "bg-red-600 font-bold" : ""}`}
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.name}
              </Link>
            ))}
            <div className="pt-2">
              <LanguageSwitcher
                mobile
                onLanguageChange={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
