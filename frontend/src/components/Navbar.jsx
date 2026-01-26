import React from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';

const Navbar = ({ setMode, currentMode, cartCount }) => {
    const { user, logout, language, updateGlobalLanguage } = useAuth(); 

    if (!user) return null;

    const t = translations[language] || translations.hu;

    return (
        <nav className="flex flex-col gap-4 mb-8 sticky top-4 z-[100] mx-auto max-w-7xl w-full">
            <div className="flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-xl rounded-[2rem] border border-emerald-50 shadow-sm shadow-emerald-900/5">
                
                {/* 1. LOGO & NYELV */}
                <div className="flex items-center gap-6">
                    <div 
                        className="text-2xl font-black text-slate-900 cursor-pointer tracking-tighter hover:scale-105 transition-transform"
                        onClick={() => setMode('dashboard')}
                    >
                        oooVooo<span className="text-emerald-500 font-black">.</span>
                    </div>

                    <div className="hidden lg:flex gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {['hu', 'en', 'de'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => updateGlobalLanguage(lang)}
                                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all duration-300 ${
                                    language === lang 
                                    ? 'bg-white text-emerald-600 shadow-sm' 
                                    : 'text-slate-300 hover:text-slate-500'
                                }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* 2. FŐ MENÜPONTOK */}
                <div className="hidden md:flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100">
                    {[
                        { id: 'dashboard', label: t.navHome, icon: '🏠' },
                        { id: 'map', label: t.navMap, icon: '📍' },
                        { id: 'chat', label: t.navChat, icon: '💬' },
                        { id: 'webshop', label: t.navShop, icon: '🛍️' },
                    ].map((item) => (
                        <button 
                            key={item.id}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                                currentMode === item.id 
                                    ? 'bg-white text-emerald-600 shadow-sm border border-emerald-50' 
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-white/50'
                            }`} 
                            onClick={() => setMode(item.id)}
                        >
                            <span className="text-sm">{item.icon}</span>
                            <span className="hidden lg:inline">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* 3. FUNKCIÓK (Kosár, Profil, Logout) */}
                <div className="flex items-center gap-3">
                    
                    {/* Kosár számlálóval */}
                    <button 
                        onClick={() => setMode('cart')}
                        className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                            currentMode === 'cart' 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                            : 'bg-white border border-emerald-50 text-slate-400 hover:border-emerald-200 shadow-sm'
                        }`}
                    >
                        <span className="text-lg">🛒</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* Admin Panel */}
                    {user?.role === 'admin' && (
                        <button 
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                                currentMode === 'admin' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'
                            }`} 
                            onClick={() => setMode('admin')}
                            title="Admin Panel"
                        >
                            <span className="text-lg">🛡️</span>
                        </button>
                    )}

                    {/* Profil / Settings */}
                    <button 
                        onClick={() => setMode('settings')}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                            currentMode === 'settings' 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                            : 'bg-white border border-emerald-50 text-slate-400 hover:border-emerald-200 shadow-sm'
                        }`}
                        title={t.navSettings}
                    >
                        <span className="text-lg">👤</span>
                    </button>

                    {/* Logout */}
                    <button 
                        className="w-11 h-11 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all duration-300 group shadow-sm shadow-rose-100"
                        onClick={() => {
                            setMode('dashboard');
                            logout();
                        }}
                    >
                        <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;