import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AdminSkinManager = () => {
    const [skins, setSkins] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [newSkin, setNewSkin] = useState({ id: '', name: '', category: 'animals' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Skinek lekérése
    const fetchSkins = async () => {
        try {
            const res = await fetch('https://oovoo-backend.onrender.com/api/schemes');
            const data = await res.json();
            setSkins(data);
        } catch (err) {
            console.error("Hiba a skinek betöltésekor:", err);
        }
    };

    useEffect(() => {
        fetchSkins();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'image/png') {
                toast.error("Csak PNG fájl engedélyezett!");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !newSkin.id || !newSkin.name) {
            toast.error("Minden mezőt tölts ki!");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('id', newSkin.id);
        formData.append('name', newSkin.name);
        formData.append('category', newSkin.category);
        formData.append('image', selectedFile);

        try {
            const stored = localStorage.getItem('oooVooo_user');
            const token = JSON.parse(stored)?.token;

            const res = await fetch('https://oovoo-backend.onrender.com/api/schemes/add', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success("Skin sikeresen publikálva!");
                setNewSkin({ id: '', name: '', category: 'animals' });
                setSelectedFile(null);
                setPreviewUrl(null);
                fetchSkins();
            } else {
                toast.error(data.message || "Feltöltési hiba");
            }
        } catch (err) {
            toast.error("Hiba a szerverrel való kapcsolatban");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* ÚJ SKIN PANEL */}
            <div className="bg-slate-50/50 border border-emerald-50 rounded-[2.5rem] p-8">
                <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Új QR Skin Gyártása</h2>
                
                <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Skin ID (pl: animals_fox_v1)</label>
                            <input 
                                type="text" 
                                value={newSkin.id}
                                onChange={e => setNewSkin({...newSkin, id: e.target.value})}
                                className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                                placeholder="kategoria_nev_v1"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Megjelenő Név</label>
                            <input 
                                type="text" 
                                value={newSkin.name}
                                onChange={e => setNewSkin({...newSkin, name: e.target.value})}
                                className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                                placeholder="Cuki Róka Design"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Kategória</label>
                            <select 
                                value={newSkin.category}
                                onChange={e => setNewSkin({...newSkin, category: e.target.value})}
                                className="w-full bg-white border border-slate-100 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all appearance-none"
                            >
                                <option value="animals">🐾 Állatok</option>
                                <option value="games">🎮 Játékok</option>
                                <option value="adults">💼 Felnőtt</option>
                                <option value="seniors">👓 Idősebb</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-6 bg-white relative group min-h-[250px]">
                        {previewUrl ? (
                            <div className="text-center">
                                <img src={previewUrl} className="w-32 h-32 object-contain drop-shadow-xl mb-4" alt="Preview" />
                                <button type="button" onClick={() => {setPreviewUrl(null); setSelectedFile(null);}} className="text-[10px] font-black text-red-400 uppercase tracking-widest">Mégse</button>
                            </div>
                        ) : (
                            <>
                                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/png" />
                                <div className="text-3xl mb-3 opacity-20 group-hover:scale-110 transition-transform">🖼️</div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Húzd ide a PNG fájlt</p>
                            </>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={isUploading}
                        className="lg:col-span-2 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-50"
                    >
                        {isUploading ? 'Gyártás...' : 'Design Publikálása'}
                    </button>
                </form>
            </div>

            {/* LISTA */}
            <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-6 ml-4">Jelenlegi választék</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {skins.map((skin) => (
                        <div key={skin.id} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center group relative shadow-sm">
                            <img src={`https://oovoo-backend.onrender.com/schemes/${skin.id}.png`} className="w-16 h-16 object-contain mb-3" alt={skin.name} onError={(e) => e.target.src = 'https://oovoo-backend.onrender.com/schemes/classic.png'} />
                            <p className="text-[9px] font-black text-slate-800 uppercase text-center truncate w-full">{skin.name}</p>
                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">{skin.category}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminSkinManager;