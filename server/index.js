require('dotenv').config();
const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const { Server } = require('socket.io');
const setupSockets = require('./socket');
const { exec }   = require('child_process');
const fs         = require('fs');
const path       = require('path');
const os         = require('os');
const { GoogleGenAI } = require('@google/genai');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/',       (_req, res) => res.json({ service: 'DevDuel Backend', status: 'running' }));

/* ─────────────────────────────────────────────────────────────────────────────
   runCode(code, lang)
   Writes `code` to a temp file, executes it, returns { stdout, stderr, exitCode }.
   Times out after 10 s to prevent infinite loops from hanging Render.
───────────────────────────────────────────────────────────────────────────── */
function runCode(code, lang) {
  return new Promise((resolve) => {
    const ext     = lang === 'javascript' ? 'js' : 'py';
    const tmpFile = path.join(os.tmpdir(), `dd_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`);
    const pyCmd   = process.platform === 'win32' ? 'python' : 'python3';
    const cmd     = lang === 'javascript' ? `node "${tmpFile}"` : `${pyCmd} "${tmpFile}"`;

    fs.writeFileSync(tmpFile, code, 'utf8');

    exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
      resolve({
        stdout:   stdout  || '',
        stderr:   stderr  || (err && !stderr ? err.message : ''),
        exitCode: err ? (err.code ?? 1) : 0,
      });
    });
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   buildCode(userCode, input, lang)
   Wraps the user's solution with a test-runner that calls solve() and prints.
───────────────────────────────────────────────────────────────────────────── */
function buildCode(userCode, input, lang) {
  if (lang === 'javascript') {
    return [
      userCode,
      '',
      'try {',
      `  const result = solve(${input});`,
      '  process.stdout.write(String(result) + "\\n");',
      '} catch (e) {',
      '  process.stderr.write("Error: " + e.message + "\\n");',
      '  process.exit(1);',
      '}',
    ].join('\n');
  }

  // Python (default)
  return [
    userCode,
    '',
    'try:',
    `    result = solve(${input})`,
    '    print(result)',
    'except Exception as e:',
    '    import sys',
    '    print("Error:", str(e), file=sys.stderr)',
    '    sys.exit(1)',
  ].join('\n');
}

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/execute
───────────────────────────────────────────────────────────────────────────── */
app.post('/api/execute', async (req, res) => {
  const { code, language = 'python', testCases } = req.body;

  if (!code || !testCases || !testCases.length) {
    return res.status(400).json({ success: false, message: 'Missing code or test cases.' });
  }

  try {
    const results  = [];
    let allPassed  = true;

    for (const tc of testCases) {
      const fullCode              = buildCode(code, tc.input, language);
      const { stdout, stderr, exitCode } = await runCode(fullCode, language);

      const output   = stdout.trim();
      const expected = String(tc.expectedOutput).trim();
      const passed   = output === expected && exitCode === 0;

      if (!passed) allPassed = false;

      results.push({
        passed,
        input:    tc.input,
        expected,
        actual:   output || (stderr ? `Error: ${stderr.split('\n')[0]}` : '(no output)'),
        stderr:   stderr ? stderr.trim() : '',
      });
    }

    return res.json({ success: allPassed, results });
  } catch (err) {
    console.error('[execute] error:', err?.message);
    return res.status(500).json({ error: 'Internal execution error: ' + err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/review  (Gemini Analysis)
───────────────────────────────────────────────────────────────────────────── */
app.post('/api/review', async (req, res) => {
  const { winnerCode, loserCode, problemDescription } = req.body;

  if (!winnerCode || !loserCode) {
    return res.status(400).json({ error: 'Missing winner or loser code' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
You are an expert programming judge. Analyze the winner's and loser's code for a coding challenge.
Problem Description:
${problemDescription || 'Not provided'}

Winner's Code:
${winnerCode}

Loser's Code:
${loserCode}

Evaluate both submissions. Return a JSON object strictly conforming to this structure. DO NOT include any markdown code blocks, backticks, or any text other than the JSON:
{
  "complexityComparison": "A 1-2 sentence comparison of time and space complexity.",
  "winnerAdvantage": "A 1-2 sentence explanation of what the winner did better.",
  "loserMistakes": "A 1-2 sentence explanation of the loser's mistakes or inefficiencies.",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "winnerScore": <number between 0 and 100>,
  "loserScore": <number between 0 and 100>,
  "optimizedRefactor": "A concise, optimized version of the loser's solution improving efficiency or readability.",
  "runtimeMs": "A realistic runtime in milliseconds (e.g., 24ms)",
  "memoryMb": "A realistic memory usage in MB (e.g., 14.2MB)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text; // Note: with @google/genai SDK, it's response.text not text()
    let data;
    try {
      data = JSON.parse(resultText);
    } catch (e) {
      if (resultText.includes('\`\`\`json')) {
        const match = resultText.match(/\`\`\`json([\s\S]*?)\`\`\`/);
        if (match) data = JSON.parse(match[1]);
      }
    }

    if (!data) throw new Error("Failed to parse JSON from AI response");

    res.json(data);
  } catch (err) {
    console.error('[review] Gemini error:', err?.message);
    res.json({
      complexityComparison: 'Optimization failed to analyze.',
      winnerAdvantage: 'Player completed the challenge successfully.',
      loserMistakes: 'Opponent was slower to solve.',
      suggestions: ['Keep practicing data structures', 'Review edge cases', 'Optimize logic'],
      winnerScore: 100,
      loserScore: 50
    });
  }
});

setupSockets(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));
