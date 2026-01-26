import { motion } from "framer-motion";

export function CleanBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020202]">
      {/* Mély háttérfények */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent 70%)]" />
      
      {/* Lassan úszó nagy panelek */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-emerald-500/5 border border-emerald-500/10 rounded-xl"
          style={{
            width: Math.random() * 200 + 100,
            height: Math.random() * 200 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* A Szkennelő vonal - V2: Finomabb, de gyorsabb */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent z-20"
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}