require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const setupSockets = require('./socket');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  /\.vercel\.app$/,
  /\.netlify\.app$/,
  /\.ngrok-free\.app$/,
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Health check — used by Render to confirm server is alive
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/', (req, res) => res.json({ service: 'DevDuel Backend', status: 'running' }));


// Routes
app.post('/api/execute', async (req, res) => {
  const { code, language = 'python', testCases } = req.body;
  
  if (!code || !testCases || !testCases.length) {
    return res.status(400).json({ success: false, message: "Missing code or test cases." });
  }

  try {
    const results = [];
    let allPassed = true;

    for (const testCase of testCases) {
      const payloadCode = `
${code}

try:
    result = solve(${testCase.input})
    print(result)
except Exception as e:
    print("Error:", str(e))
`;

      const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
          language: 'python',
          version: '3.10.0',
          files: [{ content: payloadCode }]
      });

      const runData = response.data.run;
      const output = (runData.stdout || '').trim();
      const expected = testCase.expectedOutput.trim();
      // Code 0 indicates successful execution without syntax/runtime crashing before output
      const passed = output === expected && runData.code === 0;

      if (!passed) allPassed = false;

      results.push({
          passed,
          input: testCase.input,
          expected,
          actual: output,
          stderr: runData.stderr,
      });
    }

    res.json({ success: allPassed, results });
  } catch (error) {
    console.error("Execution failed:", error?.message);
    res.status(500).json({ error: "Execution failed via Piston API" });
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
