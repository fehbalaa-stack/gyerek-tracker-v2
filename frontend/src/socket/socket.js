import { io } from 'socket.io-client';

// Vite env (később prodhoz is jó)
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'https://oovoo-beta1.onrender.com';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true
});

export default socket;
