/**
 * questions.js — Structured DSA question bank
 * Each question is keyed by difficulty for direct lookup.
 * Extend this file to add more questions per difficulty tier.
 */

// ── Config ──────────────────────────────────────────────────────────────────
// Strategy for resolving conflicting player selections.
// Options: 'higher' | 'lower' | 'random'
const SELECTION_STRATEGY = 'higher';

// How long (ms) players have to pick before auto-selection kicks in.
const SELECTION_TIMEOUT_MS = 15000;

// ── Question Bank ────────────────────────────────────────────────────────────
const QUESTIONS = {
  easy: {
    id: 'find-maximum',
    title: 'Find Maximum Element',
    difficulty: 'easy',
    points: 2,
    tags: ['arrays', 'linear-scan'],
    description:
      'Given an array of integers, return the largest element in the array.',
    constraints: [
      '1 ≤ nums.length ≤ 10^5',
      '-10^9 ≤ nums[i] ≤ 10^9',
    ],
    inputFormat:  'A single list of integers: nums',
    outputFormat: 'A single integer — the maximum value',
    examples: [
      { input: '[3, 1, 4, 1, 5, 9, 2, 6]', output: '9' },
      { input: '[-5, -1, -3]',              output: '-1' },
    ],
    // Hidden test cases used by Piston executor.
    // input must be a valid Python literal passed to solve().
    testCases: [
      { input: '[3, 1, 4, 1, 5, 9, 2, 6]', expectedOutput: '9' },
      { input: '[-5, -1, -3]',              expectedOutput: '-1' },
      { input: '[42]',                       expectedOutput: '42' },
      { input: '[0, 0, 0]',                 expectedOutput: '0' },
      { input: '[100, 200, 150, 300, 50]',  expectedOutput: '300' },
    ],
    starterCode:
`def solve(nums):
    # Return the maximum element in nums
    pass
`,
  },

  medium: {
    id: 'first-non-repeating',
    title: 'First Non-Repeating Character',
    difficulty: 'medium',
    points: 3,
    tags: ['strings', 'hashing', 'frequency-count'],
    description:
      'Given a string s, return the first character that does not repeat anywhere in the string. ' +
      'If every character repeats, return an empty string "".',
    constraints: [
      '1 ≤ s.length ≤ 10^5',
      's consists of lowercase English letters only',
    ],
    inputFormat:  'A single string s (passed with quotes)',
    outputFormat: 'A single character, or empty string ""',
    examples: [
      { input: '"leetcode"', output: 'l' },
      { input: '"aabb"',     output: '' },
      { input: '"stress"',   output: 't' },
    ],
    testCases: [
      { input: '"leetcode"',     expectedOutput: 'l' },
      { input: '"aabb"',         expectedOutput: '' },
      { input: '"stress"',       expectedOutput: 't' },
      { input: '"z"',            expectedOutput: 'z' },
      { input: '"aabbccddeef"',  expectedOutput: 'f' },
    ],
    starterCode:
`def solve(s):
    # Return the first non-repeating character, or "" if none
    pass
`,
  },

  hard: {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'hard',
    points: 5,
    tags: ['strings', 'sliding-window', 'hashmap'],
    description:
      'Given a string s, find the length of the longest substring that contains no repeating characters.',
    constraints: [
      '0 ≤ s.length ≤ 5 × 10^4',
      's consists of printable ASCII characters',
    ],
    inputFormat:  'A single string s',
    outputFormat: 'An integer — the length of the longest valid substring',
    examples: [
      { input: '"abcabcbb"', output: '3' },
      { input: '"bbbbb"',    output: '1' },
      { input: '"pwwkew"',   output: '3' },
    ],
    testCases: [
      { input: '"abcabcbb"',   expectedOutput: '3' },
      { input: '"bbbbb"',      expectedOutput: '1' },
      { input: '"pwwkew"',     expectedOutput: '3' },
      { input: '""',           expectedOutput: '0' },
      { input: '"abcdefgh"',   expectedOutput: '8' },
      { input: '"dvdf"',       expectedOutput: '3' },
    ],
    starterCode:
`def solve(s):
    # Return length of longest substring without repeating chars
    pass
`,
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the 3 question summaries (no test cases) to show in the UI picker. */
function getQuestionOptions() {
  return ['easy', 'medium', 'hard'].map((diff) => {
    const { id, title, difficulty, points, tags, description, examples } = QUESTIONS[diff];
    return { id, title, difficulty, points, tags, description, examples };
  });
}

/** Returns the full question object for a given difficulty. */
function getQuestionByDifficulty(difficulty) {
  return QUESTIONS[difficulty] || QUESTIONS.medium;
}

/**
 * Resolves two player difficulty choices into a single difficulty string.
 * Strategy is controlled by the SELECTION_STRATEGY constant above.
 */
function resolveSelection(p1Choice, p2Choice) {
  if (!p1Choice && !p2Choice) return 'medium'; // fallback
  if (!p1Choice) return p2Choice;
  if (!p2Choice) return p1Choice;
  if (p1Choice === p2Choice) return p1Choice;

  const order = { easy: 1, medium: 2, hard: 3 };

  if (SELECTION_STRATEGY === 'higher') {
    return order[p1Choice] >= order[p2Choice] ? p1Choice : p2Choice;
  }
  if (SELECTION_STRATEGY === 'lower') {
    return order[p1Choice] <= order[p2Choice] ? p1Choice : p2Choice;
  }
  // 'random'
  return Math.random() < 0.5 ? p1Choice : p2Choice;
}

module.exports = {
  QUESTIONS,
  SELECTION_TIMEOUT_MS,
  getQuestionOptions,
  getQuestionByDifficulty,
  resolveSelection,
};
