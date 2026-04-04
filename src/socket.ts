import { io } from 'socket.io-client';

// In development → connects to local server
// In production → connects to deployed Render backend
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : 'https://devduel-backend.onrender.com');

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'], // WebSocket first, fallback to polling
});

// Debug helper — visible in browser DevTools console
socket.on('connect', () => {
  console.log(`[DevDuel] ✅ Socket connected → ${SOCKET_URL} (id: ${socket.id})`);
});
socket.on('connect_error', (err) => {
  console.error(`[DevDuel] ❌ Socket error → ${err.message}`);
});
socket.on('disconnect', (reason) => {
  console.warn(`[DevDuel] ⚠️ Socket disconnected → ${reason}`);
});
