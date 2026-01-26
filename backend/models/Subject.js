const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    type: { type: String, enum: ['kutya', 'macska', 'ember', 'auto', 'egyeb'], default: 'ember' },
    category: { type: String, required: true }, // Kategória beállítás
    color: { type: String, default: '#3498db' },
    status: { type: String, enum: ['safe', 'lost'], default: 'safe' },
    qrCodeId: { type: String, unique: true, required: true }, // A QR kód egyedi azonosítója
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subject', SubjectSchema);