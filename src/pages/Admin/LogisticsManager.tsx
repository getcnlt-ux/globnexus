import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, addDoc, serverTimestamp, arrayUnion } from '../../lib/dbWrapper';
import { Search, MapPin, Truck, Save, X, Edit2, Plus, Package } from 'lucide-react';
import { cn } from '../../lib/utils';

const STEPS = [
  'ordered', 'preparing', 'warehouse', 'export', 'shipping', 'import', 'local', 'delivered'
];

export default function LogisticsManager() {
  const { t } = useTranslation();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New shipment form state
  const [newShipment, setNewShipment] = useState({
    trackingNumber: '',
    customerName: '',
    currentStep: 'ordered',
    desc: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'shipments'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShipments(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, currentShipment: any, newStatus: string) => {
    if (currentShipment.currentStep === newStatus) {
      setEditingId(null);
      return;
    }

    try {
      await updateDoc(doc(db, 'shipments', id), {
        currentStep: newStatus,
        updatedAt: serverTimestamp(),
        history: arrayUnion({
          status: newStatus,
          time: new Date(), // Using new Date() for immediate sync in arrayUnion, though serverTimestamp is better usually
          location: 'Managed Node',
          desc: t(`agent.tracking.statusLabels.${newStatus}`)
        })
      });
      setEditingId(null);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipment.trackingNumber) return;

    try {
      const now = new Date();
      await addDoc(collection(db, 'shipments'), {
        ...newShipment,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        history: [{
          status: newShipment.currentStep,
          time: now,
          location: 'System Intake',
          desc: t(`agent.tracking.statusLabels.${newShipment.currentStep}`)
        }]
      });
      setShowAddForm(false);
      setNewShipment({ trackingNumber: '', customerName: '', currentStep: 'ordered', desc: '' });
    } catch (err) {
      console.error('Error adding shipment:', err);
    }
  };

  const filteredShipments = shipments.filter(s => 
    s.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder={t('agent.tracking.inputPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all"
        >
          <Plus size={18} />
          {t('agent.tracking.admin.updateStatus')}
        </button>
      </div>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl border-blue-500/30 bg-blue-500/5 mb-8"
        >
          <form onSubmit={handleAddShipment} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">Tracking No.</label>
              <input 
                required
                value={newShipment.trackingNumber}
                onChange={e => setNewShipment({...newShipment, trackingNumber: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                placeholder="GB-XXXX-XXXX"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">Customer</label>
              <input 
                value={newShipment.customerName}
                onChange={e => setNewShipment({...newShipment, customerName: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                placeholder="Name/Company"
              />
            </div>
            <div className="md:col-span-1">
              <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">Status</label>
              <select 
                value={newShipment.currentStep}
                onChange={e => setNewShipment({...newShipment, currentStep: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
              >
                {STEPS.map(s => (
                  <option key={s} value={s}>{t(`agent.tracking.statusLabels.${s}`)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="flex-grow bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="p-2 bg-zinc-800 text-zinc-400 rounded-lg"><X size={20} /></button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="glass-panel rounded-3xl border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase">{t('agent.tracking.admin.trackingNumber')}</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase">{t('agent.tracking.admin.customer')}</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase">{t('agent.tracking.admin.lastStep')}</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase text-right">{t('agent.tracking.admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-zinc-600">Loading...</td></tr>
              ) : filteredShipments.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-zinc-600">No shipments found.</td></tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Package size={14} />
                        </div>
                        <span className="font-mono text-sm font-bold text-white">{shipment.trackingNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {shipment.customerName || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === shipment.id ? (
                        <select 
                          className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold focus:border-blue-500"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          {STEPS.map(s => (
                            <option key={s} value={s}>{t(`agent.tracking.statusLabels.${s}`)}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          shipment.currentStep === 'delivered' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                          {t(`agent.tracking.statusLabels.${shipment.currentStep}`)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === shipment.id ? (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(shipment.id, shipment, editStatus)}
                              className="p-2 bg-blue-600 text-white rounded-lg"
                            >
                              <Save size={14} />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="p-2 bg-zinc-800 text-zinc-400 rounded-lg"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingId(shipment.id);
                              setEditStatus(shipment.currentStep);
                            }}
                            className="p-2 bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-lg transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
