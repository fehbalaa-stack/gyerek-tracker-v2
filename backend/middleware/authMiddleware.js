import jwt from 'jsonwebtoken';
import { User } from '../models/User.js'; // Fontos a .js kiterjesztés!

// 1. ÁLTALÁNOS VÉDELEM (Bejelentkezett felhasználó ellenőrzése)
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // A kéréshez csatoljuk a felhasználót (jelszó nélkül)
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'A felhasználó már nem létezik.' });
            }

            next();
        } catch (error) {
            console.error("Token hiba:", error);
            return res.status(401).json({ message: 'Nem autorizált, hibás token.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Nem autorizált, nincs token.' });
    }
};

// 2. ADMIN JOGOSULTSÁG ELLENŐRZÉSE
export const isAdmin = async (req, res, next) => {
    // A 'protect' middleware-nek meg kell előznie ezt, hogy legyen req.user!
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Hozzáférés megtagadva: Admin jogosultság szükséges!" });
    }
};