import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Telepítsd: npm install qrcode.react

export const QRCodeDisplay = ({ value, styleId }) => {
    // Stílus konfigurációk
    const styles = {
        1: { fgColor: "#000000", bgColor: "#FFFFFF", level: "L" }, // Alap F/F
        2: { fgColor: "#a855f7", bgColor: "#FFFFFF", level: "M" }, // Színes (lila)
        3: { fgColor: "#000000", bgColor: "#f3f4f6", level: "H", image: "/logo_mono.png" }, // Art Mono
        4: { fgColor: "#a855f7", bgColor: "#121212", level: "H", image: "/logo.png" }  // Art Premium
    };

    const config = styles[styleId] || styles[1];

    return (
        <div className={`p-4 rounded-3xl bg-white flex items-center justify-center shadow-2xl ${styleId === 4 ? 'ring-4 ring-primary animate-pulse' : ''}`}>
            <QRCodeSVG 
                value={value} 
                size={200}
                fgColor={config.fgColor}
                bgColor={config.bgColor}
                level={config.level}
                includeMargin={true}
                imageSettings={config.image ? {
                    src: config.image,
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                } : null}
            />
        </div>
    );
};