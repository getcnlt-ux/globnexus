import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { ConsultationData, ConsultationStatus } from '../../types';
import { useAuth } from '../../components/common/AuthProvider';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Package,
  ShoppingCart,
  ShieldCheck,
  Cpu,
  Factory,
  Lock,
  MessageCircle, 
  Share2,
  Trash2,
  Globe
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminChatList from './AdminChatList';
import UserManager from './UserManager';
import LogisticsManager from './LogisticsManager';
import RateManager from './RateManager';
import { Users } from 'lucide-react';

const statusConfig: Record<ConsultationStatus, { label: string, color: string, icon: any }> = {
  received: { label: '접수', color: 'bg-zinc-500', icon: Clock },
  reviewing: { label: '검토 중', color: 'bg-blue-500', icon: Search },
  consulting: { label: '상담 중', color: 'bg-purple-500', icon: Filter },
  quoting: { label: '견적 발송', color: 'bg-yellow-500', icon: ExternalLink },
  processing: { label: '진행 중', color: 'bg-orange-500', icon: AlertCircle },
  completed: { label: '완료', color: 'bg-green-500', icon: CheckCircle2 },
};

const serviceIcon: Record<string, any> = {
  logistics: Truck,
  buying: ShoppingCart,
  kr_cert: ShieldCheck,
  cn_cert: Cpu,
  manufacturing: Factory,
};

export default function Admin() {
  const { profile, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState<ConsultationStatus | 'all'>('all');
  const [view, setView] = useState<'consultations' | 'chats' | 'users' | 'logistics' | 'rates'>('consultations');

  useEffect(() => {
    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') return;

    const q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(docs);
    });

    return () => unsubscribe();
  }, [profile]);

  const updateStatus = async (id: string, newStatus: ConsultationStatus) => {
    try {
      await updateDoc(doc(db, 'consultations', id), { status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const deleteConsultation = async (id: string) => {
    if (profile?.role !== 'super_admin') {
      alert('최고 관리자만 문의 내역을 삭제할 수 있습니다.');
      return;
    }

    if (!confirm('정말로 이 문의 내역을 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'consultations', id));
    } catch (err) {
      console.error('Error deleting consultation:', err);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono">AUTHENTICATING...</div>;

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <Lock className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-display font-bold mb-4">Access Denied</h1>
        <p className="text-zinc-500 max-w-md">This area is reserved for system administrators. Please log in with an administrator account to continue.</p>
      </div>
    );
  }

  const filteredData = filter === 'all' ? data : data.filter(item => item.status === filter);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex-grow">
            <span className="text-blue-500 font-mono text-xs font-black tracking-widest uppercase mb-4 block">// ADMIN_CONTROL_PANEL</span>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-display font-bold">운영 관리 시스템</h1>
              {profile?.role === 'super_admin' && (
                <span className="bg-red-500/10 text-red-500 text-[10px] font-mono px-3 py-1 rounded-full border border-red-500/20 font-bold uppercase tracking-widest">
                  Super Admin
                </span>
              )}
            </div>
            
            {/* View Toggle */}
            <div className="flex flex-wrap gap-4 mt-8">
              <button 
                onClick={() => setView('consultations')}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border",
                  view === 'consultations' ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-400"
                )}
              >
                <Truck size={18} />
                서비스 신청 관리
              </button>
              <button 
                onClick={() => setView('logistics')}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border",
                  view === 'logistics' ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-400"
                )}
              >
                <Package size={18} />
                물류 배송 체인 관리
              </button>
              <button 
                onClick={() => setView('chats')}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border",
                  view === 'chats' ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-400"
                )}
              >
                <MessageCircle size={18} />
                실시간 채팅 관리
              </button>
              <button 
                onClick={() => setView('rates')}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border",
                  view === 'rates' ? "bg-blue-600 border-blue-600 text-white" : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-400"
                )}
              >
                <Globe size={18} />
                포워딩 / 구매대행 요율 관리
              </button>
              {profile?.role === 'super_admin' && (
                <button 
                  onClick={() => setView('users')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border",
                    view === 'users' ? "bg-red-600 border-red-600 text-white" : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-400"
                  )}
                >
                  <Users size={18} />
                  사용자 권한 관리
                </button>
              )}
            </div>
          </div>
          
          {view === 'consultations' && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all border", filter === 'all' ? "bg-blue-600 border-blue-600" : "bg-white/5 border-white/10 hover:border-white/20")}
              >
                전체
              </button>
              {(Object.keys(statusConfig) as ConsultationStatus[]).map(s => (
                <button 
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                    filter === s ? "bg-blue-600 border-blue-600" : "bg-white/5 border-white/10 hover:border-white/20"
                  )}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {view === 'consultations' ? (
          <div className="space-y-4">
            {/* ... rest of consultation list logic remains the same ... */}
            {filteredData.length === 0 ? (
              <div className="glass-panel p-20 text-center rounded-3xl border-dashed border-white/5 text-zinc-600">
                접수된 문의 내역이 없습니다.
              </div>
            ) : (
              filteredData.map((item) => (
                <motion.div 
                  layout
                  key={item.id}
                  className="glass-panel p-6 rounded-2xl border-white/5 hover:border-white/10 transition-all grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                >
                  <div className="lg:col-span-2">
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">ID: {item.id}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        {serviceIcon[item.serviceType] && React.createElement(serviceIcon[item.serviceType], { size: 20 })}
                      </div>
                      <span className="font-bold text-sm uppercase">{item.serviceType}</span>
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    <h3 className="font-bold mb-1">{item.userInfo.name}</h3>
                    <p className="text-xs text-zinc-500">{item.userInfo.companyName || '개인'} | {item.userInfo.phone}</p>
                    {item.referredBy && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Share2 size={10} className="text-blue-500" />
                        <span className="text-[10px] text-blue-500 font-mono font-bold">REFERRAL: {item.referredBy}</span>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-3 overflow-hidden">
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-widest">DETAILS</span>
                    <p className="text-xs text-zinc-400 truncate">
                      {Object.entries(item).map(([key, val]) => {
                        if (['id', 'userInfo', 'serviceType', 'consultationMethod', 'status', 'createdAt'].includes(key)) return null;
                        return `${key}: ${val}, `;
                      })}
                    </p>
                  </div>

                  <div className="lg:col-span-2">
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold text-white", statusConfig[item.status].color)}>
                      {React.createElement(statusConfig[item.status].icon, { size: 12 })}
                      {statusConfig[item.status].label}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-end gap-2">
                    <select 
                      className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none focus:border-blue-500"
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value as ConsultationStatus)}
                    >
                      {(Object.keys(statusConfig) as ConsultationStatus[]).map(s => (
                        <option key={s} value={s}>{statusConfig[s].label}</option>
                      ))}
                    </select>
                    {profile?.role === 'super_admin' && (
                      <button 
                        onClick={() => deleteConsultation(item.id)}
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : view === 'chats' ? (
          <AdminChatList />
        ) : view === 'logistics' ? (
          <LogisticsManager />
        ) : view === 'rates' ? (
          <RateManager />
        ) : (
          <UserManager />
        )}
      </div>
    </div>
  );
}
