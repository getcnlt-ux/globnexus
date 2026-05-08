import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Search, Package, MapPin, Clock, CheckCircle2, Truck, Ship, Globe, ChevronRight, List } from 'lucide-react';
import { useAuth } from '../../components/common/AuthProvider';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { auth } from '../../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface TrackingEvent {
  time: string;
  location: string;
  status: string;
  desc: string;
}

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

export default function TrackingPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [myShipments, setMyShipments] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    
    // In a real app, you'd filter by user ID. 
    // Here we'll search by customer name matching the profile name or email temporarily
    const fetchMyShipments = async () => {
      try {
        const q = query(
          collection(db, 'shipments'), 
          where('customerName', '>=', profile.displayName || profile.email),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setMyShipments(docs.map(d => ({
          number: d.trackingNumber,
          status: d.currentStep,
          lastUpdate: d.updatedAt?.toDate ? format(d.updatedAt.toDate(), 'yyyy-MM-dd HH:mm') : 'Recently'
        })));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'shipments');
      }
    };
    fetchMyShipments();
  }, [profile]);

  const handleSearch = async (e?: React.FormEvent, manualNumber?: string) => {
    if (e) e.preventDefault();
    const num = manualNumber || trackingNumber;
    if (!num.trim()) return;

    setLoading(true);
    setTrackingNumber(num);
    
    try {
      const q = query(collection(db, 'shipments'), where('trackingNumber', '==', num), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        const updatedAt = data.updatedAt?.toDate ? format(data.updatedAt.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'Recently';
        
        let events = [];
        if (data.history && Array.isArray(data.history)) {
          // Use real history stored in DB
          events = [...data.history].reverse().map((h: any) => ({
            time: h.time?.toDate ? format(h.time.toDate(), 'yyyy-MM-dd HH:mm:ss') : h.time,
            location: h.location || 'Logistics Center',
            status: h.status,
            desc: h.desc || t(`agent.tracking.statusLabels.${h.status}`)
          }));
        } else {
          // Fallback: Generate history based on current step
          const currentIdx = STEPS.findIndex(s => s.id === data.currentStep);
          events = STEPS.slice(0, currentIdx + 1).reverse().map((step, i) => ({
            time: i === 0 ? updatedAt : format(new Date(Date.now() - (i * 1.5) * 86400000), 'yyyy-MM-dd HH:mm:ss'),
            location: 'System Hub',
            status: step.id,
            desc: t(`agent.tracking.statusLabels.${step.id}`)
          }));
        }

        setResult({
          number: num,
          currentStep: data.currentStep,
          lastUpdate: updatedAt,
          events: events
        });
      } else if (num.startsWith('DEMO-')) {
        // DEMO MOCK DATA FALLBACK
        const isComplete = num.includes('COMPLETE');
        const demoStatus = isComplete ? 'delivered' : 'shipping';
        const demoTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        
        const currentIdx = STEPS.findIndex(s => s.id === demoStatus);
        const events = STEPS.slice(0, currentIdx + 1).reverse().map((step, i) => ({
          time: format(new Date(Date.now() - (i * 2) * 86400000), 'yyyy-MM-dd HH:mm:ss'),
          location: i === 0 && !isComplete ? '국제 터미널 (International Terminal)' : 'Region Distribution Center',
          status: step.id,
          desc: `[DEMO] ${t(`agent.tracking.statusLabels.${step.id}`)}`
        }));

        setResult({
          number: num,
          currentStep: demoStatus,
          lastUpdate: demoTime,
          events: events
        });
      } else {
        setResult(null);
        alert('Tracking number not found. Try "DEMO-12345" for testing.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'shipments');
    } finally {
      setLoading(false);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === result?.currentStep);

  return (
    <div className="flex-grow pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-blue-500 font-mono text-xs font-black tracking-widest uppercase mb-4 block">
              // LOGISTICS_TRACKING
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t('agent.tracking.title')}</h1>
            <p className="text-zinc-400 max-w-xl mx-auto">{t('agent.tracking.desc')}</p>
          </motion.div>
        </div>

        <motion.form 
          onSubmit={handleSearch}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-12"
        >
          <div className="glass-panel p-2 rounded-2xl border-white/10 flex items-center gap-4 bg-white/5 pr-4">
            <div className="flex-grow flex items-center pl-4 gap-3">
              <Search className="text-zinc-500 shrink-0" size={20} />
              <input 
                type="text" 
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={t('agent.tracking.inputPlaceholder')}
                className="w-full bg-transparent border-none text-white focus:ring-0 placeholder:text-zinc-600 font-bold py-3"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : t('agent.tracking.search')}
            </button>
          </div>
        </motion.form>

        {profile && myShipments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <List size={20} className="text-blue-500" />
              <h2 className="text-xl font-bold">{t('agent.tracking.myShipments')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myShipments.map((shipment) => (
                <button
                  key={shipment.number}
                  onClick={() => handleSearch(undefined, shipment.number)}
                  className="glass-panel p-5 rounded-2xl border-white/5 bg-white/5 hover:border-blue-500/30 transition-all text-left group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded">
                      {shipment.number}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      shipment.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {t(`agent.tracking.statusLabels.${shipment.status}`)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock size={12} />
                      <span className="text-[10px]">{shipment.lastUpdate}</span>
                    </div>
                    <div className="text-blue-500 text-[10px] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {t('agent.tracking.viewDetails')}
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
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
                            animate={{ width: idx < currentStepIndex ? '100%' : idx === currentStepIndex ? '0%' : '0%' }}
                            className="h-full bg-blue-500"
                          />
                        </div>
                      )}
                      
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                        ${isActive ? 'bg-blue-500/20 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}
                        ${isCurrent ? 'animate-pulse' : ''}
                      `}>
                        <Icon size={18} />
                      </div>
                      <span className={`text-[9px] mt-3 font-bold uppercase tracking-wider text-center max-w-[80px] ${isActive ? 'text-blue-500' : 'text-zinc-600'}`}>
                        {t(`agent.tracking.statusLabels.${step.id}`)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center border-t border-white/5 pt-8">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-mono mb-1">{t('agent.tracking.currentStep')}</p>
                  <p className="font-bold text-white uppercase">{t(`agent.tracking.statusLabels.${result.currentStep}`)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Tracking Number</p>
                  <p className="font-bold text-white font-mono">{result.number}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-mono mb-1">{t('agent.tracking.lastUpdate')}</p>
                  <p className="font-bold text-white">{result.lastUpdate}</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="glass-panel overflow-hidden rounded-3xl border-white/10">
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <Clock size={18} className="text-blue-500" />
                  {t('agent.tracking.details')}
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                  {result.events.map((event: any, i: number) => (
                    <div key={i} className="relative pl-10 flex gap-6">
                      <div className={`
                        absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-2 bg-zinc-950 flex items-center justify-center z-10
                        ${i === 0 ? 'border-blue-500 text-blue-500' : 'border-zinc-800 text-zinc-600'}
                      `}>
                        {i === 0 ? <Truck size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-bold ${i === 0 ? 'text-white' : 'text-zinc-400'}`}>
                            {t(`agent.tracking.statusLabels.${event.status}`)}
                          </p>
                          <span className="text-[10px] font-mono text-zinc-500">{event.time}</span>
                        </div>
                        <p className="text-zinc-500 text-sm mb-1">{event.desc}</p>
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
