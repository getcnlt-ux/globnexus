import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Search,
  Filter,
  Share2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../components/common/AuthProvider';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

export default function AgentDashboard() {
  const { profile } = useAuth();
  const { t, i18n } = useTranslation();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile?.referralCode) return;

    // 내가 추천한(referredBy) 문의 내역만 필터링하여 가져옴
    const q = query(
      collection(db, 'consultations'),
      where('referredBy', '==', profile.referralCode),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReferrals(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching referrals:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.referralCode]);

  const referralLink = profile ? `${window.location.origin}?ref=${profile.referralCode}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'received').length,
    completed: referrals.filter(r => r.status === 'completed').length,
    inProgress: referrals.filter(r => r.status === 'consulting').length
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono">
        LOADING PROFILE...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <span className="text-blue-500 font-mono text-xs font-black tracking-widest uppercase mb-4 block">
              // AGENT_DASHBOARD
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{t('agent.dashboard')}</h1>
            <p className="text-zinc-400 mt-4 max-w-xl text-[14px] font-bold leading-[22px]">
              {t('agent.desc')}
            </p>
          </div>
 
          <div className="glass-panel p-6 rounded-3xl border-white/10 w-full md:w-auto min-w-[350px]">
            <p className="text-xs text-zinc-400 uppercase font-mono tracking-widest mb-3 font-bold">{t('agent.myPromoLink')}</p>
            <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-2 rounded-xl">
              <span className="text-xs font-mono text-zinc-400 truncate flex-grow pl-2">{referralLink}</span>
              <button 
                onClick={copyLink}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  copied ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-500"
                )}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? t('agent.copied') : t('agent.copy')}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mt-3 text-center font-medium">{t('agent.linkDesc')}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: t('agent.stats.total'), value: stats.total, icon: TrendingUp, color: 'text-white' },
            { label: t('agent.stats.pending'), value: stats.pending, icon: Clock, color: 'text-zinc-400' },
            { label: t('agent.stats.inProgress'), value: stats.inProgress, icon: Share2, color: 'text-blue-400' },
            { label: t('agent.stats.completed'), value: stats.completed, icon: CheckCircle2, color: 'text-green-500' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-2xl border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                  <stat.icon size={18} />
                </div>
              </div>
              <p className="text-zinc-500 text-xs mb-1 font-bold">{stat.label}</p>
              <p className="text-3xl font-display font-bold">{stat.value}<span className="text-sm ml-1 text-zinc-500">{t('agent.stats.unit')}</span></p>
            </motion.div>
          ))}
        </div>

        {/* Referrals Table */}
        <div className="glass-panel rounded-3xl border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <Users size={18} className="text-blue-500" />
              {t('agent.referralHistory')}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-mono text-zinc-400 uppercase font-bold">{t('agent.table.date')}</th>
                  <th className="px-6 py-4 text-xs font-mono text-zinc-400 uppercase font-bold">{t('agent.table.customer')}</th>
                  <th className="px-6 py-4 text-xs font-mono text-zinc-400 uppercase font-bold">{t('agent.table.service')}</th>
                  <th className="px-6 py-4 text-xs font-mono text-zinc-400 uppercase font-bold">{t('agent.table.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-8 animate-pulse text-center text-zinc-700 text-xs">LOADING...</td>
                    </tr>
                  ))
                ) : referrals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-zinc-600 text-sm">
                      {t('agent.noData')}
                    </td>
                  </tr>
                ) : (
                  referrals.map((ref) => (
                    <tr key={ref.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-xs text-zinc-400">
                          {ref.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">{ref.userInfo.name}</p>
                        <p className="text-[10px] text-zinc-500">{ref.userInfo.companyName || (i18n.language === 'ko' ? '개인' : 'Individual')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-1 rounded inline-block font-mono uppercase">
                          {ref.serviceType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full",
                          ref.status === 'received' ? "bg-zinc-500/20 text-zinc-400" :
                          ref.status === 'consulting' ? "bg-blue-500/20 text-blue-400" :
                          ref.status === 'completed' ? "bg-green-500/20 text-green-500" :
                          "bg-red-500/20 text-red-400"
                        )}>
                          {ref.status === 'received' ? t('agent.status.received') :
                           ref.status === 'consulting' ? t('agent.status.consulting') :
                           ref.status === 'completed' ? t('agent.status.completed') : t('agent.status.cancelled')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
