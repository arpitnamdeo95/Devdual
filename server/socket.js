/**
 * socket.js — Real-time event handler for DevDuel
 *
 * Game flow:
 *   find-match → [queue] → match-found + question-options
 *   player-selected (×2 or timeout) → final-question
 *   code-update → opponent-code-update
 *   test-progress → opponent-progress
 *   submit-code → game-end
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
 *   spectators:     [socketId],
 *   selections:     { [playerId]: 'easy'|'medium'|'hard' },
 *   selectionTimer: TimeoutHandle | null,
 *   problem:        QuestionObject | null,
 * }
 */
const rooms = {};

// ── Helper — resolve selections and broadcast final question ─────────────────
function finalizeQuestion(roomId, io) {
  const room = rooms[roomId];
  if (!room) return;

  // Clear auto-timer if it's still running
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

  // Broadcast the final resolved question to everyone in the room
  io.to(roomId).emit('final-question', { difficulty, problem });

  console.log(`[Room ${roomId}] Final question: "${problem.title}" (${difficulty})`);
}

// ── Main setup ───────────────────────────────────────────────────────────────
module.exports = function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log(`[Connect] ${socket.id}`);

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
          spectators:     [],
          selections:     {},
          selectionTimer: null,
          problem:        null,
        };

        // Send match info WITHOUT a problem — question selection comes next
        io.to(p1.id).emit('match-found', { roomId, opponent: p2 });
        io.to(p2.id).emit('match-found', { roomId, opponent: p1 });

        // Immediately send the 3 question options to both players
        const options = getQuestionOptions();
        io.to(p1.id).emit('question-options', { roomId, options });
        io.to(p2.id).emit('question-options', { roomId, options });

        console.log(`[Match] ${p1.id} vs ${p2.id} → room ${roomId}`);

        // Auto-finalize after timeout (handles non-responsive players)
        rooms[roomId].selectionTimer = setTimeout(() => {
          const room = rooms[roomId];
          if (!room || room.problem) return; // already finalized

          console.log(`[Timeout] Room ${roomId} — auto-finalizing question`);

          // Auto-assign random difficulty to any player who hasn't chosen
          const difficulties = ['easy', 'medium', 'hard'];
          [p1, p2].forEach((p) => {
            if (!room.selections[p.id]) {
              room.selections[p.id] = difficulties[Math.floor(Math.random() * 3)];
              console.log(`[Timeout] Auto-selected "${room.selections[p.id]}" for ${p.id}`);
            }
          });

          finalizeQuestion(roomId, io);
        }, SELECTION_TIMEOUT_MS);
      }
    });

    // ── Player selects a difficulty ──────────────────────────────────────────
    socket.on('player-selected', ({ roomId, difficulty }) => {
      const room = rooms[roomId];
      if (!room || room.problem) return; // ignore if already finalized or room gone

      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) return;

      // Prevent re-selection
      if (room.selections[socket.id]) {
        console.log(`[Select] ${socket.id} tried to re-select — ignored`);
        return;
      }

      room.selections[socket.id] = difficulty;
      console.log(`[Select] ${socket.id} chose "${difficulty}" in room ${roomId}`);

      // Notify the OPPONENT that this player has selected (without revealing choice)
      socket.to(roomId).emit('opponent-selected', { playerId: socket.id });

      // If BOTH players have now selected → finalize immediately
      const [p1, p2] = room.players;
      if (room.selections[p1?.id] && room.selections[p2?.id]) {
        finalizeQuestion(roomId, io);
      }
    });

    // ── Join room (used by BattleArena on mount or spectators) ───────────────
    socket.on('join-room', ({ roomId, isSpectator }) => {
      socket.join(roomId);
      console.log(`[Join] ${socket.id} → room ${roomId} (spectator: ${isSpectator})`);

      const room = rooms[roomId];
      if (!room) return;

      if (isSpectator) room.spectators.push(socket.id);

      // Send current room state (problem may be null if still in selection phase)
      socket.emit('room-state', {
        players: room.players,
        problem: room.problem,
        code:    room.code,
      });
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

    // ── Solution submitted — declare a winner ────────────────────────────────
    socket.on('submit-code', ({ roomId, code }) => {
      const room = rooms[roomId];
      if (!room) return;

      // Record the winning code
      room.code[socket.id] = code;

      io.to(roomId).emit('game-end', {
        winnerId:    socket.id,
        winningCode: code,
      });

      console.log(`[Win] ${socket.id} won room ${roomId}`);
    });

    // ── Cleanup on disconnect ────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Disconnect] ${socket.id}`);

      // Remove from queue if still waiting
      const qIdx = queue.findIndex((u) => u.id === socket.id);
      if (qIdx !== -1) queue.splice(qIdx, 1);

      // Notify opponent in any active room
      for (const [roomId, room] of Object.entries(rooms)) {
        const wasPlayer = room.players.some((p) => p.id === socket.id);
        if (wasPlayer) {
          socket.to(roomId).emit('opponent-disconnected');

          // Clean up the auto-selection timer to avoid memory leaks
          if (room.selectionTimer) {
            clearTimeout(room.selectionTimer);
          }

          // Optionally delete the room — or keep it for spectators
          delete rooms[roomId];
          console.log(`[Room] ${roomId} closed due to disconnect`);
        }
      }
    });
  });
};
