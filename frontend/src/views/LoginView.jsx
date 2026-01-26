import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { toast } from 'react-hot-toast';
import ForgotPasswordView from './ForgotPasswordView';

export default function LoginView({ setMode }) {
  const { login, language, updateGlobalLanguage } = useAuth();
  const t = translations[language] || translations.hu;

  const [view, setView] = useState('login'); 
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    emailConfirm: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    language: language,
    acceptAszf: false,
    acceptGdpr: false,
    newsletter: false
  });

  const isRegister = view === 'register';

  if (view === 'forgot') {
    return <ForgotPasswordView onBack={() => setView('login')} />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLanguageChange = (langId) => {
    setFormData(prev => ({ ...prev, language: langId }));
    updateGlobalLanguage(langId);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (loading || !formData.email) return;

    setLoading(true);
    
    try {
      if (isRegister) {
        if (formData.email !== formData.emailConfirm) throw new Error(language === 'hu' ? "Az e-mailek nem egyeznek!" : "Emails do not match!");
        if (formData.password !== formData.passwordConfirm) throw new Error(t.msgPassMismatch || "A jelszavak nem egyeznek!");
        if (!formData.acceptAszf || !formData.acceptGdpr) throw new Error(language === 'hu' ? "El kell fogadni a szabályzatokat!" : "You must accept the policies!");

        const regResponse = await axios.post('https://oovoo-beta1.onrender.com/api/auth/register', {
          name: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password,
          language: formData.language 
        });
        
        toast.success(regResponse.data.message || t.msgTrackerAdded);
        setView('login');
      } else {
        const response = await axios.post('https://oovoo-beta1.onrender.com/api/auth/login', {
          email: formData.email,
          password: formData.password
        });

        if (response.data && response.data._id) {
          toast.success(t.msgLoginSuccess || "Sikeres belépés!");
          login(response.data); 
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || t.msgServerError;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-emerald-50 p-10 rounded-[3rem] shadow-sm animate-in fade-in zoom-in duration-500">
      
      {/* NYELVVÁLASZTÓ - Emerald kapszulák */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { id: 'hu', flag: '🇭🇺' },
          { id: 'en', flag: '🇬🇧' },
          { id: 'de', flag: '🇩🇪' }
        ].map(lang => (
          <button
            key={lang.id}
            type="button"
            onClick={() => handleLanguageChange(lang.id)}
            className={`px-4 py-2 rounded-2xl border-2 text-[11px] font-black transition-all flex items-center gap-2 ${
              language === lang.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-50 text-slate-300 opacity-60 hover:opacity-100'
            }`}
          >
            <span>{lang.flag}</span> {lang.id.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="text-center mb-10">
        <div className="relative inline-block mb-6">
          <img src="/logo.png" className="w-20 h-20 mx-auto relative z-10" alt="logo" />
          <div className="absolute inset-0 bg-emerald-100 blur-2xl rounded-full opacity-30"></div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isRegister ? (language === 'hu' ? 'Csatlakozz az ' : language === 'de' ? 'Registrieren bei ' : 'Join ') : (language === 'hu' ? 'Üdv újra az ' : language === 'de' ? 'Willkommen bei ' : 'Welcome back to ')} 
          <span className="text-emerald-600 uppercase tracking-tighter">oooVooo</span>-n
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <input name="fullName" placeholder={t.labelName || "Teljes Név"} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all font-medium" onChange={handleChange} required />
            <input name="username" placeholder="Username" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all font-medium" onChange={handleChange} required />
          </>
        )}
        
        <input name="email" type="email" placeholder={t.labelEmail} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all font-medium" value={formData.email} onChange={handleChange} required />
        
        {isRegister && (
          <>
            <input name="emailConfirm" type="email" placeholder={language === 'hu' ? 'E-mail megerősítése' : 'Confirm E-mail'} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all font-medium" onChange={handleChange} required />
            <input name="phone" type="tel" placeholder={t.labelPhone} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all font-medium" onChange={handleChange} required />
          </>
        )}

        <div className="space-y-1">
          <input name="password" type="password" placeholder={t.labelPassword} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all font-medium" onChange={handleChange} required />
          
          {!isRegister && (
            <div className="flex justify-end px-3">
              <button 
                type="button"
                onClick={() => setView('forgot')} 
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
              >
                {t.forgotPassword || "Forgot password?"}
              </button>
            </div>
          )}
        </div>
        
        {isRegister && (
          <>
            <input name="passwordConfirm" type="password" placeholder={t.labelConfirmPassword || "Jelszó megerősítése"} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all font-medium" onChange={handleChange} required />
            
            <div className="flex flex-col gap-3 pt-3 px-2">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase cursor-pointer group">
                    <input type="checkbox" name="acceptAszf" checked={formData.acceptAszf} onChange={handleChange} className="w-4 h-4 accent-emerald-600 border-slate-200 rounded" />
                    <span className="text-slate-400 tracking-wider">
                      {language === 'hu' ? 'Elfogadom az ' : 'I accept '}
                      <span onClick={(e) => { e.preventDefault(); setMode('terms'); }} className="text-emerald-600 hover:underline underline-offset-4">
                        {language === 'hu' ? 'ÁSZF-et' : 'Terms of Service'}
                      </span>
                    </span>
                </label>
                <label className="flex items-center gap-3 text-[10px] font-black uppercase cursor-pointer group">
                    <input type="checkbox" name="acceptGdpr" checked={formData.acceptGdpr} onChange={handleChange} className="w-4 h-4 accent-emerald-600 border-slate-200 rounded" />
                    <span className="text-slate-400 tracking-wider">
                      {language === 'hu' ? 'Elfogadom a ' : 'I accept '}
                      <span onClick={(e) => { e.preventDefault(); setMode('privacy'); }} className="text-emerald-600 hover:underline underline-offset-4">
                        {language === 'hu' ? 'GDPR-t' : 'Privacy Policy'}
                      </span>
                    </span>
                </label>
            </div>
          </>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs transition-all mt-6 hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-100 disabled:opacity-50"
        >
          {loading ? (t.btnSaving || '...') : (isRegister ? t.btnRegister : t.btnLogin)}
        </button>
      </form>

      <button 
        onClick={() => setView(isRegister ? 'login' : 'register')}
        className="w-full mt-8 text-[11px] uppercase font-black tracking-[0.3em] text-slate-300 hover:text-emerald-600 transition-all"
      >
        {isRegister ? t.linkLogin : t.linkRegister}
      </button>
    </div>
  );
}