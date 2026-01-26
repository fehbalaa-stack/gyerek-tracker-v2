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

        // 🔥 JAVÍTÁS: Nem hashelünk itt kézzel! 
        // A User.js modell pre-save hook-ja fogja ezt megtenni automatikusan a .save() hívásakor.
        
        const newUser = new User({ 
            name, 
            email, 
            phoneNumber, 
            password, // Sima szövegként adjuk át, a Modell hasheli le!
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

        const user = await User.findOne({
            $or: [{ email: identifier }, { phoneNumber: identifier }]
        });

        if (!user) {
            return res.status(401).json({ error: "Érvénytelen adatok!" });
        }

        // 🔥 JAVÍTÁS: Használhatod a Modellbe írt matchPassword metódust is:
        // const isMatch = await user.matchPassword(password);
        // VAGY marad a bcrypt.compare, mindkettő jó, ha az adatbázisban csak egyszeres hash van.
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ error: "Érvénytelen adatok!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        const userResponse = user.toObject();
        delete userResponse.password;
        
        return res.status(200).json({ ...userResponse, token });

    } catch (error) {
        console.error("🔥 LOGIN KRITIKUS HIBA:", error.message);
        return res.status(500).json({ error: "Szerver hiba." });
    }
};