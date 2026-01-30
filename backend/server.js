import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer'; // 🔥 Új import a fájlfeltöltéshez

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

// --- MULTER KONFIGURÁCIÓ SKINEKHEZ ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'public/schemes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // A fájlnév a küldött ID lesz (pl. animals_dogv2.png)
    const skinId = req.body.id || 'temp_' + Date.now();
    cb(null, `${skinId}.png`);
  }
});
const upload = multer({ storage });

// --- KONFIGURÁCIÓ ---
const allowedOrigins = [
  "https://oovoo-backend.onrender.com", 
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
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

const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));

app.use((req, res, next) => {
  req.io = io;
  next();
});

connectDB();

app.post(
  '/api/orders/webhook', 
  express.raw({ type: 'application/json' }), 
  handleStripeWebhook
);

app.use(express.json());

app.use('/schemes', express.static(path.join(__dirname, 'public/schemes')));
app.use('/qrcodes', express.static(path.join(__dirname, 'public/qrcodes')));

// --- ADMIN & API FUNKCIÓK ---

// 🔥 ÚJ: SKIN FELTÖLTÉSE ADMINOKNAK
app.post('/api/schemes/add', authMiddleware, adminMiddleware, upload.single('image'), (req, res) => {
  try {
    // A multer már elmentette a fájlt a public/schemes mappába az ID alapján.
    res.json({ success: true, message: 'Skin sikeresen feltöltve és publikálva!' });
  } catch (error) {
    console.error("Skin feltöltési hiba:", error);
    res.status(500).json({ success: false, message: 'Hiba a fájl mentésekor.' });
  }
});

// 🔥 ÚJ: SKIN TÖRLÉSE ADMINOKNAK
app.delete('/api/schemes/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const skinId = req.params.id;
    const filePath = path.join(__dirname, 'public/schemes', `${skinId}.png`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Skin fájl sikeresen törölve!' });
    } else {
      res.status(404).json({ success: false, message: 'A fájl nem található a szerveren.' });
    }
  } catch (error) {
    console.error("Törlési hiba:", error);
    res.status(500).json({ success: false, message: 'Szerver hiba a törlés során.' });
  }
});

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

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
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

io.on('connection', (socket) => {
  console.log('📡 Socket connected:', socket.id);
  socket.on('join_chat', (trackerId) => {
    if (!trackerId) return;
    const room = trackerId.toString();
    socket.join(room);
  });
  socket.on('send_message', (data) => {
    if (data.trackerId) {
      const room = data.trackerId.toString();
      io.to(room).emit('receive_message', data);
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