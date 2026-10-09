import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  const { t } = useTranslation();

  return (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
      <h1 className="text-4xl md:text-7xl font-display font-bold mb-8 uppercase">{t('contact_page.title')}</h1>
      <p className="text-zinc-500 text-lg mb-16 px-4 max-w-2xl mx-auto">
        {t('contact_page.subtitle')}
      </p>

      {/* Direct Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
        <a 
          href="mailto:contact@glob-nexis.com" 
          className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-1">Email</span>
          <p className="font-bold text-zinc-900 dark:text-white text-base">contact@glob-nexis.com</p>
        </a>

        <a 
          href="tel:+821027461240" 
          className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group block"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-1">Phone</span>
          <p className="font-bold text-zinc-900 dark:text-white text-base">+82 (0)10-2746-1240</p>
        </a>

        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-1">Hours</span>
          <p className="font-bold text-zinc-900 dark:text-white text-sm">Mon - Fri: 09:00 ~ 18:00 (KST)</p>
        </div>
      </div>

      <div className="glass-panel p-10 rounded-3xl text-left">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400">{t('contact_page.fields.name')}</label>
              <input className="form-input" placeholder={t('contact_page.fields.name_placeholder')} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400">{t('contact_page.fields.email')}</label>
              <input className="form-input" placeholder={t('contact_page.fields.email_placeholder')} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400">{t('contact_page.fields.message')}</label>
            <textarea className="form-input min-h-[150px] py-4" placeholder={t('contact_page.fields.message_placeholder')}></textarea>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-xl font-bold transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)]">
            {t('contact_page.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
