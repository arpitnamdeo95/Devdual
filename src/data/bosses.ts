export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Example {
  input: string;
  output: string;
}

export interface BossQuestion {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  constraints: string[];
  examples: Example[];
  testCases: TestCase[];
  starterCode: string;
}

export interface Boss {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  questions: BossQuestion[];
}

export const BOSSES: Boss[] = [
  {
    id: "arrays-boss",
    name: "The Array Sentinel",
    description: "Guardian of sequential memory. Tests your fundamental manipulation of continuous numeric blocks.",
    icon: "data_array",
    color: "from-blue-500 to-cyan-500",
    questions: [
      {
        id: "arr-1",
        title: "Find Maximum Element",
        difficulty: "easy",
        description: "Given an array of integers, return the largest element in the array.",
        constraints: ["1 <= nums.length <= 10^5", "All elements fit safely in integer bounds"],
        examples: [{ input: "[3, 1, 4, 1, 5, 9, 2, 6]", output: "9" }],
        testCases: [
          { input: "[3, 1, 4, 1, 5, 9, 2, 6]", expectedOutput: "9" },
          { input: "[-5, -1, -3]", expectedOutput: "-1" },
          { input: "[42]", expectedOutput: "42" },
          { input: "[0, 0, 0]", expectedOutput: "0" }
        ],
        starterCode: "def solve(nums):\n    pass\n"
      },
      {
        id: "arr-2",
        title: "Two Sum",
        difficulty: "easy",
        description: "Given an array of integers `nums`, return the sum of the two largest distinct numbers.",
        constraints: ["2 <= nums.length <= 100"],
        examples: [{ input: "[1, 2, 3, 4, 5]", output: "9" }],
        testCases: [
          { input: "[1, 2, 3, 4, 5]", expectedOutput: "9" },
          { input: "[-10, 5, -2, 4]", expectedOutput: "9" },
          { input: "[10, 10]", expectedOutput: "20" }
        ],
        starterCode: "def solve(nums):\n    pass\n"
      },
      {
        id: "arr-3",
        title: "Contains Duplicate",
        difficulty: "medium",
        description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct. Return 'True' or 'False' as a string.",
        constraints: ["1 <= nums.length <= 10^5"],
        examples: [{ input: "[1, 2, 3, 1]", output: "True" }],
        testCases: [
          { input: "[1, 2, 3, 1]", expectedOutput: "True" },
          { input: "[1, 2, 3, 4]", expectedOutput: "False" },
          { input: "[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]", expectedOutput: "True" }
        ],
        starterCode: "def solve(nums):\n    pass\n"
      },
      {
        id: "arr-4",
        title: "Sum of Positives",
        difficulty: "medium",
        description: "Return the sum of all strictly positive integers in the array.",
        constraints: ["0 <= nums.length <= 10^5"],
        examples: [{ input: "[-1, 2, 3, -4]", output: "5" }],
        testCases: [
          { input: "[-1, 2, 3, -4]", expectedOutput: "5" },
          { input: "[-1, -2, -3]", expectedOutput: "0" },
          { input: "[100, -100]", expectedOutput: "100" }
        ],
        starterCode: "def solve(nums):\n    pass\n"
      },
      {
        id: "arr-5",
        title: "Product Except Self",
        difficulty: "hard",
        description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. Use O(n) time.",
        constraints: ["2 <= nums.length <= 10^5"],
        examples: [{ input: "[1,2,3,4]", output: "[24, 12, 8, 6]" }],
        testCases: [
          { input: "[1, 2, 3, 4]", expectedOutput: "[24, 12, 8, 6]" },
          { input: "[-1, 1, 0, -3, 3]", expectedOutput: "[0, 0, 9, 0, 0]" }
        ],
        starterCode: "def solve(nums):\n    pass\n"
      }
    ]
  },
  {
    id: "strings-boss",
    name: "The Lexical Phantom",
    description: "Master of patterns and encodings. Prepare to parse complex lexical structures and substrings.",
    icon: "sort_by_alpha",
    color: "from-purple-500 to-pink-500",
    questions: [
      {
        id: "str-1",
        title: "Reverse String",
        difficulty: "easy",
        description: "Write a function that reverses a string.",
        constraints: ["1 <= s.length <= 10^5", "s consists of printable ASCII characters."],
        examples: [{ input: "\"hello\"", output: "olleh" }],
        testCases: [
          { input: "\"hello\"", expectedOutput: "olleh" },
          { input: "\"Hannah\"", expectedOutput: "hannaH" },
          { input: "\"A\"", expectedOutput: "A" }
        ],
        starterCode: "def solve(s):\n    pass\n"
      },
      {
        id: "str-2",
        title: "First Non-Repeating Character",
        difficulty: "medium",
        description: "Given a string s, return the first character that does not repeat anywhere in the string. If every character repeats, return an empty string.",
        constraints: ["1 <= s.length <= 10^5"],
        examples: [{ input: "\"leetcode\"", output: "l" }],
        testCases: [
          { input: "\"leetcode\"", expectedOutput: "l" },
          { input: "\"aabb\"", expectedOutput: "" },
          { input: "\"stress\"", expectedOutput: "t" }
        ],
        starterCode: "def solve(s):\n    pass\n"
      },
      {
        id: "str-3",
        title: "Valid Palindrome",
        difficulty: "medium",
        description: "Return 'True' if a string is a palindrome (reads the same forwards and backwards) ignoring spaces and case, or 'False' otherwise.",
        constraints: ["1 <= s.length <= 2 * 10^5"],
        examples: [{ input: "\"A man a plan a canal Panama\"", output: "True" }],
        testCases: [
          { input: "\"A man a plan a canal Panama\"", expectedOutput: "True" },
          { input: "\"race a car\"", expectedOutput: "False" },
          { input: "\" \"", expectedOutput: "True" }
        ],
        starterCode: "def solve(s):\n    pass\n"
      },
      {
        id: "str-4",
        title: "Character Frequency",
        difficulty: "medium",
        description: "Given a string, return the character that appears the most frequently. In case of a tie, return whichever comes first alphabetically.",
        constraints: ["1 <= s.length <= 100"],
        examples: [{ input: "\"aabbb\"", output: "b" }],
        testCases: [
          { input: "\"aabbb\"", expectedOutput: "b" },
          { input: "\"xyzxyzx\"", expectedOutput: "x" },
          { input: "\"abab\"", expectedOutput: "a" }
        ],
        starterCode: "def solve(s):\n    pass\n"
      },
      {
        id: "str-5",
        title: "Longest Substring Without Repeating",
        difficulty: "hard",
        description: "Find the length of the longest substring that contains no repeating characters.",
        constraints: ["0 <= s.length <= 50000"],
        examples: [{ input: "\"abcabcbb\"", output: "3" }],
        testCases: [
          { input: "\"abcabcbb\"", expectedOutput: "3" },
          { input: "\"bbbbb\"", expectedOutput: "1" },
          { input: "\"pwwkew\"", expectedOutput: "3" }
        ],
        starterCode: "def solve(s):\n    pass\n"
      }
    ]
  },
  {
    id: "dp-boss",
    name: "The Optimus Engine",
    description: "An algorithmic titan enforcing optimality. Test your dynamic programming and recursive depth.",
    icon: "memory",
    color: "from-orange-500 to-red-500",
    questions: [
      {
        id: "dp-1",
        title: "Nth Fibonacci",
        difficulty: "easy",
        description: "Return the Nth number in the Fibonacci sequence. F(0)=0, F(1)=1. F(N) = F(N-1) + F(N-2).",
        constraints: ["0 <= n <= 30"],
        examples: [{ input: "4", output: "3" }],
        testCases: [
          { input: "4", expectedOutput: "3" },
          { input: "0", expectedOutput: "0" },
          { input: "10", expectedOutput: "55" }
        ],
        starterCode: "def solve(n):\n    pass\n"
      },
      {
        id: "dp-2",
        title: "Climbing Stairs",
        difficulty: "easy",
        description: "You are climbing a staircase. It takes n steps to reach the top. You can climb 1 or 2 steps at a time. In how many distinct ways can you climb it?",
        constraints: ["1 <= n <= 45"],
        examples: [{ input: "3", output: "3" }],
        testCases: [
          { input: "2", expectedOutput: "2" },
          { input: "3", expectedOutput: "3" },
          { input: "5", expectedOutput: "8" }
        ],
        starterCode: "def solve(n):\n    pass\n"
      },
      {
        id: "dp-3",
        title: "Coin Change (Minimal)",
        difficulty: "medium",
        description: "Given an array input structured as [target_amount, coin1, coin2, ...], return the fewest number of coins that make up that amount, or -1 if impossible.",
        constraints: ["0 <= amount <= 1000", "1 <= coins[i] <= 100"],
        examples: [{ input: "[11, 1, 2, 5]", output: "3" }],
        testCases: [
          { input: "[11, 1, 2, 5]", expectedOutput: "3" },
          { input: "[3, 2]", expectedOutput: "-1" },
          { input: "[0, 1]", expectedOutput: "0" }
        ],
        starterCode: "def solve(args):\n    amount = args[0]\n    coins = args[1:]\n    pass\n"
      },
      {
        id: "dp-4",
        title: "House Robber",
        difficulty: "medium",
        description: "You are a professional robber planning to rob houses. You cannot rob adjacent houses. Given an array of money in each house, return the maximum amount you can rob without triggering alarms.",
        constraints: ["1 <= nums.length <= 100"],
        examples: [{ input: "[1, 2, 3, 1]", output: "4" }],
        testCases: [
          { input: "[1, 2, 3, 1]", expectedOutput: "4" },
          { input: "[2, 7, 9, 3, 1]", expectedOutput: "12" },
          { input: "[0]", expectedOutput: "0" }
        ],
        starterCode: "def solve(nums):\n    pass\n"
      },
      {
        id: "dp-5",
        title: "Longest Increasing Subsequence",
        difficulty: "hard",
        description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
        constraints: ["1 <= nums.length <= 2500"],
        examples: [{ input: "[10,9,2,5,3,7,101,18]", output: "4" }],
        testCases: [
          { input: "[10, 9, 2, 5, 3, 7, 101, 18]", expectedOutput: "4" },
          { input: "[0, 1, 0, 3, 2, 3]", expectedOutput: "4" },
          { input: "[7, 7, 7, 7, 7, 7, 7]", expectedOutput: "1" }
        ],
        starterCode: "def solve(nums):\n    pass\n"
      }
    ]
  }
];
