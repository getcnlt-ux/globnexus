import { motion } from 'motion/react';
import { Package, Truck, Search, Briefcase, Factory } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ServiceType } from '../../types';
import { useTranslation } from 'react-i18next';

export default function Services() {
  const { t } = useTranslation();

  const services = [
    {
      type: ServiceType.LOGISTICS,
      icon: <Package />,
      title: t('services_page.logistics.title'),
      description: t('services_page.logistics.desc')
    },
    {
      type: ServiceType.BUYING,
      icon: <Search />,
      title: t('services_page.buying.title'),
      description: t('services_page.buying.desc')
    },
    {
      type: ServiceType.MANUFACTURING,
      icon: <Factory />,
      title: t('services_page.mfg.title'),
      description: t('services_page.mfg.desc')
    },
    {
      type: ServiceType.LOGISTICS, // Forwarding is basically logistics/freight
      icon: <Truck />,
      title: t('services_page.delivery.title'),
      description: t('services_page.delivery.desc')
    },
    {
      type: ServiceType.KR_CERT,
      icon: <Briefcase />,
      title: t('services_page.customs.title'),
      description: t('services_page.customs.desc')
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-7xl font-display font-bold mb-20 text-center">{t('services_page.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, i) => (
          <Link 
            key={i} 
            to="/apply" 
            state={{ serviceType: service.type }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-panel p-12 rounded-3xl group hover:border-blue-500/50 transition-all h-full"
            >
              <div className="text-blue-500 mb-8 p-4 bg-blue-500/5 rounded-2xl w-fit group-hover:bg-blue-500 group-hover:text-white transition-colors">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-zinc-500 font-light leading-relaxed">{service.description}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
