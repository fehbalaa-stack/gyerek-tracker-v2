const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    securityQuestion: { type: String, required: true }, // Pl. anyja leánykori neve
    role: { type: String, enum: ['parent', 'admin'], default: 'parent' },
    group: { type: String, required: true },
    status: { type: String, enum: ['active', 'banned'], default: 'active' }, // Itt tudod tiltani
    subscription: { type: String, enum: ['free', 'premium'], default: 'free' }, // Prémium státusz
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);