import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs'; // Szükséges a fájlrendszer ellenőrzéséhez

/**
 * Összeállítja a stílusos QR kódot: Alap QR + PNG maszk
 * @param {string} text - A kódolt adat (A link, ami rejtve marad)
 * @param {string} styleId - A választott séma neve (pl. animals_pug_v1)
 * @param {boolean} isPreview - Ha true, vízjelet tesz a képre
 */
export const generateStyledQR = async (text, styleId, isPreview = true) => {
    const canvasSize = 1024;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext('2d');

    try {
        // 1. ALAP QR GENERÁLÁSA (oooVooo smaragd színnel)
        const qrCanvas = createCanvas(canvasSize, canvasSize);
        await QRCode.toCanvas(qrCanvas, text, {
            errorCorrectionLevel: 'H',
            margin: 4, // Pici margó, hogy a skin ne takarja ki a szélső modulokat teljesen
            width: canvasSize,
            color: {
                dark: '#50C878', // 🔥 Smaragd/Emerald szín az oooVooo arculat szerint
                light: '#ffffff'
            }
        });

        // Átmásoljuk a QR-t a fő vászonra
        ctx.drawImage(qrCanvas, 0, 0);

        // 2. ILLUSZTRÁLT SÉMA RÁHELYEZÉSE (PNG MASZK)
        try {
            // Először megpróbáljuk a gyökérben
            let schemePath = path.join(process.cwd(), 'public', 'schemes', `${styleId}.png`);
            
            // Ha ott nem létezik, megnézzük a backend mappán belül is
            if (!fs.existsSync(schemePath)) {
                schemePath = path.join(process.cwd(), 'backend', 'public', 'schemes', `${styleId}.png`);
            }

            const schemeImage = await loadImage(schemePath);
            
            // "Összesütés": rátesszük a skint a QR kódra
            ctx.drawImage(schemeImage, 0, 0, canvasSize, canvasSize);
        } catch (err) {
            console.warn(`⚠️ Séma nem található vagy hiba a betöltéskor: ${styleId}.png`);
        }

        // 3. VÍZJEL (Csak előnézethez)
        if (isPreview) {
            ctx.save();
            ctx.font = "bold 60px Arial";
            ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            ctx.fillText("MINTA / PREVIEW", canvasSize / 2, 80);
            ctx.fillText("MINTA / PREVIEW", canvasSize / 2, canvasSize - 80);
            ctx.restore();
        }

        // Visszaküldjük a nyomdakész vagy előnézeti PNG buffert
        return canvas.toBuffer('image/png');
    } catch (error) {
        console.error('🔥 PONTOS HIBAÜZENET A GENERÁLÁSNÁL:', error);
        throw error;
    }
};