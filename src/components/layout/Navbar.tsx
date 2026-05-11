import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Plane, Globe2, Settings, LogIn, LogOut, User, UserPlus, Link as LinkIcon, Check, Users, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useAuth } from '../common/AuthProvider';
import { useTheme } from '../common/ThemeProvider';
import AuthModal from '../common/AuthModal';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

const languages = [
  { code: 'ko', name: 'KR' },
  { code: 'en', name: 'EN' },
  { code: 'zh', name: 'CN' },
  { code: 'ja', name: 'JP' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  const referralLink = profile ? `${window.location.origin}?ref=${profile.referralCode}` : '';

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const links = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.services'), href: '/services' },
    { name: t('nav.apply'), href: '/apply' },
    { name: t('nav.track'), href: '/tracking' },
    { name: t('nav.contact'), href: '/contact' },
    { name: t('nav.faq'), href: '/faq' },
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
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
            Globridge <span className="text-blue-500 italic">Control</span>
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
                location.pathname === link.href ? 'text-blue-500' : 'text-zinc-400'
              )}
            >
              {link.name}
            </Link>
          ))}

          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-xs font-black hover:bg-red-500 transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse border-2 border-red-400"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{t('nav.adminPanel')}</span>
            </Link>
          )}

          {profile ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full border border-black/5 dark:border-white/10 hover:border-blue-500/50 transition-all font-sans"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-blue-600/20">
                  {profile.displayName?.charAt(0) || profile.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-zinc-100 hidden lg:block">
                  {profile.displayName || 'User'}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-64 glass-panel rounded-2xl overflow-hidden py-2 shadow-2xl border-black/5 dark:border-white/10"
                  >
                    <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 mb-2 bg-black/5 dark:bg-white/5">
                       <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">{t('nav.account')}</p>
                       <p className="text-xs font-bold text-zinc-900 dark:text-white truncate mb-3">{profile.email}</p>
                       
                       <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1 font-black">{t('nav.myReferral')}</p>
                       <div className="flex items-center gap-2 bg-zinc-100 dark:bg-black/40 border border-black/5 dark:border-white/5 p-1.5 rounded-lg">
                         <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 truncate flex-grow">{referralLink}</span>
                         <button 
                            onClick={copyReferralLink}
                            className="text-blue-500 hover:text-blue-400 p-1"
                         >
                           {copied ? <Check className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                         </button>
                       </div>
                    </div>
                    {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                      <Link 
                        to="/admin" 
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        {t('nav.adminPanel')}
                      </Link>
                    ) : null}
                    <Link 
                      to="/referrals" 
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border-t border-white/5"
                    >
                      <Users className="w-4 h-4" />
                      {t('agent.dashboard')}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="text-xs font-bold text-zinc-400 hover:text-white transition-colors px-2"
              >
                {t('nav.login')}
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('nav.signup')}</span>
              </button>
            </div>
          )}
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass-panel hover:border-blue-500/50 transition-colors text-blue-500"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full text-xs hover:border-blue-500/50 transition-colors uppercase font-bold"
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
                  className="absolute top-full right-0 mt-2 w-24 glass-panel rounded-xl overflow-hidden py-1"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        "w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors",
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
            className="p-3 rounded-full glass-panel border-black/10 dark:border-white/10 text-blue-600 dark:text-blue-400 hover:scale-110 active:scale-95 transition-all shadow-sm"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="text-zinc-900 dark:text-zinc-100 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors" onClick={() => setIsOpen(!isOpen)}>
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
            className="md:hidden absolute top-full left-0 right-0 glass-panel py-6 px-6 flex flex-col gap-4 border-t border-white/10"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-lg font-bold uppercase tracking-tight",
                  location.pathname === link.href ? "text-blue-500" : "text-zinc-900 dark:text-zinc-100"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-white/10 mt-2">
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-3 bg-red-600 text-white py-4 rounded-xl text-sm font-black shadow-lg mb-2"
                >
                  <Settings className="w-5 h-5" />
                  {t('nav.adminPanel')}
                </Link>
              )}
              {profile ? (
                <>
                  <Link
                    to="/referrals"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white py-3 rounded-xl text-sm font-bold mb-2 shadow-sm"
                  >
                    <Users className="w-4 h-4" />
                    {t('agent.dashboard')}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-500 py-3 rounded-xl text-sm font-bold border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')} ({profile.displayName || profile.email?.split('@')[0]})
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-white py-3 rounded-xl text-sm font-bold shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('nav.signup')}
                  </button>
                </div>
              )}
            </div>

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
                      "px-6 py-3 rounded-full text-sm font-bold border transition-all",
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

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode}
      />
    </nav>
  );
}
