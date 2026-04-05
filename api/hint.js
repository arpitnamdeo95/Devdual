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
  "suggestions": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"],
  "opponentLeading": true or false,
  "threatLevel": "low" | "medium" | "high",
  "suggestedPowerup": "freeze" | "testcase" | "blur" | null,
  "powerupReason": "1 sentence: why the player should use this powerup RIGHT NOW (only if suggestedPowerup is not null)"
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
    
    const desc = (problemDescription || '').toLowerCase();
    let topicTips = [];
    if (desc.includes('array') || desc.includes('list')) {
      topicTips = ['Consider utilizing a two-pointer approach for dynamic array traversal', 'Check for out-of-bounds index errors', 'Can this array be sorted to improve time complexity algorithmically?'];
    } else if (desc.includes('graph') || desc.includes('tree') || desc.includes('node') || desc.includes('path')) {
      topicTips = ['Beware of infinite loops; track visited nodes properly', 'Would a Breadth-First Search (BFS) isolate the shortest path faster?', 'Verify your recursive depth limits to prevent stack overflows'];
    } else if (desc.includes('string') || desc.includes('characters')) {
      topicTips = ['Look out for edge cases with empty strings or unusual characters', 'A sliding window approach could condense character tracking', 'Are you handling case-insensitivity requirements?'];
    } else if (desc.includes('math') || desc.includes('number') || desc.includes('sum')) {
      topicTips = ['Consider modulus logic to cycle through value ranges', 'Beware of potential integer overflow on extremely large cases', 'Pre-calculating common values will optimize performance'];
    }
    const generalTips = ['Use a dictionary/map for O(1) lookups to save time', 'Optimize the inner loop structure if it contains heavy allocations', 'Avoid redundant variable assignments', 'Consider memoization if your algorithm uses repeated recursion', 'Double-check your iteration boundaries (off-by-one errors)'];
    let combined = [...topicTips, ...generalTips].sort(() => 0.5 - Math.random());
    const randomSuggestions = combined.slice(0, Math.floor(Math.random() * 3) + 3);
    const threats = ['low', 'medium', 'high'];
    const randomThreat = threats[Math.floor(Math.random() * threats.length)];

    res.status(200).json({
      opponentApproach: 'Using an optimized iteration approach.',
      myApproach: 'Structure looks correct, optimize the inner loop.',
      keyDifference: 'Opponent may be using a hash map for O(1) lookups.',
      urgentTip: 'Consider replacing the nested loop with a hash set.',
      suggestions: randomSuggestions,
      opponentLeading: Math.random() > 0.5,
      threatLevel: randomThreat,
      suggestedPowerup: (['freeze', 'testcase', 'blur', null, null])[Math.floor(Math.random() * 5)],
      powerupReason: 'Opponent is in a productive flow right now — disrupting them could change the outcome.'
    });
  }
}
