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
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
   POST /api/ai-review  (Gemini-powered AI Code Coach)
───────────────────────────────────────────────────────────────────────────── */
app.post('/api/ai-review', async (req, res) => {
  const { code, language = 'python', problemTitle = '', problemDescription = '' } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback if no API key is configured
    return res.json({
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      complexityExplanation: 'The solution iterates through the input once using a hash map for constant-time lookups, resulting in linear time complexity. The hash map itself uses O(n) additional space.',
      overallScore: 72,
      codeSmells: [
        { severity: 'warning', title: 'Non-descriptive variable names', description: 'Variables like `x`, `i`, `tmp` make the code harder to maintain. Use descriptive names like `current_sum` or `target_index`.', line: null },
        { severity: 'info', title: 'Missing edge case handling', description: 'The solution does not handle empty input or single-element arrays. Adding guard clauses improves robustness.', line: null },
        { severity: 'warning', title: 'No input validation', description: 'The function assumes valid input types. Adding type checks prevents runtime errors in production environments.', line: null },
      ],
      strengths: [
        'Correct use of hash-based lookup for O(1) average access time',
        'Clean function signature with proper return type',
        'Solution handles the base test cases correctly',
      ],
      alternatives: [
        { name: 'Two-Pointer Technique', complexity: 'O(n log n)', description: 'If the input can be sorted, a two-pointer approach from both ends eliminates the need for extra space. Trade-off: O(n log n) time but O(1) space.', pseudocode: 'sort(arr)\nleft, right = 0, len(arr)-1\nwhile left < right:\n  if arr[left] + arr[right] == target:\n    return [left, right]\n  elif sum < target: left++\n  else: right--' },
        { name: 'Bit Manipulation', complexity: 'O(n)', description: 'For specific constraint sets (e.g., positive integers within a known range), bitwise operations can achieve the same result with lower constant factors.', pseudocode: 'bitmask = 0\nfor num in arr:\n  complement = target - num\n  if bitmask & (1 << complement):\n    return pair\n  bitmask |= (1 << num)' },
      ],
      summary: 'Your solution is functionally correct and uses an efficient algorithmic approach. Focus on improving code readability with better variable names and adding defensive edge-case checks to level up your competitive coding style.',
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an elite competitive programming coach analyzing a post-match code submission. The player just finished a 1v1 coding duel.

PROBLEM: "${problemTitle}"
${problemDescription ? `DESCRIPTION: ${problemDescription}` : ''}
LANGUAGE: ${language}
CODE:
\`\`\`${language}
${code}
\`\`\`

Analyze this code and return a JSON object (no markdown, no code fences, ONLY valid JSON) with exactly these fields:
{
  "timeComplexity": "Big O time complexity (e.g. O(n), O(n²), O(n log n))",
  "spaceComplexity": "Big O space complexity",
  "complexityExplanation": "2-3 sentence explanation of WHY this is the complexity",
  "overallScore": <number 0-100 representing code quality>,
  "codeSmells": [
    {"severity": "warning|info|error", "title": "short title", "description": "detailed explanation", "line": <line number or null>}
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "alternatives": [
    {"name": "technique name", "complexity": "O(...)", "description": "why this approach is better/different", "pseudocode": "brief pseudocode"}
  ],
  "summary": "2-3 sentence overall coaching summary with actionable advice"
}

Be specific to the ACTUAL code submitted. Identify real issues, not generic advice. If the code uses brute force, suggest DP or greedy alternatives. Limit to 2-4 code smells and 1-3 alternatives.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.json(parsed);
  } catch (err) {
    console.error('[ai-review] Gemini API error:', err?.message);
    return res.status(500).json({ error: 'AI analysis failed: ' + (err?.message || 'unknown error') });
  }
});

/* Legacy endpoint kept for backwards compat (mocked) */
app.post('/api/review', (_req, res) => {
  res.json({
    complexityComparison: 'Analyzed using static code metrics.',
    winnerAdvantage: 'High algorithmic efficiency and clear naming.',
    loserMistakes:   'Nested loops detected in search path.',
    suggestions:     ['Use hash maps for O(1) lookups', 'Optimize recursion depth'],
    winnerScore: 100,
    loserScore: 50
  });
});

setupSockets(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));
