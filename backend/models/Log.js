const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    startTime: Date,
    endTime: Date,
    path: [{
        lat: Number,
        lng: Number,
        time: Date
    }], // A koordináták listája
    deviceType: String, // Eszköztípus naplózása
    reason: String // Mi váltotta ki
});

module.exports = mongoose.model('Log', LogSchema);