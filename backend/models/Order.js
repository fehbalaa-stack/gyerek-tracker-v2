import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  // Kicsit rugalmasabb enum, ha esetleg elírás lenne a frontendről
  productType: { 
    type: String, 
    required: true 
  },
  // HOZZÁADVA: A méret elengedhetetlen a pólóhoz/pulcsihoz
  size: { type: String, default: 'N/A' },
  uniqueCode: { type: String, required: true }, 
  // qrStyle: ha véletlenül nem jönne át, kap egy alapértelmezettet, hogy ne szálljon el a mentés
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