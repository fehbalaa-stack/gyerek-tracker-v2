import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom'; // 🔥 Link hozzáadva a profilra ugráshoz

const SUGGESTED_EMOJIS = [
  '🚗', '🚕', '🏍️', '🚲', '🛴', '🚛', '✈️', '⛵', '🚁', '🚜',
  '🐶', '🐱', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐴', '🦄', '🐦',
  '🔑', '🎒', '💼', '👜', '👛', '💻', '📱', '🎧', '📸', '🕶️', '🌂', '🔋', '🎁', '📦',
  '🎸', '👟', '🛹', '🎾', '⚽', '🏀', '🏹', '🎨', '🎣', '🎿', '🎮', '🧩',
  '🏠', '🧸', '📚', '💳', '💎', '🔔', '🔥', '🛡️', '🛰️', '🔭', '📍', '🚩', '🧿'
];

export default function TrackersView({ trackers, onUpdate, onDelete }) {
  const { language, user } = useAuth(); // 🔥 user kinyerése az AuthContext-ből
  const t = translations[language] || translations.hu;

  const [editingId, setEditingId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [editData, setEditData] = useState({ name: '', icon: '📍', permissions: {} });
  const [selectedIds, setSelectedIds] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // 🔥 Logika a mezők ellenőrzéséhez (Jogosultságok a profil alapján)
  const isFieldMissing = (field) => {
    // Backend mezőnevek szinkronizálása
    const userField = field === 'showPhone' ? 'phone' : 
                      field === 'showName' ? 'name' : 
                      field === 'showEmail' ? 'email' : null;
    
    if (!userField) return false;
    // Ha 'phoneNumber' néven van a userben, azt is nézzük
    const val = user?.[userField] || user?.['phoneNumber'];
    return !val || val.trim() === "";
  };

  const defaultPermissions = {
    showName: false,
    showPhone: false,
    showEmail: false,
    showSocial: false,
    allowChat: true
  };

  const formatDate = (dateString) => {
    if (!dateString) return t.unknown;
    const localeMap = { hu: 'hu-HU', en: 'en-US', de: 'de-DE' };
    const currentLocale = localeMap[language] || 'hu-HU';
    return new Date(dateString).toLocaleString(currentLocale, {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const startEditing = (tracker) => {
    if (editingId === tracker._id) {
      setEditingId(null);
      setShowEmojiPicker(false);
    } else {
      setEditingId(tracker._id);
      setShowEmojiPicker(false);
      setEditData({ 
        name: tracker.name, 
        icon: tracker.icon || '📍',
        permissions: {
          showName: tracker.permissions?.showName ?? defaultPermissions.showName,
          showPhone: tracker.permissions?.showPhone ?? defaultPermissions.showPhone,
          showEmail: tracker.permissions?.showEmail ?? defaultPermissions.showEmail,
          showSocial: tracker.permissions?.showSocial ?? defaultPermissions.showSocial,
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

  const handleApplyToAll = async () => {
    const confirmMsg = language === 'hu' ? "Alkalmazod ezt a beállítást az ÖSSZES eszközre?" : "Apply these settings to all devices?";
    if (!window.confirm(confirmMsg)) return;

    try {
      toast.loading("...", { id: 'bulk' });
      await Promise.all(trackers.map(track => 
        onUpdate(track._id, { 
            permissions: editData.permissions,
            icon: editData.icon
        })
      ));
      toast.success(language === 'hu' ? "Minden eszköz frissítve!" : "All devices updated!", { id: 'bulk' });
    } catch (err) {
      toast.error(t.msgSaveError, { id: 'bulk' });
    }
  };

  const handleResetAllToDefault = async () => {
    const confirmMsg = language === 'hu' ? "Visszaállítod az ÖSSZES eszközt alapértelmezettre?" : "Reset ALL devices to default?";
    if (!window.confirm(confirmMsg)) return;

    try {
      toast.loading("...", { id: 'reset' });
      await Promise.all(trackers.map(track => 
        onUpdate(track._id, { 
            permissions: defaultPermissions,
            icon: '📍'
        })
      ));
      setEditData(prev => ({ ...prev, icon: '📍', permissions: { ...defaultPermissions } }));
      toast.success(language === 'hu' ? "Visszaállítva!" : "Reset complete!", { id: 'reset' });
    } catch (err) {
      toast.error(t.msgSaveError, { id: 'reset' });
    }
  };

  const togglePermission = (key) => {
    // 🔥 Ha hiányzik a profiladat, nem engedjük kapcsolni
    if (isFieldMissing(key)) {
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
              transition={{ 
                duration: 0.8, // 🔥 LASSÍTVA: 0.6 -> 0.8 a prémium érzetért
                type: "spring", 
                stiffness: 60, // 🔥 FINOMÍTVA: lágyabb mozgás
                damping: 15 
              }}
            >
              <div className="absolute inset-0 backface-hidden bg-white border border-emerald-50 rounded-[2.5rem] shadow-sm p-6 flex flex-col justify-between transition-all group-hover:border-emerald-200 overflow-hidden">
                <AnimatePresence>
                  {hoveredId === tracker._id && editingId !== tracker._id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 1.2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-emerald-600/90 flex items-center justify-center z-10"
                    >
                      <div className="bg-white p-3 rounded-2xl shadow-xl rotate-3">
                        <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center border-2 border-slate-200 border-dashed text-slate-400 text-[8px] font-bold text-center leading-tight">
                           QR CODE<br/>PATTERN
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
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{t.btnSettings}</span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight truncate">{tracker.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {tracker.uniqueCode}</p>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  </div>
                </div>
              </div>

              <div 
                className="absolute inset-0 backface-hidden bg-white border border-emerald-300 ring-4 ring-emerald-50 rounded-[2.5rem] p-6 shadow-xl overflow-hidden flex flex-col justify-between"
                style={{ transform: "rotateY(180deg)" }}
                onClick={(e) => e.stopPropagation()} 
              >
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.btnSettings}</h3>
                   <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-800 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500 transition-all">{t.btnClose}</button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                  <div>
                    <input 
                      type="text" 
                      value={editData.name} 
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs focus:border-emerald-200 outline-none font-bold text-slate-700" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {['showName', 'showPhone', 'showEmail', 'allowChat'].map((key) => {
                      const missing = isFieldMissing(key);
                      return (
                        <div 
                          key={key} 
                          title={missing ? "Előbb töltsd ki a profilodban!" : ""}
                          onClick={() => togglePermission(key)} 
                          className={`p-2 rounded-xl border flex flex-col justify-center cursor-pointer transition-all ${editData.permissions[key] ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 bg-slate-50'} ${missing ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[8px] font-black text-slate-500 uppercase">{key.replace('show', '')}</span>
                            <div className={`w-6 h-3 rounded-full ${editData.permissions[key] && !missing ? 'bg-emerald-500' : 'bg-slate-300'} relative`}>
                              <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${editData.permissions[key] && !missing ? 'right-0.5' : 'left-0.5'}`}></div>
                            </div>
                          </div>
                          {/* 🔥 Figyelmeztető szöveg és link */}
                          {missing && (
                            <Link 
                              to="/profile" 
                              onClick={(e) => e.stopPropagation()} 
                              className="text-[7px] text-red-500 font-bold uppercase mt-1 hover:underline"
                            >
                              Hiányzó adat ↗
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleSave(tracker._id)} className="flex-[2] bg-emerald-600 text-white font-black uppercase text-[9px] tracking-widest py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition-all">{t.btnSave}</button>
                  <button onClick={() => window.confirm(t.confirmDelete) && onDelete(tracker._id)} className="flex-1 bg-red-50 text-red-500 border border-red-100 font-black uppercase text-[8px] tracking-widest py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all">TÖRLÉS</button>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl animate-in slide-in-from-bottom-10">
          <div className="bg-white border-2 border-emerald-500 p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-emerald-600 tracking-widest ml-4">
              {selectedIds.length} {language === 'hu' ? 'Kijelölve' : 'Selected'}
            </span>
            <button onClick={() => setSelectedIds([])} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">✕ {t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}