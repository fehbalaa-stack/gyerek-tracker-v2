import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js'; // Fontos a .js kiterjesztés a végére!

dotenv.config();

const seedOrders = async () => {
    try {
        // Csatlakozás (használd a .env-ből vagy a fix címet)
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ooovooo";
        await mongoose.connect(mongoUri);
        console.log("🚀 Csatlakozva az adatbázishoz...");

        // Régi adatok törlése a tiszta teszteléshez
        await Order.deleteMany({});

        const dummyOrders = [
            {
                userId: new mongoose.Types.ObjectId(), 
                customerName: "Kovács János",
                customerEmail: "janos@teszt.hu",
                productType: "tshirt",
                uniqueCode: "DINO-777",
                qrStyle: "animals_dino_front",
                status: "pending",
                createdAt: new Date()
            },
            {
                userId: new mongoose.Types.ObjectId(),
                customerName: "Szabó Erzsébet",
                customerEmail: "erzsi@peldamail.hu",
                productType: "hoodie",
                uniqueCode: "BEAR-101",
                qrStyle: "animals_bear_front",
                status: "pending",
                createdAt: new Date(Date.now() - 86400000)
            },
            {
                userId: new mongoose.Types.ObjectId(),
                customerName: "Nagy Árpád",
                customerEmail: "arpad@vura.hu",
                productType: "stickers",
                uniqueCode: "WOLF-999",
                qrStyle: "animals_wolf_minimal",
                status: "pending",
                createdAt: new Date()
            }
        ];

        await Order.insertMany(dummyOrders);
        
        console.log("✅ Teszt rendelések sikeresen betöltve!");
        console.log(`📦 Generálva: ${dummyOrders.length} db rendelés.`);
        
        process.exit();
    } catch (error) {
        console.error("❌ Hiba a betöltés során:", error);
        process.exit(1);
    }
};

seedOrders();