import express from 'express';
import { 
    createTracker, 
    getMyTrackers, 
    updateTracker, 
    deleteTracker 
} from '../controllers/trackerController.js';
import { protect } from '../middleware/authMiddleware.js';
import Log from '../models/Log.js';
import Tracker from '../models/Tracker.js';

const router = express.Router();

// --- LOGOK LEKÉRÉSE ---
router.get('/logs', protect, async (req, res) => {
  try {
    const myTrackers = await Tracker.find({ owner: req.user._id }).select('_id');
    const trackerIds = myTrackers.map(t => t._id);

    const logs = await Log.find({ trackerId: { $in: trackerIds } })
      .populate('trackerId', 'name type icon uniqueCode') 
      .sort({ date: -1 });

    res.json(logs);
  } catch (err) {
    console.error("Log lekérési hiba:", err);
    res.status(500).json({ error: 'Hiba a logok betöltésekor' });
  }
});

// --- 🔥 ÚJ: SKIN HOZZÁADÁSA MEGLÉVŐ ESZKÖZHÖZ ---
// Ezt hívja meg a Webshop sikeres fizetés után
router.post('/add-skin/:id', protect, async (req, res) => {
  try {
    const { styleId, orderId } = req.body;
    const tracker = await Tracker.findOne({ _id: req.params.id, owner: req.user._id });

    if (!tracker) {
      return res.status(404).json({ success: false, message: 'Tracker nem található' });
    }

    // Új skin rögzítése a listába
    tracker.skins.push({
      styleId,
      orderId,
      purchasedAt: new Date()
    });

    // Frissítjük az aktuális stílust is az újra
    tracker.qrStyle = styleId;

    await tracker.save();
    res.json({ success: true, tracker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Alap útvonalak
router.post('/add', protect, createTracker);
router.get('/my-trackers', protect, getMyTrackers);
router.patch('/:id', protect, updateTracker);
router.delete('/:id', protect, deleteTracker);

export default router;