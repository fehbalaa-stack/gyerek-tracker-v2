import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    childName: { 
        type: String, 
        required: true 
    }, // Opcionálisan ide kerülhet a trackerId is a jövőben
    latitude: { 
        type: Number, 
        required: true 
    },
    longitude: { 
        type: Number, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

// Named export a konzisztencia és a könnyű importálás végett
export const Location = mongoose.model('Location', LocationSchema);