import { Link } from 'react-router-dom';
import { Plane, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-zinc-100 dark:bg-zinc-950 border-t border-black/5 dark:border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-zinc-900 dark:text-white">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <Plane className="w-6 h-6 text-blue-500" />
            <span className="font-display font-bold text-lg uppercase">Global Nexis</span>
          </Link>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            {t('footer.desc')}
          </p>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-6 uppercase text-sm tracking-widest text-zinc-500 dark:text-zinc-400">{t('footer.services')}</h4>
          <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300 font-medium font-sans">
            <li><Link to="/services" className="hover:text-blue-500 transition-colors uppercase tracking-tight">{t('nav.services')}</Link></li>
            <li><Link to="/services" className="hover:text-blue-500 transition-colors uppercase tracking-tight">{t('footer.sourcing')}</Link></li>
            <li><Link to="/services" className="hover:text-blue-500 transition-colors uppercase tracking-tight">{t('footer.certification')}</Link></li>
            <li><Link to="/services" className="hover:text-blue-500 transition-colors uppercase tracking-tight">{t('footer.b2b')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-6 uppercase text-sm tracking-widest text-zinc-500 dark:text-zinc-400">{t('footer.links')}</h4>
          <ul className="space-y-4 text-base text-zinc-600 dark:text-zinc-300">
            <li><Link to="/about" className="hover:text-blue-500 transition-colors">{t('nav.about')}</Link></li>
            <li><Link to="/contact" className="hover:text-blue-500 transition-colors">{t('footer.inquiry')}</Link></li>
            <li><Link to="/faq" className="hover:text-blue-500 transition-colors">{t('nav.faq')}</Link></li>
            <li><Link to="/apply" className="hover:text-blue-500 transition-colors">{t('nav.apply')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold mb-6 uppercase text-sm tracking-widest text-zinc-500 dark:text-zinc-400">{t('footer.contact')}</h4>
          <ul className="space-y-4 text-base text-zinc-600 dark:text-zinc-300">
            <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-blue-500" /> contact@globalnexis.com</li>
            <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-blue-500" /> +82 (0)10-0000-0000</li>
            <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-blue-500" /> {t('footer.address')}</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500 dark:text-zinc-600">
        <p>© 2026 Global Nexis. All rights reserved.</p>
        <div className="flex gap-8">
          <Link to="#">{t('footer.privacy')}</Link>
          <Link to="#">{t('footer.terms')}</Link>
        </div>
      </div>
    </footer>
  );
}
