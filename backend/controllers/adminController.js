// backend/controllers/adminController.js
import { generateStyledQR } from '../services/qrGenerator.js';
import Tracker from '../models/Tracker.js';

export const getCleanQRForProduction = async (req, res) => {
    try {
        const { uniqueCode } = req.params;
        const { styleId } = req.query;

        // 1. Csak Admin férhet hozzá (ezt a routerben védjük le)
        // 2. Legeneráljuk a TISZTA képet (isPreview = false)
        const scanUrl = `https://ooovooo.com/scan/${uniqueCode}`;
        const buffer = await generateStyledQR(scanUrl, styleId, false); 

        // 3. Visszaküldjük a fájlt letöltésre
        res.setHeader('Content-Disposition', `attachment; filename=PROD_${uniqueCode}.png`);
        res.type('image/png').send(buffer);

    } catch (error) {
        console.error('Admin QR hiba:', error);
        res.status(500).json({ message: 'Hiba a generáláskor' });
    }
};