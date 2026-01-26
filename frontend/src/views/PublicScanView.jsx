export default function PublicScanView({ trackerData }) {
  return (
    <div className="min-h-screen bg-[#FBFDFF] flex items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in duration-700">
        
        {/* ÁLLAPOT JELZŐ - V3 Stílusban */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center border border-emerald-50 shadow-sm relative z-10">
              <span className="text-4xl">📍</span>
            </div>
            <div className="absolute inset-0 bg-emerald-100 blur-3xl rounded-full opacity-40 animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">oooVooo Secure Recovery</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Megtaláltál!</h1>
          <p className="text-slate-400 font-medium text-sm">Ez az eszköz a következő személyhez tartozik:</p>
          <h2 className="text-4xl font-black text-emerald-600 tracking-tight py-2">{trackerData.name}</h2>
        </div>

        {/* KAPCSOLATI KÁRTYA - Letisztult fehér */}
        <div className="bg-white border border-emerald-50 p-10 rounded-[3rem] shadow-sm">
          <p className="text-[10px] text-slate-400 mb-6 font-black uppercase tracking-widest">Azonnali kapcsolatfelvétel</p>
          
          <div className="space-y-4">
            {trackerData.phoneNumber ? (
              <a 
                href={`tel:${trackerData.phoneNumber}`}
                className="flex items-center justify-center gap-3 w-full bg-emerald-600 text-white py-5 rounded-[1.8rem] text-lg font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
              >
                <span>📞</span> HÍVÁS INDÍTÁSA
              </a>
            ) : (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-500 text-xs font-bold uppercase tracking-wide">A tulajdonos nem adott meg telefonszámot.</p>
              </div>
            )}

            <button className="flex items-center justify-center gap-3 w-full bg-white border border-emerald-100 text-emerald-600 py-5 rounded-[1.8rem] text-sm font-black hover:bg-emerald-50 transition-all">
              <span>💬</span> ÜZENET KÜLDÉSE (CHAT)
            </button>
          </div>
        </div>

        <div className="px-6">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider leading-relaxed">
            A beolvasás időpontja és a hozzávetőleges helyszín naplózásra került a tulajdonos felé a biztonság érdekében.
          </p>
        </div>
      </div>
    </div>
  );
}