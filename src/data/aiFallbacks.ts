export interface CoachHint {
  opponentApproach: string;
  myApproach: string;
  keyDifference: string;
  urgentTip: string;
  suggestions: string[];
  opponentLeading: boolean;
  threatLevel: 'low' | 'medium' | 'high';
  suggestedPowerup?: 'freeze' | 'testcase' | 'blur' | null;
  powerupReason?: string;
}

export const getTopicAwareFallback = (problemDescription: string): CoachHint => {
  const desc = (problemDescription || '').toLowerCase();
  let topicTips: string[] = [];
  let topicApproach = "Analyzing your logic flow...";
  
  if (desc.includes('array') || desc.includes('list') || desc.includes('sort')) {
    topicTips = [
      'Consider a two-pointer approach for dynamic array traversal.',
      'Check for out-of-bounds index errors.',
      'Can this array be sorted to improve time complexity?',
      'Use a sliding window if you need to track sub-ranges.',
      'A hash map could improve lookup speed from O(N) to O(1).'
    ];
    topicApproach = "Working through array manipulations.";
  } else if (desc.includes('graph') || desc.includes('tree') || desc.includes('node') || desc.includes('path')) {
    topicTips = [
      'Beware of infinite loops; track visited nodes properly.',
      'Would a BFS find the shortest path faster than DFS?',
      'Verify your recursive depth limits to prevent stack overflow.',
      'Check if a topological sort or Dijkstra is required here.',
      'Consider using an adjacency list for efficient memory usage.'
    ];
    topicApproach = "Traversing the data structure's connectivity.";
  } else if (desc.includes('string') || desc.includes('characters') || desc.includes('palindrome') || desc.includes('regex')) {
    topicTips = [
      'Handle edge cases like empty strings or single characters.',
      'A sliding window counts character frequencies efficiently.',
      'Check case-sensitivity and non-alphanumeric characters.',
      'Consider hashing the string if you need O(1) lookups.',
      'Use built-in string methods to simplify complex logic.'
    ];
    topicApproach = "Manipulating character sequence patterns.";
  } else if (desc.includes('math') || desc.includes('number') || desc.includes('sum') || desc.includes('integer') || desc.includes('prime')) {
    topicTips = [
      'Use modulo operations to prevent result overflows.',
      'Beware of integer overflow on extremely large cases.',
      'Pre-calculate common values or use bitwise logic.',
      'Check if the result should be returned as a long integer.',
      'Consider if a mathematical formula can replace a loop.'
    ];
    topicApproach = "Evaluating mathematical properties.";
  } else if (desc.includes('dp') || desc.includes('dynamic programming') || desc.includes('memoization') || desc.includes('recursive')) {
    topicTips = [
      'Define your state and transitions clearly before coding.',
      'Use memoization to store results of overlapping subproblems.',
      'Can you optimize space complexity by keeping only the last state?',
      'Check the base cases to avoid infinite recursion.',
      'Identify if this is a top-down or bottom-up approach.'
    ];
    topicApproach = "Optimizing via subproblem resolution.";
  } else if (desc.includes('stack') || desc.includes('queue') || desc.includes('priority')) {
    topicTips = [
      'Does the "Last-In, First-Out" (LIFO) property apply here?',
      'A monotonic stack might help find the next greater element.',
      'Use a Priority Queue (Heaps) for min/max retrieval in log(N) time.',
      'Check for empty structure conditions before popping.',
      'Consider the time complexity of each push/pop operation.'
    ];
    topicApproach = "Utilizing sequential data structures.";
  }
  
  const generalTips = [
    'Use a dictionary for O(1) lookups to save precious time.',
    'Optimize the inner loop structure if possible.',
    'Avoid redundant allocations inside high-frequency loops.',
    'Double-check your iteration boundaries carefully.',
    'Simplify your logic to make debugging easier.',
    'Are you handling the edge case where the input is null or empty?',
    'Consider the time complexity of the entire solution (Big O).',
    'Check if you can use bit manipulation to speed things up.'
  ];
  
  // Shuffle and pick 3 to 5 suggestions
  let combined = [...topicTips];
  if (combined.length < 5) {
    const remainingNeeded = 5 - combined.length;
    // Add unique general tips
    const shuffledGeneral = [...generalTips].sort(() => 0.5 - Math.random());
    for (let i = 0; i < remainingNeeded; i++) {
      combined.push(shuffledGeneral[i]);
    }
  }
  
  const suggestions = combined.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 3); // 3 to 5
  const threatLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  const powerups: ('freeze' | 'testcase' | 'blur' | null)[] = ['freeze', 'testcase', 'blur', null, null];
  const powerupIdx = Math.floor(Math.random() * powerups.length);
  const suggestedPowerup = powerups[powerupIdx];
  
  const powerupReasons = {
    freeze: 'Disrupt their concentration for 10 seconds to pull ahead.',
    testcase: 'Masking test case feedback will slow their validation process.',
    blur: 'Obscuring their view can cause critical syntax errors.',
    null: ''
  };

  return {
    opponentApproach: 'Using an alternative algorithm.',
    myApproach: topicApproach,
    keyDifference: 'Logic optimization level varies.',
    urgentTip: topicTips[0] || 'Keep pushing! Double check all edge cases.',
    suggestions,
    opponentLeading: Math.random() > 0.6, // Bias towards opponent leading for drama
    threatLevel: threatLevels[Math.floor(Math.random() * 3)],
    suggestedPowerup,
    powerupReason: suggestedPowerup ? powerupReasons[suggestedPowerup as keyof typeof powerupReasons] : undefined
  };
};

export interface ReviewHint {
  error?: string;
  complexityComparison: string;
  winnerAdvantage: string;
  loserMistakes: string;
  suggestions: string[];
  winnerScore: number;
  loserScore: number;
  runtimeMs?: string;
  memoryMb?: string;
  optimizedRefactor?: string;
}

export const getTopicAwareReviewFallback = (problemDescription: string, won: boolean): ReviewHint => {
  const desc = (problemDescription || '').toLowerCase();
  let suggestions: string[] = [];
  let complexity = "O(N) time complexity identified.";
  
  if (desc.includes('array') || desc.includes('list')) {
    suggestions = [
      'Focus on reducing nested loops to move from O(N²) to O(N log N).',
      'Consider using built-in sorting methods which are highly optimized.',
      'Check for edge cases where the array is already sorted or empty.'
    ];
    complexity = "O(N log N) sorting detected in optimal paths.";
  } else if (desc.includes('graph') || desc.includes('tree')) {
    suggestions = [
      'Ensure you are using an adjacency list instead of a matrix for large graphs.',
      'Always track visited nodes to avoid redundant re-processing.',
      'Verify if DFS or BFS is more suited for the specific search criteria.'
    ];
    complexity = "O(V + E) traversal complexity identified.";
  } else {
    suggestions = [
      'Pre-calculate repeated subproblems using a memoization table.',
      'Simplify your conditional logic to reduce cognitive complexity.',
      'Double-check your loop boundaries for off-by-one errors.'
    ];
    complexity = "Standard O(N) linear scan approach.";
  }

  return {
    complexityComparison: complexity,
    winnerAdvantage: won ? "You utilized an optimal data structure early on." : "Opponent identified the key constraint faster.",
    loserMistakes: won ? "Opponent struggled with nested loop overhead." : "You spent too much time on redundant comparisons.",
    suggestions: suggestions.slice(0, 3).concat(['Optimize space complexity where possible.']),
    winnerScore: won ? 94 : 88,
    loserScore: won ? 76 : 82,
    runtimeMs: "24ms",
    memoryMb: "14.2MB",
    optimizedRefactor: won ? "# Your solution is already highly optimized." : "# Consider using a more efficient data structure."
  };
};
