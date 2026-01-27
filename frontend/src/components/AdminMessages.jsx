import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const stored = localStorage.getItem('oooVooo_user');
      const token = JSON.parse(stored)?.token;
      
      const res = await axios.get('https://oovoo-backend.onrender.com/api/contact/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Hiba az üzenetek lekérésekor:", err);
      toast.error("Nem sikerült betölteni az üzeneteket");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const stored = localStorage.getItem('oooVooo_user');
      const token = JSON.parse(stored)?.token;
      
      await axios.patch(`https://oovoo-backend.onrender.com/api/contact/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => prev.map(m => m._id === id ? { ...m, status: 'read' } : m));
    } catch (err) {
      console.error("Hiba az állapot frissítésekor:", err);
    }
  };

  const deleteMsg = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Biztosan törölni akarod ezt az üzenetet?")) return;
    
    try {
      const stored = localStorage.getItem('oooVooo_user');
      const token = JSON.parse(stored)?.token;
      
      await axios.delete(`https://oovoo-backend.onrender.com/api/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => prev.filter(m => m._id !== id));
      toast.success("Üzenet törölve");
    } catch (err) {
      toast.error("Hiba a törlés során");
    }
  };

  if (loading) return (
    <div className="py-20 text-center text-emerald-600 animate-pulse font-bold uppercase tracking-[0.2em] text-xs">
      Üzenetek betöltése...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center mb-6 px-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Beérkezett megkeresések ({messages.length})
        </h3>
        <button 
          onClick={fetchMessages} 
          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition-colors"
        >
          Frissítés
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-emerald-50 rounded-[2.5rem] bg-white/50">
          <p className="italic uppercase text-[10px] font-bold tracking-widest text-slate-300">Nincs beérkező üzenet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <div 
              key={msg._id} 
              onClick={() => msg.status !== 'read' && markAsRead(msg._id)}
              className={`group relative bg-white border rounded-[2.5rem] transition-all duration-300 p-8 cursor-pointer shadow-sm hover:shadow-md ${
                msg.status !== 'read' 
                ? 'border-emerald-200 bg-emerald-50/20' 
                : 'border-slate-100 opacity-80'
              }`}
            >
              {/* Emerald jelző pötty */}
              {msg.status !== 'read' && (
                <div className="absolute top-6 right-8 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div>
                  <h4 className={`text-xl font-black tracking-tight transition-colors ${msg.status !== 'read' ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {msg.name}
                  </h4>
                  <p className="text-xs text-emerald-600 font-bold opacity-70 tracking-wide uppercase mt-1">{msg.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                    {new Date(msg.createdAt).toLocaleString('hu-HU')}
                  </span>
                </div>
              </div>
              
              <div className={`p-6 rounded-[1.5rem] text-sm leading-relaxed font-medium transition-all ${
                msg.status !== 'read' 
                ? 'bg-white border border-emerald-100 text-slate-700 shadow-inner' 
                : 'bg-slate-50 text-slate-500 border border-transparent'
              }`}>
                {msg.message}
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  onClick={(e) => deleteMsg(msg._id, e)}
                  className="text-[10px] text-red-400 hover:text-red-600 font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-300 px-4 py-2 hover:bg-red-50 rounded-full"
                >
                  Üzenet törlése
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}