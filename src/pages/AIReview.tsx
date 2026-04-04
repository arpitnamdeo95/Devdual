import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────── types ─── */
interface CodeSmell {
  severity: 'warning' | 'info' | 'error';
  title: string;
  description: string;
  line: number | null;
}

interface Alternative {
  name: string;
  complexity: string;
  description: string;
  pseudocode: string;
}

interface ReviewData {
  timeComplexity: string;
  spaceComplexity: string;
  complexityExplanation: string;
  overallScore: number;
  codeSmells: CodeSmell[];
  strengths: string[];
  alternatives: Alternative[];
  summary: string;
}

/* ─────────────────────────────────────────── loading msg ─── */
const loadingMessages = [
  'Initializing neural analysis engine...',
  'Parsing abstract syntax tree...',
  'Calculating Big-O complexity...',
  'Scanning for anti-patterns & code smells...',
  'Evaluating algorithmic alternatives...',
  'Benchmarking against optimal solutions...',
  'Generating personalized coaching report...',
];

/* ─────────────────────────────────────────────── helpers ─── */
const scoreColor = (s: number) =>
  s >= 85 ? 'text-emerald-400' :
  s >= 65 ? 'text-yellow-400'  :
  s >= 40 ? 'text-orange-400'  : 'text-red-400';

const scoreGlow = (s: number) =>
  s >= 85 ? 'shadow-emerald-500/40' :
  s >= 65 ? 'shadow-yellow-500/40'  :
  s >= 40 ? 'shadow-orange-500/40'  : 'shadow-red-500/40';

const scoreBg = (s: number) =>
  s >= 85 ? 'from-emerald-500/20 to-emerald-900/10' :
  s >= 65 ? 'from-yellow-500/20 to-yellow-900/10'   :
  s >= 40 ? 'from-orange-500/20 to-orange-900/10'   : 'from-red-500/20 to-red-900/10';

const scoreLabel = (s: number) =>
  s >= 90 ? 'LEGENDARY' :
  s >= 80 ? 'EXCELLENT'  :
  s >= 65 ? 'PROFICIENT' :
  s >= 40 ? 'DEVELOPING' : 'NEEDS WORK';

const severityIcon = (s: string) =>
  s === 'error'   ? '🔴' :
  s === 'warning' ? '🟡' : '🔵';

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function AIReview() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Data passed from BattleArena game-over screen
  const state = (location.state || {}) as {
    code?: string;
    language?: string;
    problemTitle?: string;
    problemDescription?: string;
    myProgress?: number;
    oppProgress?: number;
    opponentName?: string;
    won?: boolean;
  };

  const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

  const [loading, setLoading]       = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [review, setReview]         = useState<ReviewData | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<'overview' | 'smells' | 'alternatives'>('overview');
  const [showCode, setShowCode]     = useState(false);

  /* ── loading ticker ─────────────────────────────────────── */
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingMessages.length - 1) return prev;
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(iv);
  }, [loading]);

  /* ── fetch AI review ────────────────────────────────────── */
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/ai-review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: state.code || 'def solve(nums, target):\n  for i in range(len(nums)):\n    for j in range(i+1, len(nums)):\n      if nums[i] + nums[j] == target:\n        return [i, j]\n  return []',
            language: state.language || 'python',
            problemTitle: state.problemTitle || 'Two Sum',
            problemDescription: state.problemDescription || '',
          }),
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setReview(data);
        }
      } catch (e: any) {
        setError('Failed to connect to AI analysis server.');
      }
      setLoading(false);
    };

    // Slight delay so loading animation plays
    const timer = setTimeout(fetchReview, 1500);
    return () => clearTimeout(timer);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     LOADING STATE
  ═══════════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body">
        <AppNavbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            {/* BG glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center space-y-8 px-6 max-w-lg">
              {/* Brain icon pulsing */}
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-4 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-surface-container border-2 border-primary/50 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-4xl">🧠</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-black tracking-tight text-on-surface">AI COACH ANALYSIS</h2>
                <div className="space-y-1.5">
                  {loadingMessages.map((msg, i) => (
                    <motion.div
                      key={msg}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i <= loadingStep ? 1 : 0.2, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`font-mono text-xs flex items-center gap-2 justify-center ${
                        i < loadingStep ? 'text-tertiary' :
                        i === loadingStep ? 'text-primary' : 'text-on-surface-variant/30'
                      }`}
                    >
                      {i < loadingStep ? (
                        <span className="text-tertiary">✓</span>
                      ) : i === loadingStep ? (
                        <span className="animate-spin">⟳</span>
                      ) : (
                        <span className="opacity-30">○</span>
                      )}
                      {msg}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     ERROR STATE
  ═══════════════════════════════════════════════════════════ */
  if (error && !review) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body">
        <AppNavbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4 max-w-md">
              <span className="text-5xl">⚠️</span>
              <h2 className="text-2xl font-black">Analysis Failed</h2>
              <p className="text-on-surface-variant font-mono text-sm">{error}</p>
              <button
                onClick={() => navigate('/app')}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold hover:brightness-110 transition-all"
              >
                Return to Lobby
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const score = review.overallScore;

  /* ═══════════════════════════════════════════════════════════
     MAIN REVIEW UI 
  ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <AppNavbar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                    state.won ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : 'bg-error/10 text-error border-error/20'
                  }`}>
                    {state.won ? 'VICTORY' : 'DEFEAT'}
                  </span>
                  <span className="text-zinc-500 font-mono text-xs">#{matchId?.slice(0, 8) || 'DEMO-001'}</span>
                  {state.problemTitle && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded border border-primary/20">
                      {state.problemTitle}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-on-surface flex items-center gap-3">
                  <span>🤖</span> AI Coach Report
                </h1>
                <p className="text-on-surface-variant font-mono text-xs mt-1 max-w-xl">
                  Powered by Gemini AI — analyzing your code for complexity, quality, and growth opportunities
                </p>
              </div>
              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high transition-all border border-white/5"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Lobby
              </button>
            </div>

            {/* ── TOP CARDS: Score + Complexity ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* SCORE CARD */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-gradient-to-br ${scoreBg(score)} rounded-xl p-6 border border-white/5 text-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-3">Overall Score</div>
                <div className={`text-6xl font-black tabular-nums ${scoreColor(score)} drop-shadow-lg`}>
                  {score}
                </div>
                <div className={`text-xs font-black tracking-[0.3em] uppercase mt-1 ${scoreColor(score)}`}>
                  {scoreLabel(score)}
                </div>
                <div className={`mt-3 w-full h-1.5 bg-black/20 rounded-full overflow-hidden`}>
                  <motion.div
                    className={`h-full rounded-full ${
                      score >= 85 ? 'bg-emerald-400' :
                      score >= 65 ? 'bg-yellow-400'  :
                      score >= 40 ? 'bg-orange-400'  : 'bg-red-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </motion.div>

              {/* COMPLEXITY CARD */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface-container-low rounded-xl p-6 border border-white/5"
              >
                <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-4">Complexity Analysis</div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">schedule</span> Time
                      </span>
                      <span className="text-lg font-mono font-black text-primary">{review.timeComplexity}</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-primary h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-tertiary">memory</span> Space
                      </span>
                      <span className="text-lg font-mono font-black text-tertiary">{review.spaceComplexity}</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-tertiary h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-[11px] text-zinc-500 leading-relaxed italic border-t border-white/5 pt-3">
                  {review.complexityExplanation}
                </p>
              </motion.div>

              {/* MATCH CONTEXT CARD */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-surface-container-low rounded-xl p-6 border border-white/5"
              >
                <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-4">Match Summary</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Your Score</span>
                    <span className="font-mono font-bold text-tertiary">{Math.round(state.myProgress || 0)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Opponent</span>
                    <span className="font-mono font-bold text-primary">{Math.round(state.oppProgress || 0)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">vs</span>
                    <span className="font-mono font-bold text-on-surface text-sm">{state.opponentName || 'Opponent'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Language</span>
                    <span className="font-mono font-bold text-on-surface uppercase text-sm">{state.language || 'python'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="mt-4 w-full py-2 bg-surface-container text-on-surface-variant rounded-lg text-[11px] font-mono font-bold hover:bg-surface-container-high transition-all border border-white/5"
                >
                  {showCode ? '▾ Hide Submitted Code' : '▸ View Submitted Code'}
                </button>
              </motion.div>
            </div>

            {/* ── CODE VIEWER (collapsible) ── */}
            <AnimatePresence>
              {showCode && state.code && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#0d1117] rounded-xl border border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-surface-container border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        </div>
                        <span className="font-mono text-[11px] text-on-surface-variant">
                          solution.{state.language === 'javascript' ? 'js' : 'py'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-on-surface-variant/50">YOUR SUBMISSION</span>
                    </div>
                    <pre className="p-4 font-mono text-[12px] leading-relaxed text-on-surface/90 overflow-x-auto max-h-80 code-editor-scrollbar">
                      {state.code.split('\n').map((line, i) => (
                        <div key={i} className="flex hover:bg-white/5 transition-colors">
                          <span className="w-10 text-right pr-4 text-zinc-700 select-none shrink-0">{i + 1}</span>
                          <span className="flex-1">{line || ' '}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── AI SUMMARY BANNER ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-primary/10 via-surface-container-low to-tertiary/10 rounded-xl p-5 border border-white/5 flex items-start gap-4"
            >
              <span className="text-3xl shrink-0 mt-0.5">🎯</span>
              <div>
                <div className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold mb-1">Coach's Summary</div>
                <p className="text-sm text-on-surface/90 leading-relaxed">{review.summary}</p>
              </div>
            </motion.div>

            {/* ── TAB NAVIGATION ── */}
            <div className="flex gap-1 bg-surface-container rounded-lg p-1 w-fit">
              {(['overview', 'smells', 'alternatives'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-md text-xs font-bold tracking-wide transition-all ${
                    activeTab === tab
                      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {tab === 'overview' ? '💪 Strengths' :
                   tab === 'smells'   ? '🔍 Code Smells' :
                                        '🚀 Next-Level Strategies'}
                </button>
              ))}
            </div>

            {/* ── TAB CONTENT ── */}
            <AnimatePresence mode="wait">

              {/* STRENGTHS TAB */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {review.strengths.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-surface-container-low rounded-xl p-5 border border-tertiary/10 hover:border-tertiary/30 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0 group-hover:bg-tertiary/20 transition-colors">
                          <span className="text-tertiary text-sm">✓</span>
                        </div>
                        <p className="text-sm text-on-surface/90 leading-relaxed">{s}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* CODE SMELLS TAB */}
              {activeTab === 'smells' && (
                <motion.div
                  key="smells"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {review.codeSmells.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant font-mono text-sm">
                      <span className="text-4xl block mb-3">✨</span>
                      No code smells detected — clean code!
                    </div>
                  ) : review.codeSmells.map((smell, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-surface-container-low rounded-xl p-5 border-l-4 ${
                        smell.severity === 'error'   ? 'border-red-500'    :
                        smell.severity === 'warning' ? 'border-yellow-500' : 'border-blue-500'
                      } border border-white/5`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg shrink-0">{severityIcon(smell.severity)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm text-on-surface">{smell.title}</h4>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              smell.severity === 'error'   ? 'bg-red-500/10 text-red-400'    :
                              smell.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {smell.severity}
                            </span>
                            {smell.line && (
                              <span className="font-mono text-[10px] text-on-surface-variant/50">Line {smell.line}</span>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{smell.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* ALTERNATIVES TAB */}
              {activeTab === 'alternatives' && (
                <motion.div
                  key="alternatives"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {review.alternatives.map((alt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="bg-surface-container-low rounded-xl overflow-hidden border border-white/5"
                    >
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="text-xl">⚡</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface">{alt.name}</h4>
                            <span className="font-mono text-xs text-primary font-bold">{alt.complexity}</span>
                          </div>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{alt.description}</p>
                      </div>
                      {alt.pseudocode && (
                        <div className="bg-[#0d1117] border-t border-white/5 p-4">
                          <div className="text-[10px] font-mono text-on-surface-variant/50 uppercase tracking-widest mb-2">Pseudocode</div>
                          <pre className="font-mono text-[12px] text-primary/80 leading-relaxed whitespace-pre-wrap">{alt.pseudocode}</pre>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── BOTTOM CTA ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4 pt-4 pb-8"
            >
              <button
                onClick={() => navigate('/app')}
                className="flex-1 py-4 bg-gradient-to-b from-primary to-primary-container text-on-primary rounded-xl font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">swords</span>
                REMATCH — FIND OPPONENT
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="py-4 px-6 bg-surface-container text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container-high transition-all border border-white/5"
              >
                View Profile
              </button>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
}
