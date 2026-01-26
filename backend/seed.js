const mongoose = require('mongoose');
const Log = require('./models/Log');
require('dotenv').config();

const seedLogs = async () => {
    await mongoose.connect(process.env.MONGO_URI || "a_te_uried");
    
    const dummyLogs = [
        { subject: "teszt@vura.hu", action: "Sikertelen belépési kísérlet", time: "2024.03.20. 10:15:30" },
        { subject: "admin@vura.hu", action: "Új tracker hozzáadva: Bodri", time: "2024.03.20. 11:20:00" },
        { subject: "user1@vura.hu", action: "Profil módosítása", time: "2024.03.20. 12:05:12" }
    ];

    await Log.insertMany(dummyLogs);
    console.log("✅ Adatok betöltve!");
    process.exit();
};

seedLogs();