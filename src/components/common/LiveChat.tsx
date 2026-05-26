import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, User, MessageCircle, AlertCircle, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  setDoc,
  getDocs,
  where,
  limit,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from './AuthProvider';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export default function LiveChat({ onClose }: { onClose: () => void }) {
  const { user, profile } = useAuth();
  const { i18n, t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});

  const [chatbotActive, setChatbotActive] = useState(true);
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Bot response function using the server API route
  const getBotResponse = async (userText: string, currentMsgs: Message[]) => {
    if (!chatId) return;
    setIsBotTyping(true);
    try {
      const recentHistory = currentMsgs.map(m => ({
        senderName: m.senderId === user?.uid ? 'User' : m.senderName || 'Agent/Chatbot',
        text: m.text
      }));
      recentHistory.push({
        senderName: 'User',
        text: userText
      });

      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: recentHistory })
      });

      if (res.ok) {
        const data = await res.json();
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          senderId: 'chatbot',
          senderName: 'AI Chatbot (수행비서)',
          text: data.reply,
          createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: data.reply,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error getting bot response:', err);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleQuickFAQClick = async (faqQuery: string) => {
    if (!chatId || !user || isBotTyping) return;
    
    try {
      // Save user message first
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        senderName: profile?.displayName || user.displayName || 'User',
        text: faqQuery,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: faqQuery,
        updatedAt: serverTimestamp()
      });

      // Get bot response immediately passing current history
      await getBotResponse(faqQuery, messages);
    } catch (err) {
      console.error('Error sending FAQ query:', err);
    }
  };

  const handleTranslate = async (msgId: string, text: string, targetLang?: string) => {
    if (translatingIds[msgId]) return;

    // Toggle back to original if they clicked the main Translate button with translation already loaded
    if (translations[msgId] && !targetLang) {
      const updated = { ...translations };
      delete updated[msgId];
      setTranslations(updated);
      return;
    }

    const finalTargetLang = targetLang || i18n.language || 'ko';
    setTranslatingIds(prev => ({ ...prev, [msgId]: true }));
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLang: finalTargetLang
        })
      });
      if (response.ok) {
        const data = await response.json();
        setTranslations(prev => ({ ...prev, [msgId]: data.translated }));
      } else {
        console.error('Translation error response');
      }
    } catch (err) {
      console.error('Error translating:', err);
    } finally {
      setTranslatingIds(prev => ({ ...prev, [msgId]: false }));
    }
  };

  // Initialize or find chat session
  useEffect(() => {
    if (!user) return;

    const findOrCreateChat = async () => {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef, 
        where('userId', '==', user.uid), 
        where('status', '==', 'active'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setChatId(querySnapshot.docs[0].id);
      } else {
        const newChat = await addDoc(chatsRef, {
          userId: user.uid,
          userName: profile?.displayName || user.email?.split('@')[0] || 'Unknown',
          status: 'active',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        setChatId(newChat.id);
      }
    };

    findOrCreateChat();
  }, [user, profile]);

  // Listen to messages
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId || !user) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        senderName: profile?.displayName || user.displayName || 'User',
        text: text,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp()
      });

      // If chatbot is active, generate auto response
      if (chatbotActive) {
        await getBotResponse(text, messages);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!user) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-900 border border-white/10 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-blue-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Login Required</h3>
        <p className="text-zinc-500 text-sm mb-6">Please sign in to start a live chat with our team.</p>
        <button 
          onClick={onClose}
          className="bg-blue-600 px-6 py-2 rounded-full font-bold text-sm"
        >
          Confirm
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[520px] w-full bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-zinc-800 p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
            <MessageCircle size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold">Global Logistics Support</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Live Specialist Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="bg-zinc-950/60 p-1.5 border-b border-white/5 flex gap-1.5 justify-center items-center">
        <button
          type="button"
          onClick={() => setChatbotActive(true)}
          className={cn(
            "flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer",
            chatbotActive 
              ? "bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.1)]" 
              : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-400"
          )}
        >
          <div className={cn("w-1.5 h-1.5 rounded-full bg-blue-500", chatbotActive && "animate-pulse")} />
          지능형 AI 챗봇 응대
        </button>
        <button
          type="button"
          onClick={() => setChatbotActive(false)}
          className={cn(
            "flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer",
            !chatbotActive 
              ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]" 
              : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-400"
          )}
        >
          <div className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500", !chatbotActive && "animate-pulse")} />
          1:1 실시간 상담원
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={cn(
              "flex flex-col",
              msg.senderId === user.uid ? "items-end" : "items-start"
            )}
          >
            <span className="text-[9px] text-zinc-600 font-mono mb-1 uppercase tracking-widest">
              {msg.senderId === user.uid 
                ? 'You' 
                : (msg.senderId === 'chatbot' ? 'AI Chatbot (수행비서)' : 'Agent ' + (msg.senderName || 'Staff'))}
            </span>
            <div 
              className={cn(
                "max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed",
                msg.senderId === user.uid 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : (msg.senderId === 'chatbot' 
                      ? "bg-zinc-800 text-blue-100/90 rounded-tl-none border border-blue-500/15" 
                      : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5")
              )}
            >
              <div>{msg.text}</div>
              {translations[msg.id] && (
                <div className="mt-2 pt-2 border-t border-white/10 text-xs text-blue-200/90 italic leading-relaxed">
                  <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Translated:</div>
                  {translations[msg.id]}
                </div>
              )}
            </div>

            {/* Translation Actions */}
            <div className="flex gap-2 items-center mt-1 text-[10px] text-zinc-500">
              <button 
                onClick={() => handleTranslate(msg.id, msg.text)} 
                className="hover:text-blue-400 font-semibold transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 text-[10px]"
              >
                <Languages size={10} />
                {translatingIds[msg.id] ? '번역 중...' : (translations[msg.id] ? '원문 보기' : '번역')}
              </button>
              
              {!translations[msg.id] && !translatingIds[msg.id] && (
                <div className="flex gap-1.5 border-l border-white/10 pl-2">
                  {['ko', 'en', 'zh', 'ja'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleTranslate(msg.id, msg.text, lang)}
                      className={cn(
                        "hover:text-blue-400 font-mono transition-colors uppercase px-1 rounded hover:bg-white/5 text-[9px]",
                        i18n.language === lang ? "text-blue-400 font-black font-semibold" : "text-zinc-500"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isBotTyping && (
          <div className="flex flex-col items-start gap-1">
            <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">
              AI Chatbot (수행비서)
            </span>
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed bg-zinc-800 text-zinc-400 rounded-tl-none border border-blue-500/10 flex items-center gap-2">
              <span>답변을 구성하는 중입니다</span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* FAQ Chips */}
      {chatbotActive && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-white/5 bg-zinc-950/40">
          <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest w-full">💡 자주 묻는 질문 빠른 응대</span>
          {[
            "해상 및 항공 운송 요율 안내",
            "간편 신청서 및 견적 신청 방법",
            "배송 완료까지 기간은 얼마나 걸리나요?",
            "배송 상태 조회는 어디서 하나요?",
            "시제품 제작 & 공장 매칭 문의"
          ].map((faq) => (
            <button
              key={faq}
              type="button"
              onClick={() => handleQuickFAQClick(faq)}
              disabled={isBotTyping}
              className="text-[10px] bg-zinc-800 hover:bg-zinc-750 active:bg-blue-900/40 text-zinc-300 font-medium px-2.5 py-1 rounded-full border border-white/5 transition-all outline-none cursor-pointer duration-150"
            >
              {faq}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-zinc-800/50 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={chatbotActive ? "AI 챗봇에게 물어보세요..." : "Type your message..."}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:border-blue-500 outline-none transition-colors"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
