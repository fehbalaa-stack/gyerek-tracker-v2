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

// --- KONFIGURÁCIÓ ---
// Hozzáadtuk a metódusokat és a pontosabb origókat a 200 OK/Catch hiba elkerülésére
const allowedOrigins = [
  "https://oovoo-backend.onrender.com", 
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Engedélyezzük, ha az origin benne van a listában, vagy ha nincs origin (pl. mobil/azonos szerver kérés)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS hiba: Az origo nem engedélyezett.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// --- SOCKET.IO BEÁLLÍTÁS ---
const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));

// Req.io átadása a route-oknak
app.use((req, res, next) => {
  req.io = io;
  next();
});

connectDB();

// STRIPE WEBHOOK (express.json előtt kötelező)
app.post(
  '/api/orders/webhook', 
  express.raw({ type: 'application/json' }), 
  handleStripeWebhook
);

app.use(express.json());

// STATIKUS FÁJLOK (Sémák, QR kódok)
app.use('/schemes', express.static(path.join(__dirname, 'public/schemes')));
app.use('/qrcodes', express.static(path.join(__dirname, 'public/qrcodes')));

// --- ADMIN & API FUNKCIÓK ---

app.get('/api/admin/generate-clean/:uniqueCode', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { uniqueCode } = req.params;
    const { styleId } = req.query;
    const scanUrl = `https://oovoo-backend.onrender.com/scan/${uniqueCode}`;
    const buffer = await generateStyledQR(scanUrl, styleId, false);
    res.setHeader('Content-Disposition', `attachment; filename=PROD_${uniqueCode}.png`);
    res.type('image/png').send(buffer);
  } catch (error) {
    console.error("Generálási hiba:", error);
    res.status(500).send('Hiba a generáláskor');
  }
});

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

// --- FRONTEND KISZOLGÁLÁSA (PRODUCTION) ---
if (process.env.NODE_ENV === 'production') {
  // Javított path: Renderen a gyökérből indulva keressük a dist-et
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  
  console.log("📂 Frontend path ellenőrzése:", frontendPath);

  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    // Ha API hívás tévedt ide, ne küldjük vissza az index.html-t (ez okozza a catch hibát!)
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ message: "API endpoint not found" });
    }
    
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(500).send("Hiba: index.html nem található!");
    }
  });
}

// --- SOCKET ESEMÉNYEK ---
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

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend fut a ${PORT}-es porton`);
});