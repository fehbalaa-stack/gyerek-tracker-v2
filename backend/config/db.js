import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // 🔥 EZT ADD HOZZÁ: Megmondja az adatbázis pontos nevét
    const dbName = conn.connection.db.databaseName;
    console.log("-----------------------------------------");
    console.log(`🍃 MongoDB Csatlakoztatva: ${conn.connection.host}`);
    console.log(`🚀 AKTÍV ADATBÁZIS NEVE: ${dbName}`);
    console.log("-----------------------------------------");

  } catch (error) {
    console.error(`❌ Hiba: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;