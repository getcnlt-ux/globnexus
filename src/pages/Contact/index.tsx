import { useTranslation } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
      <h1 className="text-4xl md:text-7xl font-display font-bold mb-8 uppercase">{t('contact_page.title')}</h1>
      <p className="text-zinc-500 text-lg mb-16 px-4">
        {t('contact_page.subtitle')}
      </p>

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
          <button className="w-full bg-zinc-100 text-zinc-950 py-5 rounded-xl font-bold hover:bg-white transition-colors">
            {t('contact_page.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
