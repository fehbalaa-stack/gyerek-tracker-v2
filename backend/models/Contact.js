// backend/models/Contact.js
import mongoose from 'mongoose'; // 🔥 require helyett import

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

// 🔥 module.exports helyett export default
// A mongoose.models.Contact ellenőrzi, hogy létezik-e már a modell (fontos a Nodemon miatt)
export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);