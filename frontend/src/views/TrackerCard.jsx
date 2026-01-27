import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function TrackerCard({ tracker }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Sablon útvonala
  const qrStylePath = `/schemes/${tracker.qrStyle || 'classic'}.png`;

  // Profil ellenőrzés
  const isMissingSomething = !tracker.owner?.name || !tracker.owner?.phoneNumber;

  return (
    <div 
      className="relative w-full h-[180px] perspective-1000 cursor-pointer group"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 60, damping: 15 }}
      >
        {/* ELŐLAP */}
        <div className="absolute inset-0 backface-hidden bg-white border border-emerald-50 shadow-sm rounded-[2.5rem] p-6 flex items-center gap-5 overflow-hidden">
          
          {/* TISZTA QR DOBOZ - GARANTÁLTAN EMOJI NÉLKÜL */}
          <div className="relative w-24 h-24 flex-shrink-0 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden">
            <img 
              src={qrStylePath} 
              alt="" 
              className="w-full h-full object-contain p-2 relative z-10" // z-10 hogy minden felett legyen
              onError={(e) => e.target.src = '/schemes/classic.png'} 
            />
            {/* Ez a réteg biztosítja, hogy semmilyen háttér-emoji ne látsszon át */}
            <div className="absolute inset-0 bg-slate-50 z-0"></div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
               {/* AZ EMOJI CSAK ITT SZABAD, HOGY LEGYEN! */}
               <span className="text-xl shrink-0">{tracker.icon || "📍"}</span>
               <h3 className="font-black text-lg text-slate-800 tracking-tight truncate">{tracker.name}</h3>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isMissingSomething ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span>
              <p className={`text-[9px] font-black tracking-[0.1em] uppercase ${isMissingSomething ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isMissingSomething ? 'Beállítás szükséges' : 'Biztonságban'}
              </p>
            </div>

            <div className="mt-4">
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                 {tracker.uniqueCode}
               </span>
            </div>
          </div>
        </div>

        {/* HÁTLAP */}
        <div 
          className="absolute inset-0 backface-hidden bg-slate-900 border border-emerald-400/30 rounded-[2.5rem] flex flex-col items-center justify-center p-6 shadow-xl"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://oovoo-backend.onrender.com/scan/${tracker.uniqueCode}`}
                alt="QR"
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="mt-4">
            {isMissingSomething ? (
              <Link to="/profile" onClick={(e) => e.stopPropagation()} className="text-[9px] text-red-500 font-black uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                Adatpótlás ↗
              </Link>
            ) : (
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Aktív rendszer</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}