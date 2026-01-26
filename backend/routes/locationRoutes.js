const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// IMPORTÁLD BE A MODELLEKET!
const User = require('../models/User');
const Subject = require('../models/Subject');
const Log = require('../models/Log'); // Opcionális, ha van Log modelled

// ------------------------------------------------------------------
// 1. ADMIN API-K (Ezek kellenek a kezeléshez!)
// ------------------------------------------------------------------

// A) Összes felhasználó lekérése
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Jelszót nem küldünk vissza
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Hiba a listázáskor" });
    }
});

// B) Felhasználó TÖRLÉSE
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await Subject.deleteMany({ parentId: req.params.id }); // Alanyokat is töröljük
        res.json({ message: "Sikeres törlés" });
    } catch (err) {
        res.status(500).json({ error: "Hiba a törléskor" });
    }
});

// C) Felhasználó MÓDOSÍTÁSA (Pl. Prémium adása/elvétele)
router.put('/users/:id', async (req, res) => {
    try {
        const { subscription } = req.body; // pl. { subscription: 'premium' }
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { subscription: subscription },
            { new: true }
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: "Hiba a módosításkor" });
    }
});

// ------------------------------------------------------------------
// 2. AUTHENTIKÁCIÓ (Login / Register)
// ------------------------------------------------------------------

router.post('/register', async (req, res) => {
    try {
        const { name, email, phoneNumber, password, role } = req.body;
        const existing = await User.findOne({ phoneNumber });
        if (existing) return res.status(400).json({ error: "Ez a szám már létezik." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name, email, phoneNumber, 
            password: hashedPassword,
            role: role || 'user', // Ha admint akarsz, itt lehet 'admin'-t küldeni Postmanból, vagy DB-ben átírni
            subscription: 'free'
        });
        const saved = await newUser.save();
        res.status(201).json({ message: "Siker", userId: saved._id });
    } catch (err) {
        res.status(500).json({ error: "Regisztrációs hiba" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        const user = await User.findOne({ phoneNumber });
        if (!user) return res.status(400).json({ error: "Hibás adatok." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Hibás adatok." });

        const token = jwt.sign({ id: user._id }, "TITKOS_KULCS", { expiresIn: "1h" });

        res.json({
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,       // Fontos az admin panelhez!
            subscription: user.subscription
        });
    } catch (err) {
        res.status(500).json({ error: "Belépési hiba" });
    }
});

// ------------------------------------------------------------------
// 3. EGYÉB (Subject, Logs)
// ------------------------------------------------------------------

router.post('/subjects/:userId', async (req, res) => {
    try {
        const newSubject = new Subject({
            parentId: req.params.userId,
            name: req.body.name,
            type: req.body.type || 'ember',
            qrCodeId: Math.random().toString(36).substring(7),
            status: 'active'
        });
        await newSubject.save();
        res.status(201).json(newSubject);
    } catch (err) { res.status(500).json({ error: "Hiba" }); }
});

router.get('/subjects/user/:userId', async (req, res) => {
    try {
        const subjects = await Subject.find({ parentId: req.params.userId });
        res.json(subjects);
    } catch (err) { res.status(500).json({ error: "Hiba" }); }
});

router.get('/logs', async (req, res) => {
    try {
        const logs = await Log.find({}).populate('subjectId', 'name').sort({ endTime: -1 }).limit(20);
        res.json(logs);
    } catch (err) { res.json([]); } 
});

module.exports = router;