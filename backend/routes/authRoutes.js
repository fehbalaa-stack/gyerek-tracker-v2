import express from 'express';
// Fontos a .js kiterjesztés a controller végén is!
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Az útvonalak maradnak, csak a logika importálása változott
router.post('/register', authController.register);
router.post('/login', authController.login);

// A 'module.exports' helyett 'export default' kell az ES modulokhoz
export default router;