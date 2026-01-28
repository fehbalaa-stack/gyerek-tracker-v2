import React from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';

export const Navigation = ({ isAdmin, isPremium, setMode, currentMode, cartCount }) => {
    const { logout, language, user, updateGlobalLanguage } = useAuth();

    const currentLang = language || user?.language || 'hu';
    const t = translations[currentLang] || translations.hu;

    // Reszponzív osztályok a linkekhez
    const navLinkClass = (mode) => `
        px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl transition-all duration-300 font-black uppercase text-[9px] md:text-[10px] tracking-[0.1em] whitespace-nowrap
        ${currentMode === mode 
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}
    `;

    return (
        <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-emerald-50 sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-6">
                
                {/* FELSŐ SOR: Logo és Jobb oldali gombok */}
                <div className="h-16 md:h-20 flex items-center justify-between">
                    
                    {/* 1. LOGO */}
                    <div 
                        className="group flex items-center gap-3 cursor-pointer flex-shrink-0"
                        onClick={() => setMode('dashboard')}
                    >
                        <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
                            oooVooo<span className="text-emerald-500 font-black">.</span>
                        </div>
                    </div>

                    {/* 2. ASZTALI MENÜ (Középen, csak md méret felett) */}
                    <div className="hidden md:flex items-center gap-1.5 bg-slate-50/50 p-1.5 rounded-[1.5rem] border border-slate-100">
                        <button onClick={() => setMode('dashboard')} className={navLinkClass('dashboard')}>{t.navHome}</button>
                        <button onClick={() => setMode('map')} className={navLinkClass('map')}>{t.navMap}</button>
                        <button onClick={() => setMode('chat')} className={navLinkClass('chat')}>{t.navChat}</button>
                        <button onClick={() => setMode('webshop')} className={navLinkClass('webshop')}>{t.navShop}</button>
                        
                        {isAdmin && (
                            <button onClick={() => setMode('admin')} className="px-4 py-2.5 rounded-2xl font-black uppercase text-[10px] bg-rose-50 text-rose-500 border border-rose-100">🛡️</button>
                        )}
                    </div>

                    {/* 3. FUNKCIÓK (Mindig látható jobb oldal) */}
                    <div className="flex items-center gap-2 md:gap-3">
                        
                        {/* Nyelvválasztó (mobilon elrejtve a helytakarékosság miatt) */}
                        <div className="hidden lg:flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 mr-2">
                            {['hu', 'en'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => updateGlobalLanguage(lang)}
                                    className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${currentLang === lang ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-300'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1.5 md:gap-2 md:pl-2 md:border-l border-slate-100">
                            {/* Kosár */}
                            <button onClick={() => setMode('cart')} className={`relative w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center border transition-all ${currentMode === 'cart' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border-slate-100'}`}>
                                <span className="text-base md:text-lg">🛒</span>
                                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
                            </button>

                            {/* Beállítások */}
                            <button onClick={() => setMode('settings')} className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center border transition-all ${currentMode === 'settings' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border-slate-100'}`}>
                                <span className="text-base md:text-lg">👤</span>
                            </button>

                            {/* Kijelentkezés */}
                            <button onClick={logout} className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center bg-rose-50 text-rose-500 border border-rose-100">
                                <span className="text-base md:text-lg">🚪</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* MOBIL MENÜSÁV (Csak md alatt látszik) */}
                <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-1 px-1">
                    <button onClick={() => setMode('dashboard')} className={navLinkClass('dashboard')}>{t.navHome}</button>
                    <button onClick={() => setMode('map')} className={navLinkClass('map')}>{t.navMap}</button>
                    <button onClick={() => setMode('chat')} className={navLinkClass('chat')}>{t.navChat}</button>
                    <button onClick={() => setMode('webshop')} className={navLinkClass('webshop')}>{t.navShop}</button>
                    {isAdmin && (
                        <button onClick={() => setMode('admin')} className="px-4 py-2 rounded-xl font-black uppercase text-[9px] bg-rose-50 text-rose-500 border border-rose-100 whitespace-nowrap">Admin</button>
                    )}
                </div>

            </div>
        </nav>
    );
};