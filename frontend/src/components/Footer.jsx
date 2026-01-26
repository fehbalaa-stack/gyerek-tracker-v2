// frontend/components/Footer.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Footer({ setMode }) {
  const { language } = useAuth();

  // Segédfunkció a stílusokhoz, hogy ne legyen tele a kód ismétléssel
  const linkStyle = "text-[11px] uppercase tracking-widest font-black opacity-40 hover:opacity-100 hover:text-primary transition-all cursor-pointer bg-transparent border-none p-0";

  return (
    <footer className="w-full py-10 mt-auto border-t border-white/5 bg-background/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Logo és Copyright */}
        <div className="flex flex-col items-center md:items-start">
          <span className="text-xl font-black tracking-tighter text-white">oooVooo</span>
          <p className="text-[10px] uppercase tracking-widest opacity-30 font-bold mt-1">
            © 2026 - All Rights Reserved
          </p>
        </div>

        {/* Jogi Linkek - Buttonokat használunk setMode-dal */}
        <div className="flex flex-wrap justify-center gap-8">
          <button 
            onClick={() => setMode('terms')} 
            className={linkStyle}
          >
            {language === 'hu' ? 'ÁSZF' : language === 'de' ? 'AGB' : 'Terms'}
          </button>
          
          <button 
            onClick={() => setMode('privacy')} 
            className={linkStyle}
          >
            {language === 'hu' ? 'Adatvédelem' : language === 'de' ? 'Datenschutz' : 'Privacy'}
          </button>
          
          <button 
            onClick={() => setMode('contact')} 
            className={linkStyle}
          >
            {language === 'hu' ? 'Kapcsolat' : language === 'de' ? 'Kontakt' : 'Contact'}
          </button>
        </div>

        {/* Platform infó */}
        <div className="text-[9px] opacity-20 font-bold uppercase tracking-widest">
          Platform: {language === 'hu' ? 'Magyar' : language === 'de' ? 'Deutsch' : 'English'}
        </div>
      </div>
    </footer>
  );
}