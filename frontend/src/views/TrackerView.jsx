import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';

const SUGGESTED_EMOJIS = [
  '🚗', '🚕', '🏍️', '🚲', '🛴', '🚛', '✈️', '⛵', '🚁', '🚜',
  '🐶', '🐱', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐴', '🦄', '🐦',
  '🔑', '🎒', '💼', '👜', '👛', '💻', '📱', '🎧', '📸', '🕶️', '🌂', '🔋', '🎁', '📦',
  '🎸', '👟', '🛹', '🎾', '⚽', '🏀', '🏹', '🎨', '🎣', '🎿', '🎮', '🧩',
  '🏠', '🧸', '📚', '💳', '💎', '🔔', '🔥', '🛡️', '🛰️', '🔭', '📍', '🚩', '🧿'
];

// NEVESÍTETT EXPORT
export function TrackersView({ trackers = [], onUpdate, onDelete }) {
  const { language } = useAuth();
  const t = translations[language] || translations.hu;

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', icon: '📍', permissions: {} });
  const [selectedIds, setSelectedIds] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
    setEditData(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
    }));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto pb-32 px-4">
      {/* FEJLÉC */}
      <div className="flex justify-between items-center border-b border-emerald-50 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.manageDevices}</h2>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mt-1">
            {trackers.length} {t.activeDevices}
          </p>
        </div>
      </div>
      
      {/* ESZKÖZ LISTA */}
      <div className="grid grid-cols-1 gap-4">
        {trackers.map(tracker => (
          <div key={tracker._id} className={`bg-white border rounded-[2.5rem] transition-all duration-300 overflow-hidden shadow-sm ${editingId === tracker._id || selectedIds.includes(tracker._id) ? 'border-emerald-300 ring-4 ring-emerald-50' : 'border-emerald-50 hover:border-emerald-200'}`}>
            
            <div className="p-6 flex justify-between items-center gap-4">
              <div className="flex items-center gap-5 flex-1">
                <div onClick={() => toggleSelect(tracker._id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.includes(tracker._id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-100 bg-slate-50 hover:border-emerald-300'}`}>
                  {selectedIds.includes(tracker._id) && <span className="text-white text-[10px] font-black">✓</span>}
                </div>
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-emerald-100/50">
                  {tracker.icon || '📍'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">{tracker.name}</h3>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">ID: {tracker.uniqueCode}</p>
                </div>
              </div>
              <button onClick={() => startEditing(tracker)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${editingId === tracker._id ? 'bg-slate-800 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                {editingId === tracker._id ? t.btnClose : t.btnSettings}
              </button>
            </div>

            {editingId === tracker._id && (
              <div className="px-8 pb-10 space-y-10 animate-in slide-in-from-top-4 duration-500">
                <div className="pt-8 border-t border-emerald-50 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">{t.labelDeviceName}</label>
                    <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 mt-2 focus:border-emerald-200 focus:bg-white outline-none font-bold text-slate-700 shadow-inner" />
                  </div>
                  
                  <div className="md:col-span-1 relative">
                    <label className="text-[10px] font-black uppercase text-emerald-600 ml-3 tracking-widest">IKON</label>
                    <div 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 mt-2 focus:border-emerald-200 text-3xl text-center cursor-pointer hover:bg-white transition-all shadow-inner"
                    >
                      {editData.icon}
                    </div>

                    {showEmojiPicker && (
                      <div className="absolute top-full right-0 mt-3 p-5 bg-white border border-emerald-100 rounded-[2rem] shadow-2xl z-[100] w-72 animate-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          {SUGGESTED_EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setEditData({ ...editData, icon: emoji });
                                setShowEmojiPicker(false);
                              }}
                              className={`text-2xl p-2 rounded-xl transition-all hover:bg-emerald-50 ${editData.icon === emoji ? 'bg-emerald-100 scale-110' : ''}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.labelPermissions}</h4>
                    <div className="flex gap-2">
                      <button onClick={handleResetAllToDefault} className="text-[9px] font-black bg-slate-50 text-slate-400 px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all uppercase">🔄 Reset</button>
                      <button onClick={handleApplyToAll} className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all uppercase">🚀 Apply All</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'showName', label: 'NÉV MEGJELENÍTÉSE', icon: '👤' },
                      { key: 'showPhone', label: t.permPhone, icon: '📞' },
                      { key: 'showEmail', label: t.permEmail, icon: '✉️' },
                      { key: 'showSocial', label: t.permSocial, icon: '📱' },
                      { key: 'allowChat', label: t.permChat, icon: '💬' }
                    ].map((item) => (
                      <div key={item.key} onClick={() => togglePermission(item.key)} className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all ${editData.permissions[item.key] ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 bg-slate-50 opacity-50 hover:opacity-100'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-[10px] font-black text-slate-700 tracking-wider">{item.label}</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${editData.permissions[item.key] ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${editData.permissions[item.key] ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 px-2">📋 {t.lastActivity}</h4>
                  <div className="space-y-4 max-h-48 overflow-y-auto pr-4 custom-scrollbar">
                    {tracker.logs?.length > 0 ? tracker.logs.map((log, i) => (
                      <div key={i} className="text-xs flex justify-between border-b border-slate-100 pb-3 font-medium">
                        <span className="text-slate-700">{log.message}</span>
                        <span className="text-slate-300 text-[10px]">{formatDate(log.date)}</span>
                      </div>
                    )) : <p className="text-[10px] text-slate-300 italic text-center py-6 uppercase font-bold tracking-widest">{t.noLogs}</p>}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => handleSave(tracker._id)} className="flex-[2] bg-emerald-600 text-white font-black uppercase text-[11px] tracking-widest py-6 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">{t.btnSave}</button>
                  <button onClick={() => window.confirm(t.confirmDelete) && onDelete(tracker._id)} className="flex-1 bg-red-50 text-red-500 border border-red-100 font-black uppercase text-[10px] tracking-widest py-6 rounded-2xl hover:bg-red-500 hover:text-white transition-all">TÖRLÉS</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* KIJELÖLÉS KEZELŐ */}
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

// BIZTONSÁGI DEFAULT EXPORT
export default TrackersView;