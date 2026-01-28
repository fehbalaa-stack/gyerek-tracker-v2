import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { QRCodeSVG } from 'qrcode.react';

export default function DashboardView({ trackers, setMode, onTrackerAdded, onUpdateTracker }) {
  const { language, user } = useAuth();
  
  const t = useMemo(() => {
    return translations[language] || translations.hu;
  }, [language]);

  const [orderCount, setOrderCount] = useState(0);

  // 🔥 Rendelések számának lekérése a statisztikához
  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const stored = localStorage.getItem('oooVooo_user');
        const userData = stored ? JSON.parse(stored) : null;
        if (!userData?.token) return;

        const res = await fetch('https://oovoo-backend.onrender.com/api/orders/my-orders', {
          headers: { 'Authorization': `Bearer ${userData.token}` }
        });
        const data = await res.json();
        if (data.success) setOrderCount(data.orders.length);
      } catch (err) { console.error("Rendelések betöltése hiba:", err); }
    };
    fetchOrderCount();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    let firstName = language === 'hu' ? 'Felhasználó' : 'User';

    if (user?.name) {
      const nameParts = user.name.trim().split(/\s+/);
      if (nameParts.length > 1) {
        firstName = language === 'hu' ? nameParts[nameParts.length - 1] : nameParts[0];
      } else {
        firstName = nameParts[0];
      }
    }

    const greetings = {
      hu: { morning: `Jó reggelt, ${firstName}! ☀️`, day: `Szép napot, ${firstName}! 😊`, evening: `Szép estét, ${firstName}! 🌙`, motto: 'Itt az ideje a biztonságnak.' },
      en: { morning: `Good morning, ${firstName}! ☀️`, day: `Have a great day, ${firstName}! 😊`, evening: `Good evening, ${firstName}! 🌙`, motto: 'Time for security.' },
      de: { morning: `Guten Morgen, ${firstName}! ☀️`, day: `Einen schönen Tag, ${firstName}! 😊`, evening: `Guten Abend, ${firstName}! 🌙`, motto: 'Zeit für Sicherheit.' }
    };

    const currentGreetings = greetings[language] || greetings.hu;
    let text = currentGreetings.day;
    if (hour < 10) text = currentGreetings.morning;
    else if (hour >= 18) text = currentGreetings.evening;

    return { text, motto: currentGreetings.motto };
  };

  const greetingData = useMemo(() => getGreeting(), [language, user]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [selectedArtStyle, setSelectedArtStyle] = useState(null);

  const catLabels = {
    animals: language === 'hu' ? '🐾 ÁLLATOK' : '🐾 ANIMALS',
    games: language === 'hu' ? '🎮 JÁTÉKOK' : '🎮 GAMES',
    adults: language === 'hu' ? '💼 FELNŐTT' : '💼 ADULT',
    seniors: language === 'hu' ? '👓 IDŐSEBB' : '👓 SENIOR'
  };

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await fetch('https://oovoo-backend.onrender.com/api/schemes');
        const data = await res.json();
        setSchemes(data);
        if (data.length > 0) setSelectedArtStyle(data[0]);
      } catch (err) { console.error("Hiba a sémák betöltésekor:", err); }
    };
    fetchSchemes();
  }, []);

  const groupedSchemes = useMemo(() => {
    const groups = { animals: [], games: [], adults: [], seniors: [] };
    schemes.forEach(s => {
      if (groups[s.category]) groups[s.category].push(s);
      else groups.animals.push(s);
    });
    return groups;
  }, [schemes]);

  const handleSaveDevice = async () => {
    if (!selectedArtStyle) { toast.error("Válassz egy stílust!"); return; }
    setIsSaving(true);
    try {
        const stored = localStorage.getItem('oooVooo_user');
        const userData = stored ? JSON.parse(stored) : null;
        if (!userData?.token) { toast.error(t.msgSessionExpired); return; }

        const response = await fetch('https://oovoo-backend.onrender.com/api/trackers/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userData.token}` },
            body: JSON.stringify({
                name: deviceName || `OoVoO-${selectedArtStyle.name.toUpperCase()}`,
                type: 'generic',
                qrStyle: selectedArtStyle.id,
                icon: '📍' 
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            toast.success(t.msgTrackerAdded);
            onTrackerAdded(data.tracker); 
            setShowAddModal(false);
            setDeviceName('');
        } else { toast.error(data.message || t.msgServerError); }
    } catch (error) { toast.error(t.msgConnError); } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
      <header className="pt-4">
        <motion.h1 key={greetingData.text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-black text-slate-900 tracking-tight">
          {greetingData.text}
        </motion.h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 ml-1">{greetingData.motto}</p>
      </header>

      <section>
        <div className="bg-white border border-emerald-50 rounded-[2.5rem] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3">
          <div onClick={() => setMode('manage')} className="md:col-span-1 p-10 cursor-pointer hover:bg-slate-50 transition-all group relative border-b md:border-b-0 md:border-r border-emerald-50">
            <div className="relative z-10">
              <h2 className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-4">{t.myTrackers}</h2>
              <div className="flex items-baseline gap-4">
                <p className="text-7xl font-black tracking-tighter text-slate-900">{trackers?.length || 0}</p>
                <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">{t.activeDevices}</span>
              </div>
              <p className="mt-8 text-sm text-slate-500 group-hover:text-emerald-600 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest">{t.manageDevices} <span className="text-emerald-500">→</span></p>
            </div>
            <div className="absolute -right-4 -bottom-4 text-[8rem] opacity-[0.03] group-hover:opacity-[0.06] transition-all rotate-12 select-none pointer-events-none">📱</div>
          </div>

          <div onClick={() => setMode('orders')} className="p-10 cursor-pointer hover:bg-slate-50 transition-all group relative border-b md:border-b-0 md:border-r border-emerald-50">
            <div className="relative z-10">
              <h2 className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-4">{language === 'hu' ? '📦 RENDELÉSEK' : '📦 ORDERS'}</h2>
              <div className="flex items-baseline gap-4">
                <p className="text-7xl font-black tracking-tighter text-slate-900">{orderCount}</p>
                <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">{language === 'hu' ? 'Tétel' : 'Items'}</span>
              </div>
              <p className="mt-8 text-sm text-slate-500 group-hover:text-blue-600 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest">{language === 'hu' ? 'Követés' : 'Track'} <span className="text-blue-500">→</span></p>
            </div>
            <div className="absolute -right-4 -bottom-4 text-[8rem] opacity-[0.03] group-hover:opacity-[0.06] transition-all -rotate-12 select-none pointer-events-none">📦</div>
          </div>

          <button onClick={() => setShowAddModal(true)} className="p-10 flex flex-col items-center justify-center gap-4 bg-emerald-50/20 hover:bg-emerald-50 transition-all group">
            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm border border-emerald-50 text-emerald-600">➕</div>
            <div className="text-center">
              <span className="font-black uppercase tracking-widest text-[10px] text-emerald-600 block leading-relaxed">{t.pairNewDevice}</span>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{language === 'hu' ? 'Eszköz hozzáadása' : 'Add new device'}</p>
            </div>
          </button>
        </div>
      </section>

      {trackers && trackers.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            {language === 'hu' ? 'Válaszd ki az eszközöd' : 'Select your device'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trackers.slice(0, 10).map((tracker) => (
              <div key={tracker._id} className="relative w-full h-[180px] perspective-1000 group cursor-pointer">
                <motion.div
                  className="w-full h-full relative preserve-3d"
                  whileHover={{ rotateY: 180 }}
                  transition={{ 
                    duration: 1.2,
                    type: "spring", 
                    stiffness: 45, 
                    damping: 20 
                  }}
                >
                  {/* ELŐLAP */}
                  <div className="absolute inset-0 backface-hidden bg-white border border-emerald-50 rounded-[2.5rem] p-6 flex items-center gap-5 shadow-sm transition-all group-hover:border-emerald-200 overflow-hidden">
                    <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                        <img 
                          src={`https://oovoo-backend.onrender.com/schemes/${tracker.qrStyle || 'classic'}.png`}
                          alt="Template"
                          className="absolute inset-0 w-full h-full object-contain p-2 z-10"
                          onError={(e) => e.target.src = 'https://oovoo-backend.onrender.com/schemes/classic.png'}
                        />
                        <div className="absolute inset-0 bg-slate-50 z-0"></div>
                    </div>

                    <div className="flex-1 overflow-hidden text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl shrink-0">{tracker.icon || "📍"}</span>
                        <h3 className="font-black text-lg text-slate-800 tracking-tight truncate">{tracker.name}</h3>
                      </div>
                      
                      {/* 🔥 STÍLUS VÁLASZTÓ PÖTTYÖK - MARCSIKA-LOGIKA */}
                      {tracker.skins && tracker.skins.length > 0 && (
                        <div className="flex gap-1.5 my-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onUpdateTracker(tracker._id, { qrStyle: 'classic' }); }}
                            className={`w-4 h-4 rounded-full border-2 transition-all ${tracker.qrStyle === 'classic' ? 'border-emerald-500 scale-110' : 'border-slate-200 opacity-40'}`}
                            style={{ backgroundColor: '#f1f5f9' }}
                            title="Classic"
                          />
                          {tracker.skins.map((skin, sIdx) => (
                            <button 
                              key={sIdx}
                              onClick={(e) => { e.stopPropagation(); onUpdateTracker(tracker._id, { qrStyle: skin.styleId }); }}
                              className={`w-4 h-4 rounded-full border-2 transition-all ${tracker.qrStyle === skin.styleId ? 'border-emerald-500 scale-110 shadow-sm' : 'border-slate-200 opacity-40 hover:opacity-100'}`}
                              style={{ 
                                backgroundImage: `url(https://oovoo-backend.onrender.com/schemes/${skin.styleId}.png)`,
                                backgroundSize: 'cover'
                              }}
                              title={skin.styleId}
                            />
                          ))}
                        </div>
                      )}

                      <div className="mt-1 text-[9px] text-slate-300 font-black uppercase tracking-widest truncate">ID: {tracker.uniqueCode}</div>
                    </div>
                  </div>

                  {/* HÁTLAP */}
                  <div className="absolute inset-0 backface-hidden bg-slate-900 border border-emerald-400/30 rounded-[2.5rem] flex flex-col items-center justify-center p-6 shadow-xl" style={{ transform: "rotateY(180deg)" }}>
                    <div className="bg-white p-3 rounded-2xl shadow-lg mb-4 opacity-90 scale-90 group-hover:scale-100 transition-transform duration-700">
                      <div className="w-16 h-16 bg-white rounded flex items-center justify-center overflow-hidden">
                        <QRCodeSVG value={`https://oovoo-backend.onrender.com/scan/${tracker.uniqueCode}`} size={64} level={"H"} fgColor="#059669" includeMargin={false} />
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setMode('manage', { highlightId: tracker._id }); }} className="w-full py-3 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-2xl hover:bg-emerald-500 transition-all shadow-lg">{language === 'hu' ? 'Eszköz kezelése' : 'Manage Device'}</button>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ALSÓ KÁRTYÁK */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div onClick={() => setMode('shop')} className="bg-white border border-emerald-50 p-8 rounded-[2rem] hover:border-emerald-200 transition-all shadow-sm cursor-pointer group h-full">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-emerald-100/50">🛒</div>
          <h3 className="text-xl font-bold mb-2 text-slate-800 tracking-tight">Webshop</h3>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold leading-relaxed">{language === 'hu' ? 'Vásárolj egyedi QR-kóddal ellátott kiegészítőket, pólókat és matricákat eszközeidhez.' : 'Buy custom QR-coded accessories, t-shirts, and stickers for your devices.'}</p>
        </div>

        <div onClick={() => setMode('orders')} className="bg-slate-900 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group h-full border border-slate-800 cursor-pointer">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2 text-white tracking-tight">{language === 'hu' ? 'Rendeléskövetés' : 'Order Tracking'}</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">{language === 'hu' ? 'Nézd meg, hol tartanak a meglévő eszközeidhez rendelt új kiegészítők.' : 'Check the status of new accessories ordered for your existing devices.'}</p>
            <div className="mt-6 flex gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest">Skins</span>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest">Track</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:rotate-12 transition-transform">📦</div>
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-4xl rounded-[3rem] p-10 md:p-14 shadow-2xl relative border border-emerald-50">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-12 text-center">{t.deviceTitle} <span className="text-emerald-600">{t.configTitle}</span></h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <section>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 mb-3 block">{language === 'hu' ? 'Válassz stílust' : 'Choose style'}</label>
                  <div className="relative">
                    <select value={selectedArtStyle?.id || ''} onChange={(e) => setSelectedArtStyle(schemes.find(s => s.id === e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-sm text-slate-700 appearance-none outline-none focus:border-emerald-300 transition-all cursor-pointer">
                      <option value="" disabled>{language === 'hu' ? 'Válassz sémát...' : 'Select scheme...'}</option>
                      {Object.entries(groupedSchemes).map(([catId, catSchemes]) => catSchemes.length > 0 && (<optgroup key={catId} label={catLabels[catId]}>{catSchemes.map((s) => (<option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>))}</optgroup>))}
                    </select>
                  </div>
                </section>
                <section>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 mb-3 block">{language === 'hu' ? 'Eszköz elnevezése' : 'Device name'}</label>
                  <input type="text" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder={t.labelDeviceName} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-sm text-slate-700 outline-none focus:border-emerald-300 transition-all" />
                </section>
              </div>
              <div className="bg-slate-50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center border border-slate-100 relative min-h-[300px]">
                <div className="absolute top-6 text-[9px] font-black uppercase tracking-widest text-emerald-600 opacity-60">{language === 'hu' ? 'Látványterv' : 'Preview'}</div>
                <div className="w-48 h-48 flex items-center justify-center">
                  {selectedArtStyle ? ( <img src={`https://oovoo-backend.onrender.com/schemes/${selectedArtStyle.id}.png`} alt="Preview" className="max-w-full max-h-full object-contain drop-shadow-xl" /> ) : ( <div className="text-slate-300 text-[10px] font-black uppercase tracking-widest">{language === 'hu' ? 'Nincs választva' : 'Not selected'}</div> )}
                </div>
              </div>
            </div>
            <div className="mt-12 flex gap-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">{t.cancel}</button>
              <button onClick={handleSaveDevice} disabled={isSaving || !selectedArtStyle} className="flex-[2] bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-50 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">{isSaving ? t.btnSaving : (language === 'hu' ? 'Mentés és párosítás' : 'Save and Pair')}</button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}