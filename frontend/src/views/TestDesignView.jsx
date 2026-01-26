import React from 'react';
import { AnimatedQRBackground } from '../components/AnimatedQRBackground';
import { motion } from 'framer-motion';

export default function TestDesignView() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-[#050505] overflow-hidden">
      
      {/* 1. RÉTEG: Az animált rács háttér */}
      <AnimatedQRBackground />

      {/* 2. RÉTEG: Teszt kártya neon pulzálással */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          // ✅ Senior tipp: Finom neon ragyogás pulzálása a kártya körül
          boxShadow: [
            "0 0 20px rgba(0, 255, 148, 0.1)",
            "0 0 40px rgba(0, 255, 148, 0.3)",
            "0 0 20px rgba(0, 255, 148, 0.1)"
          ]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatType: "reverse",
          ease: "easeInOut" 
        }}
        // Fontos: z-index 50, hogy a szkenner vonal felett legyen és lehessen kattintani
        className="relative z-50 bg-black/60 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] max-w-md w-full text-center shadow-2xl"
      >
        {/* Ikon konténer */}
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/40 shadow-glow-primary/20">
            <span className="text-3xl animate-pulse">🧪</span>
        </div>

        {/* Szöveges tartalom */}
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">
          oooVooo <span className="text-[#00ff94]">Design Lab</span>
        </h1>
        
        <div className="space-y-4 mb-10">
          <p className="text-white/70 text-sm font-medium leading-relaxed italic">
            "A technovura és a digitális esztétika találkozása."
          </p>
          <div className="h-[1px] w-12 bg-[#00ff94]/50 mx-auto" />
          <p className="text-white/40 text-[11px] uppercase tracking-[0.2em] font-bold">
            Live Background Test • v1.0
          </p>
        </div>

        {/* Interaktív gomb teszt */}
        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: "#00ff94", color: "#000" }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-transparent border-2 border-[#00ff94] text-[#00ff94] py-5 rounded-2xl text-[12px] font-bold uppercase tracking-[0.3em] italic transition-all shadow-lg"
        >
          Konfiguráció Mentése
        </motion.button>
        
        <p className="mt-6 text-white/20 text-[9px] uppercase tracking-widest font-black">
          Holnap élesítjük a társadnak 🚀
        </p>
      </motion.div>

      {/* 3. RÉTEG: Extra sötétítő réteg a sarkokban a mélységért */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-40" />
    </div>
  );
}