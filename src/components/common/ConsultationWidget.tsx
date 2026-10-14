import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, MessageSquare, Mail, FileText, X, MessageCircleMore } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function ConsultationWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { 
      id: 'kakao', 
      icon: <MessageSquare className="w-5 h-5" />, 
      label: t('consult.kakao') || '카카오톡 상담', 
      color: 'bg-[#FEE500] text-black', 
      hover: 'hover:bg-[#fada00]',
      action: () => {
        window.open('https://pf.kakao.com', '_blank');
      }
    },
    { 
      id: 'wechat', 
      icon: <MessageCircle className="w-5 h-5" />, 
      label: t('consult.wechat') || 'WeChat 상담', 
      color: 'bg-[#07C160] text-white', 
      hover: 'hover:bg-[#06ae56]',
      action: () => {
        alert('WeChat 공식 ID: GlobalNexis_Official\n검색 후 1:1 상담을 요청해 주세요.');
      }
    },
    { 
      id: 'email', 
      icon: <Mail className="w-5 h-5" />, 
      label: t('consult.email') || '이메일 문의', 
      color: 'bg-zinc-700 text-white', 
      hover: 'hover:bg-zinc-600',
      action: () => {
        window.location.href = 'mailto:contact@glob-nexis.com?subject=글로벌 넥시스 서비스 상담 문의';
      }
    },
    { 
      id: 'apply', 
      icon: <FileText className="w-5 h-5" />, 
      label: '맞춤 견적 신청', 
      color: 'bg-blue-600 text-white', 
      hover: 'hover:bg-blue-500',
      action: () => {
        window.location.href = '/apply';
      }
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
                  "flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl transition-all group cursor-pointer",
                  option.color,
                  option.hover
                )}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
              >
                <span className="text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-2 py-1 rounded-md absolute right-full mr-3 pointer-events-none">
                  {option.label}
                </span>
                <span className="text-xs font-bold">{option.label}</span>
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
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer",
          isOpen 
            ? "bg-zinc-800 dark:bg-white text-white dark:text-black rotate-90" 
            : "bg-blue-600 text-white"
        )}
        aria-label="상담 문의 메뉴 열기"
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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
