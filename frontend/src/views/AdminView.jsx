import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminMessages from '../components/AdminMessages'; 

const AdminView = () => {
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('logs'); 
    const { user } = useAuth();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const stored = localStorage.getItem('oooVooo_user');
                const token = JSON.parse(stored)?.token;
                
                const res = await axios.get('https://oovoo-backend.onrender.com/api/trackers/logs/admin', { 
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(res.data);
            } catch (err) {
                console.error("Hiba a logok lekérésekor:", err);
            }
        };
        if (user?.role === 'admin') fetchLogs();
    }, [user]);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 py-6">
            {/* Címsor - V3 Emerald Stílus */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-emerald-50 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Admin <span className="text-emerald-600 font-black">Panel</span>
                    </h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">Rendszerfelügyelet és Üzenetek</p>
                </div>

                {/* Tab váltó - Modern lekerekített kapszula */}
                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200">
                    <button 
                        onClick={() => setActiveTab('logs')}
                        className={`px-8 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'logs' 
                            ? 'bg-white text-emerald-600 shadow-sm border border-emerald-50' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Napló
                    </button>
                    <button 
                        onClick={() => setActiveTab('messages')}
                        className={`px-8 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'messages' 
                            ? 'bg-white text-emerald-600 shadow-sm border border-emerald-50' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Üzenetek
                    </button>
                </div>
            </div>

            {/* Tartalom kártya */}
            <div className="bg-white border border-emerald-50 rounded-[2.5rem] p-8 shadow-sm">
                {activeTab === 'logs' ? (
                    <div className="overflow-hidden">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <th className="px-6 pb-4">Időpont</th>
                                    <th className="px-6 pb-4">Felhasználó</th>
                                    <th className="px-6 pb-4">Esemény</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr key={i} className="group hover:bg-emerald-50/30 transition-all duration-300">
                                        <td className="px-6 py-5 rounded-l-[1.5rem] text-xs font-bold text-slate-400 bg-slate-50/50 border-y border-l border-slate-50">
                                            {new Date(log.time || log.createdAt).toLocaleString('hu-HU')}
                                        </td>
                                        <td className="px-6 py-5 font-black text-emerald-700 uppercase text-xs tracking-wider bg-slate-50/50 border-y border-slate-50">
                                            {log.subject || log.userEmail}
                                        </td>
                                        <td className="px-6 py-5 rounded-r-[1.5rem] text-sm font-medium text-slate-600 bg-slate-50/50 border-y border-r border-slate-50">
                                            {log.action || log.message}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {logs.length === 0 && (
                            <div className="text-center py-20 text-slate-300 italic uppercase text-[10px] font-black tracking-widest border-2 border-dashed border-slate-50 rounded-[2rem]">
                                Nincsenek naplózott események
                            </div>
                        )}
                    </div>
                ) : (
                    <AdminMessages /> 
                )}
            </div>
        </div>
    );
};

export default AdminView;