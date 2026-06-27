import React, { useState, useEffect } from 'react';
import { Plus, Minus, Plane, Anchor, Clock, Percent, DollarSign, Globe, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot } from '../../lib/dbWrapper';
import { cn } from '../../lib/utils';

interface Rate {
  id: string;
  country: string;
  type: 'Air' | 'Sea';
  freightRate: string;
  proxyFee: string;
  transitTime: string;
  remarks?: string;
}

export default function FAQ() {
  const { t } = useTranslation();
  const [rates, setRates] = useState<Rate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const faqs = t('faq_page.items', { returnObjects: true }) as Array<{ q: string, a: string }>;

  useEffect(() => {
    const q = query(collection(db, 'rates'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Rate[];
      setRates(docs);
    }, (error) => {
      console.error("Failed to read rates for FAQ:", error);
    });

    return () => unsubscribe();
  }, []);

  // Dynamically craft enriched answers with live rates database
  const getEnrichedAnswer = (question: string, defaultAnswer: string) => {
    if (rates.length === 0) return defaultAnswer;

    // Shipping duration FAQ
    if (question.includes('배송 기간') || question.toLowerCase().includes('delivery') || question.toLowerCase().includes('shipping time')) {
      const airRates = rates.filter(r => r.type === 'Air');
      const seaRates = rates.filter(r => r.type === 'Sea');
      
      let enrichedText = defaultAnswer + "\n\n🌐 [실시간 국가별 고시 운송 소요 기한]\n";
      rates.forEach(r => {
        enrichedText += `• ${r.country} (${r.type === 'Air' ? '항공 Express' : '해상 Cargo'}): ${r.transitTime}\n`;
      });
      return enrichedText;
    }

    // Proxy fee FAQ
    if (question.includes('수수료') || question.toLowerCase().includes('fee') || question.toLowerCase().includes('commission')) {
      let enrichedText = defaultAnswer + "\n\n📊 [실시간 고시 국가별 구매대행 요율]\n";
      rates.forEach(r => {
        enrichedText += `• ${r.country} 대행 기본수수료: ${r.proxyFee} (운송 편: ${r.type === 'Air' ? '항공' : '해상'})\n`;
      });
      return enrichedText;
    }

    return defaultAnswer;
  };

  const filteredRates = rates.filter(r => 
    r.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.freightRate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.transitTime.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-7xl font-display font-bold mb-4 tracking-tighter text-zinc-900 dark:text-white">
          {t('faq_page.title')}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          자주 물으시는 질문과 실시간 공시기준 운임 정보를 원스톱으로 제공합니다.
        </p>
      </div>

      {/* Live Board Widget of Freight & Purchase Rates inside FAQ */}
      {rates.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-black/[0.06] dark:border-white/[0.06] bg-zinc-100/50 dark:bg-zinc-900/30 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Globe className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                  실시간 국가별 고지 요율 정보
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  관리자 포털에서 직접 설정하고 고시한 최신 배송 운임과 구매 수수료율입니다.
                </p>
              </div>
            </div>

            {/* Micro search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input
                type="text"
                placeholder="대상 국가 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-xl pl-8 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors w-full sm:w-48 placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRates.map((rate) => (
              <div 
                key={rate.id}
                className="p-4 rounded-2xl bg-white dark:bg-black/20 border border-black/[0.03] dark:border-white/[0.03] hover:border-blue-500/20 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="text-blue-500 font-display">#</span> {rate.country}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border",
                    rate.type === 'Air' 
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" 
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  )}>
                    {rate.type === 'Air' ? '항공 (Air)' : '해상 (Sea)'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  <div className="bg-black/[0.02] dark:bg-white/[0.02] p-2 rounded-xl text-center">
                    <span className="block text-[10px] text-zinc-400 mb-0.5">운임 요율</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">{rate.freightRate}</strong>
                  </div>
                  <div className="bg-black/[0.02] dark:bg-white/[0.02] p-2 rounded-xl text-center">
                    <span className="block text-[10px] text-zinc-400 mb-0.5">구매 수수료</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">{rate.proxyFee}</strong>
                  </div>
                  <div className="bg-black/[0.02] dark:bg-white/[0.02] p-2 rounded-xl text-center">
                    <span className="block text-[10px] text-zinc-400 mb-0.5">소요 기간</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">{rate.transitTime}</strong>
                  </div>
                </div>

                {rate.remarks && (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic mt-1 leading-relaxed">
                    * {rate.remarks}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      <div className="space-y-4">
        {Array.isArray(faqs) && faqs.map((faq, i) => (
          <FAQItem 
            key={i} 
            question={faq.q} 
            answer={getEnrichedAnswer(faq.q, faq.a)} 
          />
        ))}
      </div>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  key?: React.Key;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden glass-panel">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-lg text-zinc-900 dark:text-white">{question}</span>
        {isOpen ? <Minus className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-line">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

