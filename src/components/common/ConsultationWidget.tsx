import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, MessageSquare, Mail, Headset, X, MessageCircleMore, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useAuth } from './AuthProvider';
import AuthModal from './AuthModal';
import LiveChat from './LiveChat';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function ConsultationWidget() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  const options = [
    { 
      id: 'wechat', 
      icon: <MessageCircle className="w-5 h-5" />, 
      label: t('consult.wechat'), 
      color: 'bg-[#07C160]', 
      hover: 'hover:bg-[#06ae56]' 
    },
    { 
      id: 'kakao', 
      icon: <MessageSquare className="w-5 h-5" />, 
      label: t('consult.kakao'), 
      color: 'bg-[#FEE500] text-black', 
      hover: 'hover:bg-[#fada00]' 
    },
    { 
      id: 'email', 
      icon: <Mail className="w-5 h-5" />, 
      label: t('consult.email'), 
      color: 'bg-zinc-700', 
      hover: 'hover:bg-zinc-600' 
    },
    { 
      id: 'live', 
      icon: <Headset className="w-5 h-5" />, 
      label: t('consult.live'), 
      color: 'bg-blue-600', 
      hover: 'hover:bg-blue-500' 
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end gap-4">
      {/* Consultation Options */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {options.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: (options.length - 1 - index) * 0.05 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl transition-all group",
                  option.color,
                  option.hover
                )}
                onClick={() => {
                  if (option.id === 'live') {
                    if (!user) {
                      setIsAuthOpen(true);
                      setIsOpen(false);
                    } else {
                      setShowLiveChat(true);
                      setIsOpen(false);
                    }
                  } else {
                    console.log(`Consultation via ${option.id}`);
                  }
                }}
              >
                <span className="text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-2 py-1 rounded-md absolute right-full mr-3 pointer-events-none">
                  {option.label}
                </span>
                <span className="text-xs font-bold md:hidden">{option.label}</span>
                <span className="hidden md:inline text-xs font-bold">{option.label}</span>
                <div className="flex-shrink-0">
                  {option.icon}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
          isOpen ? "bg-zinc-800 text-white rotate-90" : "bg-blue-600 text-white"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageCircleMore size={28} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

      {/* Live Chat Panel */}
      <AnimatePresence>
        {showLiveChat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[400px] z-[1100]"
          >
             <LiveChat onClose={() => setShowLiveChat(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Status Badge */}
      {user && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
              <User size={12} />
            </div>
            <span className="text-[10px] font-mono text-zinc-300">
              {profile?.displayName || user.email}
            </span>
            {profile?.role === 'admin' && (
              <span className="text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Admin</span>
            )}
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="text-zinc-500 hover:text-red-500 transition-colors"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
