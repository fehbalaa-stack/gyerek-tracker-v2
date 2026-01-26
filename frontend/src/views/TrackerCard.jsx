import { useState } from "react";
import { motion } from "framer-motion";

export function TrackerCard({ tracker }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // 3. PONT: Sablon meghatározása
  const qrStylePath = `/schemes/${tracker.qrStyle || 'classic'}.png`;

  // Jogosultság ellenőrzése: ha nincs telefon, insta és facebook sem, akkor hiányzik az adat
  const missingData = !tracker.owner?.phone && !tracker.owner?.phoneNumber && !tracker.owner?.instagram && !tracker.owner?.facebook;

  return (
    <div 
      className="relative w-full h-[180px] perspective-1000 cursor-pointer group"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.8, 
          type: "spring", 
          stiffness: 60,  
          damping: 15     
        }}
      >
        {/* ELŐLAP */}
        <div className="absolute inset-0 backface-hidden bg-white border border-emerald-50 shadow-sm rounded-[2.5rem] p-6 flex items-center gap-5 transition-colors group-hover:border-emerald-100">
          <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
            <img 
              src={qrStylePath} 
              alt="QR Template" 
              className="absolute inset-0 w-full h-full object-contain z-10"
              onError={(e) => e.target.src = '/schemes/classic.png'} 
            />
            <div className="text-3xl z-20 bg-white/80 rounded-full p-1 backdrop-blur-sm">
              {tracker.icon || "👦"}
            </div>
            <div className="absolute inset-4 opacity-10 bg-[url('https://www.qr-code-generator.com/wp-content/themes/qr/new_structure/markets/core_market/generator/dist/generator/assets/images/static/qr-example.png')] bg-cover"></div>
          </div>

          <div className="flex-1 overflow-hidden">
            <h3 className="font-black text-xl text-slate-800 tracking-tight truncate">{tracker.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <p className="text-[10px] text-emerald-600 font-black tracking-[0.1em] uppercase">
                Biztonságban
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-0.5">
               <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest italic">Utoljára látható:</span>
               <span className="text-[10px] text-slate-500 font-bold uppercase truncate">
                 {tracker.lastSeen || "Iskola • Most"}
               </span>
            </div>
          </div>
        </div>

        {/* HÁTLAP */}
        <div 
          className="absolute inset-0 backface-hidden bg-slate-900 border border-emerald-400/30 rounded-[2.5rem] flex flex-col items-center justify-center p-6 shadow-xl"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="bg-white p-3 rounded-2xl shadow-lg shadow-emerald-900/40 relative group-hover:scale-110 transition-transform duration-700">
            <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://oovoo-beta1.onrender.com/scan/${tracker.uniqueCode}`}
                alt="QR"
                className="w-full h-full object-cover mix-blend-multiply opacity-80"
              />
            </div>
          </div>

          {/* JOGOSULTSÁG CHECKBOX ÉS FIGYELMEZTETÉS */}
          <div className="mt-4 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                checked={tracker.status === 'active'}
                disabled={missingData}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 disabled:opacity-20"
                onClick={(e) => e.stopPropagation()}
                readOnly
              />
              <label className="text-[9px] text-white/70 font-black uppercase tracking-widest">
                Aktív állapot
              </label>
            </div>
            {missingData && (
              <span className="text-[8px] text-red-500 font-black uppercase animate-pulse">
                Hiányzó adatok ↗
              </span>
            )}
          </div>
          
          <div className="mt-2 text-center">
            <p className="text-[9px] text-emerald-400 font-black tracking-[0.3em] uppercase mb-1">
              Verified Tracker
            </p>
            <p className="text-[10px] text-white/40 font-bold tracking-tighter uppercase italic">
              ID: {tracker.uniqueCode || "000-000"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}