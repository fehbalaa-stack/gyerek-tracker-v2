const express = require('express');
const router = express.Router();
const User = require('../models/User.js'); // Importáld a User modellt

// ----------------------------------------------------
// GET /api/users (Összes felhasználó lekérése ADMINNAK)
// ----------------------------------------------------
router.get('/users', async (req, res) => {
    // Ezt a console.log-ot látnod kell a backend terminálban!
    console.log('--- ADMIN PANEL: FELHASZNÁLÓK LEKÉRÉSE SIKERES ---'); 
    
    try {
        // Lekérdezzük az összes felhasználót, kivéve a jelszót
        const users = await User.find().select('-password'); 
        res.status(200).json(users);

    } catch (err) {
        console.error('FETCH USERS HIBA:', err);
        res.status(500).json({ error: 'Hiba történt a felhasználók lekérésekor.' });
    }
});

// Ide jön majd a router.delete('/users/:id') és a router.put('/users/:id')

module.exports = router;