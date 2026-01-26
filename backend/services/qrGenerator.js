import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';

/**
 * Összeállítja a stílusos QR kódot: Alap QR + PNG maszk
 * @param {string} text - A kódolt adat (A link, ami rejtve marad)
 * @param {string} styleId - A választott séma neve
 * @param {boolean} isPreview - Ha true, vízjelet tesz a képre
 */
export const generateStyledQR = async (text, styleId, isPreview = true) => {
    const canvasSize = 1024;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext('2d');

    try {
        // 1. ALAP QR GENERÁLÁSA (Közvetlen rajzolás pixelekkel, szöveg kizárva)
        // Létrehozunk egy ideiglenes vásznat a QR-nek
        const qrCanvas = createCanvas(canvasSize, canvasSize);
        await QRCode.toCanvas(qrCanvas, text, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: canvasSize,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        // Átmásoljuk a tiszta QR-t a fő vászonra
        ctx.drawImage(qrCanvas, 0, 0);

        // 2. ILLUSZTRÁLT SÉMA RÁHELYEZÉSE (PNG MASZK)
        try {
            const schemePath = path.resolve(`./public/schemes/${styleId}.png`);
            const schemeImage = await loadImage(schemePath);
            ctx.drawImage(schemeImage, 0, 0, canvasSize, canvasSize);
        } catch (err) {
            console.warn(`⚠️ Séma nem található: ${styleId}.png`);
        }

        // 3. VÍZJEL (Csak előnézethez)
        if (isPreview) {
            ctx.save();
            ctx.font = "bold 60px Arial";
            ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; // Nagyon halvány, hogy ne lehessen linknek nézni
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            // Csak a MINTA feliratot írjuk rá, semmi mást
            ctx.fillText("MINTA / PREVIEW", canvasSize / 2, 80);
            ctx.fillText("MINTA / PREVIEW", canvasSize / 2, canvasSize - 80);
            ctx.restore();
        }

        // SZIGORÚ ELLENŐRZÉS: NINCS ctx.fillText(text, ...) hívás!
        return canvas.toBuffer('image/png');
    } catch (error) {
        console.error('🔥 PONTOS HIBAÜZENET:', error);
        throw error;
    }
};