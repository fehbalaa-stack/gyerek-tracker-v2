import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordView({ onBack }) {
  const { language } = useAuth();
  const t = translations[language] || translations.hu;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://oovoo-beta1.onrender.com/api/auth/forgot-password', { email });
      toast.success(t.msgResetEmailSent);
      onBack(); 
    } catch (err) {
      toast.error(err.response?.data?.error || t.msgServerError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-emerald-50 p-10 rounded-[2.5rem] shadow-sm animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 mx-auto text-2xl border border-emerald-100/50 shadow-inner">
          🔑
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {t.forgotPasswordTitle}
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3 leading-relaxed">
          {t.forgotPasswordSubtitle}
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest ml-3 text-slate-400 opacity-70">
            {t.labelEmail}
          </label>
          <input 
            type="email" 
            placeholder="example@ooovooo.com" 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all font-medium" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs transition-all hover:bg-emerald-700 active:scale-[0.98] shadow-lg shadow-emerald-100 disabled:opacity-50"
        >
          {loading ? "..." : t.btnSendReset}
        </button>
      </form>

      <button 
        onClick={onBack}
        className="w-full mt-8 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
      >
        ← {t.backToLogin}
      </button>
    </div>
  );
}