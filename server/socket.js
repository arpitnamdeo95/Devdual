// Simple in-memory Redis backup for matchmaking & state
const queue = [];
const rooms = {};

module.exports = function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Matching
    socket.on('find-match', (userData) => {
      console.log('User searching for match:', socket.id, userData);
      queue.push({ id: socket.id, ...userData });
      
      if (queue.length >= 2) {
        const p1 = queue.shift();
        const p2 = queue.shift();
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
        
        rooms[roomId] = { players: [p1, p2], code: {}, spectators: [] };
        
        // Notify players
        io.to(p1.id).emit('match-found', { roomId, opponent: p2 });
        io.to(p2.id).emit('match-found', { roomId, opponent: p1 });
      }
    });

    socket.on('join-room', ({ roomId, isSpectator }) => {
      socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);
      
      if (rooms[roomId]) {
        if (isSpectator) rooms[roomId].spectators.push(socket.id);
        // Send initial state
        socket.emit('room-state', rooms[roomId]);
      }
    });

    socket.on('code-update', ({ roomId, code }) => {
      if (rooms[roomId]) {
        rooms[roomId].code[socket.id] = code;
        socket.to(roomId).emit('opponent-code-update', { id: socket.id, code });
      }
    });

    socket.on('submit-code', ({ roomId, code }) => {
      // Announce game end
      io.to(roomId).emit('game-end', { winnerId: socket.id, winningCode: code });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Remove from queue if present
      const index = queue.findIndex(u => u.id === socket.id);
      if (index !== -1) queue.splice(index, 1);
    });
  });
};
