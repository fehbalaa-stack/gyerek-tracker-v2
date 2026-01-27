import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function TrackersView({ trackers, onUpdate, onDelete }) {
  const { language, user } = useAuth(); 
  const t = translations[language] || translations.hu;

  const [editingId, setEditingId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [editData, setEditData] = useState({ name: '', icon: '📍', permissions: {} });
  const [selectedIds, setSelectedIds] = useState([]);

  const isFieldMissing = (field) => {
    const mapping = {
      showName: user?.name,
      showPhone: user?.phoneNumber,
      showEmail: user?.email,
      showIG: user?.instagram,
      showFB: user?.facebook,
      showEmergency: user?.emergencyPhone
    };
    const val = mapping[field];
    return val === undefined || val === null || String(val).trim() === "";
  };

  const defaultPermissions = {
    showName: false,
    showPhone: false,
    showEmail: false,
    showIG: false,
    showFB: false,
    showEmergency: false,
    allowChat: true
  };

  const startEditing = (tracker) => {
    if (editingId === tracker._id) {
      setEditingId(null);
    } else {
      setEditingId(tracker._id);
      setEditData({ 
        name: tracker.name, 
        icon: tracker.icon || '📍',
        permissions: {
          showName: tracker.permissions?.showName ?? defaultPermissions.showName,
          showPhone: tracker.permissions?.showPhone ?? defaultPermissions.showPhone,
          showEmail: tracker.permissions?.showEmail ?? defaultPermissions.showEmail,
          showIG: tracker.permissions?.showIG ?? defaultPermissions.showIG,
          showFB: tracker.permissions?.showFB ?? defaultPermissions.showFB,
          showEmergency: tracker.permissions?.showEmergency ?? defaultPermissions.showEmergency,
          allowChat: tracker.permissions?.allowChat ?? defaultPermissions.allowChat,
        } 
      });
    }
  };

  const handleSave = async (id) => {
    try {
      await onUpdate(id, {
        name: editData.name,
        icon: editData.icon,
        permissions: editData.permissions
      });
      toast.success(t.msgSaveSuccess);
      setEditingId(null);
    } catch (err) {
      toast.error(t.msgSaveError);
    }
  };

  const togglePermission = (key) => {
    if (key !== 'allowChat' && isFieldMissing(key)) {
      toast.error(language === 'hu' ? "Előbb töltsd ki a profilodat!" : "Fill your profile first!");
      return;
    }
    setEditData(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
    }));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto pb-32 px-4">
      <div className="flex justify-between items-center border-b border-emerald-50 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.manageDevices}</h2>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mt-1">
            {trackers.length} {t.activeDevices}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        {trackers.map(tracker => (
          <div 
            key={tracker._id} 
            className="relative w-full h-[180px] perspective-1000 group cursor-pointer"
            onMouseEnter={() => setHoveredId(tracker._id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => startEditing(tracker)}
          >
            <motion.div
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: editingId === tracker._id ? 180 : 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 60, damping: 15 }}
            >
              {/* KÁRTYA ELEJE */}
              <div className="absolute inset-0 backface-hidden bg-white border border-emerald-50 rounded-[2.5rem] shadow-sm p-6 flex flex-col justify-between transition-all group-hover:border-emerald-200 overflow-hidden">
                
                {/* 🔥 DINAMIKUS QR PREVIEW (EMOJI NÉLKÜL) */}
                <AnimatePresence>
                  {hoveredId === tracker._id && editingId !== tracker._id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="absolute inset-0 z-10 p-4"
                    >
                      <div className="w-full h-full bg-slate-900/95 rounded-[2rem] flex items-center justify-center relative overflow-hidden shadow-2xl border border-white/10">
                        {/* Sablon alapú háttér effektek */}
                        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${
                          tracker.templateId === 'dog' ? 'from-orange-400 to-red-600' :
                          tracker.templateId === 'cat' ? 'from-blue-400 to-indigo-600' :
                          'from-emerald-400 to-teal-600'
                        }`}></div>
                        
                        {/* Tiszta QR kód minta (Ikon nélkül) */}
                        <div className="relative bg-white p-3 rounded-2xl shadow-xl rotate-2">
                          <div className="w-16 h-16 border-4 border-slate-800 rounded-sm relative flex items-center justify-center">
                            <div className="absolute top-0 left-0 w-3 h-3 bg-slate-800"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 bg-slate-800"></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-slate-800"></div>
                            <div className="grid grid-cols-4 gap-1 p-1">
                                {[...Array(16)].map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 ${Math.random() > 0.5 ? 'bg-slate-800' : 'bg-transparent'}`}></div>
                                ))}
                            </div>
                          </div>
                          <div className="mt-1 text-center">
                            <p className="text-[5px] font-black text-slate-400 tracking-[0.2em] uppercase">oooVooo Secure</p>
                          </div>
                        </div>
                        
                        {/* Sablon neve kicsiben */}
                        <div className="absolute bottom-4 right-6">
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-widest italic">
                                Style: {tracker.templateId || 'Classic'}
                            </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={(e) => { e.stopPropagation(); toggleSelect(tracker._id); }} 
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedIds.includes(tracker._id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-100 bg-slate-50'}`}
                    >
                      {selectedIds.includes(tracker._id) && <span className="text-white text-[8px]">✓</span>}
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-emerald-100/50">
                      {tracker.icon || '📍'}
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <span className={`text-[10px] ${tracker.permissions?.showPhone ? 'opacity-100' : 'opacity-20 grayscale'}`}>📞</span>
                    <span className={`text-[10px] ${tracker.permissions?.showIG ? 'opacity-100' : 'opacity-20 grayscale'}`}>📸</span>
                    <span className={`text-[10px] ${tracker.permissions?.showEmergency ? 'opacity-100' : 'opacity-20 grayscale'}`}>🚨</span>
                    <span className={`text-[10px] ${tracker.permissions?.allowChat ? 'opacity-100' : 'opacity-20 grayscale'}`}>💬</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight truncate">{tracker.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {tracker.uniqueCode}</p>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  </div>
                </div>
              </div>

              {/* KÁRTYA HÁTLAPJA */}
              <div 
                className="absolute inset-0 backface-hidden bg-white border border-emerald-300 ring-4 ring-emerald-50 rounded-[2.5rem] p-5 shadow-xl flex flex-col justify-between"
                style={{ transform: "rotateY(180deg)" }}
                onClick={(e) => e.stopPropagation()} 
              >
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.btnSettings}</h3>
                   <button onClick={() => setEditingId(null)} className="text-[8px] font-black text-red-500 uppercase">{t.btnClose}</button>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                  <input 
                    type="text" 
                    value={editData.name} 
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 mb-2" 
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    {['showName', 'showPhone', 'showEmergency', 'showIG', 'showFB', 'allowChat'].map((key) => {
                      const missing = key !== 'allowChat' && isFieldMissing(key);
                      return (
                        <div 
                          key={key} 
                          onClick={() => !missing && togglePermission(key)} 
                          className={`p-2 rounded-xl border flex flex-col justify-center transition-all ${editData.permissions[key] ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 bg-slate-50'} ${missing ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[7px] font-black text-slate-500 uppercase">{key.replace('show', '')}</span>
                            <div className={`w-5 h-2.5 rounded-full ${editData.permissions[key] && !missing ? 'bg-emerald-500' : 'bg-slate-300'} relative`}>
                              <div className={`absolute top-0.5 w-1.5 h-1.5 bg-white rounded-full transition-all ${editData.permissions[key] && !missing ? 'right-0.5' : 'left-0.5'}`}></div>
                            </div>
                          </div>
                          {missing && (
                            <Link to="/profile" onClick={(e) => e.stopPropagation()} className="text-[6px] text-red-500 font-bold uppercase mt-1 hover:underline">Hiányzó adat ↗</Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => handleSave(tracker._id)} 
                  className="w-full bg-emerald-600 text-white font-black uppercase text-[9px] py-3 rounded-xl mt-3 shadow-lg"
                >
                  {t.btnSave}
                </button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}