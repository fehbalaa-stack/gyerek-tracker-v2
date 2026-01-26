import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Megoldás a hiányzó alapértelmezett ikonokra
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] !== 0 && center[1] !== 0) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

export const LogView = ({ trackers = [], logs = [] }) => {
    const [viewMode, setViewMode] = useState('both'); 
    const [filterTracker, setFilterTracker] = useState('all');
    const [filterDate, setFilterDate] = useState('');

    const createEmojiIcon = (emoji) => {
        return L.divIcon({
            html: `<div style="
                background: #ffffff; 
                width: 46px; 
                height: 46px; 
                border-radius: 18px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 24px; 
                border: 2px solid #10b981;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
            ">${emoji || '📍'}</div>`,
            className: '', 
            iconSize: [46, 46],
            iconAnchor: [23, 46],
            popupAnchor: [0, -46]
        });
    };

    const getDeviceLabel = (deviceInfo = "") => {
        const info = deviceInfo.toLowerCase();
        if (info.includes('iphone') || info.includes('ipad')) return 'iOS';
        if (info.includes('macintosh')) return 'macOS';
        if (info.includes('android')) return 'Android';
        if (info.includes('windows')) return 'Windows';
        if (info.includes('linux')) return 'Linux';
        return 'Ismeretlen';
    };

    const getCoords = (log) => {
        let lat, lng;
        
        // 🔥 JAVÍTÁS: A MongoDB [lng, lat] sorrendet használ, de a Leaflet [lat, lng]-t vár!
        if (log.location?.coordinates && log.location.coordinates.length === 2) {
            lng = Number(log.location.coordinates[0]);
            lat = Number(log.location.coordinates[1]);
        } else if (log.lat !== undefined && log.lng !== undefined) {
            lat = Number(log.lat);
            lng = Number(log.lng);
        }

        // Szigorú szűrés
        if (!lat || !lng || (lat === 0 && lng === 0)) return null;

        // Visszatérünk [LAT, LNG] formátumban
        return [lat, lng];
    };

    const filteredLogs = useMemo(() => {
        const safeLogs = Array.isArray(logs) ? logs : [];
        return safeLogs.filter(log => {
            const logId = log.trackerId?._id || log.trackerId;
            const matchesTracker = filterTracker === 'all' || logId === filterTracker;
            const rawDate = log.date || log.createdAt;
            const logDateStr = rawDate ? new Date(rawDate).toISOString().split('T')[0] : '';
            const matchesDate = !filterDate || logDateStr === filterDate;
            return matchesTracker && matchesDate;
        }).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    }, [logs, filterTracker, filterDate]);

    const mapCenter = useMemo(() => {
        const firstWithLoc = filteredLogs.find(l => getCoords(l) !== null);
        const coords = firstWithLoc ? getCoords(firstWithLoc) : [47.4979, 19.0402];
        return coords;
    }, [filteredLogs]);

    return (
        <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end border-b border-emerald-50 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Aktivitási <span className="text-emerald-600">Napló</span></h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Események és helyszínek követése</p>
                </div>
            </div>

            <div className="flex flex-wrap bg-white p-4 rounded-[2rem] border border-emerald-50 shadow-sm justify-between items-center gap-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <select 
                        value={filterTracker}
                        onChange={(e) => setFilterTracker(e.target.value)}
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:border-emerald-200 font-bold"
                    >
                        <option value="all">Minden eszköz</option>
                        {trackers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>

                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:border-emerald-200 font-bold uppercase"
                        />
                        {filterDate && (
                            <button onClick={() => setFilterDate('')} className="px-3 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-wider">Törlés</button>
                        )}
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {['map', 'both', 'list'].map((mode) => (
                        <button 
                            key={mode}
                            onClick={() => setViewMode(mode)} 
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                viewMode === mode ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {mode === 'map' ? 'TÉRKÉP' : mode === 'both' ? 'MINDKETTŐ' : 'LISTA'}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`grid gap-6 ${viewMode === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {(viewMode === 'map' || viewMode === 'both') && (
                    <div className="h-[550px] bg-white rounded-[2.5rem] border border-emerald-50 overflow-hidden relative z-0 shadow-sm p-2">
                        <div className="w-full h-full rounded-[2rem] overflow-hidden">
                            <MapContainer 
                                key={`map-${mapCenter[0]}-${mapCenter[1]}`} 
                                center={mapCenter} 
                                zoom={13} 
                                className="h-full w-full"
                            >
                                <TileLayer 
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
                                    attribution='© OpenStreetMap'
                                />
                                <RecenterMap center={mapCenter} />
                                
                                {filteredLogs.map(log => {
                                    const coords = getCoords(log);
                                    if (!coords) return null;

                                    // DEBUG: Ha látsz ilyet a konzolban, akkor a markernek ott kell lennie
                                    console.log(`📍 Marker kirakva ide: ${coords}`);

                                    const currentTracker = trackers.find(t => t._id === (log.trackerId?._id || log.trackerId));
                                    const trackerEmoji = currentTracker?.icon || '📍';

                                    return (
                                        <Marker key={`marker-${log._id}`} position={coords} icon={createEmojiIcon(trackerEmoji)}>
                                            <Popup>
                                                <div className="text-slate-800 p-2 text-center min-w-[160px]">
                                                    <div className="text-3xl mb-2">{trackerEmoji}</div>
                                                    <div className="font-black text-sm border-b pb-2 mb-2">{currentTracker?.name || 'Eszköz'}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mb-2">{new Date(log.date || log.createdAt).toLocaleString('hu-HU')}</div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        </div>
                    </div>
                )}

                {(viewMode === 'list' || viewMode === 'both') && (
                    <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredLogs.length === 0 ? (
                            <div className="text-center py-32 bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm opacity-50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nincs rögzített adat</p>
                            </div>
                        ) : (
                            filteredLogs.map((log) => {
                                const currentTracker = trackers.find(t => t._id === (log.trackerId?._id || log.trackerId));
                                const deviceName = getDeviceLabel(log.deviceInfo || "");
                                return (
                                    <div key={log._id} className="bg-white border border-emerald-50 p-6 rounded-[2rem] flex items-center gap-5 hover:border-emerald-200 transition-all shadow-sm">
                                        <div className="text-2xl w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100/50 shadow-inner">
                                            {currentTracker?.icon || '📍'} 
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-sm text-slate-800 tracking-tight">{currentTracker?.name || 'Eszköz'}</h4>
                                                <span className="text-[8px] font-black px-2 py-1 rounded-lg border tracking-widest uppercase border-slate-100 text-slate-400 bg-slate-50">
                                                    {deviceName}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{log.message || 'Eszköz beolvasva'}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};