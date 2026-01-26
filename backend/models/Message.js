import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  trackerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tracker', 
    required: true,
    index: true // Gyorsítja a lekérdezést
  },
  // ✅ JAVÍTVA: String típus, hogy elfogadja a 'Finder' szöveget is, 
  // így nem akad fenn a 'required: true' feltételen!
  senderId: { 
    type: String, 
    required: true 
  },
  senderType: { 
    type: String, 
    enum: ['user', 'finder', 'admin'], 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    trim: true
  }
}, { timestamps: true }); // Automatikusan kezeli a createdAt és updatedAt mezőket

export const Message = mongoose.model('Message', messageSchema);
export default Message;