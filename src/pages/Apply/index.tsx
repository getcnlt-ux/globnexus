import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../components/common/AuthProvider';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  ChevronLeft, 
  CheckCircle2, 
  ExternalLink, 
  Truck, 
  ShoppingCart, 
  ShieldCheck, 
  Cpu, 
  Factory, 
  Send,
  MessageCircle,
  Mail,
  Zap,
  Globe,
  Plane,
  Ship,
  Train
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ServiceType, ConsultationData, ConsultationStatus } from '../../types';

type Step = 'entry' | 'service' | 'details' | 'info' | 'success';

export default function Apply() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('service');
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [inquiryId, setInquiryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle pre-selected service type from navigation state
  useEffect(() => {
    if (location.state?.serviceType) {
      setServiceType(location.state.serviceType as ServiceType);
      setStep('details');
    }
  }, [location.state]);

  // Generate a random inquiry ID
  useEffect(() => {
    if (step === 'success') {
      const id = 'GB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setInquiryId(id);
      
      const submission = {
        id,
        serviceType,
        ...formData,
        status: 'received',
        createdAt: Date.now()
      };
      const existing = JSON.parse(localStorage.getItem('gb_consultations') || '[]');
      localStorage.setItem('gb_consultations', JSON.stringify([...existing, submission]));
    }
  }, [step]);

  const handleServiceSelect = (type: ServiceType) => {
    setServiceType(type);
    setStep('details');
  };

  const handleDetailsSubmit = (data: any) => {
    setFormData({ ...formData, ...data });
    setStep('info');
  };

  const handleInfoSubmit = async (data: any) => {
    setIsSubmitting(true);
    const fullFormData = { ...formData, userInfo: data };
    const referralCode = sessionStorage.getItem('referral_code');
    
    try {
      const consultationData = {
        userId: user?.uid || 'anonymous',
        serviceType,
        status: 'received',
        referredBy: referralCode || null,
        createdAt: serverTimestamp(),
        ...fullFormData
      };
      
      const colRef = collection(db, 'consultations');
      await addDoc(colRef, consultationData);
      
      setIsSubmitting(false);
      setStep('success');
    } catch (err) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      alert(t('common.error'));
    }
  };

  const renderProgress = () => {
    const steps = [
      { id: 'service', label: t('apply_page.steps.service') },
      { id: 'details', label: t('apply_page.steps.details') },
      { id: 'info', label: t('apply_page.steps.info') },
      { id: 'success', label: t('apply_page.steps.success') }
    ];
    
    const currentIndex = steps.findIndex(s => s.id === step);
    if (currentIndex === -1) return null;

    return (
      <div className="flex items-center justify-center gap-4 mb-12">
        {steps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                idx <= currentIndex ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
              )}>
                {idx < currentIndex ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <span className={cn(
                "text-[10px] font-mono uppercase tracking-tighter text-center",
                idx <= currentIndex ? "text-blue-500 dark:text-blue-400" : "text-zinc-400 dark:text-zinc-600"
              )}>{s.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "w-8 sm:w-12 h-[1px]",
                idx < currentIndex ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white pt-32 pb-20 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4 text-zinc-900 dark:text-white"
          >
            {step === 'success' ? t('apply_page.success_title') : t('apply_page.title')}
          </motion.h1>
          <p className="text-zinc-600 dark:text-zinc-500 font-light">
            {step === 'success' ? t('apply_page.success_subtitle') : t('apply_page.subtitle')}
          </p>
        </div>

        {step !== 'success' && renderProgress()}

        <div className="glass-panel p-8 md:p-12 rounded-[2rem] border-black/5 dark:border-white/5 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'service' && (
              <ServiceSelection onSelect={handleServiceSelect} />
            )}
            {step === 'details' && serviceType && (
              <DetailedInput 
                type={serviceType} 
                onBack={() => setStep('service')} 
                onSubmit={handleDetailsSubmit} 
              />
            )}
            {step === 'info' && (
              <CustomerInfo 
                onBack={() => setStep('details')} 
                onSubmit={handleInfoSubmit}
                isSubmitting={isSubmitting}
              />
            )}
            {step === 'success' && (
              <SuccessScreen id={inquiryId} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ServiceSelection({ onSelect }: { onSelect: (type: ServiceType) => void }) {
  const { t } = useTranslation();
  const services = [
    { type: ServiceType.LOGISTICS, label: t('apply_page.selection.logistics'), icon: Truck, desc: t('apply_page.service.logistics.desc') },
    { type: ServiceType.BUYING, label: t('apply_page.selection.buying'), icon: ShoppingCart, desc: t('apply_page.service.buying.desc') },
    { type: ServiceType.KR_CERT, label: t('apply_page.selection.kr_cert'), icon: ShieldCheck, desc: t('apply_page.service.kr_cert.desc') },
    { type: ServiceType.CN_CERT, label: t('apply_page.selection.cn_cert'), icon: Cpu, desc: t('apply_page.service.cn_cert.desc') },
    { type: ServiceType.MANUFACTURING, label: t('apply_page.selection.mfg'), icon: Factory, desc: t('apply_page.service.mfg.desc') }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="md:col-span-2 mb-4">
        <h3 className="text-xl font-bold font-display">{t('apply_page.selection.title')}</h3>
      </div>
      {services.map((s) => (
        <button
          key={s.type}
          onClick={() => onSelect(s.type)}
          className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <s.icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{s.label}</h3>
            <p className="text-xs text-zinc-800 dark:text-zinc-500 font-bold">{s.desc}</p>
          </div>
        </button>
      ))}
    </motion.div>
  );
}

function DetailedInput({ type, onBack, onSubmit }: { type: ServiceType, onBack: () => void, onSubmit: (data: any) => void }) {
  const { t } = useTranslation();
  const [data, setData] = useState<any>({});
  const [subStep, setSubStep] = useState(0);

  const fields: Record<ServiceType, any[][]> = {
    [ServiceType.LOGISTICS]: [
      [
        { id: 'route_from', label: t('apply_page.detailed_fields.logistics.route_from'), type: 'text', placeholder: t('apply_page.detailed_fields.logistics.route_from_placeholder'), half: true },
        { id: 'route_to', label: t('apply_page.detailed_fields.logistics.route_to'), type: 'text', placeholder: t('apply_page.detailed_fields.logistics.route_to_placeholder'), half: true },
        { id: 'method', label: t('apply_page.detailed_fields.logistics.method'), type: 'choice', options: [
          { value: '항공', label: t('apply_page.detailed_fields.logistics.method_options.air'), icon: <Plane className="w-4 h-4" /> },
          { value: '해상', label: t('apply_page.detailed_fields.logistics.method_options.sea'), icon: <Ship className="w-4 h-4" /> },
          { value: '철도', label: t('apply_page.detailed_fields.logistics.method_options.rail'), icon: <Train className="w-4 h-4" /> },
          { value: '미정', label: t('apply_page.detailed_fields.logistics.method_options.unknown'), icon: <Zap className="w-4 h-4" /> }
        ] },
      ],
      [
        { id: 'link', label: t('apply_page.detailed_fields.logistics.link'), type: 'text', placeholder: t('apply_page.detailed_fields.logistics.link_placeholder') },
        { id: 'spec', label: t('apply_page.detailed_fields.logistics.spec'), type: 'text', placeholder: t('apply_page.detailed_fields.logistics.spec_placeholder') },
        { id: 'memo', label: t('apply_page.detailed_fields.logistics.memo'), type: 'textarea', placeholder: t('apply_page.detailed_fields.logistics.memo_placeholder') },
      ]
    ],
    [ServiceType.BUYING]: [
      [
        { id: 'mall', label: t('apply_page.detailed_fields.buying.mall'), type: 'choice', options: [
          { value: '1688', label: t('apply_page.detailed_fields.buying.mall_options.s1688') }, 
          { value: '타오바오', label: t('apply_page.detailed_fields.buying.mall_options.taobao') }, 
          { value: '티몰', label: t('apply_page.detailed_fields.buying.mall_options.tmall') }, 
          { value: '기타', label: t('apply_page.detailed_fields.buying.mall_options.other') }
        ] },
        { id: 'link', label: t('apply_page.detailed_fields.buying.link'), type: 'text', placeholder: t('apply_page.detailed_fields.buying.link_placeholder') },
      ],
      [
        { id: 'qty', label: t('apply_page.detailed_fields.buying.qty'), type: 'text', placeholder: t('apply_page.detailed_fields.buying.qty_placeholder') },
        { id: 'target_price', label: t('apply_page.detailed_fields.buying.target_price'), type: 'text', placeholder: t('apply_page.detailed_fields.buying.target_price_placeholder') },
        { id: 'nego_needed', label: t('apply_page.detailed_fields.buying.nego'), type: 'choice', options: [
          { value: '필요함', label: t('apply_page.detailed_fields.buying.nego_options.yes') }, 
          { value: '이미 협의됨', label: t('apply_page.detailed_fields.buying.nego_options.already') }
        ] },
      ]
    ],
    [ServiceType.KR_CERT]: [
      [
        { id: 'prod_name', label: t('apply_page.detailed_fields.kr_cert.name'), type: 'text', placeholder: t('apply_page.detailed_fields.kr_cert.name_placeholder') },
        { id: 'category', label: t('apply_page.detailed_fields.kr_cert.cat'), type: 'text', placeholder: t('apply_page.detailed_fields.kr_cert.cat_placeholder') },
      ],
      [
        { id: 'battery', label: t('apply_page.detailed_fields.kr_cert.battery'), type: 'choice', options: [
          { value: '있음', label: t('apply_page.detailed_fields.kr_cert.options.yes') }, 
          { value: '없음', label: t('apply_page.detailed_fields.kr_cert.options.no') }
        ] },
        { id: 'wireless', label: t('apply_page.detailed_fields.kr_cert.wireless'), type: 'choice', options: [
          { value: '있음', label: t('apply_page.detailed_fields.kr_cert.options.yes') }, 
          { value: '없음', label: t('apply_page.detailed_fields.kr_cert.options.no') }
        ] },
        { id: 'memo', label: t('apply_page.detailed_fields.kr_cert.memo'), type: 'textarea', placeholder: t('apply_page.detailed_fields.kr_cert.memo_placeholder') },
      ]
    ],
    [ServiceType.CN_CERT]: [
      [
        { id: 'prod_name', label: t('apply_page.detailed_fields.kr_cert.name'), type: 'text' },
        { id: 'cert_type', label: '필요 인증 종류', type: 'choice', options: [{ value: 'CCC' }, { value: 'CQC' }, { value: 'SRRC' }, { value: '기타' }] },
      ],
      [
        { id: 'memo', label: t('apply_page.detailed_fields.logistics.memo'), type: 'textarea', placeholder: t('apply_page.detailed_fields.buying.link_placeholder') },
      ]
    ],
    [ServiceType.MANUFACTURING]: [
      [
        { id: 'dev_stage', label: t('apply_page.detailed_fields.mfg.stage'), type: 'choice', options: [
          { value: '기획/아이디어', label: t('apply_page.detailed_fields.mfg.stage_options.idea') }, 
          { value: '디자인완성', label: t('apply_page.detailed_fields.mfg.stage_options.design') }, 
          { value: '도면/시제품보유', label: t('apply_page.detailed_fields.mfg.stage_options.proto') }
        ] },
        { id: 'category', label: t('apply_page.detailed_fields.mfg.cat'), type: 'text', placeholder: t('apply_page.detailed_fields.mfg.cat_placeholder') },
      ],
      [
        { id: 'qty', label: t('apply_page.detailed_fields.mfg.qty'), type: 'text', placeholder: t('apply_page.detailed_fields.mfg.qty_placeholder') },
        { id: 'memo', label: t('apply_page.detailed_fields.mfg.memo'), type: 'textarea', placeholder: t('apply_page.detailed_fields.mfg.memo_placeholder') },
      ]
    ]
  };

  const currentGroups = fields[type];
  const currentFields = currentGroups[subStep];
  const isLastSubStep = subStep === currentGroups.length - 1;

  const handleNext = () => {
    if (isLastSubStep) {
      onSubmit(data);
    } else {
      setSubStep(s => s + 1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold font-display">{t('apply_page.detailed_fields.title')}</h3>
        <div className="flex gap-1">
          {currentGroups.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 transition-all rounded-full",
                i === subStep ? "w-8 bg-blue-500" : "w-2 bg-zinc-800"
              )} 
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentFields.map((f: any) => (
          <div key={f.id} className={cn("space-y-2", f.type === 'textarea' || !f.half ? "md:col-span-2" : "")}>
            <label className="text-xs font-mono text-zinc-700 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2 font-black">
              {f.label}
              {f.required !== false && <span className="text-blue-500">*</span>}
            </label>

            {f.type === 'choice' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {f.options.map((o: any) => (
                  <button
                    key={o.value}
                    onClick={() => setData({ ...data, [f.id]: o.value })}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border text-sm gap-2 transition-all",
                      data[f.id] === o.value
                        ? "bg-blue-600/10 border-blue-600 text-blue-400"
                        : "bg-white/5 border-white/5 text-zinc-700 dark:text-zinc-500 hover:border-white/20"
                    )}
                  >
                    {o.icon}
                    <span className="font-bold text-[10px] text-center leading-tight">{o.label || o.value}</span>
                  </button>
                ))}
              </div>
            ) : f.type === 'textarea' ? (
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-colors h-32 resize-none"
                placeholder={f.placeholder}
                value={data[f.id] || ''}
                onChange={(e) => setData({ ...data, [f.id]: e.target.value })}
              />
            ) : (
              <input 
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-colors"
                placeholder={f.placeholder}
                value={data[f.id] || ''}
                onChange={(e) => setData({ ...data, [f.id]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-8">
        <button 
          onClick={subStep === 0 ? onBack : () => setSubStep(s => s - 1)} 
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft size={16} /> {subStep === 0 ? t('apply_page.btns.prev') : t('apply_page.btns.back')}
        </button>
        <button 
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          {isLastSubStep ? t('apply_page.btns.almost') : t('apply_page.btns.next')} <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function CustomerInfo({ onBack, onSubmit, isSubmitting }: { onBack: () => void, onSubmit: (data: any) => void, isSubmitting: boolean }) {
  const { t } = useTranslation();
  const [data, setData] = useState<any>({ consultationMethod: 'kakao' });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-black">{t('apply_page.fields.name')}</label>
          <input 
            type="text" 
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white font-medium"
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-black">{t('apply_page.fields.phone')}</label>
          <input 
            type="text" 
            placeholder="010-0000-0000"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white font-medium placeholder:text-zinc-600"
            onChange={(e) => setData({ ...data, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-black">{t('apply_page.fields.email')}</label>
          <input 
            type="email" 
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white font-medium"
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-black">{t('apply_page.fields.kakao')}</label>
          <input 
            type="text" 
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white font-medium"
            onChange={(e) => setData({ ...data, kakaoId: e.target.value })}
          />
        </div>
        <div className="md:col-span-2 space-y-4">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest block font-black">{t('apply_page.fields.method')}</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'kakao', label: t('consult.kakao'), icon: MessageCircle },
              { id: 'email', label: t('consult.email'), icon: Mail },
              { id: 'wechat', label: t('consult.wechat'), icon: Globe },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setData({ ...data, consultationMethod: m.id })}
                className={cn(
                  "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  data.consultationMethod === m.id 
                    ? "bg-blue-600/10 border-blue-600 text-blue-400" 
                    : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20"
                )}
              >
                <m.icon size={20} />
                <span className="text-xs font-bold text-center leading-tight">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-[11px] text-zinc-500 leading-relaxed font-light">
        {t('apply_page.fields.privacy')}
      </div>

      <div className="flex items-center justify-between pt-8">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm">
          <ChevronLeft size={16} /> {t('apply_page.btns.prev')}
        </button>
        <button 
          onClick={() => onSubmit(data)}
          disabled={isSubmitting}
          className={cn(
            "bg-blue-600 text-white px-12 py-4 rounded-full font-bold flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]",
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500"
          )}
        >
          {isSubmitting ? t('apply_page.btns.submitting') : t('apply_page.btns.submit')} <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function SuccessScreen({ id }: { id: string }) {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 text-white">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="text-3xl font-display font-bold mb-4">{t('apply_page.success_title')}</h2>
      <p className="text-zinc-500 mb-8 font-light max-w-sm mx-auto">
        {t('apply_page.success_subtitle')}
      </p>
      
      <div className="glass-panel p-6 rounded-2xl border-blue-500/30 bg-blue-600/5 inline-block mb-12">
        <span className="text-xs font-mono text-blue-400 block mb-2 tracking-widest font-black uppercase">Inquiry ID</span>
        <span className="text-2xl font-mono font-bold text-white tracking-widest">{id}</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <a 
          href="https://pf.kakao.com/_xxxx" 
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto bg-[#FEE500] text-black px-10 py-4 rounded-full font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
        >
          <MessageCircle size={18} /> {t('apply_page.btns.kakao_chat')}
        </a>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full md:w-auto glass-panel px-10 py-4 rounded-full font-bold border border-white/10 hover:bg-white/5"
        >
          {t('apply_page.btns.home')}
        </button>
      </div>
    </motion.div>
  );
}
