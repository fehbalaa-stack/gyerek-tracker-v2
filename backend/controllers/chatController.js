// backend/controllers/chatController.js
import Message from '../models/Message.js';
import Tracker from '../models/Tracker.js';
import mongoose from 'mongoose';

export const getMessages = async (req, res) => {
  try {
    const { trackerId } = req.params;
    let queryId = trackerId;

    if (!mongoose.Types.ObjectId.isValid(trackerId)) {
      const tracker = await Tracker.findOne({ uniqueCode: trackerId });
      if (tracker) {
        queryId = tracker._id;
      }
    }

    const messages = await Message.find({ trackerId: queryId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Hiba a lekéréskor:", err);
    res.status(500).json({ success: false, message: "Szerver hiba" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { trackerId, message, senderType } = req.body; // trackerId itt jöhet rövid kódként is
    let targetId = trackerId;
    let uniqueRoomCode = trackerId; // Ezt használjuk a Finder oldal szobájaként

    if (!mongoose.Types.ObjectId.isValid(trackerId)) {
      const tracker = await Tracker.findOne({ uniqueCode: trackerId });
      if (tracker) {
        targetId = tracker._id;
        uniqueRoomCode = tracker.uniqueCode;
      } else {
        return res.status(404).json({ success: false, message: "Tracker nem található" });
      }
    } else {
        // Ha eleve hosszú ID-t kaptunk, megpróbáljuk megkeresni a rövid kódot a biztonság kedvéért
        const tracker = await Tracker.findById(trackerId);
        if (tracker) uniqueRoomCode = tracker.uniqueCode;
    }

    let finalSenderId;
    if (senderType === 'finder') {
      finalSenderId = "Finder";
    } else {
      finalSenderId = req.user?.id || "Owner";
    }

    const newMessage = await Message.create({
      trackerId: targetId,
      message,
      senderType: senderType === 'finder' ? 'finder' : 'user', 
      senderId: finalSenderId.toString() 
    });

    // 🔥 AZ ÉLŐ FRISSÍTÉS KULCSA:
    if (req.io) {
      const messageToSend = newMessage.toObject();
      
      console.log(`📡 Socket szórás -> Rövid szoba: ${uniqueRoomCode}, Hosszú szoba: ${targetId}`);
      
      // 1. Küldjük a rövid kódú szobának (ez kell a Finder oldalnak)
      req.io.to(uniqueRoomCode.toString()).emit('receive_message', messageToSend);
      
      // 2. Küldjük a hosszú ID-s szobának (ez kell a tulajdonosi ChatView-nak)
      req.io.to(targetId.toString()).emit('receive_message', messageToSend);
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    console.error("Küldési hiba a terminálban:", err);
    res.status(500).json({ success: false, message: "Hiba az üzenet mentésekor" });
  }
};