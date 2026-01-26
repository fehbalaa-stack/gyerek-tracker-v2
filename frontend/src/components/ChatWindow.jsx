import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const ChatWindow = ({ trackerId, senderType, lang, t }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();

  // Socket inicializálás (Mac-stabil verzió)
  useEffect(() => {
    const s = io('http://127.0.0.1:5000', {
      transports: ['polling', 'websocket'],
      withCredentials: true
    });
    setSocket(s);

    const channel = `message_${trackerId}`;
    s.on(channel, (msg) => {
      setMessages(prev => {
        if (prev.find(m => m._id === msg._id)) return prev;
        return [msg, ...prev];
      });
    });

    return () => s.disconnect();
  }, [trackerId]);

  // Kezdeti üzenetek betöltése
  useEffect(() => {
    const fetchMsgs = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/chat/${trackerId}`);
        setMessages(res.data);
      } catch (err) { console.error("Hiba:", err); }
    };
    fetchMsgs();
  }, [trackerId]);

  const send = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post('http://127.0.0.1:5000/api/chat/send', {
        trackerId,
        senderType, // 'user' vagy 'finder'
        message: newMessage,
        senderId: senderType === 'user' ? 'Owner' : 'Finder'
      });
      setNewMessage("");
    } catch (err) { console.error("Küldési hiba:", err); }
  };

  return (
    <div className="flex flex-col h-[450px] bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm p-4 overflow-hidden">
      {/* Üzenetek listája */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 flex flex-col-reverse px-2 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderType === senderType;
          return (
            <div key={msg._id || Math.random()} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-[1.5rem] text-sm max-w-[85%] shadow-sm ${
                isMe 
                  ? 'bg-emerald-600 text-white rounded-tr-none font-medium' 
                  : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
              }`}>
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bevitelmező szakasz */}
      <div className="flex gap-2 bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100 items-center">
        <input 
          className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 font-medium"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={t?.chatPlaceholder || "Írj üzenetet..."}
        />
        <button 
          onClick={send} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md shadow-emerald-200 active:scale-90"
        > 
          <span className="text-lg font-bold">↑</span>
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;