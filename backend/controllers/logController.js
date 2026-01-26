// 🔥 JAVÍTÁS: Nincs kapcsos zárójel, mert export default-ot használtunk!
import Log from '../models/Log.js'; 
import Tracker from '../models/Tracker.js';
import mongoose from 'mongoose';

// 1. BELSŐ LOG LÉTREHOZÁS
export const createLog = async (trackerId, ownerId, type, deviceInfo, location) => {
    try {
        const newLog = new Log({ 
            trackerId, 
            ownerId, 
            type, 
            deviceInfo, 
            location 
        });
        await newLog.save();
        console.log(`📝 Log mentve: ${type}`);
    } catch (err) {
        console.error("🔥 Logolási hiba:", err);
    }
};

// 2. PUBLIKUS LOG LÉTREHOZÁSA
export const createPublicLog = async (req, res) => {
    try {
        const { trackerId, lat, lng, device } = req.body;

        console.log("📥 Beérkező adatok:", { trackerId, lat, lng });

        const longitude = Number(lng);
        const latitude = Number(lat);

        if (!trackerId || isNaN(longitude) || isNaN(latitude) || (longitude === 0 && latitude === 0)) {
            console.error("⚠️ Mentés elutasítva: hibás adatok");
            return res.status(400).json({ error: "Érvénytelen GPS adatok." });
        }

        const tracker = await Tracker.findById(trackerId);
        if (!tracker) return res.status(404).json({ error: "Tracker nem található" });

        const logData = {
            trackerId: new mongoose.Types.ObjectId(trackerId),
            ownerId: tracker.owner,
            type: 'SCAN',
            userAgent: device || req.headers['user-agent'],
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            date: new Date()
        };

        const newLog = new Log(logData);
        await newLog.save();
        
        console.log(`✅ Log mentve! [${latitude}, ${longitude}]`);
        res.json({ success: true });

    } catch (err) {
        console.error("🔥 Mentési hiba:", err.message);
        res.status(500).json({ error: "Adatbázis hiba" });
    }
};

// 3. LOGOK LEKÉRÉSE
export const getLogs = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Nincs jogosultság" });

        const query = req.user.role === 'admin' ? {} : { ownerId: req.user._id };
        
        const logs = await Log.find(query)
            .populate({
                path: 'trackerId',
                select: 'name uniqueCode icon owner' 
            })
            .sort({ date: -1 })
            .limit(100);
            
        res.json(logs);
    } catch (err) {
        console.error("🔥 Lekérési hiba:", err);
        res.status(500).json({ error: "Hiba a lekérdezésnél." });
    }
};