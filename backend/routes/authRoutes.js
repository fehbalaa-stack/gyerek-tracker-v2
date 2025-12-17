// routes/authRoutes.js TARTALOM
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const User = require('../models/User.js'); // Fontos: a .js kiterjesztés legyen rajta!

// ----------------------------------------------------
// POST /api/register (Regisztráció)
// ----------------------------------------------------
router.post('/register', async (req, res) => {
    try {
        const { name, email, phoneNumber, password, securityQuestion, group } = req.body;
        
        // Ellenőrzés, hogy a felhasználó létezik-e
        const existingUser = await User.findOne({ 
            $or: [{ email: email }, { phoneNumber: phoneNumber }] 
        });
        if (existingUser) {
             return res.status(409).json({ error: 'Ez az e-mail cím vagy telefonszám már regisztrálva van.' });
        }
        
        // Jelszó Hashelése
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = await User.create({
            name, email, phoneNumber, 
            password: hashedPassword,
            securityQuestion, group,
            role: 'parent'
        });

        res.status(201).json({ 
            success: true, 
            message: 'Felhasználó sikeresen regisztrálva!', 
            userId: newUser._id 
        });

    } catch (err) {
        console.error('REGISZTRÁCIÓS HIBA A BACKENDEN:', err); 
        res.status(500).json({ error: 'Szerveroldali hiba történt a regisztráció során.' });
    }
});

// ----------------------------------------------------
// POST /api/login (Bejelentkezés)
// ----------------------------------------------------
router.post('/login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(400).json({ error: 'Érvénytelen telefonszám vagy jelszó.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Érvénytelen telefonszám vagy jelszó.' });
        }

        res.status(200).json({
            _id: user._id, 
            name: user.name,
            role: user.role,
            phoneNumber: user.phoneNumber,
        });

    } catch (err) {
        console.error('LOGIN HIBA A BACKENDEN:', err);
        res.status(500).json({ error: 'Hiba történt a bejelentkezés során.' });
    }
});

module.exports = router;