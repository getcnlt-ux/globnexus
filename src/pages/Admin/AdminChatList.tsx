import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../components/common/AuthProvider';
import { cn } from '../../lib/utils';
import { MessageCircle, Send, User, Clock, CheckCircle, Trash2 } from 'lucide-react';

interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  status: string;
  lastMessage: string;
  updatedAt: any;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export default function AdminChatList() {
  const { user, profile } = useAuth();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen to all active chats
  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatSession[];
      setChats(chatDocs);
    });

    return () => unsubscribe();
  }, []);

  // Listen to messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const messagesRef = collection(db, 'chats', selectedChat.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat || !user) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        senderId: user.uid,
        senderName: profile?.displayName || 'Admin',
        text: text,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastMessage: text,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error sending response:', err);
    }
  };

  const deleteChat = async (id: string) => {
    if (profile?.role !== 'super_admin') {
      alert('최고 관리자만 대화 내역을 삭제할 수 있습니다.');
      return;
    }

    if (!confirm('정말로 이 대화 내역을 영구 삭제하시겠습니까?')) return;

    try {
      await deleteDoc(doc(db, 'chats', id));
      if (selectedChat?.id === id) setSelectedChat(null);
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  };

  const closeChat = async (id: string) => {
    try {
      await updateDoc(doc(db, 'chats', id), { 
        status: 'closed',
        updatedAt: serverTimestamp() 
      });
      if (selectedChat?.id === id) setSelectedChat(null);
    } catch (err) {
      console.error('Error closing chat:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
      {/* Chat List */}
      <div className="lg:col-span-4 glass-panel rounded-3xl overflow-hidden flex flex-col border-white/5">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h3 className="font-bold flex items-center gap-2">
            <MessageCircle size={18} className="text-blue-500" />
            Active Conversations
          </h3>
        </div>
        <div className="flex-grow overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-10 text-center text-zinc-600 text-sm italic">
              No active chats found.
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={cn(
                  "w-full p-6 border-b border-white/5 text-left transition-all hover:bg-white/5",
                  selectedChat?.id === chat.id ? "bg-blue-600/10 border-l-4 border-l-blue-600" : ""
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm">{chat.userName}</span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    {chat.updatedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-1 mb-3">
                  {chat.lastMessage || 'Starting conversation...'}
                </p>
                <div className="flex items-center justify-between">
                  {chat.status === 'active' ? (
                    <span className="text-[8px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Active</span>
                  ) : (
                    <span className="text-[8px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Closed</span>
                  )}
                  <div className="flex gap-2">
                    {profile?.role === 'super_admin' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="text-zinc-700 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    <span className="text-[10px] text-zinc-600 font-mono">ID: {chat.id.slice(0, 6)}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-8 glass-panel rounded-3xl overflow-hidden flex flex-col border-white/5 relative">
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div 
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedChat.userName}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">USER_ID: {selectedChat.userId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => closeChat(selectedChat.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors"
                >
                  <CheckCircle size={14} />
                  Close Session
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "flex flex-col",
                      msg.senderId === user?.uid ? "items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                        {msg.senderId === user?.uid ? 'Admin Response' : 'User Query'}
                      </span>
                    </div>
                    <div 
                      className={cn(
                        "max-w-[70%] px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-lg",
                        msg.senderId === user?.uid 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5"
                      )}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-zinc-700 mt-2 font-mono">
                      {msg.createdAt?.toDate().toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-6 border-t border-white/5 bg-white/5">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter response for client..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 pl-6 pr-20 text-sm focus:border-blue-500 outline-none transition-colors resize-none"
                  />
                  <button 
                    type="submit"
                    className="absolute right-3 bottom-3 w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-all shadow-lg"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center p-12"
            >
              <div className="w-20 h-20 rounded-full bg-blue-500/5 flex items-center justify-center text-zinc-700 mb-8 border border-white/5">
                <MessageCircle size={40} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Select a Conversation</h3>
              <p className="text-zinc-500 max-w-sm font-light">
                Choose a client session from the list to start providing real-time logistics support.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
