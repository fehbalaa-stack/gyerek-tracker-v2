// frontend/vite.config.js TARTALOM

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // EZ A SOR KRITIKUS!!!
    host: true, // Ezt állítsd be, hogy Vite a helyi IP-n is tudjon futni, ne csak a localhoston.
    port: 5173,
    // (A proxy beállítást csak hagyd, ha van)
    // proxy: { ... } 
  },
});