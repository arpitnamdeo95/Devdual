require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const setupSockets = require('./socket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/', (req, res) => res.json({ service: 'DevDuel Backend', status: 'running' }));

// ── Code execution via child_process (runs directly on server, no external API) ─
const { exec } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

/**
 * Writes code to a temp file, executes it, returns { stdout, stderr, exitCode }.
 * Kills the process after 10 seconds to prevent infinite loops hanging Render.
 */
function runCode(code, lang) {
  return new Promise((resolve) => {
    const ext     = lang === 'javascript' ? 'js' : 'py';
    const tmpFile = path.join(os.tmpdir(), `dd_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`);
    // python3 on Render (Linux), python on Windows
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const cmd       = lang === 'javascript' ? `node "${tmpFile}"` : `${pythonCmd} "${tmpFile}"`;

    fs.writeFileSync(tmpFile, code, 'utf8');

    exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
      resolve({
        stdout:   stdout || '',
        stderr:   stderr || (err && !stderr ? err.message : ''),
        exitCode: err ? (err.code ?? 1) : 0,
      });
    });
  });
}

// Routes
app.post('/api/execute', async (req, res) => {
  const { code, language = 'python', testCases } = req.body;

  if (!code || !testCases || !testCases.length) {
    return res.status(400).json({ success: false, message: 'Missing code or test cases.' });
  }

  try {
    const results = [];
    let allPassed = true;

    for (const testCase of testCases) {
      let fullCode = '';

      if (language === 'javascript') {
        fullCode = `${code}\ntry {\n  const result = solve(${testCase.input});\n  process.stdout.write(String(result) + "\\n");\n} catch(e) {\n  process.stderr.write("Error: " + e.message + "\\n");\n  process.exit(1);\n}\n`;
      } else {
        // Python (default)
        fullCode = `${code}\ntry:\n    result = solve(${testCase.input})\n    print(result)\nexcept Exception as e:\n    import sys\n    print("Error:", str(e), file=sys.stderr)\n    sys.exit(1)\n`;
      }

      const { stdout, stderr, exitCode } = await runCode(fullCode, language);
      const output   = stdout.trim();
      const expected = String(testCase.expectedOutput).trim();
      const passed   = output === expected && exitCode === 0;

      if (!passed) allPassed = false;

      results.push({
        passed,
        input:    testCase.input,
        expected,
        actual:   output || (stderr ? `Error: ${stderr.split('\n')[0]}` : '(no output)'),
        stderr:   stderr ? stderr.trim() : '',
      });
    }

    res.json({ success: allPassed, results });
  } catch (error) {
    console.error('Execution failed:', error?.message);
    res.status(500).json({ error: 'Internal execution error: ' + error.message });
  }
});

app.post('/api/review', async (req, res) => {
  try {
    res.json({
      winnerAdvantage: 'Player wrote cleaner, more efficient code with O(n) time complexity.',
      loserMistakes:   'Opponent used a nested loop resulting in O(n^2) time complexity.',
      suggestions:     'Consider using a hash map to optimize lookups.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Review failed' });
  }
});

setupSockets(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
