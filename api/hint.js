import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { myCode, opponentCode, problemDescription } = req.body;

  if (!opponentCode || !myCode) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are a real-time competitive coding coach watching a 1v1 coding battle.

Problem: ${problemDescription || 'A DSA problem'}

YOUR PLAYER'S current code:
\`\`\`
${myCode}
\`\`\`

OPPONENT'S current code (streaming live):
\`\`\`
${opponentCode}
\`\`\`

Analyze both and respond ONLY with valid JSON (no markdown, no extra text) in this exact structure:
{
  "opponentApproach": "1 sentence describing what algorithm/approach the opponent is using",
  "myApproach": "1 sentence describing what the player's approach is",
  "keyDifference": "1 sentence: the most critical difference between the two approaches",
  "urgentTip": "1 sentence: the single most important thing the player should change RIGHT NOW to improve their solution",
  "suggestions": ["tip 1", "tip 2", "tip 3"],
  "opponentLeading": true or false,
  "threatLevel": "low" | "medium" | "high"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let text = response.text || '{}';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(text);
    res.status(200).json(data);

  } catch (err) {
    console.error('[hint-api] error:', err?.message);
    res.status(200).json({
      opponentApproach: 'Using an optimized iteration approach.',
      myApproach: 'Structure looks correct, optimize the inner loop.',
      keyDifference: 'Opponent may be using a hash map for O(1) lookups.',
      urgentTip: 'Consider replacing the nested loop with a hash set.',
      suggestions: [
        'Use a dictionary/map for O(1) lookups',
        'Check for edge cases: empty input, single element',
        'Avoid redundant variable assignments'
      ],
      opponentLeading: true,
      threatLevel: 'medium'
    });
  }
}
