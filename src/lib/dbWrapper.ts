import { 
  collection as firestoreCollection,
  doc as firestoreDoc,
  getDoc as firestoreGetDoc,
  setDoc as firestoreSetDoc,
  addDoc as firestoreAddDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  getDocs as firestoreGetDocs,
  onSnapshot as firestoreOnSnapshot,
  query as firestoreQuery,
  where as firestoreWhere,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  serverTimestamp as firestoreServerTimestamp
} from 'firebase/firestore';
import { 
  onAuthStateChanged as authAuthStateChanged,
  signInWithEmailAndPassword as authSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as authCreateUserWithEmailAndPassword,
  signInWithPopup as authSignInWithPopup,
  signOut as authSignOut,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from './firebase';

// Mode types
export type DBMode = 'cloud' | 'local';

// Event emitter to handle local updates reactively
class EventEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
    return () => this.off(event, fn);
  }

  off(event: string, fn: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== fn);
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(fn => fn(...args));
  }
}

export const dbEvents = new EventEmitter();

// Default seed data for offline mode
const DEFAULT_RATES = [
  { id: 'rate_1', country: '중국 (China)', type: 'Air', freightRate: '$3.5 / kg', proxyFee: '구매단가 5% (최소 $10)', transitTime: '항공 3-5 영업일', remarks: '심천/광저우 물류센터 신속입고 기준, 매일 선적', order: 1 },
  { id: 'rate_2', country: '중국 (China)', type: 'Ocean', freightRate: '$120 / CBM', proxyFee: '구매단가 3% (최소 $15)', transitTime: '해상 7-12 영업일', remarks: '인천항 입항 후 국내 배송 수수료 별도 실비 정산', order: 2 },
  { id: 'rate_3', country: '미국 (USA)', type: 'Air', freightRate: '$7.8 / lb', proxyFee: '구매단가 7% (최소 $15)', transitTime: '항공 4-7 영업일', remarks: '델라웨어(DE)/오레곤(OR) 무택스 센터 가동 중', order: 3 },
  { id: 'rate_4', country: '일본 (Japan)', type: 'Air', freightRate: '¥650 / 0.5kg', proxyFee: '구매단가 5% (최소 ¥1,000)', transitTime: '항공 2-4 영업일', remarks: '동경/오사카 창고 주 5회 출고 및 페덱스 연계', order: 4 },
  { id: 'rate_5', country: '일본 (Japan)', type: 'Ocean', freightRate: '¥18,000 / CBM', proxyFee: '구매단가 5% (최소 ¥1,000)', transitTime: '해상 5-10 영업일', remarks: '선박 스케줄 조율 가능, 통관 수수료 별도 고시', order: 5 }
];

const DEFAULT_TRACKING = [
  { id: 'NEX-7829-CN', trackingId: 'NEX-7829-CN', customerName: 'test (getcnlt)', email: 'getcnlt@gmail.com', origin: '중국 광저우 (Guangzhou)', destination: '대한민국 서울 (Seoul)', status: 'In Transit', currentStep: 2, steps: [
    { name: '화물 입고 완료', date: '2026-06-20 09:30', desc: '광저우 제2물류센터 실사 및 입고 완료', done: true },
    { name: '중국 수출 통관', date: '2026-06-21 14:00', desc: '해관 수출 승인 완료 및 선적 대기', done: true },
    { name: '해상 운송 진행', date: '2026-06-22 08:00', desc: '인천행 정기 화물선 운송 중 (예정일: 6/24)', done: false },
    { name: '국내 통관 및 배송', date: '대기 중', desc: '관세납부 및 우체국 택배 인계 예정', done: false }
  ], updatedAt: new Date().toISOString() },
  { id: 'NEX-1249-US', trackingId: 'NEX-1249-US', customerName: '홍길동', email: 'user@example.com', origin: '미국 포틀랜드 (Portland)', destination: '대한민국 부산 (Busan)', status: 'Delivered', currentStep: 3, steps: [
    { name: '화물 입고 완료', date: '2026-06-15 10:00', desc: '오레곤 물류센터 입고완료 및 실측 검수', done: true },
    { name: '항공 수출 선적', date: '2026-06-16 18:20', desc: '인천공항 수하물 화물 전용기 적재', done: true },
    { name: '국내 입항 및 통관', date: '2026-06-18 11:30', desc: '모바일 관세 납부 및 수입 신고 완료', done: true },
    { name: '배송 완료', date: '2026-06-19 16:30', desc: '택배 배송 완료 (배송원: 임채관 님)', done: true }
  ], updatedAt: new Date().toISOString() }
];

const DEFAULT_FAQS = [
  { id: 'faq_1', category: '운임/요율', question: '수입 통관 시 관세와 부가세는 어떻게 계산되고 납부하게 되나요?', answer: '수입 통관 시 발생하는 관세와 부가세는 관세청의 품목별 요율 규정에 따라 계산됩니다.\n\n일반적으로 구매 단가와 국제 운임의 합산액인 과세가격(C&F)을 기준으로 부과되며, 대한민국 입항 후 통관 관세사 측에서 알림톡(또는 문자)으로 고지서를 전송해 드립니다.\n\n안내받으신 가상계좌로 직접 납부하시거나 뱅킹 앱의 공과금 메뉴를 통해 납부할 수 있습니다.', order: 1 },
  { id: 'faq_2', category: '서비스안내', question: '대량 화물이나 컨테이너(FCL) 전용 선적 서비스도 지원하나요?', answer: '네, 지원합니다. 소량 화물(LCL) 혼적 서비스는 물론, 단독 기기로 움직이는 컨테이너(20ft/40ft FCL) 전용 수출입 물류 운송도 전문적으로 설계 및 대행해 드립니다.\n\n해사 조율, 항구 선적 접수, 복합 물류 통관 대행까지 전 과정을 정밀 매니징해 드립니다. 대량 견적은 [디테일 신청] 탭에서 진행해 주시기 바랍니다.', order: 2 },
  { id: 'faq_3', category: '이용방법', question: '구매대행 진행 시 판매자 조사 및 신용 정보 확인도 제공되나요?', answer: '글로벌 넥시스는 단순 수송뿐만 아니라 글로벌 공장 및 판매 제조사에 대한 기초 시장 조사, 샘플 확보 제휴, 에이전트 방문 검수, OEM 라이선스 체크 등을 맞춤 가이드라인으로 제공합니다.\n\n수출입이 처음이신 경우 현지 협상 및 유효성 확인을 매끄럽게 도와드리므로 안심하고 의뢰하실 수 있습니다.', order: 3 }
];

// Initialize localStorage if empty
export const initializeLocalStorageDB = (force = false) => {
  if (force || !localStorage.getItem('db_rates')) {
    localStorage.setItem('db_rates', JSON.stringify(DEFAULT_RATES));
  }
  if (force || !localStorage.getItem('db_tracking')) {
    localStorage.setItem('db_tracking', JSON.stringify(DEFAULT_TRACKING));
  }
  if (force || !localStorage.getItem('db_faqs')) {
    localStorage.setItem('db_faqs', JSON.stringify(DEFAULT_FAQS));
  }
  if (force || !localStorage.getItem('db_users')) {
    localStorage.setItem('db_users', JSON.stringify([
      { uid: 'mock_admin_uid', email: 'getcnlt@gmail.com', displayName: '글로벌넥시스_어드민', role: 'super_admin', referralCode: 'NEXIS-SUPER' },
      { uid: 'mock_user_uid', email: 'user@example.com', displayName: '홍길동', role: 'user', referralCode: 'NEX-GUEST' }
    ]));
  }
  if (force || !localStorage.getItem('db_chats')) {
    localStorage.setItem('db_chats', JSON.stringify([
      { id: 'chat_demo_1', userId: 'mock_user_uid', userName: '홍길동', status: 'active', lastMessage: '해상 운송 비용 문의 드립니다.', updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() }
    ]));
    localStorage.setItem('db_messages_chat_demo_1', JSON.stringify([
      { id: 'msg_1', senderId: 'mock_user_uid', senderName: '홍길동', senderRole: 'user', text: '안녕하세요! 해상 운송 비용을 대략 어떻게 계산할 수 있을까요?', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'msg_2', senderId: 'local_support', senderName: '지능형 챗봇', senderRole: 'ai', text: '안녕하세요! 글로벌 넥시스 지능형 AI 상담 도우미입니다. 해상 운송의 경우, 화물의 부피(CBM) 단위로 운임이 책정됩니다. 현재 고시된 특산 물가의 경우 요율표에서 상세 확인이 가능하며, 정확한 규격(가로x세로x높이)과 중량을 알려주시면 더욱 완벽하게 가격 시뮬레이션을 도와드리겠습니다!', createdAt: new Date(Date.now() - 3000000).toISOString() }
    ]));
  }
  if (force || !localStorage.getItem('db_logistics')) {
    localStorage.setItem('db_logistics', JSON.stringify([
      { id: 'log_req_1', userId: 'mock_user_uid', serviceType: '운송 대행 (Logistics)', country: '중국', title: '잡화 박스 해상 LCL 운송 의뢰', status: 'Pending', createdAt: new Date().toISOString(), detailData: '{"name":"박스 화물","qty":"10","weight":"250","cbm":"1.5"}' }
    ]));
  }
};

// Check DB Connection State smoothly
let _isCloudAccessible = true;

// Setup window helper for the firebase.ts testConnection callback
(window as any).__setCloudAccessible = (accessible: boolean) => {
  _isCloudAccessible = accessible;
  const targetMode = accessible ? 'cloud' : 'local';
  if (localStorage.getItem('global_nexis_db_mode') !== targetMode) {
    localStorage.setItem('global_nexis_db_mode', targetMode);
    window.dispatchEvent(new Event('db_mode_changed'));
    dbEvents.emit('db_mode_changed', targetMode);
  }
};

export const getStoredDBMode = (): DBMode => {
  const loaded = localStorage.getItem('global_nexis_db_mode') as DBMode;
  if (loaded === 'cloud' || loaded === 'local') return loaded;
  return _isCloudAccessible ? 'cloud' : 'local';
};

export const setStoredDBMode = (mode: DBMode) => {
  localStorage.setItem('global_nexis_db_mode', mode);
  window.dispatchEvent(new Event('db_mode_changed'));
  dbEvents.emit('db_mode_changed', mode);
};

// Global asynchronous check
let _connectionChecked = false;

export const verifyCloudConnectivity = async (): Promise<boolean> => {
  if (_connectionChecked) return _isCloudAccessible;
  _connectionChecked = true;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout fast check
    await fetch('https://identitytoolkit.googleapis.com', { mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeoutId);
    _isCloudAccessible = true;
  } catch (err) {
    _isCloudAccessible = false;
    if (localStorage.getItem('global_nexis_db_mode') !== 'local') {
      localStorage.setItem('global_nexis_db_mode', 'local');
      window.dispatchEvent(new Event('db_mode_changed'));
      dbEvents.emit('db_mode_changed', 'local');
    }
  }

  initializeLocalStorageDB();
  return _isCloudAccessible;
};

// Run network verification immediately
verifyCloudConnectivity();

// ==========================================
// FIRESTORE EMULATED APIs
// ==========================================

export class MockDocumentReference {
  constructor(public parentPath: string, public id: string) {}
}

export class MockCollectionReference {
  constructor(public path: string) {}
}

export class MockQuery {
  constructor(
    public ref: MockCollectionReference,
    public constraints: any[] = []
  ) {}
}

export class MockDocSnapshot {
  constructor(
    private docId: string,
    private docData: any,
    private isDocExists: boolean
  ) {}
  get id() { return this.docId; }
  exists() { return this.isDocExists; }
  data() { return this.docData; }
}

export class MockQueryDocumentSnapshot {
  constructor(public id: string, private docData: any) {}
  data() { return this.docData; }
}

export class MockQuerySnapshot {
  constructor(private docsList: MockQueryDocumentSnapshot[]) {}
  get docs() { return this.docsList; }
  get empty() { return this.docsList.length === 0; }
  get size() { return this.docsList.length; }
}

// Wrapper routing methods
export function collection(referenceDb: any, path: string, ...pathSegments: string[]): any {
  if (getStoredDBMode() === 'local') {
    const fullPath = [path, ...pathSegments].join('/');
    return new MockCollectionReference(fullPath);
  }
  return firestoreCollection(db, path, ...pathSegments);
}

export function doc(referenceDb: any, path: string, ...segments: string[]): any {
  if (getStoredDBMode() === 'local') {
    const fullPath = [path, ...segments].join('/');
    const parts = fullPath.split('/');
    const id = parts.pop() || '';
    const parentPath = parts.join('/');
    return new MockDocumentReference(parentPath, id);
  }
  return firestoreDoc(db, path, ...segments);
}

export function query(queryRef: any, ...queryConstraints: any[]): any {
  if (getStoredDBMode() === 'local') {
    const constraints = queryConstraints.map(c => {
      if (typeof c === 'function') return c;
      return c;
    });
    return new MockQuery(
      queryRef instanceof MockCollectionReference ? queryRef : queryRef.ref,
      [...(queryRef instanceof MockQuery ? queryRef.constraints : []), ...constraints]
    );
  }
  return firestoreQuery(queryRef, ...queryConstraints);
}

export function where(fieldPath: string, opStr: any, value: any) {
  if (getStoredDBMode() === 'local') {
    return { type: 'where', fieldPath, opStr, value };
  }
  return firestoreWhere(fieldPath, opStr, value);
}

export function orderBy(fieldPath: string, directionStr: 'asc' | 'desc' = 'asc') {
  if (getStoredDBMode() === 'local') {
    return { type: 'orderBy', fieldPath, directionStr };
  }
  return firestoreOrderBy(fieldPath, directionStr);
}

export function limit(limitNum: number) {
  if (getStoredDBMode() === 'local') {
    return { type: 'limit', limitNum };
  }
  return firestoreLimit(limitNum);
}

export function serverTimestamp() {
  if (getStoredDBMode() === 'local') {
    return new Date().toISOString();
  }
  return firestoreServerTimestamp();
}

// Write endpoints
export async function addDoc(collectionRef: any, data: any): Promise<any> {
  if (getStoredDBMode() === 'local') {
    const path = collectionRef.path;
    const key = `db_${path.replace(/\//g, '_')}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    const id = `${path}_id_` + Math.random().toString(36).substring(2, 10);
    
    // Sanitize timestamps
    const cleanData = { ...data };
    Object.keys(cleanData).forEach(k => {
      if (cleanData[k] && typeof cleanData[k] === 'object' && cleanData[k].toString().includes('Timestamp')) {
        cleanData[k] = new Date().toISOString();
      }
    });

    const newItem = { id, ...cleanData };
    items.push(newItem);
    localStorage.setItem(key, JSON.stringify(items));
    
    console.log(`[Local SandBox DB] Written addedDoc on ${path}`, newItem);
    dbEvents.emit(`change_${key}`);
    return new MockDocumentReference(path, id);
  }
  return firestoreAddDoc(collectionRef, data);
}

export async function setDoc(docRef: any, data: any, options?: any): Promise<void> {
  if (getStoredDBMode() === 'local') {
    const path = docRef.parentPath;
    const id = docRef.id;
    const key = `db_${path.replace(/\//g, '_')}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    
    const existingIndex = items.findIndex((i: any) => i.id === id);
    let updatedItem = { ...data };
    
    if (options?.merge && existingIndex > -1) {
      updatedItem = { ...items[existingIndex], ...data };
    } else {
      updatedItem.id = id;
    }

    if (existingIndex > -1) {
      items[existingIndex] = updatedItem;
    } else {
      items.push(updatedItem);
    }

    localStorage.setItem(key, JSON.stringify(items));
    console.log(`[Local SandBox DB] Set doc on ${path}/${id}`, updatedItem);
    dbEvents.emit(`change_${key}`);
    return;
  }
  return firestoreSetDoc(docRef, data, options);
}

export async function updateDoc(docRef: any, data: any): Promise<void> {
  if (getStoredDBMode() === 'local') {
    const path = docRef.parentPath;
    const id = docRef.id;
    const key = `db_${path.replace(/\//g, '_')}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx > -1) {
      items[idx] = { ...items[idx], ...data };
      localStorage.setItem(key, JSON.stringify(items));
      console.log(`[Local SandBox DB] Updated doc on ${path}/${id}`, data);
      dbEvents.emit(`change_${key}`);
    } else {
      console.warn(`[Local SandBox DB] Attempted updateDoc on non-existent id ${id} inside ${path}`);
    }
    return;
  }
  return firestoreUpdateDoc(docRef, data);
}

export async function deleteDoc(docRef: any): Promise<void> {
  if (getStoredDBMode() === 'local') {
    const path = docRef.parentPath;
    const id = docRef.id;
    const key = `db_${path.replace(/\//g, '_')}`;
    let items = JSON.parse(localStorage.getItem(key) || '[]');
    
    const beforeCount = items.length;
    items = items.filter((i: any) => i.id !== id);
    
    if (items.length !== beforeCount) {
      localStorage.setItem(key, JSON.stringify(items));
      console.log(`[Local SandBox DB] Deleted doc on ${path}/${id}`);
      dbEvents.emit(`change_${key}`);
    }
    return;
  }
  return firestoreDeleteDoc(docRef);
}

export async function getDoc(docRef: any): Promise<any> {
  if (getStoredDBMode() === 'local') {
    const path = docRef.parentPath;
    const id = docRef.id;
    const key = `db_${path.replace(/\//g, '_')}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    const match = items.find((i: any) => i.id === id);
    
    return new MockDocSnapshot(id, match, !!match);
  }
  return firestoreGetDoc(docRef);
}

export async function getDocs(queryObj: any): Promise<any> {
  if (getStoredDBMode() === 'local') {
    const isQuery = queryObj instanceof MockQuery;
    const path = isQuery ? queryObj.ref.path : queryObj.path;
    const key = `db_${path.replace(/\//g, '_')}`;
    let items = JSON.parse(localStorage.getItem(key) || '[]');

    if (isQuery && queryObj.constraints && queryObj.constraints.length > 0) {
      queryObj.constraints.forEach((c: any) => {
        if (!c || typeof c !== 'object') return;
        
        if (c.type === 'where') {
          const { fieldPath, opStr, value } = c;
          items = items.filter((item: any) => {
            const itemVal = item[fieldPath];
            if (opStr === '==' || opStr === '===') return itemVal === value;
            if (opStr === '!=') return itemVal !== value;
            if (opStr === '>=') return itemVal >= value;
            if (opStr === '<=') return itemVal <= value;
            if (opStr === '>') return itemVal > value;
            if (opStr === '<') return itemVal < value;
            if (opStr === 'array-contains') return Array.isArray(itemVal) && itemVal.includes(value);
            return true;
          });
        }
      });

      // Quick OrderBy
      const orderByConstraint = queryObj.constraints.find((c: any) => c && c.type === 'orderBy');
      if (orderByConstraint) {
        const { fieldPath, directionStr } = orderByConstraint;
        items.sort((a: any, b: any) => {
          const aVal = a[fieldPath];
          const bVal = b[fieldPath];
          if (aVal == null) return 1;
          if (bVal == null) return -1;
          
          if (typeof aVal === 'string') {
            return directionStr === 'desc' 
              ? bVal.localeCompare(aVal) 
              : aVal.localeCompare(bVal);
          }
          return directionStr === 'desc' ? bVal - aVal : aVal - bVal;
        });
      }

      // Quick Limit
      const limitConstraint = queryObj.constraints.find((c: any) => c && c.type === 'limit');
      if (limitConstraint) {
        items = items.slice(0, limitConstraint.limitNum);
      }
    }

    const docSnaps = items.map((i: any) => new MockQueryDocumentSnapshot(i.id, i));
    return new MockQuerySnapshot(docSnaps);
  }
  return firestoreGetDocs(queryObj);
}

export function onSnapshot(reference: any, onNext: (snapshot: any) => void, onError?: (error: any) => void): () => void {
  if (getStoredDBMode() === 'local') {
    const isQuery = reference instanceof MockQuery;
    const path = isQuery ? reference.ref.path : reference.path;
    const key = `db_${path.replace(/\//g, '_')}`;

    console.log(`[Local SandBox DB] Attached onSnapshot on path: ${path}`);
    
    const triggerSnapshot = async () => {
      try {
        const result = await getDocs(reference);
        onNext(result);
      } catch (err) {
        if (onError) onError(err);
      }
    };

    triggerSnapshot();
    
    // Subscribe to DB events
    const unsubEvent = dbEvents.on(`change_${key}`, () => {
      triggerSnapshot();
    });
    
    const unsubMode = dbEvents.on('db_mode_changed', () => {
      triggerSnapshot();
    });

    return () => {
      unsubEvent();
      unsubMode();
      console.log(`[Local SandBox DB] Detached onSnapshot on path: ${path}`);
    };
  }
  return firestoreOnSnapshot(reference, onNext, onError);
}

// Array union emulator helper
export function arrayUnion(...elements: any[]) {
  if (getStoredDBMode() === 'local') {
    return elements;
  }
  return elements; // In local emulation we handle merges or push directly in operations
}

// ==========================================
// AUTH EMULATED APIs
// ==========================================

export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData: any[];
}

const authListeners: ((user: FirebaseUser | null) => void)[] = [];

export function getLocalLoggedInUser(): FirebaseUser | null {
  const stored = localStorage.getItem('local_user');
  if (stored) {
    try {
      const userObj = JSON.parse(stored);
      return {
        uid: userObj.uid,
        email: userObj.email,
        displayName: userObj.displayName || userObj.email?.split('@')[0],
        emailVerified: true,
        isAnonymous: false,
        providerData: []
      } as unknown as FirebaseUser;
    } catch {
      return null;
    }
  }
  return null;
}

export function onAuthStateChanged(authInstance: any, callback: (user: FirebaseUser | null) => void): () => void {
  if (getStoredDBMode() === 'local') {
    authListeners.push(callback);
    // Execute immediately
    const user = getLocalLoggedInUser();
    callback(user);

    const unsubMode = dbEvents.on('db_mode_changed', () => {
      const u = getLocalLoggedInUser();
      callback(u);
    });

    return () => {
      const idx = authListeners.indexOf(callback);
      if (idx > -1) authListeners.splice(idx, 1);
      unsubMode();
    };
  }

  // Double subscribe: if Cloud is accessible, subscribe to Firebase.
  // BUT fallback immediately if Firebase hangs.
  return authAuthStateChanged(authInstance, (user) => {
    if (getStoredDBMode() === 'cloud') {
      callback(user);
    }
  });
}

export async function signInWithEmailAndPassword(authInstance: any, email: string, password?: string): Promise<any> {
  if (getStoredDBMode() === 'local') {
    // Virtual Login
    console.log(`[Local Auth] Logging in with email ${email}`);
    
    const dbUsers = JSON.parse(localStorage.getItem('db_users') || '[]');
    let userRecord = dbUsers.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!userRecord) {
      // Auto-create to make testing painless!
      const uid = 'local_uid_' + Math.random().toString(36).substring(2, 11);
      const isSuperAdminEmail = email.trim() === 'getcnlt@gmail.com';
      userRecord = {
        uid,
        email: email.trim(),
        displayName: email.split('@')[0],
        role: isSuperAdminEmail ? 'super_admin' : 'user',
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      };
      dbUsers.push(userRecord);
      localStorage.setItem('db_users', JSON.stringify(dbUsers));
    }

    localStorage.setItem('local_user', JSON.stringify({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName
    }));

    // Trigger state change
    authListeners.forEach(listener => listener(getLocalLoggedInUser()));
    dbEvents.emit('db_mode_changed');

    return {
      user: getLocalLoggedInUser()
    };
  }
  return authSignInWithEmailAndPassword(authInstance, email, password || '');
}

export async function createUserWithEmailAndPassword(authInstance: any, email: string, password?: string): Promise<any> {
  if (getStoredDBMode() === 'local') {
    console.log(`[Local Auth] Registering with email ${email}`);
    
    const dbUsers = JSON.parse(localStorage.getItem('db_users') || '[]');
    const exists = dbUsers.some((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw { code: 'auth/email-already-in-use', message: 'The email address is already in use by another account.' };
    }

    const uid = 'local_uid_' + Math.random().toString(36).substring(2, 11);
    const isSuperAdminEmail = email.trim() === 'getcnlt@gmail.com';
    
    const newUser = {
      uid,
      email: email.trim(),
      displayName: email.split('@')[0],
      role: isSuperAdminEmail ? 'super_admin' : 'user',
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };
    
    dbUsers.push(newUser);
    localStorage.setItem('db_users', JSON.stringify(dbUsers));

    localStorage.setItem('local_user', JSON.stringify({
      uid,
      email: email.trim(),
      displayName: email.split('@')[0]
    }));

    authListeners.forEach(listener => listener(getLocalLoggedInUser()));
    dbEvents.emit('db_mode_changed');

    return {
      user: getLocalLoggedInUser()
    };
  }
  return authCreateUserWithEmailAndPassword(authInstance, email, password || '');
}

export async function signInWithPopup(authInstance: any, provider: any): Promise<any> {
  if (getStoredDBMode() === 'local') {
    // Virtual Google Signin
    console.log(`[Local Auth] Logging in with Google provider`);
    return signInWithEmailAndPassword(authInstance, 'getcnlt@gmail.com');
  }
  return authSignInWithPopup(authInstance, provider);
}

export async function signOut(authInstance: any): Promise<void> {
  if (getStoredDBMode() === 'local') {
    localStorage.removeItem('local_user');
    authListeners.forEach(listener => listener(null));
    dbEvents.emit('db_mode_changed');
    return;
  }
  return authSignOut(authInstance);
}

export { GoogleAuthProvider };
