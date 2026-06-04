import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Search, Globe, Plane, Anchor, Edit2, Trash2, Plus, X, Percent, Clock, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../components/common/AuthProvider';

interface Rate {
  id: string;
  country: string;
  type: 'Air' | 'Sea';
  freightRate: string;
  proxyFee: string;
  transitTime: string;
  remarks?: string;
  updatedAt?: any;
  updatedBy?: string;
}

export default function RateManager() {
  const { profile } = useAuth();
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [country, setCountry] = useState('');
  const [type, setType] = useState<'Air' | 'Sea'>('Air');
  const [freightRate, setFreightRate] = useState('');
  const [proxyFee, setProxyFee] = useState('');
  const [transitTime, setTransitTime] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fetch rates
  useEffect(() => {
    const q = query(collection(db, 'rates'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Rate[];
      // Sort: country alphabetically, then type
      const sorted = docs.sort((a, b) => {
        const countryCompare = a.country.localeCompare(b.country);
        if (countryCompare !== 0) return countryCompare;
        return a.type.localeCompare(b.type);
      });
      setRates(sorted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !freightRate || !proxyFee || !transitTime) {
      alert('모든 필수 정보를 입력해 주세요.');
      return;
    }

    try {
      const data = {
        country: country.trim(),
        type,
        freightRate: freightRate.trim(),
        proxyFee: proxyFee.trim(),
        transitTime: transitTime.trim(),
        remarks: remarks.trim(),
        updatedAt: serverTimestamp(),
        updatedBy: profile?.displayName || 'Admin'
      };

      if (editingId) {
        // Mode update
        await updateDoc(doc(db, 'rates', editingId), data);
        setEditingId(null);
      } else {
        // Check if unique country + type already exists for clean records
        const exists = rates.find(r => r.country.toLowerCase() === country.trim().toLowerCase() && r.type === type);
        if (exists) {
          if (confirm(`이미 ${country} - ${type === 'Air' ? '항공(Air)' : '해상(Sea)'} 요율이 설정되어 있습니다. 해당 요율로 덮어씌우시겠습니까?`)) {
            await updateDoc(doc(db, 'rates', exists.id), data);
          } else {
            return;
          }
        } else {
          await addDoc(collection(db, 'rates'), data);
        }
      }

      // Reset form variables
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error saving rate:', err);
      alert('요율 저장 중 요류가 발생했습니다.');
    }
  };

  const handleEditInit = (rate: Rate) => {
    setEditingId(rate.id);
    setCountry(rate.country);
    setType(rate.type);
    setFreightRate(rate.freightRate);
    setProxyFee(rate.proxyFee);
    setTransitTime(rate.transitTime);
    setRemarks(rate.remarks || '');
    setShowAddForm(true);
  };

  const handleDelete = async (id: string, country: string, type: string) => {
    if (!confirm(`정말로 ${country} [${type === 'Air' ? '항공(Air)' : '해상(Sea)'}] 요율을 삭제하시겠습니까?`)) return;
    try {
      await deleteDoc(doc(db, 'rates', id));
    } catch (err) {
      console.error('Error deleting rate:', err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCountry('');
    setType('Air');
    setFreightRate('');
    setProxyFee('');
    setTransitTime('');
    setRemarks('');
  };

  const filteredRates = rates.filter(r => 
    r.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.freightRate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.remarks && r.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="국가 또는 요율 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-zinc-600"
          />
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-600/10"
        >
          <Plus size={16} />
          새로운 요율 설정 등록
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Rate Settings Table */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="glass-panel p-20 text-center rounded-3xl border-dashed border-white/5 text-zinc-500 flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-blue-500" size={18} />
              분석 및 처리 데이터를 수신하는 중...
            </div>
          ) : filteredRates.length === 0 ? (
            <div className="glass-panel p-20 text-center rounded-3xl border-dashed border-white/5 text-zinc-600">
              {searchTerm ? '검색된 요율 설정 내역이 없습니다.' : '등록된 국가별 운송/구매 요율 프로필이 없습니다.'}
            </div>
          ) : (
            filteredRates.map((rate) => (
              <motion.div
                layout
                key={rate.id}
                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all bg-zinc-900/10 hover:bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    rate.type === 'Air' ? "bg-cyan-500/10 text-cyan-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {rate.type === 'Air' ? <Plane size={22} /> : <Anchor size={22} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-display font-bold text-lg text-white">{rate.country}</span>
                      <span className={cn(
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border tracking-wider",
                        rate.type === 'Air' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      )}>
                        {rate.type === 'Air' ? '항공 (Air)' : '해상 (Sea)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-xs text-zinc-400 mt-3 font-medium">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                        <span>기본 운임: <strong className="text-white">{rate.freightRate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-zinc-500" />
                        <span>구매대행 수수료: <strong className="text-white">{rate.proxyFee}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>운송 소요 기간: <strong className="text-white">{rate.transitTime}</strong></span>
                      </div>
                    </div>

                    {rate.remarks && (
                      <p className="text-[11px] text-zinc-500 mt-3 border-t border-white/5 pt-2 italic leading-relaxed">
                        * 비고: {rate.remarks}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleEditInit(rate)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    title="수정하기"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(rate.id, rate.country, rate.type)}
                    className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
                    title="삭제하기"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Edit & Create Slide Right Panel Side-widget style */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {showAddForm ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-panel p-6 rounded-2xl border border-white/10 bg-zinc-950/40 relative"
              >
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>

                <h3 className="text-md font-bold mb-6 flex items-center gap-2 text-white">
                  <Globe className="text-blue-500" size={16} />
                  {editingId ? "요율 구성 수정" : "신규 요율 국가 프로필 생성"}
                </h3>

                <form onSubmit={handleAddOrUpdate} className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 font-bold block mb-1.5 uppercase tracking-widest">대상 국가 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 중국 (China), 미국 (USA)"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-bold block mb-1.5 uppercase tracking-widest">운송 형태 *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setType('Air')}
                        className={cn(
                          "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                          type === 'Air' ? "bg-cyan-600/10 border-cyan-500 text-cyan-400" : "bg-black/20 border-white/5 text-zinc-400 hover:border-white/10"
                        )}
                      >
                        <Plane size={14} />
                        항공 (Air)
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('Sea')}
                        className={cn(
                          "flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                          type === 'Sea' ? "bg-blue-600/10 border-blue-500 text-blue-400" : "bg-black/20 border-white/5 text-zinc-400 hover:border-white/10"
                        )}
                      >
                        <Anchor size={14} />
                        해상 (Sea)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-bold block mb-1.5 uppercase tracking-widest">운임 요율 설명 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 1kg당 $12 또는 CBM당 $110"
                      value={freightRate}
                      onChange={(e) => setFreightRate(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-bold block mb-1.5 uppercase tracking-widest">구매대행 수수료율 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 상품 금액의 5% 또는 건당 5,000원"
                      value={proxyFee}
                      onChange={(e) => setProxyFee(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-bold block mb-1.5 uppercase tracking-widest">평균 운송 소요 기간 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 영업일 기준 3 ~ 5일"
                      value={transitTime}
                      onChange={(e) => setTransitTime(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 font-bold block mb-1.5 uppercase tracking-widest">기타 참고사항 (선택사항)</label>
                    <textarea
                      placeholder="중량별 차등 단가, 부피 무게 기준, 서류 통관 수수료 등 포함"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full h-24 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      className="flex-grow py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      {editingId ? "프로필 업데이트" : "설정 등록 완료"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        resetForm();
                      }}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-zinc-950/20 text-center text-zinc-400 space-y-4">
                <AlertCircle className="w-10 h-10 text-blue-500/60 mx-auto" />
                <h4 className="font-bold text-sm text-white">요율 및 소요 기간 기반 FAQ 서비스 자동화</h4>
                <p className="text-xs leading-relaxed text-zinc-500">
                  각 나라별/구간별 배송 요금과 구매대행 수수료, 운송 기한 등을 실시간 데이터로 등록하면 AI 가이드 비서 서비스에 실시간 편입됩니다.
                </p>
                <div className="bg-white/5 p-3 rounded-xl text-left border border-white/5">
                  <p className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">// DYNAMIC_KNOWLEDGE_LINKED</p>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    AI 챗봇 질문 시, 등록된 운임 테이블 자료를 컨텍스트 리소스로 활용하여 오차 없는 정확한 자동 견적/안내를 지원할 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
