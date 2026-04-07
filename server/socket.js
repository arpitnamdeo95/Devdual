/**
 * socket.js — Real-time event handler for DevDuel
 *
 * Game flow:
 *   find-match → [queue] → match-found + question-options
 *   player-selected (×2 or timeout) → final-question
 *   code-update → opponent-code-update
 *   test-progress → opponent-progress
 *   submit-code → game-end
 *
 * Spectator flow:
 *   get-live-rooms → live-rooms (list of active rooms)
 *   join-room (isSpectator:true) → room-state
 *   room-reaction → broadcast reaction float to room
 */

const {
  getQuestionOptions,
  getQuestionByDifficulty,
  resolveSelection,
  SELECTION_TIMEOUT_MS,
} = require('./questions');

// ── In-memory state ──────────────────────────────────────────────────────────
const queue = [];

/**
 * rooms[roomId] = {
 *   players:        [{ id, name, rating }],
 *   code:           { [playerId]: string },
 *   spectators:     Set<socketId>,
 *   selections:     { [playerId]: 'easy'|'medium'|'hard' },
 *   selectionTimer: TimeoutHandle | null,
 *   problem:        QuestionObject | null,
 *   startedAt:      number (timestamp),
 *   status:         'picking' | 'battle' | 'ended',
 * }
 */
const rooms = {};

// ── Helper — build the public live-rooms list ──────────────────────────────
function getLiveRoomsList() {
  return Object.entries(rooms)
    .filter(([, room]) => room.status !== 'ended')
    .map(([roomId, room]) => ({
      roomId,
      players: room.players.map(p => ({ name: p.name, rating: p.rating || 1500 })),
      spectatorCount: room.spectators.size,
      difficulty: room.problem?.difficulty || null,
      problemTitle: room.problem?.title || null,
      status: room.status,
      startedAt: room.startedAt,
      elapsedSec: Math.floor((Date.now() - room.startedAt) / 1000),
    }));
}

// ── Helper — broadcast updated live-rooms to everyone watching ───────────────
function broadcastLiveRooms(io) {
  io.emit('live-rooms', getLiveRoomsList());
}

// ── Helper — resolve selections and broadcast final question ─────────────────
function finalizeQuestion(roomId, io) {
  const room = rooms[roomId];
  if (!room) return;

  if (room.selectionTimer) {
    clearTimeout(room.selectionTimer);
    room.selectionTimer = null;
  }

  const [p1, p2]   = room.players;
  const p1Choice   = room.selections[p1?.id];
  const p2Choice   = room.selections[p2?.id];
  const difficulty = resolveSelection(p1Choice, p2Choice);
  const problem    = getQuestionByDifficulty(difficulty);

  room.problem = problem;
  room.status  = 'battle';

  io.to(roomId).emit('final-question', { difficulty, problem });
  broadcastLiveRooms(io);

  console.log(`[Room ${roomId}] Final question: "${problem.title}" (${difficulty})`);
}

// ── Main setup ───────────────────────────────────────────────────────────────
module.exports = function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log(`[Connect] ${socket.id}`);

    // ── Request current live rooms list ───────────────────────────────────────
    socket.on('get-live-rooms', () => {
      socket.emit('live-rooms', getLiveRoomsList());
    });

    // ── Matchmaking ──────────────────────────────────────────────────────────
    socket.on('find-match', (userData) => {
      console.log(`[Queue] ${socket.id} (${userData?.name}) joined queue`);
      queue.push({ id: socket.id, ...userData });

      if (queue.length >= 2) {
        const p1     = queue.shift();
        const p2     = queue.shift();
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        rooms[roomId] = {
          players:        [p1, p2],
          code:           {},
          spectators:     new Set(),
          selections:     {},
          selectionTimer: null,
          problem:        null,
          startedAt:      Date.now(),
          status:         'picking',
        };

        const socket1 = io.sockets.sockets.get(p1.id);
        const socket2 = io.sockets.sockets.get(p2.id);
        if (socket1) socket1.join(roomId);
        if (socket2) socket2.join(roomId);

        io.to(p1.id).emit('match-found', { roomId, opponent: p2 });
        io.to(p2.id).emit('match-found', { roomId, opponent: p1 });

        const options = getQuestionOptions();
        io.to(p1.id).emit('question-options', { roomId, options });
        io.to(p2.id).emit('question-options', { roomId, options });

        console.log(`[Match] ${p1.id} vs ${p2.id} → room ${roomId}`);

        // Broadcast new room to live lobby watchers
        broadcastLiveRooms(io);

        rooms[roomId].selectionTimer = setTimeout(() => {
          const room = rooms[roomId];
          if (!room || room.problem) return;

          console.log(`[Timeout] Room ${roomId} — auto-finalizing question`);
          const difficulties = ['easy', 'medium', 'hard'];
          [p1, p2].forEach((p) => {
            if (!room.selections[p.id]) {
              room.selections[p.id] = difficulties[Math.floor(Math.random() * 3)];
            }
          });

          finalizeQuestion(roomId, io);
        }, SELECTION_TIMEOUT_MS);
      }
    });

    // ── Cancel Matchmaking ───────────────────────────────────────────────────
    socket.on('cancel-match', () => {
      const qIdx = queue.findIndex((u) => u.id === socket.id);
      if (qIdx !== -1) queue.splice(qIdx, 1);
    });

    // ── Player selects a difficulty ──────────────────────────────────────────
    socket.on('player-selected', ({ roomId, difficulty }) => {
      const room = rooms[roomId];
      if (!room || room.problem) return;

      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) return;

      if (room.selections[socket.id]) return;

      room.selections[socket.id] = difficulty;
      socket.to(roomId).emit('opponent-selected', { playerId: socket.id });

      const [p1, p2] = room.players;
      if (room.selections[p1?.id] && room.selections[p2?.id]) {
        finalizeQuestion(roomId, io);
      }
    });

    // ── Join room (BattleArena players or spectators) ───────────────────────
    socket.on('join-room', ({ roomId, isSpectator }) => {
      socket.join(roomId);

      const room = rooms[roomId];
      if (!room) return;

      if (isSpectator) {
        room.spectators.add(socket.id);
        broadcastLiveRooms(io); // Update spectator count globally
      }

      socket.emit('room-state', {
        players: room.players,
        problem: room.problem,
        code:    room.code,
      });

      console.log(`[Join] ${socket.id} → room ${roomId} (spectator: ${isSpectator})`);
    });

    // ── Live code sync ───────────────────────────────────────────────────────
    socket.on('code-update', ({ roomId, code }) => {
      const room = rooms[roomId];
      if (!room) return;
      room.code[socket.id] = code;
      socket.to(roomId).emit('opponent-code-update', { id: socket.id, code });
    });

    // ── Test case progress broadcast ─────────────────────────────────────────
    socket.on('test-progress', ({ roomId, passedCount, totalCount }) => {
      if (!totalCount) return;
      const progress = (passedCount / totalCount) * 100;
      socket.to(roomId).emit('opponent-progress', { progress });
    });

    // ── Power up broadcast ───────────────────────────────────────────────────
    socket.on('use-powerup', ({ roomId, type }) => {
      const room = rooms[roomId];
      let userName = 'Opponent';
      if (room && room.players) {
        const player = room.players.find(p => p.id === socket.id);
        if (player && player.name) userName = player.name;
      }
      socket.to(roomId).emit('powerup-activated', { type, userId: socket.id, userName });
    });

    // ── Emoji reaction from spectators ───────────────────────────────────────
    socket.on('room-reaction', ({ roomId, emoji }) => {
      const validEmojis = ['🔥', '⚡', '🎯', '👏', '💀', '🚀', '😱', '🤯'];
      if (!validEmojis.includes(emoji)) return;
      // Broadcast reaction to everyone watching the room (players + spectators)
      io.to(roomId).emit('room-reaction', {
        emoji,
        id: `${socket.id}_${Date.now()}`,
      });
    });

    // ── Solution submitted — declare winner ──────────────────────────────────
    socket.on('submit-code', ({ roomId, code }) => {
      const room = rooms[roomId];
      if (!room) return;

      room.code[socket.id] = code;

      const [p1, p2] = room.players || [];
      const winner   = p1?.id === socket.id ? p1 : p2;
      const loser    = p1?.id === socket.id ? p2 : p1;
      const loserCode = loser?.id ? (room.code[loser.id] || '# No code submitted') : '';

      room.status = 'ended';

      io.to(roomId).emit('game-end', {
        winnerId:           socket.id,
        winnerName:         winner?.name,
        winnerIdentity:     winner?.identity,
        loserIdentity:      loser?.identity,
        winningCode:        code,
        loserCode,
        problemDescription: room.problem?.description || '',
      });

      // Remove from live rooms after short delay (give spectators time to see result)
      setTimeout(() => {
        delete rooms[roomId];
        broadcastLiveRooms(io);
      }, 15000);

      console.log(`[Win] ${socket.id} won room ${roomId}`);
    });

    // ── Cleanup on disconnect ────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Disconnect] ${socket.id}`);

      const qIdx = queue.findIndex((u) => u.id === socket.id);
      if (qIdx !== -1) queue.splice(qIdx, 1);

      for (const [roomId, room] of Object.entries(rooms)) {
        const wasPlayer = room.players.some((p) => p.id === socket.id);
        if (wasPlayer) {
          socket.to(roomId).emit('opponent-disconnected');
          if (room.selectionTimer) clearTimeout(room.selectionTimer);
          delete rooms[roomId];
          broadcastLiveRooms(io);
          console.log(`[Room] ${roomId} closed due to disconnect`);
        }

        // Remove from spectator set
        room.spectators.delete(socket.id);
      }
    });

    // ── Chat messaging ───────────────────────────────────────────────────────
    socket.on('chat-message', ({ roomId, message, user }) => {
      io.to(roomId).emit('chat-message', { user, message, time: 'now' });
    });
  });
};
