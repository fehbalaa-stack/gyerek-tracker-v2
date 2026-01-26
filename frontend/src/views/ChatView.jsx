import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function ChatView({ trackers = [], logs = [], isPremium = false }) {
  const { language } = useAuth();
  const t = translations[language] || translations.hu;
  
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null); 
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // FIX 1: Render URL használata a localhost helyett
  useEffect(() => {
    const newSocket = io('https://oovoo-backend.onrender.com', {
      transports: ['websocket', 'polling'], 
      reconnection: true,
      withCredentials: true
    });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (activeChat?._id && socket) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          // FIX 2: Itt is Render URL kell
          const res = await axios.get(`https://oovoo-backend.onrender.com/api/chat/${activeChat._id}`);
          setMessages(res.data || []);
          setTimeout(scrollToBottom, 100);
        } catch (err) {
          console.error("Hiba az üzenetek lekérésekor:", err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMessages();
      socket.emit('join_chat', activeChat._id);

      const handleMessage = (newMessage) => {
        // FIX 3: Egyszerűsített szobafigyelés (csak az ID-ra koncentrálunk)
        if (newMessage.trackerId === activeChat._id) {
          setMessages(prev => {
            const exists = prev.some(m => m._id === newMessage._id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
          setTimeout(scrollToBottom, 50);
        }
      };

      socket.off('receive_message');
      socket.on('receive_message', handleMessage);

      return () => {
        socket.off('receive_message', handleMessage);
      };
    }
  }, [activeChat?._id, socket]);

  const activeChats = trackers || [];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const locale = language === 'hu' ? 'hu-HU' : language === 'de' ? 'de-DE' : 'en-US';
    return new Date(dateString).toLocaleString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async () => {
    if (!reply.trim() || !activeChat || loading) return;
    const newMessageContent = reply.trim();
    setReply("");
    try {
      // FIX 4: Küldés is a Renderre menjen
      await axios.post('https://oovoo-backend.onrender.com/api/chat/send', {
        trackerId: activeChat._id,
        senderId: "Owner",
        senderType: 'user', 
        message: newMessageContent
      });
    } catch (err) {
      toast.error(language === 'hu' ? "Hiba a küldés során" : "Error sending message");
      setReply(newMessageContent);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[650px] bg-white border border-emerald-50 rounded-[2.5rem] overflow-hidden shadow-sm animate-in fade-in duration-500">
      
      {/* Oldalsáv: Chat lista */}
      <div className="w-full md:w-80 border-r border-emerald-50 bg-slate-50/30 flex flex-col">
        <div className="p-6 border-b border-emerald-50 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
          {t.chatActiveList}
        </div>
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {activeChats.length > 0 ? (
            activeChats.map(tracker => {
              const isGuestChat = logs.some(l => l.trackerId === tracker._id && (l.isGuest || l.type === 'MESSAGE'));
              const isActive = activeChat?._id === tracker._id;

              return (
                <div 
                  key={tracker._id}
                  onClick={() => setActiveChat(tracker)}
                  className={`p-5 cursor-pointer flex items-center gap-4 transition-all relative border-b border-emerald-50/50 ${
                    isActive ? 'bg-white shadow-sm z-10' : 'hover:bg-emerald-50/30'
                  }`}
                >
                  <div className={`text-2xl w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {tracker.icon || (tracker.type === 'car' ? '🚗' : '🎒')}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className={`font-bold text-sm truncate pr-2 ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                        {tracker.name}
                      </h4>
                      {isGuestChat && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate font-medium">
                      {isGuestChat ? (language === 'hu' ? 'Üzenet érkezett' : 'New message') : 'oooVooo Tracker'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs text-slate-300 font-bold uppercase tracking-widest italic">
              {t.chatNoMessages}
            </div>
          )}
        </div>
      </div>

      {/* Chat ablak */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            <div className="p-5 border-b border-emerald-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <span className="text-2xl drop-shadow-sm">{activeChat.icon || (activeChat.type === 'car' ? '🚗' : '🎒')}</span>
                <div>
                   <h3 className="font-black text-slate-800 tracking-tight">{activeChat.name}</h3>
                   <p className="text-[9px] text-emerald-600 font-black tracking-widest uppercase italic opacity-60">#{activeChat.uniqueCode}</p>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-black border border-emerald-100 uppercase tracking-widest">
                {isPremium ? t.chatPremium : t.chatStandard}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20">
              {loading && messages.length === 0 ? (
                <div className="text-center py-20 text-emerald-600 animate-pulse text-[10px] font-black uppercase tracking-widest">Szinkronizálás...</div>
              ) : (
                messages.map(msg => {
                  const isOwner = msg.senderType === 'user' || msg.isOwner;
                  const isFinder = msg.senderType === 'finder' || msg.isGuest;

                  return (
                    <div key={msg._id || Math.random()} className={`flex ${isOwner ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[75%] p-4 rounded-[1.8rem] text-sm shadow-sm transition-all ${
                        isOwner 
                          ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-100' 
                          : 'bg-white text-slate-700 rounded-tl-none border border-emerald-50'
                      }`}>
                        {isFinder && (
                          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">
                            {language === 'hu' ? 'Megtaláló' : 'Finder'}
                          </div>
                        )}
                        <p className="leading-relaxed font-medium">{msg.message || msg.content}</p>
                        <span className={`text-[8px] block mt-2 font-black uppercase tracking-tighter text-right ${isOwner ? 'text-white/60' : 'text-slate-300'}`}>
                          {formatDate(msg.timestamp || msg.createdAt || msg.date)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-5 border-t border-emerald-50 bg-white">
              <div className="flex gap-2 bg-slate-50 border border-emerald-50 rounded-[1.8rem] p-2 focus-within:bg-white focus-within:border-emerald-200 focus-within:shadow-md transition-all">
                <input 
                  type="text" 
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 bg-transparent border-none px-4 py-2 outline-none text-sm font-bold text-slate-700"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!reply.trim() || loading}
                  className="bg-emerald-600 w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-all shadow-md shadow-emerald-100 hover:bg-emerald-700 active:scale-90 disabled:opacity-30"
                >
                  <span className="text-xl font-bold">↑</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
             <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mb-6 opacity-40">💬</div>
             <p className="text-[11px] tracking-[0.3em] uppercase font-black text-slate-300">{t.chatNoConversation}</p>
          </div>
        )}
      </div>
    </div>
  );
}