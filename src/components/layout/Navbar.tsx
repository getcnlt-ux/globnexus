import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Plane, Globe2, Sun, Moon, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useTheme } from '../common/ThemeProvider';

const languages = [
  { code: 'ko', name: 'KR' },
  { code: 'en', name: 'EN' },
  { code: 'zh', name: 'CN' },
  { code: 'ja', name: 'JP' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: t('nav.home') || 'Home', href: '/' },
    { name: t('nav.about') || 'About', href: '/about' },
    { name: t('nav.services') || 'Services', href: '/services' },
    { name: t('nav.apply') || 'Apply', href: '/apply' },
    { name: t('nav.track') || 'Tracking', href: '/tracking' },
    { name: t('nav.contact') || 'Contact', href: '/contact' },
    { name: t('nav.faq') || 'FAQ', href: '/faq' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'py-4 glass-panel' : 'py-6 bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Plane className="w-8 h-8 text-blue-500" />
          </motion.div>
          <span className="font-display font-bold text-xl tracking-tighter uppercase">
            Global Nexis <span className="text-blue-500 italic">Control</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-blue-500',
                location.pathname === link.href ? 'text-blue-500' : 'text-zinc-600 dark:text-zinc-400'
              )}
            >
              {link.name}
            </Link>
          ))}

          {/* Quick Apply CTA */}
          <Link
            to="/apply"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95"
          >
            <span>{t('nav.apply') || '신청하기'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass-panel hover:border-blue-500/50 transition-colors text-blue-500 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full text-xs hover:border-blue-500/50 transition-colors uppercase font-bold cursor-pointer"
            >
              <Globe2 className="w-4 h-4" />
              <span>{i18n.language.toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-24 glass-panel rounded-xl overflow-hidden py-1 shadow-xl"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        "w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors cursor-pointer",
                        i18n.language === lang.code ? "text-blue-400 font-bold" : "text-zinc-400"
                      )}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full glass-panel border-black/10 dark:border-white/10 text-blue-600 dark:text-blue-400 hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            className="text-zinc-900 dark:text-zinc-100 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 glass-panel py-6 px-6 flex flex-col gap-4 border-t border-white/10 shadow-2xl"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-lg font-bold uppercase tracking-tight py-1",
                  location.pathname === link.href ? "text-blue-500" : "text-zinc-900 dark:text-zinc-100"
                )}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/apply"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg mt-2"
            >
              <span>{t('nav.apply') || '신청하기'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-6 border-t border-white/10 mt-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe2 className="w-3 h-3" />
                {t('nav.language') || 'Language'}
              </p>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "px-6 py-3 rounded-full text-sm font-bold border transition-all cursor-pointer",
                      i18n.language === lang.code 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                        : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
