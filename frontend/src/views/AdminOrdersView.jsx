import React, { useState, useEffect, useMemo } from 'react';
import { THEME } from '../styles/theme';
import toast from 'react-hot-toast';

const API_BASE = 'https://oovoo-beta1.onrender.com';

export default function AdminOrdersView() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const stored = localStorage.getItem('oooVooo_user');
            if (!stored) {
                toast.error("Nincs jogosultságod.");
                return;
            }
            const { token } = JSON.parse(stored);

            const res = await fetch(`${API_BASE}/api/orders/admin-list`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setOrders(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
            toast.error('Szerverkapcsolati hiba');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        // Ha az 'all' van kiválasztva, csak a nem kész (shipped) rendeléseket mutatjuk
        if (filter === 'all') return orders.filter(o => o.status !== 'shipped');
        // Egyébként a konkrét státusz alapján szűrünk
        return orders.filter(order => order.status === filter);
    }, [orders, filter]);

    const updateStatus = async (orderId, newStatus) => {
        const loadingToast = toast.loading('Állapot frissítése...');
        try {
            const stored = localStorage.getItem('oooVooo_user');
            const { token } = JSON.parse(stored);

            const res = await fetch(`${API_BASE}/api/orders/status/${orderId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
                const msg = newStatus === 'shipped' ? 'Rendelés archiválva!' : 'Státusz módosítva!';
                toast.success(msg, { id: loadingToast });
            }
        } catch (err) {
            toast.error('Hiba történt', { id: loadingToast });
        }
    };

    const deleteOrder = async (orderId) => {
        if (!window.confirm("Biztosan véglegesen törlöd ezt a rendelést?")) return;
        
        const loadingToast = toast.loading('Törlés...');
        try {
            const stored = localStorage.getItem('oooVooo_user');
            const { token } = JSON.parse(stored);

            const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setOrders(prev => prev.filter(o => o._id !== orderId));
                toast.success('Rendelés törölve!', { id: loadingToast });
            }
        } catch (err) {
            toast.error('Szerver hiba a törlésnél', { id: loadingToast });
        }
    };

    const downloadProductionFile = (uniqueCode, styleId) => {
        const stored = localStorage.getItem('oooVooo_user');
        const { token } = JSON.parse(stored);
        const downloadUrl = `${API_BASE}/api/admin/generate-clean/${uniqueCode}?styleId=${styleId}&token=${token}`;
        window.open(downloadUrl, '_blank');
        toast.success(`Exportálva: ${uniqueCode}.png`);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh] text-center font-black text-emerald-600 animate-pulse tracking-widest text-sm uppercase">
            📦 Gyártási adatok szinkronizálása...
        </div>
    );

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
            {/* Fejléc Szekció */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-emerald-50">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Gyártási <span className="text-emerald-600">Várólista</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Kezeld a beérkező megrendeléseket és a nyomdai fájlokat.</p>
                </div>
                
                <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 hidden lg:block">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Stripe Sandbox Aktív</span>
                </div>
            </div>

            {/* Szűrők */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-50 rounded-[1.8rem] border border-slate-100 w-fit">
                {[
                    { id: 'all', label: 'VÁRÓLISTA', count: orders.filter(o => o.status !== 'shipped').length },
                    { id: 'pending', label: 'ÚJ', count: orders.filter(o => o.status === 'pending').length },
                    { id: 'processing', label: 'GYÁRTÁS', count: orders.filter(o => o.status === 'processing').length },
                    { id: 'shipped', label: 'ARCHÍVUM', count: orders.filter(o => o.status === 'shipped').length },
                ].map((btn) => (
                    <button
                        key={btn.id}
                        onClick={() => setFilter(btn.id)}
                        className={`px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black transition-all flex items-center gap-3 ${
                            filter === btn.id 
                            ? (btn.id === 'shipped' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-emerald-600 shadow-sm border border-emerald-50')
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                        }`}
                    >
                        {btn.label}
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] ${filter === btn.id ? 'bg-emerald-50/10 text-current' : 'bg-slate-200/50 text-slate-500'}`}>
                            {btn.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Táblázat Kártya */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-emerald-50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-emerald-50">
                            <tr>
                                <th className="p-8">Rendelés</th>
                                <th>Ügyfél</th>
                                <th>Termék</th>
                                <th>Design</th>
                                <th className="text-right p-8">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-bold text-slate-700">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-32 text-center">
                                        <div className="text-5xl mb-4 opacity-20">📦</div>
                                        <p className="text-slate-300 uppercase tracking-[0.2em] text-[10px] font-black">Nincs találat a szűrő alapján</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-emerald-50/50 hover:bg-emerald-50/20 transition-all duration-300 group">
                                        <td className="p-8">
                                            <div className="text-slate-900 font-black tracking-tight">#{order._id.slice(-6).toUpperCase()}</div>
                                            <div className="text-[10px] text-slate-400 mt-1 font-bold">
                                                {new Date(order.createdAt).toLocaleDateString('hu-HU')}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-slate-800 tracking-tight">{order.customerName}</div>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-emerald-600 uppercase">Fizetve ✅</span>
                                                    <span className="text-[8px] text-slate-400 font-medium lowercase italic">{order.customerEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{order.productType === 'tshirt' ? '👕' : '🧥'}</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase font-black text-slate-900">{order.productType}</span>
                                                    <span className="text-[10px] text-emerald-600 font-black">{order.size || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl p-1.5 border border-slate-100 group-hover:scale-110 transition-transform">
                                                    <img 
                                                        src={`${API_BASE}/schemes/${order.qrStyle}.png`} 
                                                        className="w-full h-full object-contain"
                                                        alt="Style" 
                                                    />
                                                </div>
                                                <div className="text-[10px] font-black text-slate-400 tracking-widest">{order.uniqueCode}</div>
                                            </div>
                                        </td>
                                        <td className="text-right p-8">
                                            <div className="flex items-center justify-end gap-4">
                                                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200">
                                                    {[
                                                        { id: 'pending', label: 'VÁR' },
                                                        { id: 'processing', label: 'GYÁRT' },
                                                        { id: 'shipped', label: 'KÉSZ' }
                                                    ].map((st) => (
                                                        <button
                                                            key={st.id}
                                                            onClick={() => updateStatus(order._id, st.id)}
                                                            className={`px-4 py-1.5 rounded-xl text-[9px] font-black transition-all duration-300 ${
                                                                order.status === st.id 
                                                                ? 'bg-white text-emerald-600 shadow-sm' 
                                                                : 'text-slate-400 hover:text-slate-600'
                                                            }`}
                                                        >
                                                            {st.label}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Csak az archívumban jelenik meg a törlés gomb */}
                                                {order.status === 'shipped' ? (
                                                    <button 
                                                        onClick={() => deleteOrder(order._id)}
                                                        className="bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white w-10 h-10 rounded-xl transition-all flex items-center justify-center border border-rose-100 shadow-sm"
                                                    >
                                                        🗑️
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => downloadProductionFile(order.uniqueCode, order.qrStyle)}
                                                        className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-md shadow-emerald-100 flex items-center gap-2"
                                                    >
                                                        NYOMDA ⬇️
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                oooVooo Production System — 2026
            </p>
        </div>
    );
}