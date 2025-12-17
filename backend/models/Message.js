const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true }, // Melyik alanyhoz tartozik a beszélgetés
    senderId: { type: String, required: true }, // A küldő ID-ja (vagy User ID, vagy QR-ID)
    senderType: { type: String, enum: ['user', 'finder', 'admin'], required: true }, // Ki küldte (szülő/megtaláló/admin)
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);