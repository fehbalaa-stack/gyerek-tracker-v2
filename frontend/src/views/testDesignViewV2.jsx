import React from 'react';
import { CleanBackground } from '../components/CleanBackground';
import { motion } from 'framer-motion';

export default function TestDesignViewV2({ setMode }) {
  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans selection:bg-emerald-500/30">
      <CleanBackground />

      <main className="relative z-50 max-w-5xl mx-auto px-6 py-20">
        <header className="mb-12">
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-emerald-400 font-mono text-xs tracking-[0.5em] uppercase mb-2"
          >
            oooVooo / Prototype V2
          </motion.p>
          <h1 className="text-5xl font-light tracking-tight">
            Letisztult <span className="font-bold">Rendszer</span>
          </h1>
        </header>

        {/* Bento Grid elrendezés teszt */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 h-64 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/[0.05] transition-colors">
             <h3 className="text-xl font-semibold mb-2">Fő Tracker Állapot</h3>
             <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                <motion.div animate={{ width: "75%" }} transition={{ duration: 2 }} className="h-full bg-emerald-500" />
             </div>
          </div>
          
          <div className="col-span-4 h-64 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex flex-col justify-between">
             <div className="text-4xl">🛰️</div>
             <button onClick={() => setMode('dashboard')} className="text-sm font-bold uppercase tracking-widest text-emerald-400">Vissza</button>
          </div>

          <div className="col-span-4 h-48 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <p className="text-white/40 text-xs uppercase mb-4">Aktív Kapcsolat</p>
            <div className="text-2xl font-mono">STABLE</div>
          </div>
          
          <div className="col-span-8 h-48 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <p className="text-white/40 text-xs uppercase mb-4">Rendszerüzenet</p>
            <p className="text-sm text-white/80 italic">"Minden rendszer optimálisan működik a Mac-en."</p>
          </div>
        </div>
      </main>
    </div>
  );
}