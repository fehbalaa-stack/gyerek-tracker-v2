import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ContactView({ setMode }) {
  const { language } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://oovoo-beta1.onrender.com/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        toast.success(language === 'hu' ? 'Üzenet elküldve!' : 'Message sent!');
      } else {
        throw new Error(data.error || 'Hiba történt');
      }
    } catch (err) {
      console.error("Contact hiba:", err);
      toast.error(language === 'hu' ? 'Hiba a küldés során.' : 'Error sending message.');
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    hu: { title: "Kapcsolat", subtitle: "Kérdésed van? Írj nekünk!", labelName: "Név", labelEmail: "E-mail", labelMsg: "Üzenet", btn: "Küldés", success: "Köszönjük! Hamarosan válaszolunk.", back: "Bezárás / Vissza" },
    en: { title: "Contact", subtitle: "Have a question? Drop us a line!", labelName: "Name", labelEmail: "Email", labelMsg: "Message", btn: "Send", success: "Thanks! We'll get back to you soon.", back: "Close / Back" },
    de: { title: "Kontakt", subtitle: "Haben Sie Fragen? Schreiben Sie uns!", labelName: "Name", labelEmail: "Email", labelMsg: "Nachricht", btn: "Senden", success: "Danke! Wir melden uns bald.", back: "Schließen / Zurück" }
  };

  const t = texts[language] || texts.en;

  const handleBack = () => {
    if (setMode) {
      setMode('dashboard');
    } else {
      window.history.back();
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 text-4xl shadow-inner border border-emerald-100">✓</div>
        <h2 className="text-2xl font-black tracking-tight text-slate-800">{t.success}</h2>
        <button 
          onClick={handleBack} 
          className="mt-10 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
        >
          {t.back}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          {t.title}
        </h1>
        <p className="text-emerald-600 uppercase tracking-[0.2em] text-[10px] font-black">
          {t.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-emerald-50 p-10 rounded-[2.5rem] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-3 text-slate-400">{t.labelName}</label>
            <input 
              required 
              name="name"
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all font-medium" 
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-3 text-slate-400">{t.labelEmail}</label>
            <input 
              required 
              name="email"
              type="email" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all font-medium" 
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest ml-3 text-slate-400">{t.labelMsg}</label>
          <textarea 
            required 
            name="message"
            rows="5" 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm text-slate-700 outline-none focus:border-emerald-200 focus:bg-white transition-all resize-none font-medium"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs transition-all hover:bg-emerald-700 active:scale-[0.98] shadow-lg shadow-emerald-100 disabled:opacity-50"
        >
          {loading ? "..." : t.btn}
        </button>

        <button 
          type="button"
          onClick={handleBack} 
          className="w-full text-[10px] uppercase font-bold tracking-widest text-slate-300 hover:text-emerald-600 transition-all mt-4"
        >
          ← {t.back}
        </button>
      </form>

      {/* Kapcsolati infók */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "@", text: "hello@ooovooo.com" },
          { icon: "HQ", text: "Zalaegerszeg, HU" },
          { icon: "IG", text: "@ooovooo" }
        ].map((item, idx) => (
          <div key={idx} className="p-6 rounded-[2rem] bg-white border border-emerald-50 text-center shadow-sm">
            <div className="text-emerald-500 mb-2 text-lg font-black">{item.icon}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}