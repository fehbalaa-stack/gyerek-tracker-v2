import React from 'react';

export function NavigationLight({ setMode, currentMode }) {
  const menuItems = [
    { id: 'dashboard', label: 'Áttekintés', icon: '🏠' },
    { id: 'map', label: 'Térkép', icon: '📍' },
    { id: 'settings', label: 'Profil', icon: '👤' },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-emerald-50 px-6 py-4 shadow-sm shadow-emerald-900/5">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Logo - Az oooVooo brand emerald hangsúlyal */}
        <div 
          onClick={() => setMode('dashboard')}
          className="text-2xl font-black text-slate-900 cursor-pointer tracking-tighter hover:opacity-80 transition-opacity"
        >
          oooVooo<span className="text-emerald-500 font-black">.</span>
        </div>

        {/* Menüpontok - Puha emerald kiemeléssel */}
        <div className="flex gap-1 sm:gap-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center ${
                currentMode === item.id 
                  ? 'bg-emerald-100/50 text-emerald-700 shadow-sm shadow-emerald-100' 
                  : 'text-slate-400 hover:bg-emerald-50/50 hover:text-emerald-600'
              }`}
            >
              <span className="mr-2 text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}