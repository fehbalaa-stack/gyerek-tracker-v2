import React from 'react';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';

export const Navigation = ({ isAdmin, isPremium, setMode, currentMode, cartCount }) => {
    const { logout, language, user, updateGlobalLanguage } = useAuth();

    const currentLang = language || user?.language || 'hu';
    const t = translations[currentLang] || translations.hu;

    const navLinkClass = (mode) => `
        px-5 py-2.5 rounded-2xl transition-all duration-300 font-black uppercase text-[10px] tracking-[0.1em]
        ${currentMode === mode 
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}
    `;

    return (
        <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-emerald-50 sticky top-0 z-50">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                
                {/* 1. LOGO SZAKASZ */}
                <div 
                    className="group flex items-center gap-3 cursor-pointer"
                    onClick={() => setMode('dashboard')}
                >
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">
                        oooVooo<span className="text-emerald-500 font-black">.</span>
                    </div>
                </div>

                {/* 2. MENÜPONTOK */}
                <div className="hidden md:flex items-center gap-1.5 bg-slate-50/50 p-1.5 rounded-[1.5rem] border border-slate-100">
                    <button onClick={() => setMode('dashboard')} className={navLinkClass('dashboard')}>
                        {t.navHome}
                    </button>
                    <button onClick={() => setMode('map')} className={navLinkClass('map')}>
                        {t.navMap}
                    </button>
                    <button onClick={() => setMode('chat')} className={navLinkClass('chat')}>
                        {t.navChat}
                    </button>
                    <button onClick={() => setMode('webshop')} className={navLinkClass('webshop')}>
                        {t.navShop}
                    </button>
                    
                    {isAdmin && (
                        <>
                            <div className="w-px h-6 bg-slate-200 mx-1"></div>
                            <button 
                                onClick={() => setMode('admin-orders')} 
                                className={`px-5 py-2.5 rounded-2xl transition-all duration-300 font-black uppercase text-[10px] tracking-[0.1em]
                                    ${currentMode === 'admin-orders' 
                                        ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' 
                                        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}
                            >
                                📦 {language === 'hu' ? 'Rendelések' : 'Orders'}
                            </button>
                            
                            <button 
                                onClick={() => setMode('admin')} 
                                className="px-5 py-2.5 rounded-2xl transition-all duration-300 font-black uppercase text-[10px] tracking-[0.1em] bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white"
                            >
                                🛡️ {t.navAdmin}
                            </button>
                        </>
                    )}
                </div>

                {/* 3. FUNKCIÓK & NYELVVÁLASZTÓ (Jobb oldal) */}
                <div className="flex items-center gap-3">
                    
                    {/* NYELVVÁLASZTÓ - Most már a jobb oldalon */}
                    <div className="hidden lg:flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 mr-2">
                        {['hu', 'en', 'de'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => updateGlobalLanguage(lang)}
                                className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all duration-300 ${
                                    currentLang === lang 
                                    ? 'bg-white text-emerald-600 shadow-sm' 
                                    : 'text-slate-300 hover:text-slate-500'
                                }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
                        {/* 🛒 KOSÁR */}
                        <button 
                            onClick={() => setMode('cart')} 
                            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-300 
                                ${currentMode === 'cart' 
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                                    : 'border-slate-100 bg-white text-slate-400 hover:border-emerald-200'}`}
                        >
                            <span className="text-lg">🛒</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-in zoom-in">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* PRÉMIUM JELZŐ */}
                        {isPremium && (
                            <div className="hidden lg:flex items-center h-11 bg-emerald-50 text-emerald-600 px-4 rounded-2xl border border-emerald-100 font-black text-[9px] tracking-widest uppercase shadow-sm">
                                PREMIUM
                            </div>
                        )}
                        
                        {/* BEÁLLÍTÁSOK / PROFIL */}
                        <button 
                            onClick={() => setMode('settings')} 
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-300 
                                ${currentMode === 'settings' 
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                                    : 'border-slate-100 bg-white text-slate-400 hover:border-emerald-200'}`}
                        >
                            <span className="text-lg">👤</span>
                        </button>

                        {/* KIJELENTKEZÉS */}
                        <button 
                            onClick={logout}
                            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm shadow-rose-100 group"
                        >
                            <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};