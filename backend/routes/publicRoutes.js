import express from 'express';
import Tracker from '../models/Tracker.js'; 
import User from '../models/User.js';       

const router = express.Router();

router.get('/tracker/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const tracker = await Tracker.findOne({ uniqueCode: code });
    if (!tracker) return res.status(404).json({ error: 'Tracker not found' });

    const owner = await User.findById(tracker.owner);
    if (!owner) return res.status(404).json({ error: 'Owner not found' });

    // Biztosítjuk, hogy minden permission-nek legyen alapértelmezett értéke
    const perms = {
      showName: tracker.permissions?.showName || false,
      showPhone: tracker.permissions?.showPhone || false,
      showEmail: tracker.permissions?.showEmail || false,
      showSocial: tracker.permissions?.showSocial || false,
      allowChat: tracker.permissions?.allowChat !== undefined ? tracker.permissions.allowChat : true
    };

    const filteredOwner = {
      name: perms.showName ? owner.name : (req.query.lang === 'en' ? 'Owner' : 'Tulajdonos'),
      
      // Ellenőrizd, hogy a User modellben phoneNumber vagy phone van-e!
      // Itt mindkettőt megnézzük a biztonság kedvéért:
      phone: perms.showPhone ? (owner.phoneNumber || owner.phone) : null,
      
      email: perms.showEmail ? owner.email : null,
      bio: owner.bio || '', 
      emergencyPhone: owner.emergencyPhone || '', 
      
      // Social média adatok
      social: perms.showSocial ? { 
        instagram: owner.instagram || null, 
        facebook: owner.facebook || null 
      } : null
    };

    res.json({
      success: true,
      extractedId: tracker._id, 
      tracker: {
        _id: tracker._id,
        name: tracker.name,
        type: tracker.type,
        icon: tracker.icon || '📍', // Ha nincs ikon, adjunk egy alapértelmezettet
        uniqueCode: tracker.uniqueCode,
        permissions: perms 
      },
      owner: filteredOwner
    });

  } catch (err) {
    console.error("Public API Error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;