import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// --- EMOJI IKON GENERÁTOR ---
const createEmojiIcon = (emoji) => L.divIcon({
    html: `<div style="font-size: 30px; filter: drop-shadow(0 0 3px rgba(0,0,0,0.5)); cursor: pointer;">${emoji}</div>`,
    className: 'custom-emoji-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

function LocationMarker({ coords, type = 'user', name = '', onSelect }) {
    const map = useMap();
    useEffect(() => { if (coords && type === 'user') map.flyTo(coords, 15); }, [coords, map, type]);
    const emojis = { kutya: '🐶', macska: '🐱', ember: '👤', user: '📍' };
    return coords ? (
        <Marker position={coords} icon={createEmojiIcon(emojis[type] || '📍')} eventHandlers={{ click: () => onSelect && onSelect() }}>
            <Popup><div style={{textAlign: 'center'}}><strong>{type === 'user' ? 'Te vagy itt' : name}</strong><br/>{type !== 'user' && <button style={{marginTop:'5px', cursor:'pointer'}} onClick={onSelect}>Kapcsolatfelvétel</button>}</div></Popup>
        </Marker>
    ) : null;
}

const THEME = {
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    cardBg: 'rgba(30, 41, 59, 0.85)',
    cardBorder: '1px solid rgba(255, 255, 255, 0.08)',
    textMain: '#f1f5f9',
    accentBlue: '#3b82f6',
    accentGold: '#f59e0b',
    accentRed: '#ef4444',
    accentGreen: '#22c55e',
    accentPurple: '#8b5cf6',
    inputBg: 'rgba(15, 23, 42, 0.6)',
};

const globalStyle = document.createElement('style');
globalStyle.innerHTML = `
  body { margin: 0; font-family: 'Segoe UI', sans-serif; background: ${THEME.bgGradient}; color: ${THEME.textMain}; min-height: 100vh; }
  .nav-button { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; padding: 10px 15px; border-radius: 12px; font-weight: 600; color: #fff; font-size: 13px; background: rgba(255,255,255,0.05); }
  .nav-button:hover { transform: translateY(-2px) scale(1.05); filter: brightness(1.2); }
  .nav-button.active { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); background: ${THEME.accentBlue}; }
  .log-table { width: 100%; border-collapse: collapse; margin-top: 20px; color: #cbd5e1; }
  .log-table th { text-align: left; padding: 12px; border-bottom: 2px solid rgba(255,255,255,0.1); }
  .log-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .welcome-box { background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border-left: 4px solid ${THEME.accentBlue}; padding: 25px; border-radius: 12px; margin-bottom: 25px; animation: fadeIn 0.8s ease-out; }
  .info-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px; }
  .info-card { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
  .info-card h4 { color: ${THEME.accentGold}; margin-top: 0; }
  .chat-box { height: 350px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; display: flex; flexDirection: column; gap: 10px; margin-bottom: 15px; }
  .msg { max-width: 80%; padding: 10px 15px; border-radius: 15px; font-size: 14px; line-height: 1.4; position: relative; }
  .msg.sent { align-self: flex-end; background: ${THEME.accentBlue}; color: white; border-bottom-right-radius: 2px; }
  .msg.received { align-self: flex-start; background: #334155; color: white; border-bottom-left-radius: 2px; }
  .action-btn { transition: 0.2s; cursor: pointer; border: none; font-weight: bold; color: white; padding: 12px; border-radius: 10px; width: 100%; }
  .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
`;
document.head.appendChild(globalStyle);

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', background: 'rgba(15,23,42,0.8)', borderRadius: '20px', marginBottom: '30px', border: THEME.cardBorder, backdropFilter: 'blur(10px)' },
    card: { background: THEME.cardBg, borderRadius: '24px', border: THEME.cardBorder, padding: '30px', marginBottom: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: THEME.inputBg, color: '#fff', marginBottom: '12px', boxSizing: 'border-box' },
    btnPrimary: { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: THEME.accentBlue, color: 'white', fontWeight: 'bold', cursor: 'pointer' },
};

function App() {
    const [mode, setMode] = useState('login'); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [regData, setRegData] = useState({ name: '', email: '', phone: '+36', password: '', confirmPassword: '' });
    const [forgotEmail, setForgotEmail] = useState("");
    const [logs, setLogs] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allTrackers, setAllTrackers] = useState([]); 
    const [myLocation, setMyLocation] = useState([47.4979, 19.0402]);
    const [messages, setMessages] = useState([]);
    const [msgInput, setMsgInput] = useState("");
    const [selectedReceiverId, setSelectedReceiverId] = useState("");
    const [userTrackers, setUserTrackers] = useState([]);
    const [foundInfo, setFoundInfo] = useState(null);

    useEffect(() => {
        const path = window.location.pathname;
        if (path.startsWith('/find/')) {
            const id = path.split('/')[2];
            setMode('find');
            axios.get(`http://localhost:5000/api/find/${id}`)
                .then(res => setFoundInfo(res.data))
                .catch(() => alert("Ismeretlen kód!"));
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => setMyLocation([pos.coords.latitude, pos.coords.longitude]));
        }
        
        const storedUser = localStorage.getItem('user');
        if (storedUser && !path.startsWith('/find/')) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed); setIsLoggedIn(true); setMode('dashboard');
            fetchMyTrackers(parsed._id);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn && user) {
            socket.emit('join_room', user._id);
            fetchMessages();
            socket.on('receive_message', (newMsg) => setMessages(prev => [...prev, newMsg]));
            return () => socket.off('receive_message');
        }
    }, [isLoggedIn, user]);

    const fetchMessages = async () => { try { const res = await axios.get(`http://localhost:5000/api/messages/${user._id}`); setMessages(res.data); } catch (err) {} };
    const fetchLogs = async () => { try { const res = await axios.get('http://localhost:5000/api/logs'); setLogs(res.data); } catch (err) {} };
    const fetchMyTrackers = async (userId) => { try { const res = await axios.get(`http://localhost:5000/api/trackers/${userId}`); setUserTrackers(res.data); } catch (err) {} };
    const fetchAllUsers = async () => { try { const res = await axios.get('http://localhost:5000/api/users'); setAllUsers(res.data); } catch (err) {} };

    const fetchAllOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users');
            let list = [];
            for(let u of res.data) {
                const trRes = await axios.get(`http://localhost:5000/api/trackers/${u._id}`);
                list.push(...trRes.data.map(t => ({...t, ownerEmail: u.email, ownerName: u.name})));
            }
            setAllTrackers(list);
        } catch (err) {}
    };

    const handleSendMessage = () => {
        const receiverId = mode === 'find' ? foundInfo.ownerId : selectedReceiverId;
        if (!msgInput || !receiverId) return alert("Válassz célpontot!");
        socket.emit('send_message', {
            sender: user ? user._id : "FINDER", 
            senderName: user ? user.name : "Megtaláló", 
            receiver: receiverId, text: msgInput
        });
        setMsgInput("");
        if (mode === 'find') alert("Üzenet elküldve a gazdinak!");
    };

    const handlePurchase = async (defaultName, type) => {
        const customName = prompt(`Kihez/Mihez rendeled a ${defaultName} eszközt?`, "");
        if (customName === null || customName.trim() === "") return;
        try {
            await axios.post('http://localhost:5000/api/trackers', { owner: user._id, name: customName, type: type });
            alert(`Sikeres rendelés: ${customName}!`);
            fetchMyTrackers(user._id);
        } catch (err) {}
    };

    const handleEditName = async (trackerId, currentName) => {
        const newName = prompt(`Add meg az új nevet (${currentName} helyett):`, currentName);
        if (newName === null || newName.trim() === "" || newName === currentName) return;
        try {
            await axios.put(`http://localhost:5000/api/trackers/${trackerId}`, { name: newName });
            alert("Név sikeresen módosítva!");
            fetchMyTrackers(user._id);
        } catch (err) { alert("Hiba a módosítás során!"); }
    };

    const handleDeleteTracker = async (trackerId, trackerName) => {
        if (!window.confirm(`Biztosan törölni szeretnéd a következőt: ${trackerName}?`)) return;
        try {
            await axios.delete(`http://localhost:5000/api/trackers/${trackerId}`);
            alert("Sikeres törlés!");
            fetchMyTrackers(user._id);
        } catch (err) { alert("Hiba a törlés során!"); }
    };

    const handlePrintQR = async (trackerId, trackerName) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/trackers/${trackerId}/qrcode/${user._id}`);
            const qrWindow = window.open('', '_blank');
            qrWindow.document.write(`<html><body style="text-align:center; padding: 50px; font-family: sans-serif;"><h1>TrackR QR Kód</h1><hr/><h2>Név: ${trackerName}</h2><img src="${res.data.qrCode}" style="width:300px; margin: 20px 0;"/><p>Azonosító: ${trackerId}</p><button onclick="window.print()">Nyomtatás</button></body></html>`);
        } catch (err) { alert("Hiba!"); }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', loginData);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data); setIsLoggedIn(true); setMode('dashboard');
            fetchMyTrackers(res.data._id);
        } catch (err) { alert("Hibás belépés!"); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (regData.password !== regData.confirmPassword) return alert("A jelszavak nem egyeznek!");
        try {
            await axios.post('http://localhost:5000/api/register', {
                name: regData.name,
                email: regData.email,
                phoneNumber: regData.phone,
                password: regData.password
            });
            alert("Sikeres regisztráció! Most már beléphetsz.");
            setMode('login');
        } catch (err) { alert("Hiba a regisztráció során!"); }
    };

    const handleForgot = (e) => {
        e.preventDefault();
        alert(`Jelszó-visszaállító link elküldve a(z) ${forgotEmail} címre! (Demo funkció)`);
        setMode('login');
    };

    if (mode === 'find' && foundInfo) {
        return (
            <div style={{...styles.container, justifyContent:'center', alignItems:'center'}}>
                <div style={{...styles.card, width:'400px', textAlign:'center'}}>
                    <div style={{fontSize:'60px'}}>{foundInfo.type === 'kutya' ? '🐶' : foundInfo.type === 'macska' ? '🐱' : '👤'}</div>
                    <h2>Megtaláltad: {foundInfo.name}!</h2>
                    <p>Gazdi: {foundInfo.ownerName}</p>
                    <p>Telefon: <a href={`tel:${foundInfo.ownerPhone}`} style={{color:THEME.accentBlue}}>{foundInfo.ownerPhone}</a></p>
                    <textarea style={{...styles.input, height:'100px'}} placeholder="Üzenet a gazdinak..." value={msgInput} onChange={e=>setMsgInput(e.target.value)} />
                    <button style={styles.btnPrimary} onClick={handleSendMessage}>Üzenet küldése</button>
                    <button style={{marginTop:'15px', background:'none', color:THEME.accentBlue, cursor:'pointer'}} onClick={()=>window.location.href='/'}>Vissza</button>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div style={{...styles.container, justifyContent:'center', alignItems:'center'}}>
                <div style={{...styles.card, width:'400px', textAlign:'center'}}>
                    <h1>TrackR {mode === 'login' ? 'Login' : mode === 'register' ? 'Regisztráció' : 'Jelszóvisszaállítás'}</h1>
                    {mode === 'login' && (
                        <form onSubmit={handleLogin}>
                            <input style={styles.input} type="email" placeholder="Email" onChange={e=>setLoginData({...loginData, email:e.target.value})} required />
                            <input style={styles.input} type="password" placeholder="Jelszó" onChange={e=>setLoginData({...loginData, password:e.target.value})} required />
                            <button style={styles.btnPrimary}>Belépés</button>
                            <div style={{marginTop:'20px', fontSize:'14px', display:'flex', flexDirection:'column', gap:'10px'}}>
                                <span style={{color:THEME.accentBlue, cursor:'pointer'}} onClick={() => setMode('register')}>Nincs még fiókod? Regisztrálj itt</span>
                                <span style={{color:THEME.accentGold, cursor:'pointer', fontSize:'12px'}} onClick={() => setMode('forgot')}>Elfelejtetted a jelszavad?</span>
                            </div>
                        </form>
                    )}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister}>
                            <input style={styles.input} type="text" placeholder="Teljes név" onChange={e=>setRegData({...regData, name:e.target.value})} required />
                            <input style={styles.input} type="email" placeholder="Email cím" onChange={e=>setRegData({...regData, email:e.target.value})} required />
                            <input style={styles.input} type="text" placeholder="Telefonszám" value={regData.phone} onChange={e=>setRegData({...regData, phone:e.target.value})} required />
                            <input style={styles.input} type="password" placeholder="Jelszó" onChange={e=>setRegData({...regData, password:e.target.value})} required />
                            <input style={styles.input} type="password" placeholder="Jelszó ismétlése" onChange={e=>setRegData({...regData, confirmPassword:e.target.value})} required />
                            <button style={styles.btnPrimary}>Regisztráció</button>
                            <p style={{marginTop:'20px', fontSize:'14px', color:THEME.accentBlue, cursor:'pointer'}} onClick={() => setMode('login')}>Van már fiókod? Lépj be itt</p>
                        </form>
                    )}
                    {mode === 'forgot' && (
                        <form onSubmit={handleForgot}>
                            <p style={{fontSize:'13px', opacity:0.8, marginBottom:'20px'}}>Add meg az e-mail címed, és küldünk egy linket a jelszó módosításához.</p>
                            <input style={styles.input} type="email" placeholder="Email címed" onChange={e=>setForgotEmail(e.target.value)} required />
                            <button style={styles.btnPrimary}>Link küldése</button>
                            <p style={{marginTop:'20px', fontSize:'14px', color:THEME.accentBlue, cursor:'pointer'}} onClick={() => setMode('login')}>Vissza a belépéshez</p>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={{fontSize: '22px', fontWeight: '800', color: '#fff', cursor: 'pointer'}} onClick={() => setMode('dashboard')}>TrackR</div>
                <div style={{display:'flex', gap:'10px'}}>
                    <button className={`nav-button ${mode === 'map' ? 'active' : ''}`} onClick={() => setMode('map')}>🌍 Térkép</button>
                    <button className={`nav-button ${mode === 'chat' ? 'active' : ''}`} onClick={() => {setMode('chat'); fetchMessages();}}>💬 Chat</button>
                    <button className={`nav-button ${mode === 'log' ? 'active' : ''}`} onClick={() => {setMode('log'); fetchLogs();}}>📋 Log</button>
                    <button className={`nav-button ${mode === 'webshop' ? 'active' : ''}`} onClick={() => setMode('webshop')}>🛒 Shop</button>
                    <button className={`nav-button ${mode === 'settings' ? 'active' : ''}`} onClick={() => setMode('settings')}>⚙️ Beállítások</button>
                    {user?.role === 'admin' && (
                        <>
                            <button className={`nav-button ${mode === 'orders' ? 'active' : ''}`} onClick={() => {setMode('orders'); fetchAllOrders();}}>📦 Rendelések</button>
                            <button className={`nav-button ${mode === 'admin' ? 'active' : ''}`} onClick={() => {setMode('admin'); fetchAllUsers();}}>👥 Tagok</button>
                        </>
                    )}
                    <button className="nav-button" style={{color: THEME.accentRed}} onClick={() => { localStorage.removeItem('user'); setIsLoggedIn(false); }}>🚪</button>
                </div>
            </div>

            {mode === 'dashboard' && (
                <div className="welcome-box">
                    <h2 style={{marginTop:0}}>Üdvözlünk a TrackR közösségben, {user.name}! 👋</h2>
                    <p style={{opacity:0.8}}>A Te biztonságod és szeretteid védelme a küldetésünk.</p>
                    <div className="info-section">
                        <div className="info-card">
                            <h4>🛒 Hogyan rendelhetsz?</h4>
                            <p style={{fontSize:'13px', lineHeight:'1.6'}}>Válaszd a <b>Shop</b> menüpontot, válaszd ki az eszközt és add meg a nevet. A rendelésed bekerül az adminisztrációs rendszerbe gyártásra.</p>
                        </div>
                        <div className="info-card">
                            <h4>🔍 Mi történik leolvasáskor?</h4>
                            <p style={{fontSize:'13px', lineHeight:'1.6'}}>A megtaláló látja az általad megadott elérhetőségeket, és <b>azonnal tud neked biztonságos üzenetet küldeni</b>, amit a Chat ablakban kapsz meg.</p>
                        </div>
                        <div className="info-card">
                            <h4>🤝 Hogyan segítünk?</h4>
                            <p style={{fontSize:'13px', lineHeight:'1.6'}}>A rendszerünk 24/7 rögzíti a leolvasási kísérleteket a <b>Log</b> fülön, így látható marad minden aktivitás.</p>
                        </div>
                    </div>
                </div>
            )}

            {mode === 'map' && (
                <div style={{...styles.card, height: '550px', padding: '10px'}}>
                    <MapContainer center={myLocation} zoom={15} style={{ height: '100%', width: '100%', borderRadius: '16px' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker coords={myLocation} type="user" />
                        {userTrackers.map((t, idx) => (
                            <LocationMarker key={t._id} coords={[myLocation[0] + (idx * 0.002), myLocation[1] + (idx * 0.002)]} type={t.type} name={t.name} onSelect={() => { setSelectedReceiverId(t.owner); alert("Célpont kiválasztva!"); }} />
                        ))}
                    </MapContainer>
                </div>
            )}

            {mode === 'chat' && (
                <div style={styles.card}>
                    <h2>💬 Chat</h2>
                    <div className="chat-box">{messages.filter(m => m.receiver === user._id || m.sender === user._id).map((m, i) => (<div key={i} className={`msg ${m.sender === user._id ? 'sent' : 'received'}`}><div style={{fontSize:'10px', opacity:0.7}}>{m.senderName}</div><div>{m.text}</div></div>))}</div>
                    <div style={{display:'flex', gap:'10px'}}><input style={{...styles.input, marginBottom:0}} placeholder="Üzenet..." value={msgInput} onChange={e=>setMsgInput(e.target.value)} /><button className="action-btn" style={{background: THEME.accentGreen, width:'100px'}} onClick={handleSendMessage}>Küldés</button></div>
                </div>
            )}

            {mode === 'settings' && (
                <div style={styles.card}>
                    <h2>⚙️ Beállítások & Családi Csoportok</h2>
                    {['ember', 'kutya', 'macska'].map(cat => (
                        <div key={cat} style={{marginBottom:'20px'}}>
                            <h4 style={{borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'5px', textTransform:'capitalize'}}>
                                {cat === 'ember' ? '👤 Családtagok' : cat === 'kutya' ? '🐶 Kutyák' : '🐱 Macskák'}
                            </h4>
                            {userTrackers.filter(t => t.type === cat).length === 0 ? <p style={{fontSize:'12px', opacity:0.4}}>Nincs regisztrálva.</p> : 
                                userTrackers.filter(t => t.type === cat).map(t => (
                                    <div key={t._id} style={{padding:'12px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                        <span><b>{t.name}</b></span>
                                        <div style={{display:'flex', gap:'10px'}}>
                                            <button className="nav-button" style={{fontSize:'11px'}} onClick={() => handleEditName(t._id, t.name)}>Név módosítása</button>
                                            <button className="nav-button" style={{fontSize:'11px', background: THEME.accentRed}} onClick={() => handleDeleteTracker(t._id, t.name)}>Törlés</button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    ))}
                </div>
            )}

            {mode === 'webshop' && (
                <div style={styles.card}>
                    <h2>🛒 Shop</h2>
                    <div className="shop-grid">
                        {[{ n: "GPS Nyakörv", t: "kutya", e: "🐶" }, { n: "QR Medál", t: "macska", e: "🐱" }, { n: "Személyi QR", t: "ember", e: "👤" }].map((item, i) => (
                            <div key={i} className="stat-card">
                                <div style={{fontSize: '40px'}}>{item.e}</div>
                                <h3>{item.n}</h3>
                                <button className="action-btn" style={{background: THEME.accentBlue}} onClick={() => handlePurchase(item.n, item.t)}>Megveszem</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {mode === 'orders' && user?.role === 'admin' && (
                <div style={styles.card}>
                    <h2>📦 Rendelések</h2>
                    <table className="log-table">
                        <thead><tr><th>Tulaj</th><th>Név</th><th>ID</th><th>Művelet</th></tr></thead>
                        <tbody>{allTrackers.map(t => (
                            <tr key={t._id}><td>{t.ownerName}</td><td>{t.name}</td><td style={{fontSize:'10px'}}>{t._id}</td><td><button className="action-btn" style={{background: THEME.accentGold, padding:'5px 10px', width:'auto'}} onClick={() => handlePrintQR(t._id, t.name)}>Nyomtatás</button></td></tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {mode === 'admin' && (
                <div style={styles.card}>
                    <h2>👥 Tagok</h2>
                    <table className="log-table">
                        <thead><tr><th>Név</th><th>Email</th><th>Művelet</th></tr></thead>
                        <tbody>{allUsers.map(u => (
                            <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td><button className="action-btn" style={{background: THEME.accentRed, padding:'5px 10px', width:'auto'}} onClick={async () => { if(window.confirm("Törlés?")) { await axios.delete(`http://localhost:5000/api/users/${u._id}`); fetchAllUsers(); } }}>Törlés</button></td></tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {mode === 'log' && (
                <div style={styles.card}>
                    <h2>📋 Log</h2>
                    <table className="log-table">
                        <thead><tr><th>Idő</th><th>Alany</th><th>Esemény</th></tr></thead>
                        <tbody>{logs.map((log, i) => (<tr key={i}><td>{log.time}</td><td>{log.subject}</td><td>{log.action}</td></tr>))}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
export default App;