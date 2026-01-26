import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  trackerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tracker', 
    required: true 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  type: { 
    type: String, 
    enum: ['SCAN', 'MESSAGE', 'STATUS_CHANGE'], 
    default: 'SCAN' 
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], 
      default: [0, 0]
    }
  },
  userAgent: String,
  message: String
});

logSchema.index({ location: '2dsphere' });

// 🔥 A MEGOLDÁS: Megnézzük, létezik-e már. Ha igen, azt használjuk. Ha nem, újat gyártunk.
const Log = mongoose.models.Log || mongoose.model('Log', logSchema);

export default Log;