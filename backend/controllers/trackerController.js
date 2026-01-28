// controllers/trackerController.js
import Tracker from '../models/Tracker.js';
import Log from '../models/Log.js'; 
import { customAlphabet } from 'nanoid';
import { generateStyledQR } from '../services/qrGenerator.js';
import fs from 'fs';
import path from 'path';

const generateUniqueId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 10);

// --- 1. JAVÍTOTT PUBLIKUS LEKÉRÉS ---
export const getPublicTracker = async (req, res) => {
  try {
    const { code } = req.params;
    const tracker = await Tracker.findOne({ uniqueCode: code })
      .populate('owner', 'name bio email phone emergencyPhone language')
      .lean(); 

    if (!tracker) {
      return res.status(404).json({ success: false, message: 'Tracker nem található' });
    }

    const tId = tracker._id.toString();
    return res.json({
      success: true,
      extractedId: tId,
      tracker: { ...tracker, _id: tId, id: tId },
      owner: tracker.owner
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Szerver hiba' });
  }
};

// --- 2. LOG PUBLIC SCAN ---
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
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      userAgent: device || req.headers['user-agent']
    });

    return res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// --- 3. CREATE TRACKER (Skins logikával bővítve) ---
export const createTracker = async (req, res) => {
  try {
    const { name, type, icon, qrStyle, customImage } = req.body;
    const ownerId = req.user.id;
    const selectedStyle = qrStyle || 'classic';

    let uniqueCode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      uniqueCode = generateUniqueId();
      const existing = await Tracker.findOne({ uniqueCode });
      if (!existing) isUnique = true;
      attempts++;
    }

    const tracker = await Tracker.create({
      owner: ownerId,
      name: name || `oooVooo-${uniqueCode}`,
      icon: icon || '📍', 
      type: type || 'generic',
      qrStyle: selectedStyle,
      // 🔥 Automatikusan hozzáadjuk az induló skint a listához
      skins: [{ styleId: selectedStyle, purchasedAt: new Date() }],
      uniqueCode,
      customImage: customImage || null,
      status: 'active',
      permissions: { showName: false, showPhone: false, showEmail: false, showSocial: false, allowChat: true }
    });

    // QR Generálás
    try {
      const qrDir = path.resolve('./public/qrcodes');
      if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
      const scanUrl = `https://oovoo-backend.onrender.com/scan/${uniqueCode}`;      
      const qrBuffer = await generateStyledQR(scanUrl, selectedStyle);
      fs.writeFileSync(path.join(qrDir, `${uniqueCode}.png`), qrBuffer);
    } catch (qrError) {
      console.error('⚠️ QR hiba:', qrError);
    }

    if (req.io) req.io.emit('tracker_created', { ownerId, tracker });
    res.status(201).json({ success: true, tracker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Hiba a mentés során.' });
  }
};

// --- 4. UPDATE TRACKER (Skin gyűjtemény kezeléssel) ---
export const updateTracker = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, permissions, qrStyle } = req.body;

    const tracker = await Tracker.findOne({ _id: id, owner: req.user.id });
    if (!tracker) return res.status(404).json({ message: 'Nincs találat.' });

    if (name) tracker.name = name;
    if (icon) tracker.icon = icon;
    if (permissions) tracker.permissions = permissions;
    
    if (qrStyle) {
      tracker.qrStyle = qrStyle;
      // 🔥 Ha olyan stílust választ, ami még nincs a gyűjteményében, adjuk hozzá
      const hasSkin = tracker.skins.some(s => s.styleId === qrStyle);
      if (!hasSkin) {
        tracker.skins.push({ styleId: qrStyle, purchasedAt: new Date() });
      }

      // QR Újragenerálás az új stílussal
      try {
        const scanUrl = `https://oovoo-backend.onrender.com/scan/${tracker.uniqueCode}`;
        const qrBuffer = await generateStyledQR(scanUrl, qrStyle);
        fs.writeFileSync(path.resolve(`./public/qrcodes/${tracker.uniqueCode}.png`), qrBuffer);
      } catch (e) { 
        console.error("⚠️ Update QR hiba:", e);
      }
    }

    await tracker.save();

    if (req.io) req.io.emit('tracker_updated', { ownerId: req.user.id, tracker });
    res.json({ success: true, tracker });
  } catch (error) {
    res.status(500).json({ error: 'Frissítési hiba.' });
  }
};

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