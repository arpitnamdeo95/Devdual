const problems = [
  {
    id: "twosum",
    title: "1. Two Sum Optimizer",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to the target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Exactly one valid answer exists."
    ],
    examples: [
      { input: "nums=[2,7,11,15], target=9", output: "[0, 1]" },
      { input: "nums=[3,2,4], target=6", output: "[1, 2]" }
    ],
    starterCode: `def solve(nums, target):\n    # Write your optimization logic here\n    pass`,
    testCases: [
      { input: "[2, 7, 11, 15], 9", expectedOutput: "[0, 1]" },
      { input: "[3, 2, 4], 6", expectedOutput: "[1, 2]" },
      { input: "[3, 3], 6", expectedOutput: "[0, 1]" }
    ]
  },
  {
    id: "reversearr",
    title: "2. Reverse Engineering (Array)",
    description: "Given a sequence of structured `nums`, your task is to completely reverse the data array in place (or return a newly reversed array) to destabilize the payload's original signature.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-2^31 <= nums[i] <= 2^31 - 1"
    ],
    examples: [
      { input: "nums=[1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "nums=[10,20]", output: "[20,10]" }
    ],
    starterCode: `def solve(nums):\n    # Reverse the array sequence\n    pass`,
    testCases: [
      { input: "[1, 2, 3, 4, 5]", expectedOutput: "[5, 4, 3, 2, 1]" },
      { input: "[10, 20]", expectedOutput: "[20, 10]" },
      { input: "[1]", expectedOutput: "[1]" }
    ]
  },
  {
    id: "anagram",
    title: "3. Valid Anagram Decoder",
    description: "Intercepted two encrypted strings, `s` and `t`. Verify if `t` is a valid anagram of `s` (contains the exact same characters with the exact same frequencies). Return True if valid, False otherwise.",
    constraints: [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters."
    ],
    examples: [
      { input: "s='anagram', t='nagaram'", output: "True" },
      { input: "s='rat', t='car'", output: "False" }
    ],
    starterCode: `def solve(s, t):\n    # Verify anagram properties\n    pass`,
    testCases: [
      { input: "'anagram', 'nagaram'", expectedOutput: "True" },
      { input: "'rat', 'car'", expectedOutput: "False" }
    ]
  }
];

module.exports = problems;
