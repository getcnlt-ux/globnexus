import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, User, LogIn, UserPlus, AlertCircle, Eye, EyeOff, Shield, Database } from 'lucide-react';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  setStoredDBMode
} from '../../lib/dbWrapper';
import { auth } from '../../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'link'>('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
      setLinkSent(false);
      setError(null);
      setEmail('');
      setDisplayName('');
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  const getAuthErrorMessage = (err: any) => {
    console.error('Firebase Auth Error Info:', err.code, err.message, err);
    
    switch (err.code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return '비밀번호가 올바르지 않거나 가입되어 있지 않은 계정 정보입니다. 입력하신 내용을 다시 한 번 확인해 주세요.';
      case 'auth/user-not-found':
        return '가입되지 않은 이메일 주소입니다. 신규 회원가입을 먼저 진행해 주세요.';
      case 'auth/weak-password':
        return '비밀번호는 최소 6자 이상으로 안전하게 설정해 주세요.';
      
      case 'auth/operation-not-allowed':
        return `Firebase 인증 설정에서 '이메일 링크(비밀번호 없는 로그인)' 방식이 활성화되어 있지 않습니다.\n\n해결 방법:\n1. Firebase 콘솔(console.firebase.google.com)로 이동합니다.\n2. [Build] > [Authentication] > [Sign-in method] 메뉴로 이동합니다.\n3. '이메일/비밀번호(Email/Password)' 설정을 누릅니다.\n4. **'이메일 링크(비밀번호 없는 로그인)'** 활성화 스위치를 켜고 저장해 주세요!`;
      
      case 'auth/unauthorized-domain':
        return `현재 실행 중인 도메인이 Firebase 승인 목록에 없습니다.\n\n해결 방법:\n1. Firebase 콘솔로 이동합니다.\n2. [Build] > [Authentication] > [Settings] > [Authorized domains]로 이동합니다.\n3. 새 도메인으로 현재 도메인( ${window.location.hostname} )을 승인 도메인 목록에 추가해 주세요.`;
 
      case 'auth/popup-blocked':
        return '팝업창이 차단되었습니다. 브라우저 주소창 부분에서 팝업 차단을 해제한 후 다시 시도해 주세요.';
        
      case 'auth/cancelled-popup-request':
        return '로그인 팝업 창이 닫혔습니다. 인증을 마칠 때까지 대기해 주세요.';
        
      case 'auth/email-already-in-use':
        return '이미 임포트되어 사용 중인 이메일입니다. 다른 이메일을 사용하거나 로그인을 시도해 주세요.';
        
      case 'auth/invalid-email':
        return '유효한 이메일 형식이 아닙니다. 이메일 주소를 다시 확인해 주세요.';

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

  const validateEmail = (emailStr: string) => {
    return String(emailStr)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError('유효한 이메일 형식이 아닙니다.');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (authMethod === 'password') {
      if (!password) {
        setError('비밀번호를 입력해주세요.');
        return;
      }
      if (password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
    }

    setLoading(true);

    try {
      if (authMethod === 'password') {
        if (!isLogin && displayName.trim()) {
          // Temporarily cache the name to set it in AuthProvider profile doc creation
          window.localStorage.setItem('displayNameForSignIn', displayName.trim());
        }

        if (isLogin) {
          await signInWithEmailAndPassword(auth, email.trim(), password);
        } else {
          await createUserWithEmailAndPassword(auth, email.trim(), password);
        }
        onClose();
      } else {
        const actionCodeSettings = {
          // Redirect back to our exact current location (dynamic resolution)
          url: window.location.origin + window.location.pathname,
          handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings);

        // Save email locally to pre-fill on link landing
        window.localStorage.setItem('emailForSignIn', email.trim());
        if (!isLogin && displayName.trim()) {
          window.localStorage.setItem('displayNameForSignIn', displayName.trim());
        }

        setLinkSent(true);
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLocalAndLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      setStoredDBMode('local');
      
      const useEmail = email.trim() || 'getcnlt@gmail.com';
      const usePassword = password || '123456';
      
      if (isLogin) {
        await signInWithEmailAndPassword(auth, useEmail, usePassword);
      } else {
        const useName = displayName.trim() || useEmail.split('@')[0];
        window.localStorage.setItem('displayNameForSignIn', useName);
        try {
          await createUserWithEmailAndPassword(auth, useEmail, usePassword);
        } catch (regErr: any) {
          if (regErr && (regErr.code === 'auth/email-already-in-use' || regErr.message?.includes('already-in-use'))) {
            await signInWithEmailAndPassword(auth, useEmail, usePassword);
          } else {
            throw regErr;
          }
        }
      }
      onClose();
    } catch (err: any) {
      setError(`로컬 로그인 중 오류 발생: ${err.message || err}`);
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
            className="relative w-full max-w-md glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl bg-zinc-50 dark:bg-zinc-950"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-500 dark:text-zinc-400"
            >
              <X size={20} />
            </button>

            {linkSent ? (
               <div className="text-center py-4">
                <div className="flex justify-center mb-6 text-blue-500">
                  <div className="p-4 bg-blue-500/10 rounded-full animate-bounce">
                    <Mail size={32} />
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">
                  로그인 링크 전송 완료!
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
                  <span className="font-bold text-blue-500">{email}</span> 주소로 인증 링크를 보냈습니다.<br />
                  인증 메일함에서 링크를 클릭하면 즉시 가입/로그인이 완료됩니다.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={onClose}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  >
                    확인 후 닫기
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkSent(false)}
                    className="text-xs text-zinc-500 hover:text-blue-500 underline transition-colors"
                  >
                    이메일 다시 작성하기
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-display font-bold mb-2">
                    {isLogin ? 'Welcome Back' : 'Join Us'}
                  </h2>
                  <p className="text-zinc-500 text-sm">
                    {isLogin 
                      ? (authMethod === 'password' ? '이메일과 비밀번호로 간편하게 로그인하세요' : '안전한 1회용 이메일 인증 링크로 자동 로그인하세요') 
                      : (authMethod === 'password' ? '이메일과 비밀번호로 빠르게 신규 가입하세요' : '이메일 인증 링크만으로 비밀번호 없이 신규 가입하세요')
                    }
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all border border-black/10"
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

                  <div className="relative py-1">
                    <div className="flex bg-black/[0.04] dark:bg-white/5 rounded-xl p-1 mb-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod('password');
                          setError(null);
                        }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                          authMethod === 'password'
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                      >
                        이메일/비밀번호 (보안 추천)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod('link');
                          setError(null);
                        }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                          authMethod === 'link'
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                      >
                        이메일 링크 로그인
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1 text-zinc-600 dark:text-zinc-400">Name</label>
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
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1 text-zinc-600 dark:text-zinc-400">Email</label>
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

                    {authMethod === 'password' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1 text-zinc-600 dark:text-zinc-400">Password</label>
                        <div className="relative">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm focus:border-blue-500 outline-none transition-colors dark:text-white"
                            placeholder="••••••"
                            required={authMethod === 'password'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (() => {
                      const isNetworkOr405Error = error && (
                        error.includes('405') || 
                        error.includes('network-request-failed') || 
                        error.includes('fetch') || 
                        error.includes('Failed to fetch') || 
                        error.includes('status: 405')
                      );
                      return (
                        <div className="space-y-3 mt-2">
                          <div className="flex items-start gap-2.5 text-red-500 text-[11px] bg-red-500/10 p-3.5 rounded-2xl border border-red-500/20 text-left whitespace-pre-line leading-relaxed">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <span>{error}</span>
                            </div>
                          </div>

                          {isNetworkOr405Error && (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-left space-y-3">
                              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                <Shield size={14} className="text-amber-500" />
                                중국 내 네트워크 방화벽 차단 안내
                              </h4>
                              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                현재 VPN 없이 중국에서 접속 중이거나 만리방화벽(GFW) 차단 등의 영향으로 서버 인증 API 연결(405 오류)이 불가능한 상태입니다.
                                <strong className="block mt-1 font-semibold text-zinc-800 dark:text-zinc-200">
                                  '로컬 데모 샌드박스 모드'로 전환하시면, VPN 없이도 브라우저 로컬 저장소를 기반으로 모든 기능(게시판, 접수, 트래킹, 고객문의 등)을 즉시 이용하실 수 있습니다!
                                </strong>
                              </p>
                              <button
                                type="button"
                                onClick={handleSwitchToLocalAndLogin}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Database size={13} />
                                로컬 데모 모드로 전환 및 즉시 로그인
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : authMethod === 'password' ? (
                        isLogin ? (
                          <>
                            <LogIn size={18} />
                            로그인 완료하기
                          </>
                        ) : (
                          <>
                            <UserPlus size={18} />
                            무료 신규 가입하기
                          </>
                        )
                      ) : isLogin ? (
                        <>
                          <LogIn size={18} />
                          로그인 링크 받기
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          가입 링크 받기
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
                    {isLogin ? "계정이 없으신가요? 무료 회원가입" : "이미 계정이 있으신가요? 로그인하기"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
