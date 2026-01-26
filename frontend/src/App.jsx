import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster, toast } from 'react-hot-toast';

// VIEW IMPORTOK
import { MapView } from './views/MapView';
import ShopView  from './views/ShopView';
import AdminView  from './views/AdminView';
import ChatView  from './views/ChatView';
import ContactView  from './views/ContactView';
import { TrackersView } from './views/TrackerView'; 
import AdminOrdersView  from './views/AdminOrdersView';
import CartView  from './views/CartView';
import PublicTrackerView from './views/PublicTrackerView'; 
import LegalView  from './views/LegalView'; 

// Kiemelt V3 nézetek
import DashboardViewV3 from './views/DashboardView'; 
import ProfileViewV3 from './views/ProfileView'; 
import LoginView from './views/LoginView'; 

// COMPONENT IMPORTOK
import { Navigation } from './components/Navigation';
import Footer from './components/Footer';

function AppContent() {
  const { user, loading, language } = useAuth(); 
  const isLoggedIn = !!user;

  const [mode, setMode] = useState('dashboard');
  const [trackers, setTrackers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedTrackerId, setSelectedTrackerId] = useState(null);
  const [cart, setCart] = useState([]);

  // 🔥 STRIPE VISSZATÉRÉS ÉS JOGI ÚTVONALAK KEZELÉSE
  useEffect(() => {
    const path = window.location.pathname;
    
    if (path === '/success') {
      setMode('success');
      setCart([]); // Kosár ürítése sikeres fizetés után
      window.history.replaceState({}, '', '/');
    } else if (path === '/cancel') {
      setMode('shop');
      toast.error('A fizetés megszakadt.');
      window.history.replaceState({}, '', '/');
    } else if (path === '/privacy') {
      setMode('privacy');
    } else if (path === '/terms') {
      setMode('terms');
    }
  }, []);

  const scanMatch = window.location.pathname.match(/\/scan\/([a-zA-Z0-9]+)/);
  const isScanPath = !!scanMatch;
  const scanCode = scanMatch ? scanMatch[1] : null;

  useEffect(() => {
    if (!user || isScanPath) return;

    const fetchData = async () => {
      try {
        const stored = localStorage.getItem('oooVooo_user');
        if (!stored) return;
        
        const userData = JSON.parse(stored);
        const token = userData.token || userData.accessToken;

        if (!token) return;

        const [resTrackers, resLogs] = await Promise.all([
          fetch('https://oovoo-backend.onrender.com/api/trackers/my-trackers', { 
            headers: { 'Authorization': `Bearer ${token}` } 
          }),
          fetch('https://oovoo-backend.onrender.com/api/trackers/logs', { 
            headers: { 'Authorization': `Bearer ${token}` } 
          })
        ]);

        if (resLogs.status === 401 || resTrackers.status === 401) return;

        const dataTrackers = await resTrackers.json();
        const dataLogs = await resLogs.json();

        setTrackers(Array.isArray(dataTrackers) ? dataTrackers : []);
        setLogs(Array.isArray(dataLogs) ? dataLogs : []);
      } catch (err) { 
        console.error("Adatbetöltési hiba:", err); 
      }
    };
    fetchData();
  }, [user, isScanPath]);

  const handleUpdateTracker = async (id, payload) => {
    try {
      const stored = localStorage.getItem('oooVooo_user');
      const { token } = JSON.parse(stored);

      const res = await fetch(`https://oovoo-backend.onrender.com/api/trackers/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setTrackers(prev => prev.map(t => (t._id === id ? { ...t, ...data.tracker } : t)));
        toast.success('Beállítások mentve!');
      }
    } catch (err) { toast.error('Módosítás sikertelen'); }
  };

  const handleSetMode = (m, d) => { 
    setSelectedTrackerId(d?.trackerId || null); 
    setMode(m); 
    if (m !== 'dashboard' && !isScanPath) window.history.replaceState({}, '', '/');
  };
  
  const handleDeleteTracker = async (id) => {
    try {
      const stored = localStorage.getItem('oooVooo_user');
      const { token } = JSON.parse(stored);
      await fetch(`https://oovoo-backend.onrender.com/api/trackers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setTrackers(prev => prev.filter(t => t._id !== id));
      toast.success('Tracker törölve');
    } catch (err) { toast.error('Törlés sikertelen'); }
  };

  const handleTrackerAdded = (t) => setTrackers(prev => [t, ...prev]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FBFDFF]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <span className="text-emerald-600 font-black tracking-widest text-sm uppercase">oooVooo...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col transition-all duration-500 bg-[#FBFDFF] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {isLoggedIn && !isScanPath && (
        <Navigation 
          setMode={handleSetMode} 
          currentMode={mode} 
          cartCount={cart.length}
          isAdmin={user?.role === 'admin'}
        />
      )}

      <main className="flex-1 relative">
        {isScanPath ? (
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <PublicTrackerView code={scanCode} />
          </div>
        ) : !isLoggedIn && !['privacy', 'terms', 'contact'].includes(mode) ? ( 
          <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
            <LoginView setMode={handleSetMode} />
          </div>
        ) : (
          <div key={`content-${language}`} className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
            <div className="container mx-auto px-4 py-10 max-w-7xl">
              
              {/* SIKERES FIZETÉS ÜZENET */}
              {mode === 'success' && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Sikeres rendelés!</h1>
                  <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">Köszönjük a bizalmadat! Hamarosan megkezdjük a gyártást és értesítünk a részletekről.</p>
                  <button 
                    onClick={() => setMode('dashboard')}
                    className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-95"
                  >
                    Vissza a vezérlőpultra
                  </button>
                </div>
              )}

              {mode === 'dashboard' && <DashboardViewV3 user={user} trackers={trackers} setMode={handleSetMode} onTrackerAdded={handleTrackerAdded} />}
              {mode === 'settings' && <ProfileViewV3 user={user} />}
              {mode === 'manage' && <TrackersView trackers={trackers} onDelete={handleDeleteTracker} onUpdate={handleUpdateTracker} />}
              {mode === 'map' && <MapView trackers={trackers} logs={logs} />} 
              {mode === 'chat' && <ChatView trackers={trackers} logs={logs} isPremium={user?.isPremium} />}
              {(mode === 'webshop' || mode === 'shop') && <ShopView trackers={trackers} selectedTrackerId={selectedTrackerId} setMode={handleSetMode} addToCart={(item) => setCart([...cart, item])} />}
              {mode === 'cart' && <CartView cart={cart} removeFromCart={(id) => setCart(cart.filter(i => i.cartId !== id))} clearCart={() => setCart([])} setMode={handleSetMode} user={user} />}
              {mode === 'admin-orders' && user?.role === 'admin' && <AdminOrdersView />}
              {mode === 'contact' && <ContactView setMode={handleSetMode} />} 
              {mode === 'admin' && user?.role === 'admin' && <AdminView />}
              {mode === 'privacy' && <LegalView type="privacy" setMode={handleSetMode} />}
              {mode === 'terms' && <LegalView type="terms" setMode={handleSetMode} />}
            </div>
          </div>
        )}
      </main>
      
      {!isScanPath && <Footer setMode={handleSetMode} />}

      {/* Háttér dekoráció */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-emerald-50 rounded-full blur-[100px] opacity-30"></div>
      </div>
    </div>
  );
}

export default function App() { 
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster position="top-center" />
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  ); 
}
