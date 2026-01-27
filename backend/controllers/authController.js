// backend/controllers/authController.js
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 1. REGISZTRÁCIÓ
export const register = async (req, res) => {
    console.log("📥 REGISZTRÁCIÓ START");
    try {
        const { name, email, phoneNumber, password, language } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Ez az email már foglalt!" });

        const newUser = new User({ 
            name, 
            email, 
            phoneNumber, 
            password, 
            language: language || 'hu'
        });

        await newUser.save();
        
        console.log("✅ REGISZTRÁCIÓ SIKERES:", email);
        res.status(201).json({ success: true, message: "Sikeres regisztráció!" });
    } catch (err) {
        console.error("🔥 REG HIBA:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 2. BEJELENTKEZÉS
export const login = async (req, res) => {
    console.log("🔍 LOGIN FOLYAMAT INDUL...");
    try {
        const identifier = req.body.email || req.body.phoneNumber;
        const password = req.body.password;

        // Ellenőrizzük, hogy a környezeti változó létezik-e
        if (!process.env.JWT_SECRET) {
            console.error("❌ HIÁNYZIK A JWT_SECRET A RENDER BEÁLLÍTÁSOKBÓL!");
            return res.status(500).json({ error: "Szerver konfigurációs hiba: JWT_SECRET hiányzik." });
        }

        const user = await User.findOne({
            $or: [{ email: identifier }, { phoneNumber: identifier }]
        });

        if (!user) {
            console.log("❌ LOGIN: Felhasználó nem található:", identifier);
            return res.status(401).json({ error: "Érvénytelen adatok!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log("❌ LOGIN: Hibás jelszó:", identifier);
            return res.status(401).json({ error: "Érvénytelen adatok!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Explicit módon állítjuk össze a választ, hogy ne legyen üres a response
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            language: user.language || 'hu',
            role: user.role || 'user',
            token: token
        });

    } catch (error) {
        console.error("🔥 LOGIN KRITIKUS HIBA:", error.message);
        return res.status(500).json({ error: "Szerver hiba: " + error.message });
    }
};