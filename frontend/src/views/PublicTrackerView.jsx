import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

// --- SZÓTÁR ---
const translations = {
  hu: {
    loading: "oooVooo Betöltés...",
    helpMe: "KÉRLEK SEGÍTS HAZAJUTNI!",
    gpsSearching: "🛰️ GPS JEL KERESÉSE...",
    gpsSuccess: "📡 HELYZET MEGOSZTVA A TULAJDONOSSAL",
    msgPlaceholder: "Üzenet a tulajdonosnak...",
    send: "KÜLDÉS",
    call: "HÍVÁS",
    email: "EMAIL",
    emergency: "🚨 SÜRGŐSSÉGI HÍVÁS",
    openChat: "💬 ÜZENET KÜLDÉSE / CHAT",
    closeChat: "BEZÁRÁS X",
    phoneLabel: "TELEFONSZÁM:",
    emailLabel: "EMAIL CÍM:",
    sosLabel: "SÜRGŐSSÉGI (SOS) SZÁM:"
  },
  en: {
    loading: "oooVooo Loading...",
    helpMe: "PLEASE HELP ME GET HOME!",
    gpsSearching: "🛰️ SEARCHING FOR GPS SIGNAL...",
    gpsSuccess: "📡 LOCATION SHARED WITH OWNER",
    msgPlaceholder: "Message to owner...",
    send: "SEND",
    call: "CALL",
    email: "EMAIL",
    emergency: "EMERGENCY CALL",
    openChat: "💬 SEND MESSAGE / CHAT",
    closeChat: "CLOSE X",
    phoneLabel: "PHONE NUMBER:",
    emailLabel: "EMAIL ADDRESS:",
    sosLabel: "EMERGENCY (SOS) NUMBER:"
  }
};

export default function PublicTrackerView({ code }) {
  const [lang, setLang] = useState('hu');
  const t = translations[lang];

  const [tracker, setTracker] = useState(null);
  const [owner, setOwner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [locationSent, setLocationSent] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendSilentLog = useCallback(async (trackerId) => {
    if (!navigator.geolocation) return;
    const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        if (!latitude || !longitude || (latitude === 0 && longitude === 0)) return;
        
        await axios.post('https://oovoo-backend.onrender.com/api/logs/log-public', {
          trackerId: trackerId.toString(),
          lat: Number(latitude),
          lng: Number(longitude),
          device: navigator.userAgent
        });
        
        setLocationSent(true);
        toast.success("Helyzet rögzítve! 📍");
      } catch (e) { console.warn("Hiba a koordináták küldésekor:", e); }
    }, (err) => { console.warn("GPS hiba:", err.message); }, options);
  }, []);

  useEffect(() => {
    const initPage = async () => {
      try {
        const res = await axios.get(`https://oovoo-backend.onrender.com/api/public/tracker/${code}`);
        if (res.data && res.data.success) {
          const tData = res.data.tracker;
          // FONTOS: Mindig a valódi MongoDB _id-t használjuk a loghoz és chathoz
          const realDbId = tData?._id?.toString();
          
          if (tData) {
            setTracker(tData);
            setOwner(res.data.owner);
            if (realDbId) {
              sendSilentLog(realDbId);
              try {
                const msgRes = await axios.get(`https://oovoo-backend.onrender.com/api/chat/${realDbId}`);
                setMessages(msgRes.data || []);
                setTimeout(scrollToBottom, 200);
              } catch (e) { console.warn("Üzenetek hiba"); }
            }
          }
        }
      } catch (err) { console.error("❌ Hálózati hiba:", err.message); }
      finally { setLoading(false); }
    };
    if (code) initPage();
  }, [code, sendSilentLog]);

  useEffect(() => {
    if (!tracker?._id) return;
    const newSocket = io('https://oovoo-backend.onrender.com', { transports: ['websocket', 'polling'], withCredentials: true });
    newSocket.on('connect', () => { newSocket.emit('join_chat', tracker._id); });
    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
      setTimeout(scrollToBottom, 100);
    });
    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [tracker?._id]);

  const handleSend = async () => {
    if (!inputText.trim() || !tracker?._id) return;
    const msgData = { trackerId: tracker._id, senderId: "Finder", senderType: 'finder', message: inputText };
    try {
      setInputText("");
      await axios.post('https://oovoo-backend.onrender.com/api/chat/send', msgData);
    } catch (err) { toast.error("Hiba küldéskor"); }
  };

  if (loading) return (
    <div className="h-screen bg-[#FBFDFF] flex items-center justify-center font-black text-emerald-600 uppercase tracking-widest text-sm animate-pulse">
      {t.loading}
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FBFDFF] text-slate-900 p-6 flex flex-col animate-in fade-in duration-700">
      
      {/* NYELVVÁLTÓ */}
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={() => setLang('hu')} className={`text-[10px] font-black px-3 py-1 rounded-full border transition-all ${lang === 'hu' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}>HU</button>
        <button onClick={() => setLang('en')} className={`text-[10px] font-black px-3 py-1 rounded-full border transition-all ${lang === 'en' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}>EN</button>
      </div>

      {/* FEJLÉC */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-6">
          <div className="text-6xl bg-white w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-sm border border-emerald-50 relative z-10">
            {tracker?.icon || '📍'}
          </div>
          <div className="absolute inset-0 bg-emerald-100 blur-2xl rounded-full opacity-40 animate-pulse"></div>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">{tracker?.name}</h1>
        <div className="mt-2">
            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-colors duration-500 ${locationSent ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
              {locationSent ? t.gpsSuccess : t.gpsSearching}
            </span>
        </div>

        {/* --- ADATOK KÁRTYÁKRA BONTVA --- */}
        <div className="mt-8 space-y-4">
          {/* BIO KÁRTYA */}
          <div className="px-6 py-6 bg-emerald-50/40 rounded-[2rem] border border-emerald-100 shadow-sm animate-in slide-in-from-top-4">
            <p className="text-emerald-700 text-xs font-black leading-relaxed italic uppercase tracking-wider">
              "{owner?.bio || t.helpMe}"
            </p>
          </div>

          {/* SOS SZÁM KÁRTYA - Fixálva: animate-bounce törölve */}
          {owner?.emergencyPhone && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex flex-col items-center gap-3 shadow-lg shadow-red-50/50">
              <span className="text-[10px] font-black text-red-500 tracking-[0.2em] uppercase">{t.sosLabel}</span>
              <span className="text-2xl font-black text-red-700 tracking-tighter">{owner.emergencyPhone}</span>
              <a href={`tel:${owner.emergencyPhone}`} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all">
                {t.emergency}
              </a>
            </div>
          )}

          {/* TELEFON KÁRTYA */}
          {tracker?.permissions?.showPhone && owner?.phone && (
            <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col items-center gap-2 shadow-sm hover:border-emerald-200 transition-colors">
              <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">{t.phoneLabel}</span>
              <a href={`tel:${owner.phone}`} className="text-xl font-black text-slate-800 hover:text-emerald-600 transition-colors tracking-tight">
                {owner.phone}
              </a>
            </div>
          )}

          {/* EMAIL KÁRTYA */}
          {tracker?.permissions?.showEmail && owner?.email && (
            <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex flex-col items-center gap-2 shadow-sm hover:border-emerald-200 transition-colors">
              <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">{t.emailLabel}</span>
              <a href={`mailto:${owner.email}`} className="text-sm font-black text-slate-800 break-all underline decoration-emerald-200 underline-offset-4">
                {owner.email}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* CHAT RÉSZLEG */}
      {tracker?.permissions?.allowChat && (
        <div className="mt-4 flex flex-col flex-1">
          {!chatOpen ? (
            <button 
              onClick={() => setChatOpen(true)}
              className="mt-2 bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-slate-200 active:scale-95 transition-all animate-in slide-in-from-bottom-6"
            >
              {t.openChat}
            </button>
          ) : (
            <div className="flex-1 flex flex-col animate-in slide-in-from-bottom-8 duration-500 min-h-0">
              <div className="flex justify-between items-center mb-4 px-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">oooVooo Live Chat</span>
                <button 
                  onClick={() => setChatOpen(false)} 
                  className="bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl border border-red-100 active:scale-90 transition-all"
                >
                  {t.closeChat}
                </button>
              </div>

              <div className="flex-1 bg-white border border-emerald-50 rounded-[2.5rem] p-6 mb-4 overflow-y-auto shadow-sm flex flex-col space-y-4 custom-scrollbar">
                {messages.map((m, i) => {
                  const isMe = m.senderType === 'finder';
                  return (
                    <div key={m._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                        isMe 
                          ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-100' 
                          : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                      }`}>
                        {m.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2 pb-6">
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.msgPlaceholder}
                  className="flex-1 bg-white border border-emerald-50 rounded-2xl px-6 py-5 outline-none focus:border-emerald-200 transition-all font-bold text-sm text-slate-700 shadow-sm"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-100 active:scale-95 transition-all disabled:opacity-30"
                >
                  {t.send}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-[9px] text-slate-300 text-center font-black uppercase tracking-[0.3em] py-6 mt-auto">
        oooVooo Secure Chat Protocol Active
      </div>
    </div>
  );
}