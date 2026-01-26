import Tracker from '../models/Tracker.js';
import Log from '../models/Log.js'; 
import { customAlphabet } from 'nanoid';
import { generateStyledQR } from '../services/qrGenerator.js';
import fs from 'fs';
import path from 'path';

const generateUniqueId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 10);

// --- 1. JAVÍTOTT PUBLIKUS LEKÉRÉS (Nincs automatikus log mentés) ---
export const getPublicTracker = async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`🔥 GET PUBLIC TRACKER HIVAS ERKEZETT! Kód: ${code}`);

    const tracker = await Tracker.findOne({ uniqueCode: code })
      .populate('owner', 'name bio email phone emergencyPhone language')
      .lean(); 

    if (!tracker) {
      return res.status(404).json({ success: false, message: 'Tracker nem található' });
    }

    const tId = tracker._id.toString();

    const responseData = {
      success: true,
      extractedId: tId,
      tracker: {
        ...JSON.parse(JSON.stringify(tracker)),
        _id: tId,
        id: tId
      },
      owner: tracker.owner
    };

    console.log("🚀 KÜLDÖTT ADAT (extractedId):", responseData.extractedId);
    return res.json(responseData);
    
  } catch (error) {
    console.error('❌ Hiba a publikus lekérésnél:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

// --- 2. ÚJ VÉGPONT A VALÓDI GPS ADATOKHOZ ---
export const logPublicScan = async (req, res) => {
  try {
    const { trackerId, lat, lng, device } = req.body;

    if (!lat || !lng || parseFloat(lat) === 0 || parseFloat(lng) === 0) {
      return res.status(400).json({ success: false, message: 'Érvénytelen GPS koordináták' });
    }

    const tracker = await Tracker.findById(trackerId);
    if (!tracker) return res.status(404).json({ success: false });

    await Log.create({
      trackerId: tracker._id,
      ownerId: tracker.owner,
      type: 'SCAN',
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      userAgent: device || req.headers['user-agent']
    });

    console.log(`✅ VALÓDI GPS Log mentve: ${lat}, ${lng}`);
    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Hiba a logPublicScan mentésnél:", error);
    res.status(500).json({ success: false });
  }
};

export const createTracker = async (req, res) => {
  try {
    const { name, type, icon, qrStyle, customImage } = req.body;
    const ownerId = req.user.id;

    let uniqueCode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      uniqueCode = generateUniqueId();
      const existing = await Tracker.findOne({ uniqueCode });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) return res.status(500).json({ success: false, message: 'ID generálási hiba.' });

    const tracker = await Tracker.create({
      owner: ownerId,
      name: name || `oooVooo-${uniqueCode}`,
      icon: icon || '📍', 
      type: type || 'car',
      qrStyle: qrStyle || 'animals_bear',
      uniqueCode,
      customImage: customImage || null,
      status: 'active',
      permissions: { showName: false, showPhone: false, showEmail: false, showSocial: false, allowChat: true }
    });

    try {
      const qrDir = path.resolve('./public/qrcodes');
      if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
      const scanUrl = `https://oovoo-beta1.onrender.com/scan/${uniqueCode}`;      
      const qrBuffer = await generateStyledQR(scanUrl, tracker.qrStyle);
      const qrPath = path.join(qrDir, `${uniqueCode}.png`);
      fs.writeFileSync(qrPath, qrBuffer);
    } catch (qrError) {
      console.error('⚠️ QR hiba:', qrError);
    }

    if (req.io) req.io.emit('tracker_created', { ownerId, tracker });
    res.status(201).json({ success: true, tracker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Hiba a mentés során.' });
  }
};

export const updateTracker = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, permissions, qrStyle } = req.body;

    const updatedTracker = await Tracker.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { $set: { name, icon, permissions, qrStyle } },
      { new: true, runValidators: true }
    );

    if (!updatedTracker) return res.status(404).json({ message: 'Nincs találat.' });

    if (qrStyle) {
        try {
            const scanUrl = `https://oovoo-beta1.onrender.com/scan/${updatedTracker.uniqueCode}`;
            const qrBuffer = await generateStyledQR(scanUrl, updatedTracker.qrStyle);
            fs.writeFileSync(path.resolve(`./public/qrcodes/${updatedTracker.uniqueCode}.png`), qrBuffer);
        } catch (e) { 
            console.error("⚠️ Update QR hiba:", e);
        }
    }

    if (req.io) req.io.emit('tracker_updated', { ownerId: req.user.id, tracker: updatedTracker });
    res.json({ success: true, tracker: updatedTracker });
  } catch (error) {
    console.error('❌ Frissítési hiba:', error);
    res.status(500).json({ error: 'Frissítési hiba.' });
  }
};

// ✅ JAVÍTVA: Hozzáadva a populate('owner'), hogy a kártya lássa a jogosultságokat
export const getMyTrackers = async (req, res) => {
  try {
    const trackers = await Tracker.find({ owner: req.user.id })
      .populate('owner', 'phone phoneNumber instagram facebook emergencyPhone')
      .sort({ createdAt: -1 })
      .lean(); 
    
    res.json(trackers);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a lekérdezésnél.' });
  }
};

export const getTrackerLogs = async (req, res) => {
  try {
    const logs = await Log.find({ ownerId: req.user.id })
      .populate({
        path: 'trackerId',
        select: 'name icon uniqueCode'
      })
      .sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a logok lekérésekor' });
  }
};

export const deleteTracker = async (req, res) => {
  try {
    const deletedTracker = await Tracker.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!deletedTracker) return res.status(404).json({ message: 'Nem törölhető.' });

    const qrPath = path.resolve(`./public/qrcodes/${deletedTracker.uniqueCode}.png`);
    if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);

    if (req.io) req.io.emit('tracker_deleted', { ownerId: req.user.id, trackerId: deletedTracker._id });
    res.json({ success: true, message: 'Törölve.' });
  } catch (error) {
    res.status(500).json({ error: 'Törlési hiba.' });
  }
};