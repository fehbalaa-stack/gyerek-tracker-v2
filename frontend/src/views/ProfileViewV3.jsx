import React from 'react';
import { motion } from 'framer-motion';

export default function ProfileViewV3({ user }) {
  // Ez csak a design prototípusa
  const languages = [
    { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Felhasználói kártya */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-emerald-50 flex items-center gap-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-emerald-200/50">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{user?.name || 'Felhasználó'}</h2>
            <p className="text-slate-500 font-medium">{user?.email || 'email@oooVooo.hu'}</p>
          </div>
        </div>

        {/* Nyelvválasztó szekció */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-emerald-50">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-2">Alkalmazás nyelve</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`flex items-center justify-between p-5 rounded-[1.8rem] border-2 transition-all duration-300 ${
                  lang.code === 'hu' 
                    ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-sm shadow-emerald-100' 
                    : 'border-slate-50 bg-slate-50/30 text-slate-400 hover:border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-bold tracking-tight">{lang.label}</span>
                </div>
                {lang.code === 'hu' && (
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[12px] text-white shadow-sm">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Egyéb beállítások */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-emerald-50 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Fiók kezelése</h3>
          
          <button className="w-full flex items-center justify-between p-5 bg-slate-50/50 rounded-[1.5rem] text-slate-600 font-bold hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-transparent hover:border-emerald-100">
            <div className="flex items-center gap-3">
              <span>🔐</span>
              <span>Jelszó módosítása</span>
            </div>
            <span className="opacity-30">→</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-5 bg-red-50/30 rounded-[1.5rem] text-red-500 font-bold hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
            <div className="flex items-center gap-3">
              <span>🚪</span>
              <span>Kijelentkezés</span>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}