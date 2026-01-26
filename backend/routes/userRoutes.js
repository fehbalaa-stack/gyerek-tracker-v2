import express from 'express';
// FONTOS: Mivel a User.js-ben 'export const User' van, kapcsos zárójel KELL!
import { User } from '../models/User.js'; 
import { protect } from '../middleware/authMiddleware.js'; 
import { getProfile, updateProfile, updateEmail, updatePassword } from '../controllers/userController.js';

const router = express.Router();

/* A konkrét útvonalak (/profile) mindig jó helyen vannak itt, 
   de győződj meg róla, hogy a server.js-ben hogyan kötötted be!
*/

/**
 * @route   GET /api/users/profile
 * @desc    Profiladatok lekérése (beleértve a mentett nyelvbeállítást is) [cite: 2026-01-02]
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PATCH /api/users/profile
 * @desc    Profiladatok frissítése (név, email, telefon és NYELV mentése) [cite: 2026-01-02, 2026-01-06]
 */
router.patch('/profile', protect, updateProfile);

/**
 * @route   POST /api/users/update-email
 * @desc    Email cím módosítása jelszavas ellenőrzéssel
 */
router.post('/update-email', protect, updateEmail);

/**
 * @route   POST /api/users/update-password
 * @desc    Jelszó módosítása
 */
router.post('/update-password', protect, updatePassword);


// --- ADMIN ÚTVONALAK ---

/**
 * @route   GET /api/users/admin/all 
 * @desc    Összes felhasználó listázása adminoknak
 */
router.get('/admin/all', protect, async (req, res) => {
    // Senior tip: Mindig ellenőrizzük a req.user létezését a role előtt
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultságod.' });
    }
    
    console.log('--- ADMIN PANEL: FELHASZNÁLÓK LEKÉRÉSE ---'); 
    try {
        // Lekérjük az összes felhasználót, beleértve a választott nyelvüket is [cite: 2026-01-02]
        const users = await User.find().select('-password'); 
        res.status(200).json(users);
    } catch (err) {
        console.error('FETCH USERS HIBA:', err);
        res.status(500).json({ error: 'Hiba történt a lekéréskor.' });
    }
});

export default router;