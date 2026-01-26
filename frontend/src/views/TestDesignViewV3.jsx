import React, { useState } from 'react';
import { SoftParentBackground } from '../components/SoftParentBackground';
import { motion } from 'framer-motion';

// Külön komponens a Flip kártyának
function TrackerCard({ name, icon, lastSeen }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-40 perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* ELŐLAP: Tiszta szülői nézet */}
        <div className="absolute inset-0 backface-hidden bg-white border border-slate-100 shadow-sm rounded-[2rem] p-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{name}</h3>
            <p className="text-sm text-emerald-500 font-medium">Biztonságban</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{lastSeen}</p>
          </div>
        </div>

        {/* HÁTLAP: A QR "villanás" */}
        <div 
          className="absolute inset-0 backface-hidden bg-slate-900 rounded-[2rem] flex items-center justify-center p-6"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="w-20 h-20 bg-white p-1.5 rounded-lg shadow-lg shadow-emerald-500/20">
            {/* Itt egy generált QR helykitöltő */}
            <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=oooVooo')] bg-cover opacity-90" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function TestDesignViewV3({ setMode }) {
  return (
    <div className="relative min-h-screen w-full font-sans text-slate-700 overflow-x-hidden">
      <SoftParentBackground />

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Szia, Anya!</h1>
          <p className="text-slate-500">Itt vannak a fontos dolgok egy helyen.</p>
        </header>

        {/* Táblázatos (Grid) elrendezés */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrackerCard name="Bence" icon="👦" lastSeen="Iskola • 2 perce" />
          <TrackerCard name="Luca" icon="👧" lastSeen="Otthon • Most" />
          
          {/* Új hozzáadása gomb kártya stílusban */}
          <button className="h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-white hover:border-emerald-300 transition-all group">
            <span className="text-2xl group-hover:scale-125 transition-transform">+</span>
            <span className="text-xs font-bold uppercase tracking-widest">Új eszköz</span>
          </button>
        </div>

        <button 
          onClick={() => setMode('dashboard')}
className="mt-12 w-full max-w-xs mx-auto block bg-emerald-600 text-white py-4 rounded-[2rem] font-bold shadow-lg shadow-emerald-200/50 hover:bg-emerald-700 active:scale-95 transition-all text-center tracking-wide"        >
          Vissza
        </button>
      </main>
    </div>
  );
}