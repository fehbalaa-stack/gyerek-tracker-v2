import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Ellenőrizd: default vagy named export? (Itt default-ot feltételezek)

// 1. ÁLTALÁNOS VÉDELEM (authMiddleware)
export const authMiddleware = async (req, res, next) => {
    let token;

    // Ellenőrizzük a Headerben VAGY a Query paraméterben (a letöltéshez) [cite: 2026-01-06]
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Nem autorizált, nincs token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // A kéréshez csatoljuk a felhasználót (jelszó nélkül)
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({ message: 'A felhasználó már nem létezik.' });
        }

        next();
    } catch (error) {
        console.error("Token hiba:", error);
        return res.status(401).json({ message: 'Nem autorizált, hibás vagy lejárt token.' });
    }
};

// 2. ADMIN JOGOSULTSÁG ELLENŐRZÉSE (adminMiddleware)
export const adminMiddleware = async (req, res, next) => {
    // Az 'authMiddleware'-nek meg kell előznie ezt, hogy legyen req.user!
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Hozzáférés megtagadva: Admin jogosultság szükséges!" });
    }
};