import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Copy, 
  Share2,
  DollarSign,
  Shield,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

export default function AgentDashboard() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const sampleReferralLink = `${window.location.origin}?ref=NEXIS-PARTNER`;

  const copyLink = () => {
    navigator.clipboard.writeText(sampleReferralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const partnerBenefits = [
    {
      title: '업계 최고 수준 리워드',
      desc: '의뢰 건당 확정 수수료 지급 및 정기 정산 프로세스 지원',
      icon: DollarSign,
      color: 'text-emerald-400'
    },
    {
      title: '투명한 실시간 트래킹',
      desc: '전담 어카운트 매니저 배정 및 진행 상태 핫라인 소통',
      icon: TrendingUp,
      color: 'text-blue-400'
    },
    {
      title: '신뢰할 수 있는 물류 인프라',
      desc: '광저우/웨이하이/오레곤 직영 물류센터 및 원스톱 통관',
      icon: Shield,
      color: 'text-purple-400'
    },
    {
      title: '간편한 추천 링크 연동',
      desc: '개별 고유 추천 코드를 통한 유입 및 전환 자동 트래킹',
      icon: Share2,
      color: 'text-cyan-400'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="text-blue-500 font-mono text-xs font-black tracking-widest uppercase mb-4 block">
              // PARTNER_PROGRAM
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold">글로벌 파트너스 & 에이전트</h1>
            <p className="text-zinc-400 mt-4 max-w-xl text-[15px] font-medium leading-relaxed">
              글로벌 넥시스와 함께 성장할 무역, 이커머스, 소싱 전문 파트너를 모십니다. 
              최첨단 물류 인프라와 구매 대행 서비스를 파트너 고객사에 매끄럽게 연결하세요.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border-white/10 w-full md:w-auto min-w-[350px]">
            <p className="text-xs text-zinc-400 uppercase font-mono tracking-widest mb-3 font-bold">파트너 추천 코드 예시</p>
            <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-2 rounded-xl">
              <span className="text-xs font-mono text-zinc-400 truncate flex-grow pl-2">{sampleReferralLink}</span>
              <button 
                onClick={copyLink}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  copied ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-500"
                )}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? t('agent.copied') : t('agent.copy')}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mt-3 text-center font-medium">파트너 제휴 승인 시 맞춤 코드가 발급됩니다.</p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {partnerBenefits.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-8 rounded-2xl border-white/5 space-y-4 hover:border-white/20 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <b.icon size={22} className={b.color} />
              </div>
              <h3 className="font-bold text-lg text-white">{b.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Join CTA */}
        <div className="glass-panel p-10 md:p-14 rounded-3xl border-blue-500/20 bg-blue-600/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">파트너십 제휴 신청하기</h2>
            <p className="text-zinc-400 text-sm max-w-lg leading-relaxed font-medium">
              기업 고객, 셀러, 포워더 등 물류와 구매대행 시너지가 필요한 모든 비즈니스 파트너의 문의를 환영합니다.
            </p>
          </div>
          <Link
            to="/contact"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-sm transition-all flex items-center gap-2 shrink-0 shadow-lg"
          >
            제휴 담당자에게 문의하기 <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
