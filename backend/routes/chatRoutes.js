// backend/routes/chatRoutes.js
import express from 'express';
import { sendMessage, getMessages } from '../controllers/chatController.js';

const router = express.Router();

// Üzenet küldése
// URL: https://oovoo-beta1.onrender.com/api/chat/send
router.post('/send', sendMessage);

// Üzenetek lekérése trackerId alapján
// URL: https://oovoo-beta1.onrender.com/api/chat/:trackerId
router.get('/:trackerId', getMessages);

export default router;