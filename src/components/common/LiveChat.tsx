import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, User, MessageCircle, AlertCircle } from 'lucide-react';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col h-[500px] w-full bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
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
              {msg.senderId === user.uid ? 'You' : 'Agent ' + (msg.senderName || 'Staff')}
            </span>
            <div 
              className={cn(
                "max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed",
                msg.senderId === user.uid 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-zinc-800/50 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
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
