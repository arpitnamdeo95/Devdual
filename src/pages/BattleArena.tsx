import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { useState, useEffect } from 'react';
import { useParams, useNavigate , Link} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { socket } from '../socket';
import {
  Clock, Code2, Terminal, Send, Brain, XCircle,
  Trophy, Swords, Copy, Check, Maximize2, Minimize2
} from 'lucide-react';

const problem = {
  id: '0x7F',
  title: 'TWO SUM V2',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  example: { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
  constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Each input has exactly one solution'],
  difficulty: 'Medium' as const,
};

const diffColors: Record<string, string> = {
  Easy: 'text-accent-green border-accent-green/30 bg-accent-green/10',
  Medium: 'text-accent-orange border-accent-orange/30 bg-accent-orange/10',
  Hard: 'text-accent-red border-accent-red/30 bg-accent-red/10',
};

export default function BattleArena() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('// Write your solution here\nfunction solve(a, b) {\n  \n}');
  const [opponentCode, setOpponentCode] = useState('/* Opponent is typing... */');
  const [timer, setTimer] = useState(30 * 60);
  const [status, setStatus] = useState('WAITING_FOR_OPPONENT');
  const [result, setResult] = useState<{ winnerId?: string; winningCode?: string } | null>(null);
  const [lineCount, setLineCount] = useState(3);
  const [charCount, setCharCount] = useState(0);
  const [showConstraints, setShowConstraints] = useState(false);
  const [copied, setCopied] = useState(false);
  const [opponentLines, setOpponentLines] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    socket.emit('join-room', { roomId, isSpectator: false });

    socket.on('room-state', (state) => {
      setStatus('IN_PROGRESS');
      if (state.code) {
        const oppId = Object.keys(state.code).find(id => id !== socket.id);
        if (oppId) setOpponentCode(state.code[oppId]);
      }
    });

    socket.on('opponent-code-update', (data) => {
      setOpponentCode(data.code);
      setOpponentLines(data.code.split('\n').length);
    });

    socket.on('game-end', (data) => {
      setStatus('ENDED');
      setResult(data);
    });

    return () => {
      socket.off('room-state');
      socket.off('opponent-code-update');
      socket.off('game-end');
    };
  }, [roomId]);

  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;
    const interval = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (status === 'IN_PROGRESS') {
        socket.emit('code-update', { roomId, code });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [code, roomId, status]);

  useEffect(() => {
    setLineCount(code.split('\n').length);
    setCharCount(code.length);
  }, [code]);

  const handleSubmit = async () => {
    setStatus('SUBMITTING');
    try {
      const res = await fetch('http://localhost:4000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language_id: 63 })
      });
      const data = await res.json();
      if (data.success) {
        socket.emit('submit-code', { roomId, code });
      } else {
        alert(data.message);
        setStatus('IN_PROGRESS');
      }
    } catch (err) {
      console.error(err);
      setStatus('IN_PROGRESS');
    }
  };

  const handleReview = () => {
    navigate(`/review/${roomId}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timerColor = timer < 300 ? 'text-accent-red' : timer < 600 ? 'text-accent-orange' : 'text-primary-container';
  const timerPercent = (timer / (30 * 60)) * 100;

  return (
<div className="h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">

<AppNavbar />
<div className="flex flex-1 flex-row pt-16 w-full h-full overflow-hidden">

<AppSidebar />

<main className="flex-1 flex flex-col bg-background relative overflow-hidden">

<div className="grid grid-cols-12 gap-px bg-white/5 border-b border-white/5">
<div className="col-span-4 p-4 bg-surface flex flex-col justify-center">
<div className="flex items-center gap-2 mb-1">
<span className="text-xs font-label uppercase tracking-tighter text-on-surface-variant font-semibold">Active Duel</span>
<span className="px-1.5 py-0.5 rounded-[2px] bg-error-container text-error text-[9px] font-bold">LIVE</span>
</div>
<h1 className="text-xl font-headline font-extrabold tracking-tight">K-Means Clustering Optimization</h1>
</div>
<div className="col-span-4 p-4 bg-surface flex flex-col justify-center border-l border-white/5">
<div className="flex justify-between items-end mb-2">
<span className="text-[10px] font-label uppercase text-on-surface-variant font-bold">Your Progress</span>
<span className="text-xs font-mono text-tertiary">84% Complete</span>
</div>
<div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-tertiary w-[84%] transition-all duration-1000 shadow-[0_0_8px_rgba(78,222,163,0.4)]"></div>
</div>
</div>
<div className="col-span-4 p-4 bg-surface flex flex-col justify-center border-l border-white/5">
<div className="flex justify-between items-end mb-2">
<span className="text-[10px] font-label uppercase text-on-surface-variant font-bold">Opponent: @syntax_void</span>
<span className="text-xs font-mono text-primary-fixed-dim">62% Complete</span>
</div>
<div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary-container w-[62%] transition-all duration-1000 shadow-[0_0_8px_rgba(77,142,255,0.4)]"></div>
</div>
</div>
</div>

<div className="flex-1 flex overflow-hidden">

<section className="w-1/3 bg-surface-container-low p-8 overflow-y-auto code-editor-scrollbar border-r border-white/5">
<div className="space-y-6">
<div>
<span className="text-[10px] font-mono font-bold text-primary tracking-[0.2em] uppercase">Context</span>
<p className="mt-2 text-sm text-on-surface leading-relaxed opacity-90">
                                Implement a highly optimized version of the K-Means algorithm to handle datasets with high dimensionality. You must ensure the initialization step uses the K-Means++ heuristic for faster convergence.
                            </p>
</div>
<div className="p-4 bg-surface-container-lowest rounded-lg border border-white/5">
<h3 className="text-xs font-bold text-on-surface-variant uppercase mb-3 flex items-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="rule">rule</span> Constraints
                            </h3>
<ul className="space-y-2 text-[13px] font-mono text-on-surface">
<li className="flex gap-2"><span className="text-primary-container">01</span> Memory Limit: 256MB</li>
<li className="flex gap-2"><span className="text-primary-container">02</span> Time Complexity: O(n * k * d)</li>
<li className="flex gap-2"><span className="text-primary-container">03</span> Convergence Threshold: ε &lt; 1e-4</li>
</ul>
</div>
<div>
<h3 className="text-xs font-bold text-on-surface-variant uppercase mb-3">Example Dataset</h3>
<div className="bg-surface-container-highest rounded-lg p-3 font-mono text-[12px] text-primary/80">
                                [[1.2, 0.4], [0.1, -1.0], [3.4, 2.2]]
                            </div>
</div>
</div>
</section>

<section className="flex-1 flex flex-col bg-surface-container-lowest relative">

<div className="h-10 bg-surface-container px-4 flex items-center justify-between border-b border-white/5">
<div className="flex items-center gap-4">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-[#f87171]"></span>
<span className="w-2 h-2 rounded-full bg-[#fbbf24]"></span>
<span className="w-2 h-2 rounded-full bg-[#4ade80]"></span>
</div>
<span className="text-[11px] font-mono text-on-surface-variant/80">solution.py</span>
</div>
<div className="flex items-center gap-3">
<span className="text-[10px] font-mono text-zinc-500">UTF-8</span>
<span className="text-[10px] font-mono text-zinc-500">Spaces: 4</span>
</div>
</div>

<div className="flex-1 overflow-y-auto code-editor-scrollbar p-6 font-mono text-[14px] leading-relaxed">
<div className="flex gap-6 group">
<div className="flex flex-col text-right text-zinc-600 select-none w-8">
<span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span>
</div>
<div className="flex-1">
<span className="text-tertiary">import</span> numpy <span className="text-tertiary">as</span> np<br />
<br />
<span className="text-tertiary">class</span> <span className="text-primary">KMeans</span>:<br />
                                    <span className="text-tertiary">def</span> <span className="text-primary">__init__</span>(<span className="text-on-secondary-container">self</span>, k=<span className="text-primary-container">3</span>, max_iter=<span className="text-primary-container">300</span>):<br />
                                        self.k = k<br />
                                        self.max_iter = max_iter<br />
                                        self.centroids = <span className="text-on-secondary-container">None</span><br />
<br />
                                    <span className="text-tertiary">def</span> <span className="text-primary">fit</span>(<span className="text-on-secondary-container">self</span>, X):<br />
                                        <span className="text-on-surface-variant"># Initialize centroids using K-Means++</span><br />
<div className="bg-primary-container/10 -mx-2 px-2 border-l-2 border-primary">
                                        self.centroids = [X[np.random.choice(X.shape[<span className="text-primary-container">0</span>])]]<br />
</div>
                                        <span className="text-tertiary">for</span> _ <span className="text-tertiary">in</span> <span className="text-primary">range</span>(<span className="text-primary-container">1</span>, self.k):<br />
                                            dist_sq = np.array([min([np.inner(c-x, c-x) <span className="text-tertiary">for</span> c <span className="text-tertiary">in</span> self.centroids]) <span className="text-tertiary">for</span> x <span className="text-tertiary">in</span> X])<br />
                                            probs = dist_sq / dist_sq.sum()<br />
                                            cumulative_probs = probs.cumsum()<br />
</div>
</div>
</div>

<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 glass-panel rounded-xl border border-white/10 shadow-2xl">
<button onClick={() => { setIsTesting(true); setTimeout(() => setIsTesting(false), 2000); }} disabled={isTesting || status === 'SUBMITTING'} className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest text-on-surface font-label font-bold text-xs rounded-lg hover:bg-surface-bright transition-all disabled:opacity-50">
<span className="material-symbols-outlined text-[18px]" data-icon="play_arrow">play_arrow</span>
                            {isTesting ? 'Running...' : 'Run Tests'}
                        </button>
<div className="w-px h-6 bg-white/10 mx-1"></div>
<button onClick={handleSubmit} disabled={isTesting || status === 'SUBMITTING'} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-primary to-primary-container text-on-primary font-label font-bold text-xs rounded-lg hover:brightness-110 transition-all disabled:opacity-50">
<span className="material-symbols-outlined text-[18px]" data-icon="publish">publish</span>
                            {status === 'SUBMITTING' ? 'Submitting...' : 'Submit Solution'}
                        </button>
</div>
</section>
</div>

<footer className="h-40 bg-surface-container-high border-t border-white/5 flex flex-col">
<div className="h-8 flex items-center justify-between px-6 border-b border-white/5 bg-surface-container">
<div className="flex items-center gap-4">
<span className="text-[10px] font-bold text-tertiary uppercase tracking-widest flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                            Success
                        </span>
<span className="text-[10px] font-label text-zinc-500 uppercase tracking-widest">Console Output</span>
</div>
<div className="flex items-center gap-3">
<button className="material-symbols-outlined text-sm text-zinc-500" data-icon="keyboard_arrow_down">keyboard_arrow_down</button>
</div>
</div>
<div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] text-zinc-400 space-y-1">
{isTesting ? (
    <p className="animate-pulse"><span className="text-primary">[RUNNING]</span> Executing test cases locally...</p>
) : status === 'SUBMITTING' ? (
    <p className="animate-pulse"><span className="text-secondary">[UPLOADING]</span> Submitting solution payload to centralized grader...</p>
) : (
    <>
        <p><span className="text-tertiary">[PASS]</span> Test Case 1: Base Centroid Allocation</p>
        <p><span className="text-tertiary">[PASS]</span> Test Case 2: Convergence Stability</p>
        <p><span className="text-tertiary">[PASS]</span> Test Case 3: Performance Benchmark (0.84s)</p>
        <p><span className="text-tertiary">[PASS]</span> Test Case 4: Edge Case - Null Dimensionality...</p>
    </>
)}
</div>
</footer>
</main>
</div>

<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
<div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
<div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[120px]"></div>
</div>

</div>
);
}
