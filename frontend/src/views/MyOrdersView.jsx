// views/MyOrdersView.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MyOrdersView = () => {
    const { language } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const stored = localStorage.getItem('oooVooo_user');
            const userData = stored ? JSON.parse(stored) : null;
            
            const res = await fetch('https://oovoo-backend.onrender.com/api/orders/my-orders', {
                headers: { 'Authorization': `Bearer ${userData?.token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (err) {
            toast.error(language === 'hu' ? 'Hiba a rendelések betöltésekor' : 'Error loading orders');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-500';
            case 'processing': return 'bg-blue-500';
            case 'shipped': return 'bg-emerald-500';
            default: return 'bg-slate-400';
        }
    };

    const getStatusText = (status) => {
        const texts = {
            hu: { pending: 'Függőben', processing: 'Gyártás alatt', shipped: 'Kiszállítva' },
            en: { pending: 'Pending', processing: 'Processing', shipped: 'Shipped' }
        };
        return (texts[language] || texts.hu)[status] || status;
    };

    if (isLoading) return <div className="p-20 text-center font-black animate-pulse text-slate-300 uppercase tracking-widest">Loading Orders...</div>;

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        {language === 'hu' ? 'Rendeléseim' : 'My Orders'}
                    </h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 ml-1">
                        {language === 'hu' ? 'Készülnek az egyedi cuccaid' : 'Your custom gear is being prepared'}
                    </p>
                </div>
                <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 hidden md:block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'hu' ? 'Összesen' : 'Total'}:</span>
                    <span className="ml-3 font-black text-slate-900">{orders.length} db</span>
                </div>
            </header>

            {orders.length === 0 ? (
                <div className="bg-white border border-emerald-50 rounded-[3rem] p-20 text-center shadow-sm">
                    <div className="text-6xl mb-6">🛍️</div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">{language === 'hu' ? 'Még nincs rendelésed' : 'No orders yet'}</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                        {language === 'hu' ? 'Nézz szét a webshopban és válaszd ki a kedvenc skinedet!' : 'Check out the shop and pick your favorite skin!'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <motion.div 
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="bg-white border border-emerald-50 rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-8 group"
                        >
                            {/* Termék ikon / Skin előnézet */}
                            <div className="relative w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                                <img 
                                    src={`https://oovoo-backend.onrender.com/schemes/${order.qrStyle}.png`}
                                    alt="Skin"
                                    className="w-16 h-16 object-contain z-10 group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            {/* Fő információk */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{order.productType}</h3>
                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        Size: {order.size}
                                    </span>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-300 text-xs">🏷️</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Code: {order.uniqueCode}</span>
                                    </div>
                                    {order.targetTrackerId && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">
                                                ✨ Marcsika update
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Állapot és Dátum */}
                            <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3 pt-6 md:pt-0 border-t md:border-t-0 border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)} animate-pulse`}></div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{getStatusText(order.status)}</span>
                                </div>
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                    {new Date(order.createdAt).toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-US')}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersView;