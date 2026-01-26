import React from 'react';
import { useAuth } from '../context/AuthContext';

const legalContent = {
  hu: {
    privacy: { title: "Adatvédelmi Irányelvek", text: "Az oooVooo (a továbbiakban: Szolgáltató) az Ön e-mail címét és chat üzeneteit a szolgáltatás biztosítása érdekében kezeli. Az adatokat biztonságos MongoDB szervereken tároljuk. A fizetési adatokat közvetlenül a Stripe kezeli, azokhoz a Szolgáltató nem fér hozzá. Ön bármikor kérheti adatainak törlését a profil oldalon." },
    terms: { title: "Általános Szerződési Feltételek", text: "A szolgáltatás használatával Ön elfogadja, hogy az oooVooo csupán egy kommunikációs platform. Nem vállalunk felelősséget az elveszett tárgyak fizikai állapotáért vagy azok visszajuttatásáért. A Prémium funkciók megvásárlása azonnali hozzáférést biztosít, így elállásra a teljesítés után nincs lehetőség." }
  },
  en: {
    privacy: { title: "Privacy Policy", text: "oooVooo (the Provider) processes your email and chat messages to provide the service. Data is stored on secure MongoDB servers. Payment data is handled directly by Stripe; the Provider has no access to it. You can request data deletion at any time via the profile page." },
    terms: { title: "Terms of Service", text: "By using the service, you agree that oooVooo is merely a communication platform. We are not responsible for the physical condition or return of lost items. Purchasing Premium features provides immediate access, and no refunds are available after fulfillment." }
  },
  de: {
    privacy: { title: "Datenschutz", text: "oooVooo (der Anbieter) verarbeitet Ihre E-Mail und Chat-Nachrichten, um den Dienst bereitzustellen. Die Daten werden auf sicheren MongoDB-Servern gespeichert. Zahlungsdaten werden direkt von Stripe verarbeitet; der Anbieter hat keinen Zugriff darauf. Sie können jederzeit über die Profilseite die Löschung Ihrer Daten beantragen." },
    terms: { title: "AGB", text: "Durch die Nutzung des Dienstes erklären Sie sich damit einverstanden, dass oooVooo lediglich eine Kommunikationsplattform ist. Wir sind nicht verantwortlich für den Zustand oder die Rückgabe verlorener Gegenstände. Der Kauf von Premium-Funktionen bietet sofortigen Zugriff; Rückerstattungen sind nach der Bereitstellung nicht möglich." }
  }
};

export default function LegalView({ type, setMode }) {
  const { language } = useAuth();
  const content = legalContent[language]?.[type] || legalContent.en[type];

  const handleBack = () => {
    if (setMode) {
      setMode('dashboard');
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFDFF] p-6 md:p-10 pt-20 md:pt-32 animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto bg-white border border-emerald-50 p-8 md:p-12 rounded-[2.5rem] shadow-sm">
        {/* Ikon a fejléc felett */}
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-xl mb-8 border border-emerald-100/50 shadow-inner">
          {type === 'privacy' ? '🛡️' : '📋'}
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
          {content.title}
        </h1>
        
        <div className="prose prose-slate">
          <p className="text-slate-500 leading-relaxed font-medium whitespace-pre-line text-sm md:text-base">
            {content.text}
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-emerald-50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <button 
            onClick={handleBack} 
            className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95"
          >
            ← {language === 'hu' ? 'Bezárás / Vissza' : language === 'de' ? 'Schließen / Zurück' : 'Close / Back'}
          </button>
          
          <div className="text-right">
             <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] block">
               oooVooo Legal v1.0
             </span>
             <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">
               Verified Policy
             </span>
          </div>
        </div>
      </div>
      
      <p className="text-center mt-10 text-[10px] text-slate-300 font-black uppercase tracking-[0.4em]">
        oooVooo Security Protocol Active
      </p>
    </div>
  );
}