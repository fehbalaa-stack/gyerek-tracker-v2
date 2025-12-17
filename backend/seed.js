require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("🌱 Csatlakozva az adatbázishoz a teszt szülő létrehozásához...");

        // Töröljük a korábbi teszt szülőket (opcionális, hogy ne duplikálódjon)
        await User.deleteMany({ group: "Csalad1" });

        // Új szülő létrehozása
        const testParent = new User({
            name: "Teszt Apa",
            phoneNumber: process.env.PARENT_PHONE_NUMBER, // A .env fájlból veszi a számodat!
            role: "parent",
            group: "Csalad1"
        });

        await testParent.save();
        console.log("✅ Teszt szülő sikeresen létrehozva: " + testParent.name);
        mongoose.connection.close();
    })
    .catch(err => console.error("❌ Hiba:", err));