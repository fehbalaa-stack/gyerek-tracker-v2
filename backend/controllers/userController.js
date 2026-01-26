// backend/controllers/userController.js
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

/* ============================================================
   1️⃣ PROFIL LEKÉRÉSE
   ============================================================ */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }
    res.json(user);
  } catch (error) {
    console.error('getProfile hiba:', error);
    res.status(500).json({ message: 'Hiba a profil lekérésekor' });
  }
};

/* ============================================================
   2️⃣ PROFIL FRISSÍTÉSE (Javított verzió)
   ============================================================ */
export const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, phone, instagram, facebook, bio, emergencyPhone, language } = req.body;
    
    // Debug log a Render konzolhoz
    console.log("📥 Beérkező profil adatok:", req.body);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    // Alapadatok frissítése - Kezeljük mindkét telefonmező nevet
    user.name = name || user.name;
    user.phone = phone || phoneNumber || user.phone; 
    user.phoneNumber = phoneNumber || phone || user.phoneNumber;
    user.instagram = instagram ?? user.instagram;
    user.facebook = facebook ?? user.facebook;
    user.bio = bio ?? user.bio;
    user.emergencyPhone = emergencyPhone ?? user.emergencyPhone;

    // ✅ NYELV FRISSÍTÉSE: Rugalmasabb ellenőrzés (kisbetűsítés)
    if (language) {
      const lowerLang = language.toLowerCase();
      if (['hu', 'en', 'de'].includes(lowerLang)) {
        user.language = lowerLang;
      }
    }

    const updatedUser = await user.save();
    
    // Jelszó eltávolítása a válaszból
    const userObject = updatedUser.toObject();
    delete userObject.password;

    res.json(userObject);
  } catch (error) {
    console.error('❌ updateProfile hiba:', error.message);
    res.status(500).json({ success: false, message: `Hiba a mentés során: ${error.message}` });
  }
};

/* ============================================================
   3️⃣ EMAIL MÓDOSÍTÁSA (Jelszavas ellenőrzéssel)
   ============================================================ */
export const updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Felhasználó nem található' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Hibás jelszó!' });
    }

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Ez az email cím már használatban van!' });
    }

    user.email = newEmail;
    await user.save();

    res.json({ success: true, message: 'Email cím sikeresen frissítve!' });
  } catch (error) {
    console.error('updateEmail hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba az email frissítésekor' });
  }
};

/* ============================================================
   4️⃣ JELSZÓ MÓDOSÍTÁSA
   ============================================================ */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Felhasználó nem található' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'A jelenlegi jelszó hibás!' });
    }

    user.password = newPassword; // A User modell pre-save hookja fogja hashelni
    await user.save();

    res.json({ success: true, message: 'Jelszó sikeresen módosítva!' });
  } catch (error) {
    console.error('updatePassword hiba:', error);
    res.status(500).json({ success: false, message: 'Szerver hiba a jelszó módosításakor' });
  }
};
  //