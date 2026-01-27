import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// --- FORDÍTÁSI OBJEKTUM ---
const translations = {
  hu: {
    titlePersonal: "Személyes", titleSettings: "Beállítások", titleSocial: "Social", titlePresence: "Jelenlét",
    titleAccount: "Fiók", titleData: "Adatok", titleOrders: "Rendelések", titleStatus: "Állapota",
    navPersonal: "Személyes", navSocial: "Közösségi", navOrders: "Rendeléseim",
    navSecurity: "Fiók / Biztonság", labelName: "Megjelenítendő név", labelPhone: "Telefonszám",
    labelEmergency: "Sürgősségi név + szám (🚨)", labelLang: "Rendszer Nyelve / Interface Language",
    labelBio: "Üzenet a megtalálónak (Bio)", placeholderBio: "Írj ide valamit, amit a megtaláló látni fog...",
    labelEmail: "Regisztrált E-mail", btnPassword: "Jelszó módosítása", btnSave: "BEÁLLÍTÁSOK MENTÉSE",
    btnSaving: "ADATOK FRISSÍTÉSE...", msgLoadError: "Profil betöltése sikertelen",
    msgSaveSuccess: "Változtatások mentve az adatbázisba!", msgSaveError: "Hiba a mentés során",
    orderEmpty: "Még nincs leadott rendelésed.", orderId: "Rendelésszám", statusPending: "Várakozik",
    statusProcessing: "Gyártás alatt", statusShipped: "Kiszállítva"
  },
  en: {
    titlePersonal: "Personal", titleSettings: "Settings", titleSocial: "Social", titlePresence: "Presence",
    titleAccount: "Account", titleData: "Details", titleOrders: "My Orders", titleStatus: "Status",
    navPersonal: "Personal", navSocial: "Social", navOrders: "Orders",
    navSecurity: "Account / Security", labelName: "Display Name", labelPhone: "Phone Number",
    labelEmergency: "Emergency Name + Number (🚨)", labelLang: "Interface Language",
    labelBio: "Message to Finder (Bio)", placeholderBio: "Write something the finder will see...",
    labelEmail: "Registered E-mail", btnPassword: "Change Password", btnSave: "SAVE SETTINGS",
    btnSaving: "UPDATING DATA...", msgLoadError: "Failed to load profile",
    msgSaveSuccess: "Changes saved to database!", msgSaveError: "Error during save",
    orderEmpty: "No orders yet.", orderId: "Order #", statusPending: "Pending",
    statusProcessing: "In Production", statusShipped: "Shipped"
  },
  de: {
    titlePersonal: "Persönlich", titleSettings: "Einstellungen", titleSocial: "Soziale", titlePresence: "Präsenz",
    titleAccount: "Konto", titleData: "Daten", titleOrders: "Bestellungen", titleStatus: "Status",
    navPersonal: "Persönlich", navSocial: "Sozial", navOrders: "Bestellungen",
    navSecurity: "Konto / Security", labelName: "Anzeigename", labelPhone: "Telefonnummer",
    labelEmergency: "Notfallname + Nummer (🚨)", labelLang: "Systemsprache",
    labelBio: "Nachricht an den Finder (Bio)", placeholderBio: "Schreiben Sie etwas...",
    labelEmail: "E-Mail", btnPassword: "Passwort ändern", btnSave: "SPEICHERN",
    btnSaving: "AKTUALISIERUNG...", msgLoadError: "Fehler beim Laden",
    msgSaveSuccess: "In der Datenbank gespeichert!", msgSaveError: "Fehler",
    orderEmpty: "Keine Bestellungen.", orderId: "Bestellnr", statusPending: "Warten",
    statusProcessing: "In Produktion", statusShipped: "Versandt"
  }
};

export default function SettingsView() {
  const { updateGlobalLanguage } = useAuth(); 
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '', email: '', phoneNumber: '', emergencyPhone: '',
    instagram: '', facebook: '', bio: '', language: 'hu' 
  });

  const t = useMemo(() => translations[profile.language] || translations.hu, [profile.language]);

  // Profil betöltése az adatbázisból (beleértve a mentett nyelvet is)
  useEffect(() => {
    const fetchProfile = async () => {
      const stored = localStorage.getItem('oooVooo_user');
      if (!stored) return;
      const { token } = JSON.parse(stored);

      try {
        const res = await fetch('https://oovoo-backend.onrender.com/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProfile(prev => ({ ...prev, ...data }));
        
        // Szinkronizáljuk a globális nyelvi állapotot a mentett beállítással [cite: 2026-01-02]
        if (data.language) updateGlobalLanguage(data.language);
      } catch (err) {
        console.error("Profil betöltési hiba:", err);
      }
    };
    fetchProfile();
  }, []);

  // Rendelések lekérése, ha az Orders fül aktív [cite: 2026-01-06]
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchMyOrders = async () => {
        setIsOrdersLoading(true);
        try {
          const stored = localStorage.getItem('oooVooo_user');
          const { token } = JSON.parse(stored);
          const res = await fetch('https://oovoo-backend.onrender.com/api/orders/my-orders', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setOrders(data.orders || []);
          }
        } catch (err) {
          console.error("Rendelések hiba:", err);
        } finally {
          setIsOrdersLoading(false);
        }
      };
      fetchMyOrders();
    }
  }, [activeTab]);

  // Mentés az adatbázisba (Profil adatok + Nyelv) [cite: 2026-01-02, 2026-01-06]
  const handleSave = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('oooVooo_user');
      const { token } = JSON.parse(stored);

      const res = await fetch('https://oovoo-backend.onrender.com/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile) // Ebben benne van a választott language mező is
      });

      if (res.ok) {
        toast.success(t.msgSaveSuccess);
        updateGlobalLanguage(profile.language); 
        
        // Frissítjük a helyi tárolót is, hogy konzisztens maradjon [cite: 2026-01-06]
        const userData = JSON.parse(stored);
        userData.language = profile.language;
        localStorage.setItem('oooVooo_user', JSON.stringify(userData));
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error(t.msgSaveError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Sidebar / Tabs */}
      <aside className="w-full md:w-64 flex flex-row md:flex-col gap-2">
        {[
          { id: 'profile', label: t.navPersonal, icon: '👤' },
          { id: 'social', label: t.navSocial, icon: '📱' },
          { id: 'orders', label: t.navOrders, icon: '📦' },
          { id: 'security', label: t.navSecurity, icon: '🛡️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 md:flex-none flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
              activeTab === tab.id 
              ? 'bg-primary text-black shadow-glow-primary/20 scale-105' 
              : 'bg-card text-muted-foreground hover:text-foreground border border-border/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </aside>

      {/* Main Content Card */}
      <main className="flex-1">
        <div className="bg-card border-2 border-primary/20 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-glow">
              {activeTab === 'profile' && <>{t.titlePersonal} <span className="text-primary">{t.titleSettings}</span></>}
              {activeTab === 'social' && <>{t.titleSocial} <span className="text-primary">{t.titlePresence}</span></>}
              {activeTab === 'orders' && <>{t.titleOrders} <span className="text-primary">{t.titleStatus}</span></>}
              {activeTab === 'security' && <>{t.titleAccount} <span className="text-primary">{t.titleData}</span></>}
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {/* --- RENDELÉSEK NÉZET --- */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {isOrdersLoading ? (
                    <div className="text-center py-10 animate-pulse font-black uppercase italic tracking-widest">Szinkronizálás...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-background/30 rounded-[2rem] border border-dashed border-white/5 opacity-50 italic">
                      {t.orderEmpty}
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order._id} className="bg-background/50 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl filter drop-shadow-glow">
                            {order.productType === 'tshirt' ? '👕' : order.productType === 'hoodie' ? '🧥' : '🏷️'}
                          </span>
                          <div>
                            <p className="text-[10px] font-black uppercase italic text-primary">{t.orderId}: #{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-[12px] font-bold text-foreground mt-1 uppercase tracking-tighter">
                              {order.productType} <span className="text-muted-foreground opacity-50 px-2">|</span> {order.uniqueCode}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg ${
                            order.status === 'shipped' ? 'bg-green-500 text-black shadow-green-500/20' :
                            order.status === 'processing' ? 'bg-blue-500 text-white shadow-blue-500/20' : 
                            'bg-yellow-500 text-black shadow-yellow-500/20'
                          }`}>
                            {order.status === 'pending' ? t.statusPending : 
                             order.status === 'processing' ? t.statusProcessing : t.statusShipped}
                          </span>
                          <p className="text-[8px] text-muted-foreground mt-2 font-bold opacity-40 italic">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* --- PROFIL NÉZET --- */}
              {activeTab === 'profile' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-[0.2em] italic text-primary">{t.labelName}</label>
                    <input 
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      className="vura-input-glow w-full bg-background/50 border border-border rounded-2xl px-6 py-4 focus:border-primary outline-none font-bold text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-[0.2em] italic">{t.labelPhone}</label>
                      <input 
                        type="text"
                        value={profile.phoneNumber}
                        onChange={e => setProfile({...profile, phoneNumber: e.target.value})}
                        className="vura-input-glow w-full bg-background/50 border border-border rounded-2xl px-6 py-4 focus:border-primary outline-none font-bold text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-red-500/80 ml-2 tracking-[0.2em] italic">{t.labelEmergency}</label>
                      <input 
                        type="text"
                        value={profile.emergencyPhone}
                        onChange={e => setProfile({...profile, emergencyPhone: e.target.value})}
                        className="vura-input-glow w-full bg-red-500/5 border border-red-500/20 rounded-2xl px-6 py-4 focus:border-red-500 outline-none font-bold text-lg text-red-100 placeholder:opacity-20"
                        placeholder="Pl. Anya: +36..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-primary ml-2 tracking-widest italic">{t.labelLang}</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'hu', label: 'Magyar' },
                        { id: 'en', label: 'English' },
                        { id: 'de', label: 'Deutsch' }
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setProfile(prev => ({...prev, language: lang.id}))}
                          className={`flex-1 min-w-[100px] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-200 ${
                            profile.language === lang.id 
                            ? 'bg-primary text-black shadow-glow-primary scale-105 border-transparent' 
                            : 'bg-background/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-[0.2em] italic">{t.labelBio}</label>
                    <textarea 
                      value={profile.bio}
                      onChange={e => setProfile({...profile, bio: e.target.value})}
                      rows="3"
                      className="vura-input-glow w-full bg-background/50 border border-border rounded-2xl px-6 py-4 focus:border-primary outline-none font-bold resize-none italic"
                      placeholder={t.placeholderBio}
                    />
                  </div>
                </>
              )}

              {/* --- SOCIAL --- */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-[0.2em] italic font-bold">Instagram</label>
                    <input 
                      type="text"
                      value={profile.instagram}
                      onChange={e => setProfile({...profile, instagram: e.target.value})}
                      placeholder="@username"
                      className="vura-input-glow w-full bg-background/50 border border-border rounded-2xl px-6 py-4 focus:border-primary outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-[0.2em] italic font-bold">Facebook</label>
                    <input 
                      type="text"
                      value={profile.facebook}
                      onChange={e => setProfile({...profile, facebook: e.target.value})}
                      placeholder="Facebook URL"
                      className="vura-input-glow w-full bg-background/50 border border-border rounded-2xl px-6 py-4 focus:border-primary outline-none font-bold"
                    />
                  </div>
                </div>
              )}

              {/* --- SECURITY --- */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="p-8 border-2 border-dashed border-primary/10 rounded-[2rem] text-center space-y-4 bg-primary/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{t.labelEmail}</p>
                    <p className="text-2xl font-black text-foreground tracking-tighter">{profile.email}</p>
                  </div>
                  <button className="w-full bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] py-4 rounded-2xl hover:bg-white hover:text-black transition-all">
                    {t.btnPassword}
                  </button>
                </div>
              )}
            </div>

            {/* Mentés Gomb - Rendelések fülön elrejtve */}
            {activeTab !== 'orders' && (
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-primary text-black font-black uppercase text-[12px] tracking-[0.3em] py-6 rounded-[2rem] hover:shadow-glow-primary transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
              >
                {loading ? t.btnSaving : t.btnSave}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}