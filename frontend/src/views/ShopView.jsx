import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';

const ShopView = ({ trackers = [], selectedTrackerId, setMode, addToCart }) => {
    const { language } = useAuth();
    const t = translations[language] || translations.hu;

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('L');
    const [viewAngle, setViewAngle] = useState('front');
    const [isFlipped, setIsFlipped] = useState(false);
    
    // 🔥 Új állapot a kézzel választott trackernek
    const [manualTrackerId, setManualTrackerId] = useState("");

    const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL'];

    // 🔥 Kombinált tracker figyelés
    const targetTracker = useMemo(() => {
        const idToFind = manualTrackerId || selectedTrackerId;
        if (!trackers || !idToFind) return null;
        return trackers.find(tr => tr._id === idToFind);
    }, [trackers, selectedTrackerId, manualTrackerId]);

    const products = [
        {
            id: 'tshirt',
            name: language === 'hu' ? 'PRÉMIUM PÓLÓ' : 'PREMIUM T-SHIRT',
            price: '10 Ft',
            features: language === 'hu' ? ['100% Pamut', 'Egyedi QR nyomat'] : ['100% Cotton', 'Custom QR Print'],
            icon: '👕'
        },
        {
            id: 'hoodie',
            name: language === 'hu' ? 'KAPUCNIS PULÓVER' : 'PREMIUM HOODIE',
            price: '10 Ft',
            features: language === 'hu' ? ['Vastag anyag', 'QR a háton'] : ['Heavy fabric', 'QR on back'],
            icon: '🧥'
        },
        {
            id: 'stickers',
            name: language === 'hu' ? 'MATRICA CSOMAG' : 'STICKER PACK',
            price: '10 Ft',
            features: language === 'hu' ? ['Vízálló', 'UV-álló'] : ['Waterproof', 'UV resistant'],
            icon: '🏷️'
        }
    ];

    const handleAddToCart = () => {
        // 🔥 Védelem a null hiba ellen
        if (!targetTracker) {
            toast.error(language === 'hu' ? 'Válassz egy eszközt!' : 'Please select a tracker!');
            return;
        }

        if (!selectedSize) {
            toast.error(language === 'hu' ? 'Válassz méretet!' : 'Select a size!');
            return;
        }

        const cartItem = {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            size: selectedSize,
            icon: selectedProduct.icon,
            uniqueCode: targetTracker.uniqueCode,
            trackerName: targetTracker.name,
            trackerId: targetTracker._id, // Fontos a backendnek
            cartId: Date.now()
        };

        addToCart(cartItem);
        toast.success(language === 'hu' ? 'Kosárba téve!' : 'Added to cart!');
        setSelectedProduct(null);
        setIsFlipped(false);
        setManualTrackerId(""); // Alaphelyzetbe állítás
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 animate-in fade-in duration-700">
            
            {/* KIJELÖLT TRACKER INFÓ / VÁLASZTÓ */}
            <div className="bg-white border border-emerald-50 rounded-[2.5rem] p-6 mb-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner overflow-hidden">
                        {targetTracker ? (
                            <img src={`https://oovoo-backend.onrender.com/schemes/${targetTracker.qrStyle}.png`} className="w-10 h-10 object-contain" alt="QR" />
                        ) : (
                            <span className="text-2xl opacity-20">🔍</span>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{language === 'hu' ? 'Eszköz kiválasztása' : 'Select tracker'}</p>
                        <select 
                            value={targetTracker?._id || ""}
                            onChange={(e) => setManualTrackerId(e.target.value)}
                            className="bg-transparent text-xl font-black text-slate-800 outline-none cursor-pointer"
                        >
                            <option value="">{language === 'hu' ? '-- Válassz eszközt --' : '-- Select one --'}</option>
                            {trackers.map(tr => (
                                <option key={tr._id} value={tr._id}>{tr.name} ({tr.uniqueCode})</option>
                            ))}
                        </select>
                    </div>
                </div>
                {targetTracker && (
                    <button onClick={() => {setManualTrackerId(""); setMode('dashboard')}} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">Vissza a listához</button>
                )}
            </div>

            {!selectedProduct ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {products.map((prod) => (
                        <div key={prod.id} onClick={() => setSelectedProduct(prod)} className="bg-white p-10 rounded-[3rem] border border-emerald-50 shadow-sm hover:border-emerald-300 transition-all cursor-pointer group text-center">
                            <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-500">{prod.icon}</div>
                            <h2 className="text-xl font-black text-slate-900 mb-2">{prod.name}</h2>
                            <div className="text-emerald-600 font-black text-lg">{prod.price}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* BAL OLDAL: ELŐNÉZET */}
                    <div className="space-y-6">
                        <div className="bg-white border border-emerald-50 rounded-[3rem] p-10 aspect-square flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
                            <div className="absolute top-8 left-10 text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600/40">3D Preview • {viewAngle}</div>
                            
                            <motion.div 
                                key={viewAngle}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-[12rem] drop-shadow-2xl"
                            >
                                {selectedProduct.icon}
                            </motion.div>

                            <div className="flex gap-3 mt-12">
                                {['front', 'side', 'back'].map(angle => (
                                    <button 
                                        key={angle}
                                        onClick={() => setViewAngle(angle)}
                                        className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${viewAngle === angle ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}
                                    >
                                        {angle}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* JOBB OLDAL: FLIP KONFIGURÁTOR */}
                    <div className="relative h-[550px] perspective-1000">
                        <motion.div
                            className="w-full h-full relative preserve-3d"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 20 }}
                        >
                            <div className="absolute inset-0 backface-hidden bg-white border border-emerald-50 rounded-[3rem] p-10 shadow-xl flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{selectedProduct.name}</h2>
                                        <button onClick={() => setSelectedProduct(null)} className="text-2xl opacity-20 hover:opacity-100 transition-opacity">✕</button>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedProduct.features.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {f}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-[11px] text-slate-500 font-medium">
                                        {!targetTracker ? (
                                            <span className="text-rose-500 font-bold">{language === 'hu' ? 'Válassz egy eszközt felül!' : 'Select a tracker above first!'}</span>
                                        ) : (
                                            language === 'hu' 
                                            ? `A rendelésed az egyedi "${targetTracker.name}" (${targetTracker.uniqueCode}) kóddal készül el.` 
                                            : `Your order will be printed with the unique "${targetTracker.name}" (${targetTracker.uniqueCode}) code.`
                                        )}
                                    </div>
                                </div>
                                <button 
                                    disabled={!targetTracker}
                                    onClick={() => setIsFlipped(true)} 
                                    className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-20"
                                >
                                    {language === 'hu' ? 'Méretválasztás →' : 'Select Size →'}
                                </button>
                            </div>

                            <div 
                                className="absolute inset-0 backface-hidden bg-slate-900 border border-emerald-400/30 rounded-[3rem] p-10 shadow-2xl flex flex-col justify-between text-white"
                                style={{ transform: "rotateY(180deg)" }}
                            >
                                <div>
                                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                                        <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">Mérettáblázat</h2>
                                        <button onClick={() => setIsFlipped(false)} className="text-[10px] font-bold text-white/40 uppercase">Vissza</button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {SIZES.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`py-4 rounded-xl text-xs font-black transition-all border ${selectedSize === size ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleAddToCart} className="w-full py-6 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all shadow-lg">Kosárba teszem</button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopView;