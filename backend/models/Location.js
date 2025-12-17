const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    childName: { type: String, required: true }, // Kihez tartozik a jel?
    latitude: { type: Number, required: true },  // Szélességi fok
    longitude: { type: Number, required: true }, // Hosszúsági fok
    timestamp: { type: Date, default: Date.now } // Mikor érkezett a jel?
});

module.exports = mongoose.model('Location', LocationSchema);