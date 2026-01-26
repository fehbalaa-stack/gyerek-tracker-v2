import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedQRBackground() {
  const gridSize = 20;
  const totalCells = gridSize * gridSize;

  const pastelGreens = [
    "#CFFF04", "#c8e6c9", "#b2dfb2", "#a5d6a7", "#00ff94", "#b9f6ca",
  ];

  const [cells, setCells] = useState(() =>
    Array.from({ length: totalCells }, (_, i) => ({
      id: i,
      active: Math.random() > 0.8, // Kevesebb aktív kocka a nyugodtabb képért
      color: pastelGreens[Math.floor(Math.random() * pastelGreens.length)],
    }))
  );

  useEffect(() => {
    // LASSÍTÁS 1: Az állapotváltás most 8 másodpercenként történik (nem vibrál)
    const interval = setInterval(() => {
      setCells((prevCells) =>
        prevCells.map((cell) => ({
          ...cell,
          active: Math.random() > 0.8,
          color: Math.random() > 0.9 
            ? pastelGreens[Math.floor(Math.random() * pastelGreens.length)] 
            : cell.color,
        }))
      );
    }, 8000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050505] z-0">
      
      {/* 1. RÉTEG: Lassú radiális fények */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 20%, rgba(0, 255, 148, 0.08) 0%, transparent 60%)",
            "radial-gradient(circle at 80% 80%, rgba(0, 255, 148, 0.08) 0%, transparent 60%)",
            "radial-gradient(circle at 20% 20%, rgba(0, 255, 148, 0.08) 0%, transparent 60%)",
          ],
        }}
        transition={{
          duration: 25, // Nagyon lassú háttér hömpölygés
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 2. RÉTEG: Digitális rács - Szemkímélő pulzálással */}
      <div
        className="absolute inset-0 grid gap-[2px] p-2 opacity-30" // Finomabb összhatás
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {cells.map((cell) => (
          <motion.div
            key={cell.id}
            className="rounded-[1px]"
            animate={{
              // LASSÍTÁS 2: Csökkentett fényerő (max 0.4 opacity)
              opacity: cell.active ? [0.05, 0.35, 0.05] : 0.03,
              scale: cell.active ? [0.98, 1.02, 0.98] : 1,
              backgroundColor: cell.color,
            }}
            transition={{
              // LASSÍTÁS 3: Egyéni sebesség korlát (10 és 20 mp közötti mozgás)
              duration: Math.random() * 10 + 10, 
              delay: Math.random() * 8, // Elcsúsztatott kezdés, hogy ne egyszerre mozogjanak
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 3. RÉTEG: Lassú szkennelő vonal */}
      <motion.div
        className="absolute left-0 right-0 h-[6px] bg-emerald-500/10 z-20"
        animate={{
          top: ["-5%", "105%"],
          opacity: [0, 2, 2, 0],
        }}
        transition={{
          duration: 4, // A szkenner is sokkal lassabb lett
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          boxShadow: "0 0 10px #10b98122",
        }}
      />

      {/* Üveg réteg - sötétebb és picit jobban elmosott */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px] z-10" />
    </div>
  );
}