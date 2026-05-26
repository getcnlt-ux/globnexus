import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { Globe } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
    }
  }, [isOpen, initialMode]);

  const getAuthErrorMessage = (err: any) => {
    console.error('Firebase Auth Error Info:', err.code, err.message, err);
    
    switch (err.code) {
      case 'auth/operation-not-allowed':
        return `Firebase 인증 설정이 활성화되어 있지 않습니다.\n\n해결 방법:\n1. Firebase 콘솔(console.firebase.google.com)로 이동합니다.\n2. [Build] > [Authentication] > [Sign-in method] 메뉴로 이동합니다.\n3. '이메일/비밀번호' 및 'Google' 로그인 방식을 각각 활성화(Enable)해 주세요.`;
      
      case 'auth/unauthorized-domain':
        return `현재 실행 중인 도메인이 Firebase 승인 목록에 없습니다.\n\n해결 방법:\n1. Firebase 콘솔로 이동합니다.\n2. [Build] > [Authentication] > [Settings] > [Authorized domains]로 이동합니다.\n3. 새 도메인으로 현재 도메인( ${window.location.hostname} )을 승인 도메인 목록에 추가해 주세요.`;

      case 'auth/popup-blocked':
        return '팝업창이 차단되었습니다. 브라우저 주소창 부분에서 팝업 차단을 해제한 후 다시 시도해 주세요.';
        
      case 'auth/cancelled-popup-request':
        return '로그인 팝업 창이 닫혔습니다. 인증을 마칠 때까지 대기해 주세요.';
        
      case 'auth/email-already-in-use':
        return '이미 등록되어 사용 중인 이메일입니다. 다른 이메일을 사용하거나 로그인을 시도해 주세요.';
        
      case 'auth/invalid-credential':
        return '이메일 또는 비밀번호가 일치하지 않습니다. 입력한 정보가 올바른지 다시 확인해 주세요.';
        
      case 'auth/weak-password':
        return '비밀번호가 너무 취약합니다. 문자, 숫자, 특수문자를 혼합하여 8자에서 15자 사이로 설정해 주세요.';

      case 'auth/network-request-failed':
        return '인터넷 연결이 원활하지 않거나 방화벽 문제로 인해 Firebase 서버에 연결할 수 없습니다.';
        
      default:
        return `인증 중 오류가 발생했습니다:\n${err.message || '알 수 없는 오류'} (${err.code || '알 수 없는 코드'})`;
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePassword = (password: string) => {
    // At least 6 characters (Firebase Authentication standard requirement)
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation for Signup
    if (!isLogin) {
      if (!validateEmail(email)) {
        setError('유효한 이메일 형식이 아닙니다.');
        return;
      }
      if (!validatePassword(password)) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (!displayName.trim()) {
        setError('이름을 입력해주세요.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      }
      onClose();
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 dark:bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-panel p-8 rounded-3xl border-black/5 dark:border-white/10 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-500 dark:text-zinc-400"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold mb-2">
                {isLogin ? 'Welcome Back' : 'Join Us'}
              </h2>
              <p className="text-zinc-500 text-sm">
                {isLogin ? 'Log in to access your consultations' : 'Create an account to start consulting'}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all border border-white/20"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google 계정으로 로그인
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
                  <span className="bg-zinc-50 dark:bg-black px-4 text-zinc-500 dark:text-zinc-500">또는 이메일로 로그인</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-blue-500 outline-none transition-colors dark:text-white"
                      placeholder="Your name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-blue-500 outline-none transition-colors dark:text-white"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-blue-500 outline-none transition-colors dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-red-500 text-[11px] mt-2 bg-red-500/10 p-3.5 rounded-2xl border border-red-500/20 text-left whitespace-pre-line leading-relaxed">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isLogin ? (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Account
                  </>
                )}
              </button>
            </form>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-white transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
