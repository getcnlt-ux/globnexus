import { useTranslation } from 'react-i18next';
import { business } from '../../lib/business';

export default function BusinessInfo() {
  const { t } = useTranslation();
  const fields = [
    ['operator', business.name],
    ['representative', business.representative],
    ['registrationNumber', business.registrationNumber],
    ['address', t('footer.address')],
  ];

  return (
    <section className="text-left text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
      <h2 className="font-semibold text-zinc-900 dark:text-white mb-3">{t('business.title')}</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
        {fields.map(([key, value]) => (
          <div key={key} className={key === 'address' ? 'sm:col-span-2 min-w-0' : 'min-w-0'}>
            <dt className="inline font-medium">{t('business.' + key)}: </dt>
            <dd className="inline break-words">{value}</dd>
          </div>
        ))}
        <div>
          <dt className="inline font-medium">{t('business.phone')}: </dt>
          <dd className="inline"><a href={business.phoneHref} className="hover:text-blue-500">{business.phone}</a></dd>
        </div>
      </dl>
    </section>
  );
}
