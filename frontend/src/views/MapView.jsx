import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 1. Egyedi jelölő ikon definíció
const createIcon = (emoji) => L.divIcon({
    html: `<div style="background: white; width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; border: 2px solid #10b981; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">${emoji || '📍'}</div>`,
    className: 'custom-marker',
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -42]
});

// Automatikus térkép fókuszálás
function MapAutoView({ points }) {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => p.position));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            setTimeout(() => map.invalidateSize(), 400);
        }
    }, [points, map]);
    return null;
}

export const MapView = ({ trackers, logs }) => {
    // 2. DÁTUM SZŰRŐ ÁLLAPOT
    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);

    // 3. ADATOK SZŰRÉSE ÉS GPS KOORDINÁTA VALIDÁLÁSA
    const filteredData = useMemo(() => {
        if (!Array.isArray(logs)) return [];

        return logs.map(log => {
            const logDate = new Date(log.date);
            const logDateStr = logDate.toISOString().split('T')[0];
            
            // Kinyerjük a koordinátákat a log-ból (vagy a tracker utolsó ismert helyéből)
            const coords = log.location?.coordinates || log.trackerId?.lastLocation?.coordinates;

            // SZŰRÉSI LOGIKA
            if (logDateStr < startDate || logDateStr > endDate) return null;

            const tracker = trackers?.find(t => t._id === (log.trackerId?._id || log.trackerId));
            
            // SZIGORÚ ELLENŐRZÉS: Csak akkor van GPS, ha a tömb létezik és nem [0,0]
            let pos = null;
            if (Array.isArray(coords) && coords.length === 2) {
                const lng = parseFloat(coords[0]);
                const lat = parseFloat(coords[1]);
                
                // Ha a számok érvényesek és nem nullák
                if (!isNaN(lng) && !isNaN(lat) && (lng !== 0 || lat !== 0)) {
                    // Leaflet: [lat, lng] sorrendet vár!
                    pos = [lat, lng];
                }
            }

            return {
                id: log._id,
                date: logDate,
                name: tracker?.name || 'Ismeretlen eszköz',
                emoji: tracker?.icon || '📍',
                position: pos,
                rawCoords: coords, // Diagnózishoz eltároljuk a nyers adatot
                message: log.message || (log.type === 'SCAN' ? 'QR beolvasás' : 'Esemény')
            };
        }).filter(item => item !== null);
    }, [logs, trackers, startDate, endDate]);

    const pointsOnMap = useMemo(() => filteredData.filter(d => d.position), [filteredData]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            
            {/* DÁTUMVÁLASZTÓ PANEL */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-1">Időszak választó</h3>
                    <div className="flex items-center gap-3">
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        />
                        <span className="text-slate-300 font-bold">-</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-emerald-50 px-6 py-3 rounded-2xl text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Naplózott</p>
                        <p className="text-xl font-black text-emerald-900">{filteredData.length}</p>
                    </div>
                    <div className="bg-slate-900 px-6 py-3 rounded-2xl text-center shadow-lg shadow-slate-200 min-w-[120px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Térképen</p>
                        <p className="text-xl font-black text-white">{pointsOnMap.length}</p>
                    </div>
                </div>
            </div>

            {/* TÉRKÉP */}
            <div className="bg-white rounded-[2.5rem] h-[550px] p-2 border border-emerald-50 shadow-sm overflow-hidden relative z-0">
                <MapContainer 
                    center={[47.4979, 19.0402]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%', borderRadius: '2.1rem' }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapAutoView points={pointsOnMap} />
                    
                    {pointsOnMap.map((p) => (
                        <Marker key={p.id} position={p.position} icon={createIcon(p.emoji)}>
                            <Popup>
                                <div className="text-center p-1">
                                    <div className="text-2xl mb-1">{p.emoji}</div>
                                    <div className="font-black text-slate-800 uppercase text-xs">{p.name}</div>
                                    <div className="text-[10px] text-emerald-600 font-bold mt-1">
                                        {p.date.toLocaleString('hu-HU')}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* TÁBLÁZAT */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-emerald-50 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
                                <th className="px-6 pb-2">Dátum és Idő</th>
                                <th className="px-6 pb-2">Eszköz</th>
                                <th className="px-6 pb-2">Helyszín adatok</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => (
                                <tr key={item.id} className="group">
                                    <td className="bg-slate-50 px-6 py-5 rounded-l-2xl text-slate-400 font-bold border-y border-l border-slate-50">
                                        {item.date.toLocaleString('hu-HU')}
                                    </td>
                                    <td className="bg-slate-50 px-6 py-5 font-black border-y border-slate-50 text-slate-900">
                                        <span className="inline-block p-2 bg-white rounded-lg mr-3 shadow-sm">{item.emoji}</span>
                                        {item.name}
                                    </td>
                                    <td className="bg-slate-50 px-6 py-5 rounded-r-2xl border-y border-r border-slate-50">
                                        {item.position ? (
                                            <div className="flex flex-col">
                                                <span className="text-emerald-600 font-black tracking-tight">
                                                    📍 {item.position[0].toFixed(5)}, {item.position[1].toFixed(5)}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">GPS adatok rögzítve</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="text-slate-300 italic font-medium">
                                                    {item.rawCoords ? `Hibás koordináta: ${JSON.stringify(item.rawCoords)}` : "Nincs GPS jel"}
                                                </span>
                                                <span className="text-[10px] text-slate-300">{item.message}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};