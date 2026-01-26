import React from 'react';
import { THEME } from '../styles/theme';
import toast from 'react-hot-toast';

export default function CartView({ cart = [], removeFromCart, clearCart, setMode, user }) {
    // 🔥 Biztonsági ellenőrzés
    if (!Array.isArray(cart)) return null;
    
    const calculateTotal = () => {
        return cart.reduce((sum, item) => {
            const priceNum = parseFloat(item.price?.toString().replace(/[^0-9.]/g, '') || 0);
            return sum + priceNum;
        }, 0).toFixed(2);
    };

    const handleCheckout = async () => {
        const loadingToast = toast.loading('Fizetés előkészítése...');
        try {
            const stored = localStorage.getItem('oooVooo_user');
            if (!stored) throw new Error('Bejelentkezés szükséges!');
            const { token } = JSON.parse(stored);

            const res = await fetch('https://oovoo-beta1.onrender.com/api/orders/create-checkout-session', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                    // 🔥 Most már közvetlenül küldjük a cart-ot, mert a ShopView-ban minden belekerült
                    items: cart,
                    customerEmail: user.email
                })
            });

            const data = await res.json();

            if (data.url) {
                toast.dismiss(loadingToast);
                window.location.href = data.url; 
            } else {
                throw new Error(data.message || 'Sikertelen munkamenet indítás.');
            }

        } catch (err) {
            console.error("Stripe hiba:", err);
            toast.error(err.message || 'Hiba a fizetés indításakor.', { id: loadingToast });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Saját <span className="text-emerald-600">Kosár</span>
                </h1>
                <button 
                    onClick={() => setMode('shop')}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors mb-1"
                >
                    ← Vissza a boltba
                </button>
            </header>

            {cart.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-emerald-50 shadow-sm">
                    <div className="text-5xl mb-6 opacity-20">🛒</div>
                    <p className="text-slate-400 uppercase font-black text-xs tracking-[0.2em]">A kosarad üres</p>
                    <button 
                        onClick={() => setMode('shop')} 
                        className="mt-6 px-8 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all"
                    >
                        ← Irány a webshop
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {cart.map((item) => (
                        <div key={item.cartId} className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-emerald-200 shadow-sm transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner border border-emerald-100/50">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">{item.name}</h3>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                                        Eszköz: {item.trackerName} <span className="text-emerald-200">|</span> {item.uniqueCode}
                                    </p>
                                    
                                    {/* 🔥 Csak a kiválasztott méret megjelenítése */}
                                    {item.productId !== 'stickers' && (
                                        <div className="mt-3 flex gap-2">
                                            <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                                                Méret: {item.size}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-emerald-50 pt-4 md:pt-0">
                                <span className="font-black text-xl text-slate-900">{item.price}</span>
                                <button 
                                    onClick={() => removeFromCart(item.cartId)}
                                    className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold shadow-sm shadow-red-100"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="mt-12 p-10 bg-emerald-50/50 rounded-[3rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="text-[10px] font-black uppercase text-emerald-700 tracking-[0.3em] mb-1">Fizetendő összesen</p>
                            <h2 className="text-4xl font-black tracking-tight text-slate-900">{calculateTotal()} EUR</h2>
                        </div>
                        <button 
                            type="button"
                            onClick={handleCheckout}
                            className="w-full md:w-auto px-12 py-5 bg-emerald-600 text-white font-black uppercase rounded-[1.8rem] shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-1 active:scale-95 transition-all tracking-wider text-sm"
                        >
                            Fizetés indítása
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
