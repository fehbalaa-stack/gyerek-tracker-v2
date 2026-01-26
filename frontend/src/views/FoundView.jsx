import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function FoundView() {
  const { trackerId } = useParams();
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');
  const [isSent, setIsSent] = useState(false);

  const sendMessage = async () => {
    if (!msg.trim()) return toast.error("Írj valamit az üzenetbe!");

    try {
      await axios.post('https://oovoo-beta1.onrender.com/api/chat/send', {
        trackerId,
        senderId: name || "Névtelen Megtaláló",
        senderType: 'finder',
        message: msg
      });
      setIsSent(true);
      toast.success("Üzenet elküldve a tulajdonosnak!");
    } catch (err) {
      toast.error("Hiba a küldés során.");
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-[#FBFDFF] flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-emerald-50 p-12 rounded-[3rem] shadow-sm max-w-sm w-full animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 mx-auto text-4xl shadow-inner">
            💚
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Köszönjük a segítséget!</h2>
          <p className="text-slate-400 text-sm mt-3 font-medium leading-relaxed">A tulajdonost értesítettük az üzenetedről. Hamarosan jelentkezni fog.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFDFF] p-6 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
      <div className="bg-white border border-emerald-50 p-10 rounded-[3rem] w-full max-w-md shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">
             oooVooo<span className="text-emerald-500">.</span>
          </div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Found Protocol</p>
        </div>

        <h2 className="text-2xl font-black text-slate-800 text-center tracking-tight mb-8">Találtál valamit?</h2>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Neved (opcionális)</label>
            <input 
              type="text" 
              placeholder="Hogy hívnak?" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 text-center outline-none focus:border-emerald-200 focus:bg-white font-bold transition-all placeholder:text-slate-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Üzenet a tulajdonosnak</label>
             <textarea 
              placeholder="Pl: Megtaláltam a táskát a Deák téren, nálam biztonságban van!" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 text-sm h-40 outline-none focus:border-emerald-200 focus:bg-white transition-all resize-none font-medium placeholder:text-slate-300"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
          </div>

          <button 
            onClick={sendMessage}
            className="w-full bg-emerald-600 text-white font-black py-5 rounded-[1.8rem] uppercase tracking-widest text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all mt-4"
          >
            Üzenet küldése
          </button>
        </div>
      </div>
      <p className="text-slate-300 text-[10px] uppercase tracking-[0.3em] font-black">Secure Recovery System</p>
    </div>
  );
}