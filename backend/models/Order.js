import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  
  // 🔥 MARCSIKA-LOGIKA: Ha van trackerId, akkor meglévő eszközhöz adunk új skint
  targetTrackerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tracker', default: null },
  
  productType: { 
    type: String, 
    required: true 
  },
  size: { type: String, default: 'N/A' },
  uniqueCode: { type: String, required: true }, 
  qrStyle: { type: String, default: 'default' },    
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
// force update 123