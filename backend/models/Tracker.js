// models/Tracker.js
import mongoose from 'mongoose';

const trackerSchema = new mongoose.Schema(
  {
    owner: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      default: '📍'
    },
    type: {
      type: String,
      enum: ['car', 'pet', 'bag', 'key', 'generic'], 
      default: 'generic'
    },
    qrStyle: {
      type: String,
      default: 'classic' // 🔥 JAVÍTVA: 'default'-ról 'classic'-ra a fájlnév szinkron miatt
    },
    uniqueCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'lost'],
      default: 'active',
      index: true
    },
    permissions: {
      showName: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: false },
      showSocial: { type: Boolean, default: false },
      showInstagram: { type: Boolean, default: false }, // 🔥 HOZZÁADVA
      showFacebook: { type: Boolean, default: false },  // 🔥 HOZZÁADVA
      allowChat: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true 
  }
);

// JAVÍTOTT KASZKÁDOLT TÖRLÉS
trackerSchema.pre('findOneAndDelete', async function(next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      if (mongoose.models.Log) {
        await mongoose.model('Log').deleteMany({ trackerId: doc._id });
      }
      if (mongoose.models.Message) {
        await mongoose.model('Message').deleteMany({ trackerId: doc._id });
      }
    }
    next();
  } catch (error) {
    console.error("Hiba a kaszkádolt törlés közben:", error);
    next();
  }
});

const Tracker = mongoose.models.Tracker || mongoose.model('Tracker', trackerSchema);

export default Tracker;