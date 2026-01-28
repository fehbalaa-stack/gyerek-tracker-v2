import React, { useState, useMemo, useEffect } from 'react';
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
    
    // 🔥 Új állapotok a skinekhez
    const [schemes, setSchemes] = useState([]);
    const [selectedSkinId, setSelectedSkinId] = useState('classic');
    
    const [manualTrackerId, setManualTrackerId] = useState(selectedTrackerId || "NEW");

    const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL'];

    // 🔥 Skinek betöltése a választóhoz
    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const res = await fetch('https://oovoo-backend.onrender.com/api/schemes');
                const data = await res.json();
                setSchemes(data);
                if (data.length > 0) setSelectedSkinId(data[0].id);
            } catch (err) { console.error("Hiba a sémák betöltésekor:", err); }
        };
        fetchSchemes();
    }, []);

    const targetTracker = useMemo(() => {
        const idToFind = manualTrackerId;
        if (idToFind === "NEW") return { _id: null, name: language === 'hu' ? "Új eszköz" : "New Device", uniqueCode: "GEN_NEW" };
        if (!trackers || !idToFind) return null;
        return trackers.find(tr => tr._id === idToFind);
    }, [trackers, manualTrackerId, language]);

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
        if (!targetTracker) {
            toast.error(language === 'hu' ? 'Válassz egy opciót!' : 'Please select an option!');
            return;
        }

        const cartItem = {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            size: selectedSize,
            icon: selectedProduct.icon,
            // 🔥 Most már a választott skin ID-t küldjük a kosárba!
            qrStyle: selectedSkinId, 
            targetTrackerId: targetTracker._id, 
            uniqueCode: targetTracker._id ? targetTracker.uniqueCode : "NEW_DEVICE",
            trackerName: targetTracker.name,
            cartId: Date.now()
        };

        addToCart(cartItem);
        toast.success(language === 'hu' ? 'Kosárba téve!' : 'Added to cart!');
        setSelectedProduct(null);
        setIsFlipped(false);
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 animate-in fade-in duration-700">
            
            <div className="bg-white border border-emerald-50 rounded-[2.5rem] p-6 mb-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-100 shadow-inner overflow-hidden">
                        {targetTracker && targetTracker._id ? (
                            <img src={`https://oovoo-backend.onrender.com/schemes/${selectedSkinId}.png`} className="w-10 h-10 object-contain" alt="QR" />
                        ) : (
                            <span className="text-2xl">🆕</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{language === 'hu' ? 'Vásárlás típusa' : 'Purchase type'}</p>
                        <select 
                            value={manualTrackerId}
                            onChange={(e) => setManualTrackerId(e.target.value)}
                            className="bg-transparent text-xl font-black text-slate-800 outline-none cursor-pointer w-full max-w-[400px] truncate"
                        >
                            <option value="NEW">🆕 {language === 'hu' ? 'ÚJ ESZKÖZ REGISZTRÁLÁSA' : 'REGISTER NEW DEVICE'}</option>
                            {trackers.length > 0 && (
                                <optgroup label={language === 'hu' ? 'MEGLÉVŐ ESZKÖZ FRISSÍTÉSE' : 'UPDATE EXISTING DEVICE'}>
                                    {trackers.map(tr => (
                                        <option key={tr._id} value={tr._id}>{tr.name} ({tr.uniqueCode})</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>
                </div>
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
                    
                    <div className="space-y-6">
                        <div className="bg-white border border-emerald-50 rounded-[3rem] p-10 aspect-square flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
                            <div className="absolute top-8 left-10 text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600/40">Preview • {selectedProduct.name}</div>
                            
                            {/* 🔥 A termék ikonja mögött megjelenítjük a választott QR skint kis méretben */}
                            <div className="relative">
                                <motion.div 
                                    key={selectedSkinId}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-[12rem] drop-shadow-2xl z-10 relative"
                                >
                                    {selectedProduct.icon}
                                </motion.div>
                                <img 
                                    src={`https://oovoo-backend.onrender.com/schemes/${selectedSkinId}.png`} 
                                    className="absolute -bottom-4 -right-4 w-20 h-20 object-contain opacity-80 border-2 border-white rounded-xl shadow-lg bg-white p-1" 
                                    alt="Skin Preview" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[650px] perspective-1000">
                        <motion.div
                            className="w-full h-full relative preserve-3d"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 20 }}
                        >
                            <div className="absolute inset-0 backface-hidden bg-white border border-emerald-50 rounded-[3rem] p-10 shadow-xl flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{selectedProduct.name}</h2>
                                        <button onClick={() => setSelectedProduct(null)} className="text-2xl opacity-20 hover:opacity-100 transition-opacity">✕</button>
                                    </div>

                                    {/* 🔥 QR SKIN VÁLASZTÓ EGYSÉG */}
                                    <div className="mb-8">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4 block">
                                            {language === 'hu' ? 'Válassz QR stílust' : 'Choose QR style'}
                                        </label>
                                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                            {schemes.map((s) => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => setSelectedSkinId(s.id)}
                                                    className={`w-14 h-14 rounded-2xl border-2 flex-shrink-0 transition-all p-1 bg-white ${selectedSkinId === s.id ? 'border-emerald-500 scale-110 shadow-md' : 'border-slate-100 opacity-60'}`}
                                                >
                                                    <img src={`https://oovoo-backend.onrender.com/schemes/${s.id}.png`} className="w-full h-full object-contain" alt={s.name} />
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">
                                            {schemes.find(s => s.id === selectedSkinId)?.name}
                                        </p>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-[11px] text-slate-500 font-medium leading-relaxed">
                                        {targetTracker && !targetTracker._id ? (
                                            <span className="text-emerald-600 font-bold">
                                                {language === 'hu' 
                                                ? '✨ Új oooVooo eszközt vásárolsz. A fizetés után egy teljesen új profilt hozhatsz létre.' 
                                                : '✨ You are buying a new oooVooo device. You can create a completely new profile after payment.'}
                                            </span>
                                        ) : (
                                            <span className="text-blue-600 font-bold">
                                                {language === 'hu' 
                                                ? `🔄 Ez az új "${selectedSkinId}" skin a meglévő "${targetTracker?.name}" profilodhoz lesz adva.` 
                                                : `🔄 This new "${selectedSkinId}" skin will be added to your existing "${targetTracker?.name}" profile.`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsFlipped(true)} 
                                    className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-xl mt-4"
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
                                        <h2 className="text-xl font-black uppercase tracking-widest text-emerald-400">Méret</h2>
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