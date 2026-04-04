import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : 'https://devduel-backend-m4b9.onrender.com');

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: false,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log(`[DevDuel] ✅ Connected to ${SOCKET_URL} (id: ${socket.id})`);
});
socket.on('connect_error', (err) => {
  console.error(`[DevDuel] ❌ Socket error → ${err.message}`);
});
socket.on('disconnect', (reason) => {
  console.warn(`[DevDuel] ⚠️ Disconnected → ${reason}`);
});
