import express from 'express';
import { 
    createTracker, 
    getMyTrackers, 
    updateTracker, 
    deleteTracker 
} from '../controllers/trackerController.js';
import { protect } from '../middleware/authMiddleware.js';
import Log from '../models/Log.js';
import Tracker from '../models/Tracker.js'; // 🔥 Be kell importálnod a Tracker modellt is!

const router = express.Router();

// --- LOGOK LEKÉRÉSE A TÉRKÉPHEZ ÉS LISTÁHOZ ---
router.get('/logs', protect, async (req, res) => {
  try {
    // 1. Megkeressük a bejelentkezett felhasználó összes trackerének ID-ját
    const myTrackers = await Tracker.find({ owner: req.user._id }).select('_id');
    const trackerIds = myTrackers.map(t => t._id);

    // 2. Lekérjük az összes logot, ami ezekhez a trackerekhez tartozik
    // Így nem számít, hogy a log-ban van-e ownerId, mert a trackerId alapján szűrünk
    const logs = await Log.find({ trackerId: { $in: trackerIds } })
      .populate('trackerId', 'name type icon uniqueCode') 
      .sort({ date: -1 });

    console.log(`📡 ${logs.length} log küldve a frontendnek.`);
    res.json(logs);
  } catch (err) {
    console.error("Log lekérési hiba:", err);
    res.status(500).json({ error: 'Hiba a logok betöltésekor' });
  }
});

// Többi útvonal marad...
router.post('/add', protect, createTracker);
router.get('/my-trackers', protect, getMyTrackers);
router.patch('/:id', protect, updateTracker);
router.delete('/:id', protect, deleteTracker);

export default router;
