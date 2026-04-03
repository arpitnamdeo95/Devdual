import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans relative overflow-hidden">
      {/* Top HUD */}
      <header className="h-14 bg-surface-container-lowest border-b border-outline-variant/30 flex justify-between items-center px-6 relative z-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary-container" />
            <h1 className="font-[Space_Grotesk] font-bold text-lg uppercase tracking-widest text-white">
              ARENA <span className="text-primary-container">/{roomId?.substring(0, 6)}/</span>
            </h1>
          </div>

          {/* Timer with progress bar */}
          <div className="flex items-center gap-3">
            <div className="relative w-32 h-1 bg-surface-container-high overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 ${
                  timer < 300 ? 'bg-accent-red' : timer < 600 ? 'bg-accent-orange' : 'bg-primary-container'
                }`}
                style={{ width: `${timerPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className={`flex items-center gap-1 font-mono text-sm font-bold ${timerColor}`}>
              <Clock className="w-4 h-4" />
              <span className="tabular-nums">
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Code stats */}
          <div className="hidden lg:flex items-center gap-4 text-meta opacity-60">
            <span className="flex items-center gap-1">
              <Code2 className="w-3 h-3" /> {lineCount} lines
            </span>
            <span>{charCount} chars</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsZenMode(!isZenMode)}
            className="p-2 text-on-surface-variant hover:text-primary-container transition-colors bg-surface-container/50 border border-outline-variant/30 hidden md:block"
            title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
          {status === 'ENDED' ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReview}
              className="flex items-center gap-2 bg-accent-purple text-white font-bold font-mono px-5 py-2 uppercase tracking-widest text-sm hover:shadow-glow-purple transition-shadow clip-angle"
            >
              <Brain className="w-4 h-4" />
              AI REVIEW
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={status !== 'IN_PROGRESS'}
              className="flex items-center gap-2 bg-primary-container text-[#002022] font-bold font-mono px-5 py-2 uppercase tracking-widest text-sm hover:shadow-glow-intense transition-shadow disabled:opacity-50 clip-angle"
            >
              <Send className="w-4 h-4" />
              EXECUTE
            </motion.button>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden relative">
        {/* Match ended overlay */}
        <AnimatePresence>
          {status === 'ENDED' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/90 z-50 flex flex-col items-center justify-center backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-center"
              >
                {result?.winnerId === socket.id ? (
                  <>
                    <Trophy className="w-16 h-16 text-primary-container mx-auto mb-4 animate-pulse-glow" />
                    <h2 className="text-6xl font-[Space_Grotesk] font-bold text-white uppercase tracking-widest mb-4">
                      VICTORY
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-8">
                      <span className="text-xl text-accent-green font-mono font-bold">+25 ELO</span>
                      <span className="text-on-surface-variant font-mono">|</span>
                      <span className="text-primary-container font-mono">RANK UP</span>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-accent-red mx-auto mb-4" />
                    <h2 className="text-6xl font-[Space_Grotesk] font-bold text-white uppercase tracking-widest mb-4">
                      DEFEATED
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-8">
                      <span className="text-xl text-accent-red font-mono font-bold">-15 ELO</span>
                      <span className="text-on-surface-variant font-mono">|</span>
                      <span className="text-accent-orange font-mono">BETTER LUCK NEXT TIME</span>
                    </div>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReview}
                  className="bg-gradient-to-r from-primary-container to-accent-purple text-white font-bold px-8 py-4 uppercase tracking-widest font-mono flex items-center gap-2 mx-auto clip-angle"
                >
                  <Brain className="w-5 h-5" />
                  INITIALIZE AI DEBRIEF
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Problem Panel */}
        <AnimatePresence>
          {!isZenMode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="col-span-3 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col overflow-hidden min-w-[280px]"
            >
              <div className="p-4 border-b border-outline-variant/30">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-meta font-bold border ${diffColors[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-meta">
                    PROTOCOL {problem.id}
                  </span>
                </div>
                <h2 className="text-xl font-[Space_Grotesk] font-bold text-white mb-3">{problem.title}</h2>
                <p className="text-[#b9cacb] text-sm leading-relaxed">{problem.description}</p>
              </div>

              {/* Example */}
              <div className="p-4 border-b border-outline-variant/30">
                <span className="text-meta block mb-2">Example</span>
                <div className="bg-[#0E0E0E] p-3 border-l-2 border-primary-container font-mono text-xs">
                  <p className="text-on-surface-variant">
                    <span className="text-accent-purple">Input:</span> {problem.example.input}
                  </p>
                  <p className="text-on-surface-variant mt-1">
                    <span className="text-accent-green">Output:</span> {problem.example.output}
                  </p>
                </div>
              </div>

              {/* Constraints toggle */}
              <div className="p-4">
                <button
                  onClick={() => setShowConstraints(!showConstraints)}
                  className="flex items-center gap-2 text-meta hover:text-primary-container transition-colors"
                >
                  <Terminal className="w-3 h-3" />
                  {showConstraints ? 'Hide' : 'Show'} Constraints
                </button>
                <AnimatePresence>
                  {showConstraints && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <ul className="space-y-1">
                        {problem.constraints.map((c, i) => (
                          <li key={i} className="font-mono text-[11px] text-on-surface-variant/80 pl-2 border-l border-outline-variant/30">
                            {c}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Opponent progress */}
              <div className="mt-auto p-4 border-t border-outline-variant/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-meta text-accent-orange">Opponent Status</span>
                  <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-surface-container-high">
                    <motion.div
                      className="h-full bg-accent-orange"
                      animate={{ width: `${Math.min(opponentLines * 5, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="font-mono text-xs text-accent-orange">{opponentLines} lines</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Split Editors */}
        <div className={`${isZenMode ? 'col-span-12' : 'col-span-9'} grid ${isZenMode ? 'grid-cols-1' : 'grid-cols-2'} relative transition-all duration-500`}>
          {/* Main User Editor */}
          <div className="bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col relative">
            <div className="h-10 bg-surface-container flex items-center px-4 justify-between border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                <span className="text-primary-container font-black font-mono text-xs tracking-widest uppercase">YOU</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-on-surface-variant hover:text-primary-container transition-colors text-meta"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="flex-1 relative bg-[#0E0E0E]">
              <Editor
                height="100%"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  padding: { top: 16 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true },
                  suggest: { showKeywords: true },
                }}
              />
            </div>
          </div>

          {/* Opponent Editor */}
          <AnimatePresence>
            {!isZenMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-surface-container-lowest flex flex-col relative border-l border-outline-variant/10"
              >
                <div className="h-10 bg-surface-container flex items-center px-4 justify-between border-b border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
                    <span className="text-accent-orange font-black font-mono text-xs tracking-widest uppercase">OPPONENT</span>
                  </div>
                  <span className="text-meta">READ ONLY</span>
                </div>
                <div className="flex-1 relative bg-[#0E0E0E] opacity-70 pointer-events-none">
                  <Editor
                    height="100%"
                    language="javascript"
                    theme="vs-dark"
                    value={opponentCode}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, Fira Code, monospace',
                      readOnly: true,
                      padding: { top: 16 },
                      lineNumbers: 'on',
                    }}
                  />
                </div>
                {/* Opponent active indicator */}
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-12 right-4 flex items-center gap-1 text-accent-orange text-meta"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
                  TYPING
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VS divider */}
          {!isZenMode && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant/50 flex items-center justify-center">
                <span className="font-mono text-xs text-on-surface-variant font-bold">VS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
