import React from 'react';

export function FooterLight({ setMode }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-white border-t border-emerald-50 px-6 py-12 mt-auto">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start text-center md:text-left">
          
          {/* Brand oszlop */}
          <div className="space-y-4">
            <div className="text-xl font-black text-slate-900 tracking-tighter">
              oooVooo<span className="text-emerald-500">.</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Biztonság, amit érezhetsz. <br /> 
              Védett kapcsolat minden pillanatban.
            </p>
          </div>

          {/* Gyorslinkek oszlop */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2">Információ</h4>
            <button onClick={() => setMode('privacy')} className="text-sm text-slate-500 hover:text-emerald-600 transition-colors font-semibold">Adatvédelem</button>
            <button onClick={() => setMode('terms')} className="text-sm text-slate-500 hover:text-emerald-600 transition-colors font-semibold">ÁSZF</button>
            <button onClick={() => setMode('contact')} className="text-sm text-slate-500 hover:text-emerald-600 transition-colors font-semibold">Kapcsolat</button>
          </div>

          {/* Állapot oszlop */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100/50 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Rendszer online</span>
            </div>
            <p className="text-[10px] text-slate-300 font-bold mt-4 uppercase tracking-tighter">
              © {currentYear} oooVooo Global. Minden jog fenntartva.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}