const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
    cors: { origin: "*" } 
});

app.use(express.json());
app.use(cors());

// --- MONGODB CSATLAKOZÁS ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:W7kAK4tkCoLIlrUu@cluster0.xvrv42j.mongodb.net/trackr";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB: Kapcsolat stabil!'))
    .catch(err => console.error('❌ MongoDB hiba:', err));

// --- MODELLEK ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'parent' },
    isPremium: { type: Boolean, default: false },
    group: { type: String, default: "" }
});
const User = mongoose.model('User', userSchema);

const trackerSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    type: String,
    status: { type: String, default: 'active' }
});
const Tracker = mongoose.model('Tracker', trackerSchema);

const messageSchema = new mongoose.Schema({
    sender: String,
    senderName: String,
    senderPhone: String,
    receiver: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

const logSchema = new mongoose.Schema({
    time: { type: String, default: () => new Date().toLocaleString('hu-HU') },
    subject: String,
    action: String
});
const Log = mongoose.model('Log', logSchema);

const createLog = async (subject, action) => {
    try {
        await new Log({ subject, action }).save();
    } catch (e) {
        console.error("Logolási hiba:", e);
    }
};

// --- API ÚTVONALAK ---

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phoneNumber, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, phoneNumber, password: hashedPassword });
        await newUser.save();
        await createLog(email, "Sikeres regisztráció.");
        res.status(201).json({ message: "Sikeres regisztráció!" });
    } catch (err) { res.status(500).json({ error: "Szerver hiba." }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Hibás adatok!" });
        }
        await createLog(email, "Bejelentkezett.");
        res.json(user);
    } catch (err) { res.status(500).json({ error: "Hiba." }); }
});

app.get('/api/logs', async (req, res) => {
    const logs = await Log.find().sort({ _id: -1 }).limit(50);
    res.json(logs);
});

app.get('/api/users', async (req, res) => {
    const users = await User.find({}, '-password');
    res.json(users);
});

app.post('/api/trackers', async (req, res) => {
    try {
        const nt = new Tracker(req.body);
        await nt.save();
        const user = await User.findById(req.body.owner);
        await createLog(user?.email || "Rendszer", `Új vásárlás: ${req.body.name}`);
        res.json(nt);
    } catch (err) { res.status(500).json(err); }
});

app.get('/api/trackers/:userId', async (req, res) => {
    const trackers = await Tracker.find({ owner: req.params.userId });
    res.json(trackers);
});

// ✅ NÉV MÓDOSÍTÁSA (PUT)
app.put('/api/trackers/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const updatedTracker = await Tracker.findByIdAndUpdate(
            req.params.id, 
            { name: name }, 
            { new: true }
        ).populate('owner', 'email');
        
        if (updatedTracker) {
            await createLog(updatedTracker.owner?.email || "Rendszer", `Eszköz átnevezése: ${name}`);
        }
        
        res.json(updatedTracker);
    } catch (err) { 
        res.status(500).json({ error: "Hiba a név frissítésekor." }); 
    }
});

// ✅ ESZKÖZ TÖRLÉSE (DELETE) - ÚJ FUNKCIÓ
app.delete('/api/trackers/:id', async (req, res) => {
    try {
        const tracker = await Tracker.findById(req.params.id).populate('owner', 'email');
        if (!tracker) return res.status(404).json({ error: "Eszköz nem található." });

        await createLog(tracker.owner?.email || "Rendszer", `Eszköz törölve: ${tracker.name}`);
        await Tracker.findByIdAndDelete(req.params.id);
        
        res.json({ message: "Sikeres törlés!" });
    } catch (err) {
        res.status(500).json({ error: "Hiba a törlés során." });
    }
});

// ✅ ÜZENETEK LEKÉRÉSE
app.get('/api/messages/:userId', async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ receiver: req.params.userId }, { sender: req.params.userId }]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) { res.status(500).json(err); }
});

// 🖨️ ADMIN QR GENERÁLÁS
app.get('/api/trackers/:id/qrcode/:adminId', async (req, res) => {
    try {
        const requester = await User.findById(req.params.adminId);
        if (!requester || requester.role !== 'admin') {
            return res.status(403).json({ error: "Hozzáférés megtagadva!" });
        }

        const tracker = await Tracker.findById(req.params.id);
        if (!tracker) return res.status(404).send("Nincs ilyen eszköz.");

        const url = `http://localhost:5173/find/${tracker._id}`;
        const qrImage = await QRCode.toDataURL(url);
        
        res.json({ qrCode: qrImage });
    } catch (err) { res.status(500).json({ error: "QR generálási hiba" }); }
});

// PUBLIKUS: Eszköz adatok lekérése a megtaláló számára
app.get('/api/find/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Hibás kód formátum." });
        }

        const tracker = await Tracker.findById(req.params.id).populate('owner', 'name phoneNumber');
        if (!tracker) return res.status(404).json({ error: "Ismeretlen kód." });
        
        res.json({
            name: tracker.name,
            type: tracker.type,
            ownerName: tracker.owner?.name || "Ismeretlen gazda",
            ownerPhone: tracker.owner?.phoneNumber || "Nincs megadva",
            ownerId: tracker.owner?._id
        });
    } catch (err) { res.status(500).json(err); }
});

// --- SOCKET.IO CHAT ---
io.on('connection', (socket) => {
    socket.on('join_room', (userId) => socket.join(userId));
    socket.on('send_message', async (data) => {
        try {
            const newMessage = new Message(data);
            await newMessage.save();
            io.to(data.receiver).emit('receive_message', newMessage);
            io.to(data.sender).emit('receive_message', newMessage);
        } catch (e) { console.error("Chat hiba:", e); }
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Szent Grál Szerver fut a ${PORT}-on`));