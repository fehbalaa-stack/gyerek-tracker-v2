import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Az általad küldött képek alapján frissített sémák
const SCHEMES = [
  { id: 'bear', name: 'Maci', img: '/schemes/bear.png' },
  { id: 'ladybug', name: 'Katica', img: '/schemes/ladybug.png' },
  { id: 'car', name: 'Autó', img: '/schemes/car.png' },
  { id: 'sun', name: 'Napocska', img: '/schemes/sun.png' },
  { id: 'mushroom', name: 'Gomba', img: '/schemes/mushroom.png' },
  { id: 'duck', name: 'Kacsa', img: '/schemes/duck.png' },
  { id: 'train', name: 'Vonat', img: '/schemes/train.png' },
  { id: 'butterfly', name: 'Pillangó', img: '/schemes/butterfly.png' },
  { id: 'apple', name: 'Alma', img: '/schemes/apple.png' },
  { id: 'ship', name: 'Hajó', img: '/schemes/ship.png' }
];

// A dizájnterv szerinti 4 főkategória
const CATEGORIES = [
  { id: 'car', label: 'JÁRMŰ', icon: '🚗' },
  { id: 'pet', label: 'KISÁLLAT', icon: '🐶' },
  { id: 'key', label: 'KULCSOK', icon: '🔑' },
  { id: 'bag', label: 'TÁSKA', icon: '🎒' }
];

export default function TrackerCreator({ onCreate }) {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState('car'); // Jármű, Kisállat, stb.
  const [selectedStyle, setSelectedStyle] = useState(SCHEMES[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Adj nevet az eszköznek!");
    
    // Az onCreate kapja meg az összes választott adatot
    const payload = {
      name: name.toUpperCase(),
      type: selectedType,
      qrStyle: selectedStyle.id,
      emoji: CATEGORIES.find(c => c.id === selectedType)?.icon || '❓'
    };

    await onCreate(payload);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 p-10 bg-[#0a0a0a] text-white rounded-[3.5rem] border border-primary/20 shadow-2xl relative overflow-hidden">
      
      {/* BAL OLDAL: KONFIGURÁCIÓ */}
      <div className="space-y-10">
        <header className="text-center lg:text-left">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            ESZKÖZ <span className="text-primary shadow-glow-primary/20">KONFIGURÁCIÓ</span>
          </h2>
        </header>

        {/* 1. TÍPUS KIVÁLASZTÁSA (Gombokkal, mint a képeden) */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 block italic text-center lg:text-left">1. TÍPUS KIVÁLASZTÁSA</label>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedType(cat.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 group ${
                  selectedType === cat.id 
                  ? 'border-primary bg-primary/5 shadow-glow-primary/10' 
                  : 'border-white/5 bg-white/5 hover:border-white/10'
                }`}
              >
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className={`text-[9px] font-black tracking-[0.2em] ${selectedType === cat.id ? 'text-primary' : 'text-gray-500'}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. QR VIZUALIZÁCIÓ (Lenyíló sémák) */}
        <div className="space-y-4 relative z-50">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 block italic text-center lg:text-left">2. QR VIZUALIZÁCIÓ</label>
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[11px] tracking-widest flex justify-between px-8 items-center hover:bg-white/10 transition-all group"
          >
            <span className="group-hover:text-primary transition-colors">Választott séma: <span className="text-primary italic ml-2">{selectedStyle.name}</span></span>
            <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}>▼</span>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute w-full overflow-hidden bg-[#151515] rounded-3xl mt-3 border border-primary/20 grid grid-cols-3 md:grid-cols-4 gap-3 p-4 shadow-3xl"
              >
                {SCHEMES.map(scheme => (
                  <button 
                    key={scheme.id}
                    type="button"
                    onClick={() => { setSelectedStyle(scheme); setIsOpen(false); }}
                    className={`cursor-pointer p-3 rounded-2xl border-2 transition-all group ${
                      selectedStyle.id === scheme.id ? 'border-primary bg-primary/10' : 'border-transparent bg-black/40 hover:border-white/10'
                    }`}
                  >
                    <img 
                      src={scheme.img} 
                      alt={scheme.name} 
                      className={`w-full aspect-square object-contain transition-all ${selectedStyle.id === scheme.id ? 'grayscale-0 scale-105' : 'grayscale opacity-40 group-hover:opacity-100'}`} 
                    />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NÉV MEGADÁSA */}
        <div className="pt-4">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ESZKÖZ NEVE (PL: KOCSIKULCS)"
            className="w-full bg-transparent border-b-2 border-primary/30 p-5 outline-none focus:border-primary font-black uppercase italic text-lg text-center tracking-tighter transition-all"
          />
        </div>

        <div className="flex gap-4">
            <button type="button" onClick={() => window.location.reload()} className="flex-1 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all italic">Mégse</button>
            <button 
                onClick={handleCreate}
                className="flex-[2] py-6 bg-primary text-black font-black uppercase tracking-[0.3em] rounded-[2rem] hover:shadow-glow-primary transition-all active:scale-95 text-[11px] italic"
            >
                PÁROSÍTÁS ÉS GENERÁLÁS
            </button>
        </div>
      </div>

      {/* JOBB OLDAL: ÉLŐ PREVIEW (Dizájn fókuszban) */}
      <div className="flex flex-col items-center justify-center bg-white/5 rounded-[3.5rem] border border-white/5 p-10 relative overflow-hidden min-h-[500px]">
        <div className="absolute top-8 left-10 text-[10px] font-black text-primary/30 uppercase tracking-[0.5em] italic">Live Preview</div>
        
        <div className="relative w-80 h-80 bg-white p-6 rounded-[3rem] shadow-2xl scale-100 transition-transform duration-700 hover:scale-105">
            {/* A választott séma */}
            <motion.img 
              key={selectedStyle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={selectedStyle.img} 
              className="w-full h-full object-contain" 
              alt="QR Mask" 
            />
            {/* Az aktuális kategória ikonja */}
            <motion.div 
              key={selectedType}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center text-7xl drop-shadow-2xl select-none"
            >
              {CATEGORIES.find(c => c.id === selectedType)?.icon}
            </motion.div>
        </div>

        <div className="mt-14 text-center space-y-2">
            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              {name || 'Eszköz Neve'}
            </h3>
            <div className="inline-block px-5 py-2 bg-primary/10 rounded-full border border-primary/10">
              <p className="text-[10px] text-primary font-black tracking-[0.5em] uppercase italic">ID: XXXXXXXX-X</p>
            </div>
        </div>
      </div>
    </div>
  );
}