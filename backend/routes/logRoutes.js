import express from 'express';
import Log from '../models/Log.js';
import Tracker from '../models/Tracker.js';
import mongoose from 'mongoose';

const router = express.Router();

// --- 1. MENTÉS (Ezt hívja a mobil/frontend) ---
// Ez lesz a: https://oovoo-beta1.onrender.com/api/logs/log-public
router.post('/log-public', async (req, res) => {
    try {
        const { trackerId, lat, lng, device } = req.body;

        const longitude = Number(lng);
        const latitude = Number(lat);

        // Szűrés, hogy ne mentsünk 0,0-át
        if (!trackerId || isNaN(longitude) || isNaN(latitude) || (longitude === 0 && latitude === 0)) {
            return res.status(400).json({ error: "Érvénytelen GPS adatok." });
        }

        const tracker = await Tracker.findById(trackerId);
        if (!tracker) return res.status(404).json({ error: "Tracker nem található" });

        const newLog = new Log({
            trackerId: new mongoose.Types.ObjectId(trackerId),
            ownerId: tracker.owner,
            type: 'SCAN',
            userAgent: device || req.headers['user-agent'],
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            date: new Date()
        });

        await newLog.save();
        console.log(`✅ SIKER! Log mentve: [${latitude}, ${longitude}]`);
        res.json({ success: true });

    } catch (err) {
        console.error("🔥 Mentési hiba:", err.message);
        res.status(500).json({ error: "Szerver hiba" });
    }
});

// --- 2. LEKÉRDEZÉS (Ezt hívja a Dashboard/Térkép) ---
router.get('/', async (req, res) => {
  try {
    const logs = await Log.find({
      'location.coordinates': { $ne: [0, 0] }
    })
    .populate('trackerId')
    .sort({ date: -1 })
    .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;