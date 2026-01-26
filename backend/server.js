import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import trackerRoutes from './routes/trackerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js'; 
import publicRoutes from './routes/publicRoutes.js'; 
import chatRoutes from './routes/chatRoutes.js'; 
import contactRoutes from './routes/contactRoutes.js';
import logRoutes from './routes/logRoutes.js'; 

import { generateStyledQR } from './services/qrGenerator.js'; 
import { authMiddleware, adminMiddleware } from './middleware/auth.js'; 
import { handleStripeWebhook } from './controllers/orderController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// --- SOCKET.IO BEÁLLÍTÁS ---
const io = new Server(server, {
  cors: { 
    origin: ["https://oovoo-beta1.onrender.com", "http://localhost:5173"], 
    methods: ['GET', 'POST'],
    credentials: true 
  }
});

app.use(cors({
  origin: ["https://oovoo-beta1.onrender.com", "http://localhost:5173"],
  credentials: true
}));

// Req.io átadása a route-oknak
app.use((req, res, next) => {
  req.io = io;
  next();
});

connectDB();

// STRIPE WEBHOOK (express.json előtt)
app.post(
  '/api/orders/webhook', 
  express.raw({ type: 'application/json' }), 
  handleStripeWebhook
);

app.use(express.json());

// STATIKUS FÁJLOK
app.use('/schemes', express.static(path.join(__dirname, 'public/schemes')));
app.use('/qrcodes', express.static(path.join(__dirname, 'public/qrcodes')));

// ADMIN GENERÁTOR - 🔥 JAVÍTVA: Átírva beta1-re
app.get('/api/admin/generate-clean/:uniqueCode', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { uniqueCode } = req.params;
    const { styleId } = req.query;
    // Itt is a béta címet kell használni a generáláshoz
    const scanUrl = `https://oovoo-beta1.onrender.com/scan/${uniqueCode}`;
    const buffer = await generateStyledQR(scanUrl, styleId, false);
    res.setHeader('Content-Disposition', `attachment; filename=PROD_${uniqueCode}.png`);
    res.type('image/png').send(buffer);
  } catch (error) {
    console.error("Generálási hiba:", error);
    res.status(500).send('Hiba a generáláskor');
  }
});

// SÉMÁK LISTÁZÁSA
app.get('/api/schemes', (req, res) => {
  const schemesDir = path.join(__dirname, 'public/schemes');
  if (!fs.existsSync(schemesDir)) {
    fs.mkdirSync(schemesDir, { recursive: true });
    return res.json([]);
  }
  const files = fs.readdirSync(schemesDir);
  const schemes = files
    .filter(file => file.endsWith('.png'))
    .map(file => {
      const parts = file.replace('.png', '').split('_');
      let category = 'animals';
      let displayName = parts[0];
      if (parts.length > 1) {
        category = parts[0];
        displayName = parts[1];
      }
      return {
        id: file.replace('.png', ''),
        category: category,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        img: `/schemes/${file}`
      };
    });
  res.json(schemes);
});

// --- API ÚTVONALAK ---
app.use('/api/auth', authRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/orders', orderRoutes); 
app.use('/api/public', publicRoutes); 
app.use('/api/chat', chatRoutes); 
app.use('/api/contact', contactRoutes); 
app.use('/api/logs', logRoutes); 

// --- JAVÍTOTT, TISZTA SOCKET ESEMÉNYEK ---
io.on('connection', (socket) => {
  console.log('📡 Socket connected:', socket.id);

  socket.on('join_chat', (trackerId) => {
    if (!trackerId) return;
    const room = trackerId.toString();
    socket.join(room);
    console.log(`🏠 User ${socket.id} belépett a ${room} szobába`);
  });

  socket.on('send_message', (data) => {
    if (data.trackerId) {
      const room = data.trackerId.toString();
      io.to(room).emit('receive_message', data);
      console.log(`✉️ Üzenet továbbítva a ${room} szobába`);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend fut: http://localhost:${PORT}`);
  console.log(`💬 Chat rendszer aktív.`);
});