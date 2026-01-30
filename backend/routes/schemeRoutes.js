// routes/schemeRoutes.js
const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const upload = require('../middleware/uploadMiddleware');
const { isAdmin } = require('../middleware/authMiddleware');

// ÚJ SKIN HOZZÁADÁSA
router.post('/add', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id, name, category } = req.body;

    // Ellenőrizzük, létezik-e már az ID az adatbázisban
    let scheme = await Scheme.findOne({ id });

    if (scheme) {
      // Ha létezik, frissítjük az adatait
      scheme.name = name;
      scheme.category = category;
      await scheme.save();
      return res.json({ success: true, message: 'Skin adatai frissítve!' });
    }

    // Ha új, létrehozzuk
    const newScheme = new Scheme({
      id,
      name,
      category
    });

    await newScheme.save();
    res.json({ success: true, message: 'Új skin sikeresen hozzáadva!' });

  } catch (err) {
    console.error("Skin feltöltési hiba:", err);
    res.status(500).json({ success: false, message: 'Szerver hiba a mentés során.' });
  }
});

// LISTÁZÁS (Ez már valószínűleg megvan neked, de a biztonság kedvéért)
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;