import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Search, Package, MapPin, Clock, CheckCircle2, Truck, Ship, Globe, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const STEPS = [
  { id: 'ordered', icon: Package },
  { id: 'preparing', icon: Clock },
  { id: 'warehouse', icon: Truck },
  { id: 'export', icon: Globe },
  { id: 'shipping', icon: Ship },
  { id: 'import', icon: Globe },
  { id: 'local', icon: Truck },
  { id: 'delivered', icon: CheckCircle2 }
];

interface DemoShipmentData {
  status: string;
  location: string;
  desc: string;
}

const DEMO_PRESETS: Record<string, DemoShipmentData> = {
  'GN-2024-001': {
    status: 'import',
    location: '인천항 (Incheon Port)',
    desc: '인천항 해관 수입 통관 심사 진행 중'
  },
  'GN-2024-005': {
    status: 'warehouse',
    location: '중국 웨이하이 물류창고 (Weihai, China)',
    desc: '중국 웨이하이 물류센터 실사 및 입고 완료'
  },
  'DEMO-12345': {
    status: 'shipping',
    location: '국제 정기 화물선 (In Transit)',
    desc: '수출 통관 후 한국행 정기 선적 운송 중'
  },
  '12345678': {
    status: 'delivered',
    location: '서울시 송파구 배송지 (Destination Reached)',
    desc: '고객님께 화물 인계 및 배송이 최종 완료되었습니다.'
  }
};

export default function TrackingPage() {
  const { t, i18n } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [searchedNumber, setSearchedNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleNumbers = [
    { number: 'GN-2024-001', label: '인천항 통관 진행' },
    { number: 'GN-2024-005', label: '웨이하이 창고 입고' },
    { number: 'DEMO-12345', label: '해상 운송 진행' },
    { number: '12345678', label: '배송 완료' }
  ];

  const handleSearch = (e?: React.FormEvent, manualNumber?: string) => {
    if (e) e.preventDefault();
    const num = (manualNumber || trackingNumber).trim();
    if (!num) return;

    setLoading(true);
    setTrackingNumber(num);
    setSearchedNumber(num);
    setResult(null);
    setNotFound(false);

    setTimeout(() => {
      const preset = DEMO_PRESETS[num.toUpperCase()] || DEMO_PRESETS[num];

      if (preset) {
        const demoTime = format(new Date(), 'yyyy-MM-dd HH:mm');
        const currentIdx = STEPS.findIndex(s => s.id === preset.status);
        const events = STEPS.slice(0, currentIdx + 1).reverse().map((step, i) => {
          const isLatest = i === 0;
          return {
            time: format(new Date(Date.now() - (i * 2) * 86400000), 'yyyy-MM-dd HH:mm'),
            location: isLatest ? preset.location : 'Global Transit Hub',
            status: step.id,
            desc: isLatest ? preset.desc : t(`agent.tracking.statusLabels.${step.id}`)
          };
        });

        setResult({
          number: num,
          currentStep: preset.status,
          lastUpdate: demoTime,
          events: events
        });
        setNotFound(false);
      } else {
        // Not a demo preset: strictly show not found notice to prevent false shipment misunderstandings
        setResult(null);
        setNotFound(true);
      }
      setLoading(false);
    }, 250);
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === result?.currentStep);

  return (
    <div className="flex-grow pt-32 pb-20 px-6 bg-zinc-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-blue-500 font-mono text-xs font-black tracking-widest uppercase mb-4 block">
              // LOGISTICS_TRACKING
            </span>
            <h1 className="text-4xl md:text-7xl font-display font-extrabold mb-6 tracking-tighter text-zinc-900 dark:text-white uppercase italic">
              {t('agent.tracking.title')}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-lg font-medium">
              {t('agent.tracking.desc')}
            </p>
          </motion.div>
        </div>

        <motion.form 
          onSubmit={handleSearch}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <div className="glass-panel p-2 rounded-2xl border-black/5 dark:border-white/10 flex items-center gap-4 bg-black/5 dark:bg-white/5 pr-4">
            <div className="flex-grow flex items-center pl-4 gap-3">
              <Search className="text-zinc-500 shrink-0" size={20} />
              <input 
                type="text" 
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={t('agent.tracking.inputPlaceholder') || '운송장 번호를 입력하세요 (예: GN-2024-001)'}
                className="w-full bg-transparent border-none text-zinc-900 dark:text-white focus:ring-0 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-bold py-3 outline-none"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-blue-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : t('agent.tracking.search')}
            </button>
          </div>
        </motion.form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <span className="text-xs text-zinc-500 font-medium mr-1">데모 시뮬레이션 번호:</span>
          {sampleNumbers.map((s) => (
            <button
              key={s.number}
              type="button"
              onClick={() => handleSearch(undefined, s.number)}
              className="text-xs px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-blue-600/10 hover:border-blue-500/30 border border-black/5 dark:border-white/10 font-mono text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              {s.number} ({s.label})
            </button>
          ))}
        </div>

        {/* Not Found State */}
        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-10 rounded-3xl border-white/10 text-center space-y-4 mb-8"
          >
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">조회 가능한 배송정보가 없습니다</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                입력하신 운송장 번호 <span className="font-mono font-bold text-zinc-900 dark:text-white">[{searchedNumber}]</span>에 해당하는 화물 정보가 조회되지 않습니다.
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
                운송장 번호를 다시 확인하시거나, 배송 대행 담당자 또는 고객센터로 문의해 주시기 바랍니다.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md"
              >
                배송 문의하기 <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Demo Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Prominent Multi-language Simulation Disclaimer Banner */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <AlertTriangle size={18} className="shrink-0" />
                <span>[시뮬레이션 데모 안내 / Simulation Notice]</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium pl-7 leading-relaxed">
                <div>🇰🇷 본 화면은 실제 배송정보가 아닌 시뮬레이션 안내입니다.</div>
                <div>🇺🇸 This is a demonstration simulation, not actual shipment data.</div>
                <div>🇨🇳 本界面为模拟演示，非真实物流信息。</div>
                <div>🇯🇵 本画面は実際の配送情報ではなく、シミュレーション案内です。</div>
              </div>
            </div>

            {/* Status Stepper */}
            <div className="glass-panel p-8 rounded-3xl border-white/10">
              <div className="flex justify-between items-center mb-10 overflow-x-auto pb-4">
                {STEPS.map((step, idx) => {
                  const isActive = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center min-w-[80px] relative">
                      {/* Connection Line */}
                      {idx < STEPS.length - 1 && (
                        <div className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 bg-zinc-800">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: idx < currentStepIndex ? '100%' : '0%' }}
                            className="h-full bg-blue-500"
                          />
                        </div>
                      )}
                      
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                        ${isActive ? 'bg-blue-500/20 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-zinc-200 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600'}
                        ${isCurrent ? 'animate-pulse' : ''}
                      `}>
                        <Icon size={18} />
                      </div>
                      <span className={`text-[9px] mt-3 font-bold uppercase tracking-wider text-center max-w-[80px] ${isActive ? 'text-blue-500' : 'text-zinc-400 dark:text-zinc-600'}`}>
                        {t(`agent.tracking.statusLabels.${step.id}`)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center border-t border-black/5 dark:border-white/5 pt-8">
                <div>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 uppercase font-bold font-mono mb-1">{t('agent.tracking.currentStep')}</p>
                  <p className="font-bold text-zinc-900 dark:text-white uppercase">{t(`agent.tracking.statusLabels.${result.currentStep}`)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 uppercase font-bold font-mono mb-1">Demo Tracking #</p>
                  <p className="font-bold text-zinc-900 dark:text-white font-mono">{result.number}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 uppercase font-bold font-mono mb-1">{t('agent.tracking.lastUpdate')}</p>
                  <p className="font-bold text-zinc-900 dark:text-white">{result.lastUpdate} (Simulation)</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="glass-panel overflow-hidden rounded-3xl border-black/5 dark:border-white/10">
              <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                  <Clock size={18} className="text-blue-500" />
                  {t('agent.tracking.details')}
                </h2>
                <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold">
                  Demo Simulation
                </span>
              </div>
              <div className="p-8">
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-black/5 dark:before:bg-white/10">
                  {result.events.map((event: any, i: number) => (
                    <div key={i} className="relative pl-10 flex gap-6">
                      <div className={`
                        absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-2 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center z-10
                        ${i === 0 ? 'border-blue-500 text-blue-500' : 'border-zinc-300 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600'}
                      `}>
                        {i === 0 ? <Truck size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-bold ${i === 0 ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-400'}`}>
                            {t(`agent.tracking.statusLabels.${event.status}`)}
                          </p>
                          <span className="text-[10px] font-mono text-zinc-500">{event.time}</span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300 text-base mb-1 font-medium">{event.desc}</p>
                        <div className="flex items-center gap-1 text-[10px] text-blue-500/70 font-mono">
                          <MapPin size={10} />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
