require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const setupSockets = require('./socket');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/execute', async (req, res) => {
  const { code, language_id } = req.body;
  // This would talk to Judge0 API. Mock for now
  try {
    // For demo, immediately pass or fail based on code content containing "console.log"
    const passed = code.includes('console.log') || code.includes('return');
    res.json({ success: passed, message: passed ? "Test cases passed!" : "Test cases failed." });
  } catch (error) {
    res.status(500).json({ error: "Execution failed" });
  }
});

app.post('/api/review', async (req, res) => {
  const { playerCode, opponentCode } = req.body;
  // This would talk to OpenAI/Claude API. Mock for now
  try {
    res.json({
      winnerAdvantage: "Player wrote cleaner, more efficient code with O(n) time complexity.",
      loserMistakes: "Opponent used a nested loop resulting in O(n^2) time complexity.",
      suggestions: "Consider using a hash map to optimize lookups."
    });
  } catch (error) {
    res.status(500).json({ error: "Review failed" });
  }
});

setupSockets(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
