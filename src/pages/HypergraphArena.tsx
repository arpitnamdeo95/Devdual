
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Lock, 
  X,
  ChevronRight,
  Book,
  Code,
  Terminal,
  Activity,
  Bug,
  Layout,
  HelpCircle,
  Clock,
  Database,
  ArrowRight,
  Monitor
} from 'lucide-react';
import { AppNavbar, AppSidebar } from '../components/AppLayout';

// --- DATA DEFINITIONS ---

interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
}

interface DSANodeData {
  id: string;
  label: string;
  subtitle: string;
  x: number; y: number;
  state: 'locked' | 'available' | 'completed';
  prereqs: string[];
  theory: {
    overview: string;
    deepTheory: string;
    visualizerSteps?: string[];
    complexity: {
      access: string;
      search: string;
      insertion: string;
      deletion: string;
    };
    pitfalls: string[];
    polyglotCode: string;
  };
  practiceDeck: Question[];
}

const initialTopics: DSANodeData[] = [
  {
    id: 'bit-alchemy',
    label: 'Bit Alchemy',
    subtitle: 'BITWISE MODULE',
    x: 450, y: 150,
    state: 'available',
    prereqs: [],
    theory: {
      overview: 'Manipulating raw binary units for maximum hardware-level performance.',
      deepTheory: `Every piece of data is eventually reduced to bits. Bitwise operations are executed directly in the CPU core without complex ALUs.\n\n**Key Identities:**\n1. \`x ^ x = 0\` (Self XOR is zero)\n2. \`x & (x-1)\` (Clears the rightmost set bit)\n3. \`x & -x\` (Isolates the rightmost set bit)\n\nThese operations allow for extremely memory-efficient state tracking, where a single 64-bit integer can act as a set of 64 boolean flags.`,
      complexity: { access: 'N/A', search: 'O(1)', insertion: 'O(1)', deletion: 'O(1)' },
      pitfalls: ['Operator precedence errors', 'Signed overflow', 'Endianness issues'],
      polyglotCode: `// Python\nx = 5; y = 3\nx = x ^ y; y = x ^ y; x = x ^ y // Swap without temp\n\n// JavaScript\nlet isOdd = (n) => !!(n & 1);`,
    },
    practiceDeck: [
      { id: 'q1', title: 'Single Number', difficulty: 'Easy', description: 'Find the element that appears only once in an array where every other element appears twice.' },
      { id: 'q2', title: 'Number of 1 Bits', difficulty: 'Easy', description: 'Count the number of set bits in an integer.' },
      { id: 'q3', title: 'Bitwise AND of Range', difficulty: 'Medium', description: 'Given a range [m, n], find the bitwise AND of all numbers in this range.' }
    ]
  },
  {
    id: 'recursion',
    label: 'Recursion & The Stack',
    subtitle: 'RECURSION MODULE',
    x: 650, y: 150,
    state: 'available',
    prereqs: [],
    theory: {
      overview: 'Solving complex problems by breaking them into smaller, self-similar sub-problems.',
      deepTheory: `Every recursive call pushes a new **Stack Frame** onto memory. A frame contains local variables, return addresses, and parameters.\n\n**Example: Factorial(3)**\n1. \`fact(3)\` -> pushes to stack. Calls \`fact(2)\`.\n2. \`fact(2)\` -> pushes to stack. Calls \`fact(1)\`.\n3. \`fact(1)\` -> Base case! Returns 1.\n4. \`fact(2)\` resumes. Returns 2 * 1.\n5. \`fact(3)\` resumes. Returns 3 * 2.\n\n**Key Rule:** Always define a **Base Case** to stop the recursion, otherwise: \`StackOverflowError\`.`,
      complexity: { access: 'N/A', search: 'O(N) - Depth', insertion: 'N/A', deletion: 'N/A' },
      pitfalls: ['Missing Base Case', 'Excessive memory usage', 'Tailed vs Non-tailed recursion'],
      polyglotCode: `// Java\npublic int fact(int n) {\n  if(n <= 1) return 1;\n  return n * fact(n-1);\n}`,
    },
    practiceDeck: [
      { id: 'q4', title: 'Reverse String', difficulty: 'Easy', description: 'Write a recursive function that reverses a string in-place.' },
      { id: 'q5', title: 'Fibonacci Number', difficulty: 'Easy', description: 'Calculate the n-th Fibonacci number recursively (note the overlapping subproblems).' },
      { id: 'q6', title: 'Letter Combinations', difficulty: 'Medium', description: 'Find all possible letter combinations of a phone number.' }
    ]
  },
  {
    id: 'arrays',
    label: 'Arrays & RAM',
    subtitle: 'LINEAR DATA MODULE',
    x: 350, y: 350,
    state: 'available',
    prereqs: ['bit-alchemy'],
    theory: {
      overview: 'Contiguous memory blocks for high-speed linear access.',
      deepTheory: `Arrays utilize **Cache Locality**. Since the memory is contiguous, the CPU can pre-fetch future elements into its L1 cache.\n\n**Access Logic:**\n\`Address = Base + (Index * Size)\`\nThis allows constant time indexing. However, resizing is an \`O(N)\` operation as it requires allocating a new block and migration.`,
      complexity: { access: 'O(1)', search: 'O(N)', insertion: 'O(N)', deletion: 'O(N)' },
      pitfalls: ['Index Out of Bounds', 'Resizing overhead', 'Off-by-one errors'],
      polyglotCode: `// C++\nint arr[5] = {1, 2, 3, 4, 5};\n\n// Python\nlst = [i for i in range(10)]`,
    },
    practiceDeck: [
      { id: 'q7', title: 'Two Sum', difficulty: 'Easy', description: 'Find two numbers that add up to a specific target.' },
      { id: 'q8', title: 'Rotate Array', difficulty: 'Medium', description: 'Rotate an array to the right by k steps.' },
      { id: 'q9', title: 'Merge Intervals', difficulty: 'Medium', description: 'Merge all overlapping intervals in an array.' }
    ]
  },
  {
    id: 'backtracking',
    label: 'Backtrack Protocol',
    subtitle: 'ALGORITHMIC SEARCH MODULE',
    x: 820, y: 350,
    state: 'available',
    prereqs: ['recursion'],
    theory: {
      overview: 'Refining brute-force by pruning invalid sub-trees during search.',
      deepTheory: `Backtracking explores a state-space tree. If a partial solution violates a constraint, we "backtrack" to the parent node.\n\n**Formula:**\n1. Choose\n2. Explore\n3. Un-choose (Clean up state)\n\nThis is the bread and butter of solving constraint-satisfaction problems like Sudoku or pathfinding.`,
      complexity: { access: 'N/A', search: 'O(B^D)', insertion: 'N/A', deletion: 'N/A' },
      pitfalls: ['Not pruning branches', 'State pollution', 'Memory overhead'],
      polyglotCode: `// Template\ndef backtrack(state):\n    if is_done: ...\n    for opt in options:\n        add(opt)\n        backtrack(state)\n        remove(opt)`,
    },
    practiceDeck: [
      { id: 'q10', title: 'Permutations', difficulty: 'Medium', description: 'Generate all possible permutations of an array of unique integers.' },
      { id: 'q11', title: 'N-Queens', difficulty: 'Hard', description: 'Place N queens on an NxN chessboard such that no two queens attack each other.' },
      { id: 'q12', title: 'Combination Sum', difficulty: 'Medium', description: 'Find all unique combinations of numbers that sum to a target.' }
    ]
  },
  {
    id: 'linked-lists',
    label: 'Dynamic Links',
    subtitle: 'NON-CONTIGUOUS MODULE',
    x: 550, y: 500,
    state: 'available',
    prereqs: ['arrays', 'recursion'],
    theory: {
      overview: 'Memory nodes linked via pointers, scattered across the heap.',
      deepTheory: `Linked Lists solve the resizing problem of arrays. Each node is dynamic. Search is slower (\`O(N)\`) because you cannot jump indices, but insertion is \`O(1)\` once the location is found.\n\n**Common Tip:** Use a "Dummy Head" node to simplify edge cases during list manipulation.`,
      complexity: { access: 'O(N)', search: 'O(N)', insertion: 'O(1)', deletion: 'O(1)' },
      pitfalls: ['Losing the head', 'Memory leaks', 'Infinite cycles'],
      polyglotCode: `// Python Node\nclass Node:\n    def __init__(self, v):\n        self.val = v\n        self.next = None`,
    },
    practiceDeck: [
      { id: 'q13', title: 'Reverse LinkedIn', difficulty: 'Easy', description: 'Reverse a singly linked list.' },
      { id: 'q14', title: 'Linked List Cycle', difficulty: 'Easy', description: 'Determine if a linked list has a cycle (Floyd\'s algorithm).' },
      { id: 'q15', title: 'Merge sorted Lists', difficulty: 'Medium', description: 'Merge two sorted linked lists into one.' }
    ]
  },
  {
    id: 'trees',
    label: 'Trees & BST',
    subtitle: 'HIERARCHICAL MODULE',
    x: 520, y: 850,
    state: 'available',
    prereqs: ['linked-lists'],
    theory: {
      overview: 'Recursive hierarchical structures with root-child relationships.',
      deepTheory: `A tree is basically a linked list where each node has multiple "next" pointers. Binary trees restrict this to two.\n\n**BST Property:** \`Left < Node < Right\`. This makes search logarithmic \`O(log N)\` in balanced cases. High-performance databases use B+ Trees for indexing.`,
      complexity: { access: 'O(log N)', search: 'O(log N)', insertion: 'O(log N)', deletion: 'O(log N)' },
      pitfalls: ['Skewed trees (O(N))', 'Recursion depth errors', 'Reference management'],
      polyglotCode: `// BST Search\nif v < n.val: search(n.l)\nelif v > n.val: search(n.r)\nreturn n`,
    },
    practiceDeck: [
      { id: 'q16', title: 'Inorder Traversal', difficulty: 'Easy', description: 'Print the values of a BST in ascending order.' },
      { id: 'q17', title: 'Maximum Depth', difficulty: 'Easy', description: 'Find the maximum height of a binary tree.' },
      { id: 'q18', title: 'LCA of BST', difficulty: 'Medium', description: 'Find the lowest common ancestor of two nodes in a BST.' }
    ]
  },
  {
    id: 'graphs',
    label: 'Graphs & Flow',
    subtitle: 'NETWORK TOPOLOGY MODULE',
    x: 820, y: 850,
    state: 'available',
    prereqs: ['trees'],
    theory: {
      overview: 'General network of vertices connected by edges.',
      deepTheory: `Graphs can be directed or undirected, weighted or unweighted. They are usually represented via an **Adjacency List** for space efficiency.\n\n**Search Strategy:**\n- **BFS:** Level-order (Shortest path in unweighted).\n- **DFS:** Depth-first (Connectivity, cycles).`,
      complexity: { access: 'N/A', search: 'O(V+E)', insertion: 'O(1)', deletion: 'O(E)' },
      pitfalls: ['Infinite loops (forgetting visited)', 'Disconnected components', 'Adjacency Matrix memory usage'],
      polyglotCode: `// BFS Template\nqueue = [start]; visit = {start}\nwhile queue:\n  n = queue.pop(0)\n  for m in adj[n]: add(m)`,
    },
    practiceDeck: [
      { id: 'q19', title: 'Number of Islands', difficulty: 'Medium', description: 'Count the number of connected components in a grid.' },
      { id: 'q20', title: 'Dijkstra', difficulty: 'Hard', description: 'Find the shortest path in a weighted graph.' },
      { id: 'q21', title: 'Course Schedule', difficulty: 'Medium', description: 'Detect cycles in a directed graph using topological sort.' }
    ]
  },
  {
    id: 'dp',
    label: 'Dynamic Logic',
    subtitle: 'OVERLAPPING STATE MODULE',
    x: 670, y: 1100,
    state: 'available',
    prereqs: ['backtracking', 'graphs'],
    theory: {
      overview: 'Optimizing recursion by caching overlapping sub-problem results.',
      deepTheory: `Dynamic Programming is all about **Memoization** (Top-down) or **Tabulation** (Bottom-up). If a problem has an "Optimal Substructure" and "Overlapping Subproblems", DP can reduce exponential time to linear.\n\n**Transition:** \`dp[i] = dp[i-1] + dp[i-2]\``,
      complexity: { access: 'O(1)', search: 'O(N^2)', insertion: 'O(1)', deletion: 'N/A' },
      pitfalls: ['Incorrect state definition', 'Memory exhaustion in 2D DP', 'Sub-optimal base cases'],
      polyglotCode: `// Memoization\nmemo = {}\ndef fib(n):\n  if n in memo: return memo[n]\n  ...`,
    },
    practiceDeck: [
      { id: 'q22', title: 'Climbing Stairs', difficulty: 'Easy', description: 'How many ways to reach the top of a staircase of N steps?' },
      { id: 'q23', title: 'Knapsack 0/1', difficulty: 'Hard', description: 'Find the maximum value of items that fit into a limited-capacity bag.' },
      { id: 'q24', title: 'LCS', difficulty: 'Medium', description: 'Find the length of the longest common subsequence of two strings.' }
    ]
  }
];

const TopicNode = ({ topic, onClick }: { topic: DSANodeData, onClick: () => void }) => {
  const isLocked = topic.state === 'locked';
  const isCompleted = topic.state === 'completed';

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      style={{ left: topic.x - 55, top: topic.y - 55 }}
      className="absolute z-10"
    >
      <motion.button
        onClick={onClick} disabled={isLocked}
        className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 shadow-2xl z-10 ${
          isLocked ? 'bg-zinc-950/40 border-zinc-900 text-zinc-700 cursor-not-allowed select-none'
          : isCompleted ? 'bg-[#00F2FF44] border-[#00F2FF] text-white shadow-[0_0_40px_#00F2FF44]'
          : 'bg-[#0A0A0A] border-[#00F2FF88] text-white shadow-[0_0_20px_#00F2FF22] cursor-pointer hover:bg-zinc-900 hover:scale-110 active:scale-95 group'
        }`}
      >
        {!isLocked && <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />}
        {isLocked ? <Lock size={12} className="mb-2 opacity-30" /> : <Zap size={14} className={`mb-1 text-[#00F2FF]`} />}
        <div className={`text-[10px] font-black uppercase text-center tracking-tight leading-none px-2 mb-1 ${isLocked ? 'opacity-30' : 'opacity-100'}`}>{topic.label}</div>
        {!isLocked && <div className="text-[7px] font-mono text-zinc-400 font-bold uppercase tracking-widest">{topic.subtitle.split(' ')[0]}</div>}
      </motion.button>
    </motion.div>
  );
};

export default function HypergraphArena() {
  const [topics, setTopics] = useState<DSANodeData[]>(initialTopics);
  const [selectedTopic, setSelectedTopic] = useState<DSANodeData | null>(null);
  const [activeTab, setActiveTab] = useState<'Theory' | 'Complexity' | 'Polyglot Code' | 'Pitfalls' | 'Practice Deck'>('Theory');
  const scrollRef = useRef<HTMLDivElement>(null);

  const theoryRef = useRef(null);
  const complexityRef = useRef(null);
  const codeRef = useRef(null);
  const pitfallsRef = useRef(null);
  const practiceRef = useRef(null);

  const scrollTo = (ref: any, tab: any) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedTopic) {
      setActiveTab('Theory');
    }
  }, [selectedTopic]);

  return (
    <div className="h-screen flex flex-col bg-black text-[#e5e2e1] overflow-hidden font-sans selection:bg-[#00F2FF] selection:text-black">
      <AppNavbar />
      <div className="flex flex-1 flex-row pt-16 w-full h-full relative">
        <AppSidebar />
        <main className="flex-1 relative flex flex-col bg-[#010101]">
          
          <div className="pt-10 px-12 z-20 pointer-events-none relative flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-0">Hypergraph Arena</h1>
              <div className="text-[9px] font-mono text-zinc-600 font-bold uppercase tracking-[0.6em] flex items-center gap-3">
                 Symmetric Neural Mesh V10 // Global Sync
                 <div className="w-1.5 h-1.5 rounded-full bg-[#00F2FF] animate-pulse shadow-[0_0_10px_#00F2FF]" />
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-y-auto scrollbar-hide relative p-12">
             <div className="relative w-[1100px] h-[1550px] mx-auto">
                <svg className="absolute inset-0 w-full h-full z-0 overflow-visible pointer-events-none">
                   {topics.map(topic => (
                      topic.prereqs.map(prereqId => {
                         const start = topics.find(t => t.id === prereqId);
                         if (!start) return null;
                         return (
                           <g key={`${start.id}-${topic.id}`}>
                              <line x1={start.x} y1={start.y} x2={topic.x} y2={topic.y} stroke="#00F2FF" strokeWidth="1" strokeOpacity="0.4" />
                              <line x1={start.x} y1={start.y} x2={topic.x} y2={topic.y} stroke="#00F2FF" strokeWidth="4" strokeOpacity="0.05" />
                           </g>
                         );
                      })
                   ))}
                </svg>
                {topics.map(topic => <TopicNode key={topic.id} topic={topic} onClick={() => setSelectedTopic(topic)} />)}
             </div>
          </div>

          <AnimatePresence>
            {selectedTopic && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTopic(null)} className="absolute inset-0 bg-black/80 backdrop-blur-3xl z-40" />
                <motion.div 
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 40, stiffness: 300 }}
                  className="absolute top-0 right-0 h-full w-[85%] bg-[#080808] border-l border-white/5 z-50 flex flex-col shadow-[-40px_0_100px_rgba(0,0,0,0.9)]"
                >
                  <div className="flex justify-between items-center p-8 bg-zinc-950/50 border-b border-white/5">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-[#6366f1]/20 flex items-center justify-center text-[#6366f1] border border-[#6366f1]/30 italic text-xl font-black">[]</div>
                      <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{selectedTopic.label}</h2>
                        <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest">{selectedTopic.subtitle}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedTopic(null)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      Close Protocol <X size={14} />
                    </button>
                  </div>

                  <div className="flex flex-1 overflow-hidden">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-20 custom-scrollbar scroll-smooth">
                      
                      <section ref={theoryRef} className="space-y-6">
                         <div className="flex items-center gap-3 text-[#6366f1]">
                            <Book size={18} />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Deep Theory</span>
                         </div>
                         <div className="space-y-6">
                            <p className="text-zinc-300 text-lg font-medium leading-relaxed max-w-3xl">{selectedTopic.theory.overview}</p>
                            <div className="bg-zinc-950 p-8 rounded-2xl border border-white/5 text-zinc-400 text-sm leading-[1.8] whitespace-pre-wrap font-medium">
                               {selectedTopic.theory.deepTheory}
                            </div>
                         </div>
                      </section>

                      <section ref={complexityRef} className="space-y-6">
                         <div className="flex items-center gap-3 text-[#ff4c9a]">
                            <Activity size={18} />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Complexity Analysis</span>
                         </div>
                         <div className="grid grid-cols-4 gap-4">
                            {[
                               { label: 'Access', val: selectedTopic.theory.complexity.access },
                               { label: 'Search', val: selectedTopic.theory.complexity.search },
                               { label: 'Insertion', val: selectedTopic.theory.complexity.insertion },
                               { label: 'Deletion', val: selectedTopic.theory.complexity.deletion }
                            ].map(item => (
                               <div key={item.label} className="bg-zinc-950/80 p-6 rounded-xl border border-white/5 group hover:bg-zinc-900 transition-all">
                                  <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-2 block">{item.label}</span>
                                  <span className="text-lg font-black text-white font-mono">{item.val}</span>
                               </div>
                            ))}
                         </div>
                      </section>

                      <section ref={codeRef} className="space-y-6">
                         <div className="flex items-center gap-3 text-[#00f2ff]">
                            <Code size={18} />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Polyglot Code</span>
                         </div>
                         <div className="bg-zinc-950 p-8 rounded-2xl border border-white/5 border-l-4 border-l-[#00f2ff]/30">
                            <pre className="font-mono text-xs text-[#00f2ff]/80 leading-relaxed">{selectedTopic.theory.polyglotCode}</pre>
                         </div>
                      </section>

                      <section ref={pitfallsRef} className="space-y-6">
                         <div className="flex items-center gap-3 text-orange-400">
                            <Bug size={18} />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Pitfalls</span>
                         </div>
                         <ul className="space-y-3">
                            {selectedTopic.theory.pitfalls.map(p => (
                               <li key={p} className="flex gap-4 p-4 rounded-xl bg-zinc-950/40 border border-white/5 text-xs text-zinc-400 font-bold uppercase tracking-tight">
                                  <X size={14} className="text-red-500 shrink-0" /> {p}
                               </li>
                            ))}
                         </ul>
                      </section>

                      <section ref={practiceRef} className="space-y-6">
                         <div className="flex items-center gap-3 text-emerald-400">
                            <HelpCircle size={18} />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Practice Deck</span>
                         </div>
                         <div className="grid grid-cols-1 gap-4">
                            {selectedTopic.practiceDeck.map(q => (
                               <motion.div whileHover={{ x: 10 }} key={q.id} className="group p-6 bg-zinc-950 rounded-2xl border border-white/5 flex justify-between items-center cursor-pointer hover:border-[#00f2ff]/30">
                                  <div className="flex items-center gap-6">
                                     <div className={`text-[10px] font-black uppercase px-3 py-1 rounded ${
                                        q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                        q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                                     }`}>{q.difficulty}</div>
                                     <div>
                                        <h4 className="text-sm font-black text-white uppercase mb-1">{q.title}</h4>
                                        <p className="text-[11px] text-zinc-500 font-medium">{q.description}</p>
                                     </div>
                                  </div>
                                  <ArrowRight size={16} className="text-zinc-700 group-hover:text-[#00f2ff]" />
                               </motion.div>
                            ))}
                         </div>
                      </section>

                      <div className="h-40" />
                    </div>

                    {/* Table of Contents Right Bar */}
                    <div className="w-64 border-l border-white/5 p-8 hidden lg:block bg-zinc-950/20">
                       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-10 block">Table of Contents</span>
                       <div className="space-y-2 relative">
                         <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/5" />
                         {[
                            { name: 'Theory', ref: theoryRef },
                            { name: 'Complexity', ref: complexityRef },
                            { name: 'Polyglot Code', ref: codeRef },
                            { name: 'Pitfalls', ref: pitfallsRef },
                            { name: 'Practice Deck', ref: practiceRef }
                         ].map(tab => (
                           <button 
                             key={tab.name}
                             onClick={() => scrollTo(tab.ref, tab.name)}
                             className={`w-full text-left flex items-center group transition-all duration-300 py-3 ${
                               activeTab === tab.name ? 'text-[#6366f1]' : 'text-zinc-600 hover:text-zinc-400'
                             }`}
                           >
                             <div className={`w-1 h-4 transition-all duration-300 mr-4 ${activeTab === tab.name ? 'bg-[#6366f1]' : 'bg-transparent'}`} />
                             <span className="text-[11px] font-black capitalize tracking-tight">{tab.name}</span>
                             {activeTab === tab.name && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6366f1]" />}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
