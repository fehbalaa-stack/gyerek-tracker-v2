import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function ProfileView() {
  const { user, language, updateLanguage, logout } = useAuth();
  const t = translations[language] || translations.hu;

  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    phoneNumber: '',
    instagram: '',
    facebook: '',
    bio: '',
    emergencyPhone: ''
  });

  const [emailData, setEmailData] = useState({ newEmail: '', password: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        instagram: user.instagram || '',
        facebook: user.facebook || '',
        bio: user.bio || '',
        emergencyPhone: user.emergencyPhone || ''
      });
    }
  }, [user]);

  const languages = [
    { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  const getToken = () => {
    const stored = localStorage.getItem('oooVooo_user');
    return stored ? JSON.parse(stored).token : null;
  };

  const handleLanguageChange = async (code) => {
    try {
      const token = getToken();
      if (!token) return;
      // JAVÍTVA: beta1 URL használata
      await axios.patch('https://oovoo-backend.onrender.com/api/users/profile', { language: code }, { headers: { Authorization: `Bearer ${token}` } });
      const stored = localStorage.getItem('oooVooo_user');
      if (stored) {
        const userData = JSON.parse(stored);
        userData.language = code;
        localStorage.setItem('oooVooo_user', JSON.stringify(userData));
      }
      await updateLanguage(code);
      toast.success(code === 'hu' ? 'Nyelv elmentve!' : code === 'de' ? 'Sprache gespeichert!' : 'Language saved!');
    } catch (err) {
      toast.error(language === 'hu' ? 'Hiba a mentés során' : 'Error saving language');
    }
  };

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    try {
      // JAVÍTVA: Nyelv beküldése a profil adatokkal együtt és beta1 URL
      const updatePayload = { ...profileData, language };
      const res = await axios.patch('https://oovoo-backend.onrender.com/api/users/profile', updatePayload, { headers: { Authorization: `Bearer ${getToken()}` } });
      const stored = localStorage.getItem('oooVooo_user');
      if (stored && res.data) {
          const userData = JSON.parse(stored);
          const updatedData = { ...userData, ...res.data };
          localStorage.setItem('oooVooo_user', JSON.stringify(updatedData));
      }
      toast.success(language === 'hu' ? 'Profil sikeresen frissítve!' : 'Profile updated!');
      setShowProfileEdit(false);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      toast.error('Hiba a profil frissítésekor');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailChange = async () => {
    if (!emailData.newEmail || !emailData.password) { toast.error('Minden mezőt tölts ki!'); return; }
    setIsUpdating(true);
    try {
      const res = await axios.post('https://oovoo-backend.onrender.com/api/users/update-email', emailData, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.data.success) { toast.success('Email módosítva! Jelentkezz be újra.'); setTimeout(() => logout(), 2000); }
    } catch (err) { toast.error(err.response?.data?.message || 'Hiba'); } finally { setIsUpdating(false); }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) { toast.error('Töltsd ki az összes jelszó mezőt!'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('Az új jelszavak nem egyeznek!'); return; }
    setIsUpdating(true);
    try {
      const res = await axios.post('https://oovoo-backend.onrender.com/api/users/update-password', { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.data.success) { toast.success('Jelszó sikeresen módosítva! Jelentkezz be újra.'); setTimeout(() => logout(), 2000); }
    } catch (err) { toast.error(err.response?.data?.message || 'Hiba történt'); } finally { setIsUpdating(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-4">
      
      {/* FŐ KÁRTYA */}
      <section className="bg-white border border-emerald-50 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative z-10">
        
        {/* PROFIL FEJLÉC */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-6">
            <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center text-5xl shadow-inner border border-emerald-100">
              👤
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
              <span className="text-white text-[10px] font-black">✓</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {user?.name || 'Betöltés...'}
          </h2>
          <p className="text-emerald-600 text-[10px] font-black tracking-[0.3em] mt-2 uppercase">oooVooo Member</p>
        </div>

        {/* --- 1. PROFIL ADATOK --- */}
        <div className="space-y-6 mb-12">
          <div className="flex justify-between items-center px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profil Információk</p>
            {!showProfileEdit && (
              <button onClick={() => setShowProfileEdit(true)} className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline">Szerkesztés</button>
            )}
          </div>

          {!showProfileEdit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
              {[
                { label: 'Telefonszám', val: user?.phoneNumber },
                { label: 'Instagram', val: user?.instagram ? `@${user.instagram}` : null },
                { label: 'Facebook', val: user?.facebook },
                { label: 'S.O.S Szám', val: user?.emergencyPhone, sos: true }
              ].map((item, i) => (
                <div key={i} className={`p-5 rounded-2xl border ${item.sos ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                  <span className={`text-[8px] block uppercase font-black mb-1 tracking-widest ${item.sos ? 'text-red-500' : 'text-slate-400'}`}>{item.label}</span>
                  <span className={`text-sm font-bold ${item.sos ? 'text-red-600' : 'text-slate-700'}`}>{item.val || '-'}</span>
                </div>
              ))}
              <div className="md:col-span-2 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[8px] text-slate-400 block uppercase font-black mb-2 tracking-widest">Amit a megtaláló lát</span>
                <p className="text-sm text-slate-600 font-medium italic">{user?.bio || 'Ide írd, amit a megtalálóval meg akarsz osztani'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 animate-in zoom-in-95">
              <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} placeholder="TELJES NÉV" className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:border-emerald-400 font-bold" />
              <input type="text" value={profileData.phoneNumber} onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})} placeholder="TELEFONSZÁM" className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:border-emerald-400 font-bold" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={profileData.instagram} onChange={(e) => setProfileData({...profileData, instagram: e.target.value})} placeholder="INSTAGRAM" className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:border-emerald-400 font-bold" />
                <input type="text" value={profileData.facebook} onChange={(e) => setProfileData({...profileData, facebook: e.target.value})} placeholder="FACEBOOK" className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:border-emerald-400 font-bold" />
              </div>
              <input type="text" value={profileData.emergencyPhone} onChange={(e) => setProfileData({...profileData, emergencyPhone: e.target.value})} placeholder="SÜRGŐSSÉGI SZÁM" className="w-full bg-white border border-red-200 rounded-xl px-5 py-3 text-sm outline-none focus:border-red-400 font-bold text-red-600" />
              <textarea value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} placeholder="BEMUTATKOZÁS" className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:border-emerald-400 font-bold h-24 resize-none" />
              <div className="flex gap-3">
                <button onClick={() => setShowProfileEdit(false)} className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mégse</button>
                <button onClick={handleProfileUpdate} disabled={isUpdating} className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-100">Mentés</button>
              </div>
            </div>
          )}
        </div>

        {/* --- 2. BIZTONSÁG SZEKCIÓ (Email/Password) --- */}
        <div className="space-y-4 mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Fiók Biztonság</p>
            
            {/* Email */}
            <div className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Cím</span>
                {!showEmailEdit && <button onClick={() => {setShowEmailEdit(true); setShowPasswordEdit(false);}} className="text-emerald-600 text-[9px] font-bold uppercase">Módosítás</button>}
              </div>
              {!showEmailEdit ? <p className="text-sm font-bold text-slate-700">{user?.email}</p> : (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <input type="email" value={emailData.newEmail} onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})} placeholder="Új email" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold" />
                  <input type="password" value={emailData.password} onChange={(e) => setEmailData({...emailData, password: e.target.value})} placeholder="Jelenlegi jelszó" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold" />
                  <div className="flex gap-2">
                    <button onClick={() => setShowEmailEdit(false)} className="flex-1 text-[9px] font-black text-slate-400 uppercase">Mégse</button>
                    <button onClick={handleEmailChange} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-[9px] font-black uppercase">Frissítés</button>
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Jelszó</span>
                {!showPasswordEdit && <button onClick={() => {setShowPasswordEdit(true); setShowEmailEdit(false);}} className="text-emerald-600 text-[9px] font-bold uppercase">Csere</button>}
              </div>
              {!showPasswordEdit ? <p className="text-sm font-bold text-slate-300 tracking-[0.3em]">••••••••</p> : (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} placeholder="Régi jelszó" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold" />
                  <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} placeholder="Új jelszó" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold" />
                  <div className="flex gap-2">
                    <button onClick={() => setShowPasswordEdit(false)} className="flex-1 text-[9px] font-black text-slate-400 uppercase">Mégse</button>
                    <button onClick={handlePasswordChange} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-[9px] font-black uppercase">Mentés</button>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* --- 3. NYELVVÁLASZTÓ --- */}
        <div className="space-y-6 pt-10 border-t border-emerald-50">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Nyelvválasztás</h3>
          <div className="grid grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                  language === lang.code 
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                  : 'border-slate-50 bg-slate-50/50 text-slate-300 opacity-60 hover:opacity-100'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-[9px] font-black uppercase tracking-widest">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* KIJELENTKEZÉS */}
      <button 
        onClick={logout}
        className="w-full bg-red-50 text-red-500 py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all shadow-sm shadow-red-100 border border-red-100"
      >
        {language === 'hu' ? 'KIJELENTKEZÉS' : 'LOGOUT'}
      </button>
    </div>
  );
}