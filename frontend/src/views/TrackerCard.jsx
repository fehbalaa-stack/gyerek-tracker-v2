import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function TrackerCard({ tracker }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // 3. PONT: Sablon meghatározása (Tiszta QR sablon emoji nélkül)
  const qrStylePath = `/schemes/${tracker.qrStyle || 'classic'}.png`;

  // Profil adatok ellenőrzése (szinkronban a ProfileView-val)
  const missingName = !tracker.owner?.name;
  const missingPhone = !tracker.owner?.phoneNumber;
  const isMissingSomething = missingName || missingPhone;

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
        {/* ELŐLAP - Tiszta QR Preview */}
        <div className="absolute inset-0 backface-hidden bg-white border border-emerald-50 shadow-sm rounded-[2.5rem] p-6 flex items-center gap-5 transition-colors group-hover:border-emerald-100 overflow-hidden">
          
          {/* QR PREVIEW (EMOJI NÉLKÜL) */}
          <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
            <img 
              src={qrStylePath} 
              alt="QR Template" 
              className="absolute inset-0 w-full h-full object-contain p-2"
              onError={(e) => e.target.src = '/schemes/classic.png'} 
            />
            {/* Itt már nincs ott az emoji! */}
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
               <span className="text-xl">{tracker.icon || "📍"}</span>
               <h3 className="font-black text-lg text-slate-800 tracking-tight truncate">{tracker.name}</h3>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${isMissingSomething ? 'bg-amber-400' : 'bg-emerald-500 shadow-emerald-500/50'}`}></span>
              <p className={`text-[9px] font-black tracking-[0.1em] uppercase ${isMissingSomething ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isMissingSomething ? 'Beállítás szükséges' : 'Biztonságban'}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-0.5">
               <span className="text-[8px] text-slate-300 font-black uppercase tracking-widest italic">Kód:</span>
               <span className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-widest">
                 {tracker.uniqueCode}
               </span>
            </div>
          </div>
        </div>

        {/* HÁTLAP - Gyors állapot és adatok */}
        <div 
          className="absolute inset-0 backface-hidden bg-slate-900 border border-emerald-400/30 rounded-[2.5rem] flex flex-col items-center justify-center p-6 shadow-xl"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="bg-white p-2 rounded-xl shadow-lg relative">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://oovoo-backend.onrender.com/scan/${tracker.uniqueCode}`}
                alt="QR"
                className="w-full h-full object-cover mix-blend-multiply"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-1">
            {isMissingSomething ? (
              <Link 
                to="/profile" 
                onClick={(e) => e.stopPropagation()}
                className="text-[9px] text-red-500 font-black uppercase bg-red-500/10 px-3 py-1 rounded-full animate-pulse border border-red-500/20"
              >
                Hiányzó profil adatok ↗
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">
                  Aktív és látható
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-[10px] text-white/40 font-bold tracking-tighter uppercase italic">
              oooVooo System v2
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}