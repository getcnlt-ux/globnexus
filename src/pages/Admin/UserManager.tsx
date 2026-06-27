import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Shield, 
  ShieldAlert, 
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Edit2,
  Truck
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc,
  where,
  getDocs,
  deleteDoc,
  addDoc,
  serverTimestamp
} from '../../lib/dbWrapper';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { useAuth } from '../../components/common/AuthProvider';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'super_admin';
  referralCode?: string;
  phone?: string;
}

export default function UserManager() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  
  const [shipmentTargetUser, setShipmentTargetUser] = useState<UserProfile | null>(null);
  const [newShipment, setNewShipment] = useState({
    trackingNumber: '',
    currentStep: 'ordered',
    desc: ''
  });

  const handleAddShipmentForUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentTargetUser || !newShipment.trackingNumber) return;

    try {
      setLoading(true);
      const now = new Date();
      const customerName = shipmentTargetUser.displayName || shipmentTargetUser.email;

      const stepLabels: Record<string, string> = {
        ordered: '주문접수',
        preparing: '배송준비중',
        warehouse: '창고입고',
        export: '수출통관',
        shipping: '해상/항공운송',
        import: '수입통관',
        local: '국내배송',
        delivered: '배송완료'
      };
      
      const statusDesc = newShipment.desc || `${stepLabels[newShipment.currentStep]} 단계 완료`;

      await addDoc(collection(db, 'shipments'), {
        trackingNumber: newShipment.trackingNumber.trim(),
        customerName: customerName,
        customerEmail: shipmentTargetUser.email,
        customerUid: shipmentTargetUser.uid,
        currentStep: newShipment.currentStep,
        desc: statusDesc,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        history: [{
          status: newShipment.currentStep,
          time: now,
          location: 'System Intake',
          desc: statusDesc
        }]
      });

      setSuccessMessage(`'${customerName}' 회원님의 송장(${newShipment.trackingNumber}) 등록이 완료되었습니다.`);
      setShipmentTargetUser(null);
      setNewShipment({ trackingNumber: '', currentStep: 'ordered', desc: '' });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding shipment for user:', err);
      alert('송장 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    if (profile?.role !== 'super_admin') {
      alert('최고 관리자만 회원을 삭제할 수 있습니다.');
      return;
    }

    if (email === 'getcnlt@gmail.com') {
      alert('메인 관리자는 삭제할 수 없습니다.');
      return;
    }

    if (!confirm(`정말로 '${email}' 사용자를 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.`)) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'users', userId));
      setSuccessMessage('사용자가 삭제되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', editingUser.uid);
      await updateDoc(userRef, {
        displayName: editingUser.displayName,
        email: editingUser.email,
        phone: editingUser.phone || ''
      });
      setSuccessMessage('사용자 정보가 성공적으로 수정되었습니다.');
      setEditingUser(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating user info:', error);
      alert('정보 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic real-time fetch for recent users
    const q = query(collection(db, 'users'), where('role', 'in', ['user', 'admin', 'super_admin']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      setUsers(docs);
    });

    return () => unsubscribe();
  }, []);

  const toggleAdminRole = async (userId: string, currentRole: string, email: string) => {
    if (profile?.role !== 'super_admin') {
      alert('최고 관리자만 권한을 변경할 수 있습니다.');
      return;
    }

    if (email === 'getcnlt@gmail.com') {
      alert('메인 관리자의 권한은 변경할 수 없습니다.');
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setSuccessMessage(`'${email}' 사용자의 권한이 '${newRole}'로 변경되었습니다.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating role:', error);
      alert('권한 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
        <div className="flex-grow max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="이메일 또는 이름으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-blue-500 outline-none transition-colors"
          />
        </div>
        <div className="hidden md:block text-right">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Status</p>
          <p className="text-sm font-bold text-blue-500">Super Admin Access</p>
        </div>
      </div>

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-green-500/10 text-green-500 p-4 rounded-xl border border-green-500/20 text-sm"
        >
          <CheckCircle2 size={16} />
          {successMessage}
        </motion.div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel p-8 rounded-3xl border-white/10"
          >
            <h3 className="text-xl font-bold mb-6">사용자 정보 수전</h3>
            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">이름</label>
                <input 
                  type="text"
                  value={editingUser.displayName}
                  onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">이메일</label>
                <input 
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">전화번호</label>
                <input 
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                  placeholder="010-0000-0000"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-grow py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-grow py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-lg"
                >
                  저장하기
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {shipmentTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10"
          >
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Truck size={20} />
              <span className="text-xs uppercase font-mono tracking-widest font-black">// REGISTER_SHIPMENT</span>
            </div>
            <h3 className="text-xl font-bold mb-1">배송 송장 및 현황 등록</h3>
            <p className="text-xs text-zinc-500 mb-6 font-medium">
              대상 회원: <span className="font-bold text-white">{shipmentTargetUser.displayName || shipmentTargetUser.email}</span> ({shipmentTargetUser.email})
            </p>
            
            <form onSubmit={handleAddShipmentForUser} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">송장 번호 (Tracking Number)</label>
                <input 
                  type="text"
                  required
                  placeholder="예: GB-12345-6789"
                  value={newShipment.trackingNumber}
                  onChange={(e) => setNewShipment({...newShipment, trackingNumber: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">현재 배송 상태</label>
                <select 
                  value={newShipment.currentStep}
                  onChange={(e) => setNewShipment({...newShipment, currentStep: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white font-bold"
                >
                  <option value="ordered">주문접수 (Ordered)</option>
                  <option value="preparing">배송준비중 (Preparing)</option>
                  <option value="warehouse">창고입고 (Warehouse)</option>
                  <option value="export">수출통관 (Export)</option>
                  <option value="shipping">해상/항공운송 (Shipping)</option>
                  <option value="import">수입통관 (Import)</option>
                  <option value="local">국내배송 (Local Courier)</option>
                  <option value="delivered">배송완료 (Delivered)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">추가 설명 (생략 가능)</label>
                <input 
                  type="text"
                  placeholder="예: 물류센터에 입고되어 분류 작업 진행 중입니다."
                  value={newShipment.desc}
                  onChange={(e) => setNewShipment({...newShipment, desc: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShipmentTargetUser(null);
                    setNewShipment({ trackingNumber: '', currentStep: 'ordered', desc: '' });
                  }}
                  className="flex-grow py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-grow py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? '저장 중...' : '송장 등록'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="glass-panel p-20 text-center rounded-3xl border-dashed border-white/5 text-zinc-600">
            사용자를 찾을 수 없습니다.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div 
              key={user.uid}
              className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4 flex-grow">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  user.role === 'super_admin' ? "bg-red-500/10 text-red-500" :
                  user.role === 'admin' ? "bg-blue-500/10 text-blue-500" :
                  "bg-zinc-500/10 text-zinc-500"
                )}>
                  {user.role === 'super_admin' ? <ShieldAlert size={24} /> :
                   user.role === 'admin' ? <Shield size={24} /> :
                   <User size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{user.displayName}</h3>
                    <span className={cn(
                      "text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border",
                      user.role === 'super_admin' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                      user.role === 'admin' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                      "bg-white/5 border-white/10 text-zinc-500"
                    )}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase">Code: {user.referralCode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShipmentTargetUser(user)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:text-white hover:bg-blue-600 transition-all font-bold text-xs"
                  title="배송 송장 등록"
                >
                  <Truck size={14} />
                  <span>배송 등록</span>
                </button>

                <button
                  onClick={() => setEditingUser(user)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                  title="정보 수정"
                >
                  <Edit2 size={16} />
                </button>
                
                {profile?.role === 'super_admin' && user.role !== 'super_admin' && (
                  <button
                    onClick={() => deleteUser(user.uid, user.email)}
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                    title="회원 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {user.role !== 'super_admin' && (
                  <button
                    disabled={loading || profile?.role !== 'super_admin'}
                    onClick={() => toggleAdminRole(user.uid, user.role, user.email)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      user.role === 'admin' 
                        ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" 
                        : "bg-blue-600 border-blue-600 text-white hover:bg-blue-500"
                    )}
                  >
                    {user.role === 'admin' ? '부관리자 권한 해제' : '부관리자로 임명'}
                  </button>
                )}
                {user.role === 'super_admin' && (
                  <div className="flex items-center gap-2 text-zinc-500 text-xs px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <AlertTriangle size={12} />
                    시스템 최고 관리자
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
