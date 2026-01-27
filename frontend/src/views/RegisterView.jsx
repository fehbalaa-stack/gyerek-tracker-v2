import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { toast } from 'react-hot-toast';

export default function RegisterView({ onSwitchToLogin }) {
  const { language, updateGlobalLanguage } = useAuth();
  const t = translations[language] || translations.hu;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const languages = [
    { id: 'hu', flag: '🇭🇺', label: 'HU' },
    { id: 'en', flag: '🇬🇧', label: 'EN' },
    { id: 'de', flag: '🇩🇪', label: 'DE' }
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error(t.msgPassMismatch);
    }

    try {
      const response = await fetch('https://oovoo-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          language: language 
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(language === 'hu' ? 'Sikeres regisztráció!' : language === 'de' ? 'Registrierung erfolgreich!' : 'Registration successful!');
        onSwitchToLogin();
      } else {
        toast.error(data.message || t.msgServerError);
      }
    } catch (err) {
      toast.error(t.msgConnError);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-emerald-50 rounded-[3rem] p-10 shadow-sm animate-in zoom-in duration-500">
        
        {/* NYELVVÁLASZTÓ - Emerald kapszulák */}
        <div className="flex justify-center gap-3 mb-10">
          {languages.map(lang => (
            <button
              key={lang.id}
              type="button"
              onClick={() => updateGlobalLanguage(lang.id)}
              className={`px-4 py-2 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                language === lang.id 
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm scale-105' 
                : 'border-slate-50 text-slate-300 opacity-60 hover:opacity-100'
              }`}
            >
              <span>{lang.flag}</span> {lang.label}
            </button>
          ))}
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {t.regTitle}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3 leading-relaxed">
            {t.regSubtitle}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-slate-400">
              {t.labelEmail}
            </label>
            <input 
              type="email" 
              required
              placeholder="example@ooovooo.com"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-emerald-200 focus:bg-white text-slate-700 font-bold transition-all shadow-inner"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-slate-400">
              {t.labelPassword}
            </label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-emerald-200 focus:bg-white text-slate-700 font-bold transition-all shadow-inner"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-slate-400">
              {t.labelConfirmPassword}
            </label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-emerald-200 focus:bg-white text-slate-700 font-bold transition-all shadow-inner"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <button className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-emerald-700 shadow-lg shadow-emerald-100 hover:scale-[1.01] active:scale-95 transition-all mt-6">
            {t.btnRegister}
          </button>
        </form>

        <button 
          onClick={onSwitchToLogin}
          className="w-full mt-8 text-[11px] font-black uppercase tracking-widest text-slate-300 hover:text-emerald-600 transition-all"
        >
          {t.linkLogin}
        </button>
      </div>
    </div>
  );
}