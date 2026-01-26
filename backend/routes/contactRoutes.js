// backend/routes/contactRoutes.js
import express from 'express';
import Contact from '../models/Contact.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 1. Üzenet küldése (Publikus - /api/contact/send)
router.post('/send', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Minden mező kitöltése kötelező!" });
    }

    const newMessage = new Contact({ name, email, message });
    await newMessage.save();

    res.status(201).json({ success: true, message: "Üzenet elmentve!" });
  } catch (err) {
    console.error("Backend Contact Error:", err);
    res.status(500).json({ error: "Szerver hiba az üzenet küldésekor." });
  }
});

// 2. Üzenetek lekérése (Csak Adminnak! - /api/contact/all)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Admin Contact Fetch Error:", err);
    res.status(500).json({ error: "Hiba az üzenetek lekérésekor." });
  }
});

// 3. 🔥 Üzenet állapotának frissítése (Olvasottá tétel - /api/contact/:id/read)
router.patch('/:id/read', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMessage = await Contact.findByIdAndUpdate(
      id,
      { status: 'read' },
      { new: true } // Visszaadja a frissített dokumentumot
    );
    
    if (!updatedMessage) {
      return res.status(404).json({ error: "Az üzenet nem található." });
    }
    
    res.json(updatedMessage);
  } catch (err) {
    console.error("Admin Contact Update Error:", err);
    res.status(500).json({ error: "Hiba az állapot frissítésekor." });
  }
});

// 4. Üzenet törlése (Csak Adminnak! - /api/contact/:id)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.json({ success: true, message: "Üzenet törölve." });
  } catch (err) {
    console.error("Admin Contact Delete Error:", err);
    res.status(500).json({ error: "Hiba a törlés során." });
  }
});

export default router;