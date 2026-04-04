import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { socket } from '../socket';

/* ─────────────────────────────────────────────── helpers ─── */
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/* ─────────────────────────────────────────────────────────── */
export default function BattleArena() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate    = useNavigate();

  /* ── phase: 'waiting' | 'searching' | 'battle' | 'ended' */
  const [phase, setPhase]               = useState<'waiting'|'searching'|'battle'|'ended'>('waiting');
  const [searchSec, setSearchSec]       = useState(0);
  const [opponent, setOpponent]         = useState<{name:string}>({name:'???'});
  const [problem, setProblem]           = useState<any>(null);
  const [code, setCode]                 = useState('def solve():\n    pass\n');
  const [opponentCode, setOpponentCode] = useState('# Opponent is coding...\n');
  const [myProgress, setMyProgress]     = useState(0);
  const [oppProgress, setOppProgress]   = useState(0);
  const [timer, setTimer]               = useState(30 * 60);
  const [isTesting, setIsTesting]       = useState(false);
  const [testResults, setTestResults]   = useState<any[]>([]);
  const [gameResult, setGameResult]     = useState<{won:boolean;message:string}|null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const myName = useRef(`Player_${Math.floor(Math.random() * 9000) + 1000}`);

  /* ── is this a "direct entry" demo URL? ─────────────────── */
  const isDemoRoom = roomId === 'demo';

  /* ── socket listeners ─────────────────────────────────────── */
  useEffect(() => {
    // If we came here via matchmaking (non-demo), join the room immediately
    if (!isDemoRoom && roomId) {
      socket.emit('join-room', { roomId, isSpectator: false });
    }

    const onMatchFound = (data: any) => {
      setOpponent({ name: data.opponent?.name || 'Opponent' });
      setProblem(data.problem);
      setCode(data.problem?.starterCode || 'def solve():\n    pass\n');
      setPhase('battle');
      setTimer(30 * 60);
    };

    const onRoomState = (state: any) => {
      setPhase('battle');
      if (state.problem) {
        setProblem(state.problem);
        setCode(state.problem.starterCode || 'def solve():\n    pass\n');
      }
      if (state.players) {
        const opp = state.players.find((p: any) => p.id !== socket.id);
        if (opp) setOpponent({ name: opp.name || 'Opponent' });
      }
    };

    const onOpponentCode = (data: any) => {
      setOpponentCode(data.code || '');
    };

    const onOpponentProgress = (data: any) => {
      setOppProgress(data.progress || 0);
    };

    const onGameEnd = (data: any) => {
      const won = data.winnerId === socket.id;
      setGameResult({ won, message: won ? '🏆 YOU WIN!' : '💀 YOU LOST' });
      setPhase('ended');
    };

    socket.on('match-found', onMatchFound);
    socket.on('room-state', onRoomState);
    socket.on('opponent-code-update', onOpponentCode);
    socket.on('opponent-progress', onOpponentProgress);
    socket.on('game-end', onGameEnd);

    return () => {
      socket.off('match-found', onMatchFound);
      socket.off('room-state', onRoomState);
      socket.off('opponent-code-update', onOpponentCode);
      socket.off('opponent-progress', onOpponentProgress);
      socket.off('game-end', onGameEnd);
    };
  }, [roomId, isDemoRoom]);

  /* ── search timer ─────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'searching') return;
    const iv = setInterval(() => setSearchSec(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  /* ── countdown timer ──────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'battle') return;
    const iv = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  /* ── broadcast code changes (debounced) ───────────────────── */
  useEffect(() => {
    if (phase !== 'battle') return;
    const h = setTimeout(() => socket.emit('code-update', { roomId, code }), 300);
    return () => clearTimeout(h);
  }, [code, roomId, phase]);

  /* ── actions ──────────────────────────────────────────────── */
  const handleFindMatch = () => {
    setPhase('searching');
    setSearchSec(0);
    socket.emit('find-match', { name: myName.current, rating: 1500 });
  };

  const handleCancelSearch = () => {
    setPhase('waiting');
    setSearchSec(0);
    socket.emit('cancel-match');
  };

  const handleRunTests = async () => {
    if (!problem?.testCases) return;
    setIsTesting(true);
    setTestResults([]);
    try {
      const res  = await fetch('http://localhost:4000/api/execute', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, testCases: problem.testCases }),
      });
      const data = await res.json();
      const results: any[] = data.results || [];
      setTestResults(results);
      const passed   = results.filter(r => r.passed).length;
      const progress = problem.testCases.length > 0 ? (passed / problem.testCases.length) * 100 : 0;
      setMyProgress(progress);
      socket.emit('test-progress', { roomId, passedCount: passed, totalCount: problem.testCases.length });
    } catch (e) {
      setTestResults([{ passed: false, actual: 'Server unreachable.', expected: '', input: '' }]);
    }
    setIsTesting(false);
  };

  const handleSubmit = async () => {
    if (!problem?.testCases) return;
    setIsSubmitting(true);
    try {
      const res  = await fetch('http://localhost:4000/api/execute', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, testCases: problem.testCases }),
      });
      const data = await res.json();
      const results: any[] = data.results || [];
      setTestResults(results);
      const passed   = results.filter(r => r.passed).length;
      const progress = problem.testCases.length > 0 ? (passed / problem.testCases.length) * 100 : 0;
      setMyProgress(progress);
      socket.emit('test-progress', { roomId, passedCount: passed, totalCount: problem.testCases.length });
      if (data.success) {
        socket.emit('submit-code', { roomId, code });
      } else {
        alert(`Only ${passed}/${problem.testCases.length} test cases passed. Fix your solution!`);
      }
    } catch (e) {
      alert('Execution server unreachable. Is the backend running?');
    }
    setIsSubmitting(false);
  };

  const timerColor = timer < 300 ? 'text-red-400' : timer < 600 ? 'text-yellow-400' : 'text-emerald-400';

  /* ══════════════════════════════════════════════════════════════
     PHASE: WAITING  (direct demo URL or newly mounted)
  ══════════════════════════════════════════════════════════════ */
  if (phase === 'waiting' || phase === 'searching') {
    return (
      <div className="h-screen flex flex-col bg-background text-on-surface font-body">
        <AppNavbar />
        <div className="flex flex-1 flex-row pt-16 w-full overflow-hidden">
          <AppSidebar />
          <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">

            {/* BG glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-tertiary/5 rounded-full blur-[100px]" />
            </div>

            {phase === 'waiting' ? (
              /* ── IDLE STATE ── */
              <div className="relative z-10 text-center space-y-8 px-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[11px] font-mono text-primary tracking-widest uppercase">Ranked Queue</span>
                  </div>
                  <h1 className="text-5xl font-black tracking-tighter text-on-surface">
                    FIND YOUR<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">OPPONENT</span>
                  </h1>
                  <p className="text-on-surface-variant font-mono text-sm max-w-md mx-auto leading-relaxed">
                    Enter the queue to be matched with an opponent at your skill level. You will both receive the same DSA problem.
                  </p>
                </div>

                {/* Stats row */}
                <div className="flex justify-center gap-8">
                  {[
                    { label: 'Players Online', val: '142' },
                    { label: 'In Queue', val: '23' },
                    { label: 'Avg Wait', val: '~12s' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className="text-2xl font-black text-primary">{s.val}</div>
                      <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">{s.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleFindMatch}
                  className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-b from-primary to-primary-container text-on-primary font-black text-lg rounded-xl shadow-2xl shadow-primary/30 hover:brightness-110 hover:scale-105 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-2xl">swords</span>
                  FIND MATCH
                  <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <p className="text-[11px] text-on-surface-variant font-mono">
                  You will play as <span className="text-primary font-bold">{myName.current}</span>
                </p>
              </div>
            ) : (
              /* ── SEARCHING STATE ── */
              <div className="relative z-10 text-center space-y-8 px-6">
                {/* Pulsing radar animation */}
                <div className="relative mx-auto w-40 h-40">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-full border border-primary/40 animate-ping"
                      style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2s' }}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-4xl">radar</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tight text-on-surface">SCANNING...</h2>
                  <p className="text-on-surface-variant font-mono text-sm">Searching for an opponent in the ranked queue</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <span className="px-3 py-1 rounded-full bg-surface-container border border-white/10 font-mono text-sm text-primary">
                      {fmt(searchSec)} elapsed
                    </span>
                    <span className="px-3 py-1 rounded-full bg-surface-container border border-white/10 font-mono text-sm text-on-surface-variant">
                      {myName.current}
                    </span>
                  </div>
                </div>

                {/* Animated dots bar */}
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleCancelSearch}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-error/20 text-error border border-error/30 rounded-lg font-bold text-sm hover:bg-error/30 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                  CANCEL SEARCH
                </button>

                <p className="text-[11px] text-on-surface-variant font-mono opacity-60">
                  Tip: Open a 2nd browser tab and click "Find Match" to test 1v1 instantly
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     PHASE: ENDED  — game over overlay on top of arena
  ══════════════════════════════════════════════════════════════ */
  const GameOverOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface-container-low border border-white/10 rounded-2xl p-12 text-center shadow-2xl max-w-md w-full mx-4 space-y-6">
        <div className={`text-6xl font-black tracking-tighter ${gameResult?.won ? 'text-tertiary' : 'text-error'}`}>
          {gameResult?.won ? '🏆 VICTORY' : '💀 DEFEATED'}
        </div>
        <div className="space-y-2">
          <p className="text-on-surface-variant font-mono text-sm">
            {gameResult?.won
              ? 'You submitted the correct solution first!'
              : `${opponent.name} solved it before you.`}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-surface-container rounded-lg p-3">
              <div className="text-xs font-mono text-on-surface-variant uppercase">Your Score</div>
              <div className="text-2xl font-black text-tertiary">{Math.round(myProgress)}%</div>
            </div>
            <div className="bg-surface-container rounded-lg p-3">
              <div className="text-xs font-mono text-on-surface-variant uppercase">Opponent</div>
              <div className="text-2xl font-black text-primary">{Math.round(oppProgress)}%</div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/app')}
            className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold hover:brightness-110 transition-all"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate(`/review/${roomId}`)}
            className="flex-1 py-3 bg-surface-container-high text-on-surface rounded-xl font-bold hover:bg-surface-bright transition-all border border-white/10"
          >
            View Review
          </button>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     PHASE: BATTLE  — full 1v1 arena
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">

      {phase === 'ended' && <GameOverOverlay />}

      <AppNavbar />
      <div className="flex flex-1 flex-row pt-16 w-full h-full overflow-hidden">
        <AppSidebar />

        <main className="flex-1 flex flex-col overflow-hidden">

          {/* ── TOP STATUS BAR ── */}
          <div className="h-14 bg-surface-container border-b border-white/5 flex items-center px-6 gap-6 shrink-0">
            {/* Problem title */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded bg-error-container text-error text-[9px] font-bold shrink-0">LIVE</span>
              <h1 className="text-sm font-bold tracking-tight truncate">
                {problem?.title || 'Loading problem...'}
              </h1>
              {problem?.difficulty && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  problem.difficulty === 'Easy' ? 'bg-emerald-900/40 text-emerald-400' :
                  problem.difficulty === 'Hard' ? 'bg-red-900/40 text-red-400' :
                  'bg-blue-900/40 text-blue-400'
                }`}>{problem.difficulty}</span>
              )}
            </div>

            <div className="flex-1" />

            {/* Timer */}
            <div className={`font-mono font-black text-xl ${timerColor} shrink-0`}>
              {fmt(timer)}
            </div>

            {/* VS badge */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xs font-bold text-tertiary">{myName.current}</div>
                <div className="text-[10px] font-mono text-on-surface-variant">YOU</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-primary to-tertiary flex items-center justify-center text-[10px] font-black text-on-primary">
                VS
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-primary">{opponent.name}</div>
                <div className="text-[10px] font-mono text-on-surface-variant">OPPONENT</div>
              </div>
            </div>
          </div>

          {/* ── PROGRESS BARS ── */}
          <div className="grid grid-cols-2 border-b border-white/5 shrink-0">
            <div className="p-3 bg-surface border-r border-white/5">
              <div className="flex justify-between text-[10px] font-mono mb-1.5">
                <span className="text-on-surface-variant uppercase">Your Progress</span>
                <span className="text-tertiary font-bold">{Math.round(myProgress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-tertiary transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(78,222,163,0.6)]"
                  style={{ width: `${myProgress}%` }}
                />
              </div>
            </div>
            <div className="p-3 bg-surface">
              <div className="flex justify-between text-[10px] font-mono mb-1.5">
                <span className="text-on-surface-variant uppercase">Opponent Progress</span>
                <span className="text-primary font-bold">{Math.round(oppProgress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(77,142,255,0.6)]"
                  style={{ width: `${oppProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── MAIN BODY: Problem | My Editor | Opponent Editor ── */}
          <div className="flex-1 flex overflow-hidden">

            {/* ── PROBLEM PANEL ── */}
            <aside className="w-72 shrink-0 bg-surface-container-low border-r border-white/5 overflow-y-auto code-editor-scrollbar">
              <div className="p-5 space-y-5">
                <div>
                  <div className="text-[10px] font-mono text-primary tracking-widest uppercase mb-2">Description</div>
                  <p className="text-sm text-on-surface/90 leading-relaxed">
                    {problem?.description || 'Waiting for server...'}
                  </p>
                </div>

                {problem?.constraints?.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase mb-2">Constraints</div>
                    <ul className="space-y-1.5">
                      {problem.constraints.map((c: string, i: number) => (
                        <li key={i} className="flex gap-2 text-[12px] font-mono text-on-surface">
                          <span className="text-primary-container shrink-0">›</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {problem?.examples?.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase mb-2">Examples</div>
                    {problem.examples.map((ex: any, i: number) => (
                      <div key={i} className="bg-surface-container-highest rounded-lg p-3 font-mono text-[11px] mb-2 border border-white/5">
                        <div className="text-on-surface-variant mb-1">Input: <span className="text-primary/90">{ex.input}</span></div>
                        <div className="text-on-surface-variant">Output: <span className="text-tertiary">{ex.output}</span></div>
                      </div>
                    ))}
                  </div>
                )}

                {problem?.testCases?.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase mb-2">
                      Test Cases ({problem.testCases.length} total, hidden)
                    </div>
                    <div className="text-[11px] font-mono text-on-surface-variant bg-surface-container rounded-lg p-3 border border-white/5">
                      {problem.testCases.length} test case{problem.testCases.length > 1 ? 's' : ''} will be run on your solution.
                      All must pass to win.
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* ── MY EDITOR ── */}
            <section className="flex-1 flex flex-col border-r border-white/5 min-w-0">
              {/* Editor tab bar */}
              <div className="h-9 bg-surface-container flex items-center px-4 gap-3 border-b border-white/5 shrink-0">
                <div className="flex gap-1 mr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[11px] font-mono text-on-surface-variant">solution.py</span>
                <div className="flex-1" />
                <span className="text-[10px] font-mono text-tertiary font-bold">{myName.current}</span>
              </div>

              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={code}
                  onChange={(v) => setCode(v || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    scrollBeyondLastLine: false,
                    lineHeight: 22,
                    padding: { top: 12 },
                    renderLineHighlight: 'all',
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                  }}
                  loading={
                    <div className="flex h-full items-center justify-center text-zinc-500 font-mono text-xs">
                      INITIALIZING KERNEL...
                    </div>
                  }
                />
              </div>

              {/* ── ACTION BAR ── */}
              <div className="h-12 bg-surface-container-high border-t border-white/5 flex items-center gap-3 px-4 shrink-0">
                <button
                  onClick={handleRunTests}
                  disabled={isTesting || isSubmitting || phase !== 'battle'}
                  className="flex items-center gap-2 px-5 py-2 bg-surface-container-highest text-on-surface font-bold text-xs rounded-lg hover:bg-surface-bright disabled:opacity-40 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  {isTesting ? 'Running...' : 'Run Tests'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isTesting || isSubmitting || phase !== 'battle'}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-primary to-primary-container text-on-primary font-bold text-xs rounded-lg hover:brightness-110 disabled:opacity-40 transition-all shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-[16px]">publish</span>
                  {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                </button>
              </div>

              {/* ── CONSOLE OUTPUT ── */}
              <div className="h-32 bg-[#0d1117] border-t border-white/5 overflow-y-auto code-editor-scrollbar p-3 font-mono text-[11px] shrink-0">
                <div className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest mb-2">Console Output</div>
                {isTesting && (
                  <p className="text-primary animate-pulse">[RUNNING] Executing against Piston API...</p>
                )}
                {isSubmitting && (
                  <p className="text-yellow-400 animate-pulse">[SUBMITTING] Validating all test cases...</p>
                )}
                {!isTesting && !isSubmitting && testResults.length === 0 && (
                  <p className="text-on-surface-variant/40">Click "Run Tests" to see output here.</p>
                )}
                {testResults.map((r, i) => (
                  <div key={i} className={`flex gap-2 items-start mb-1 ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    <span className="font-bold">[{r.passed ? 'PASS' : 'FAIL'}]</span>
                    <span>
                      Test {i + 1}
                      {!r.passed && r.input && ` — Input: ${r.input}`}
                      {!r.passed && r.expected && ` → Expected: ${r.expected}`}
                      {!r.passed && r.actual && ` | Got: ${r.actual}`}
                    </span>
                  </div>
                ))}
                {testResults.length > 0 && (
                  <div className={`mt-2 font-bold text-[11px] ${
                    testResults.every(r => r.passed) ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {testResults.filter(r => r.passed).length}/{testResults.length} passed
                    {testResults.every(r => r.passed) ? ' ✓ Ready to Submit!' : ' — Keep working!'}
                  </div>
                )}
              </div>
            </section>

            {/* ── OPPONENT EDITOR (read-only live feed) ── */}
            <section className="w-80 shrink-0 flex flex-col border-l border-white/5">
              {/* Opponent header */}
              <div className="h-9 bg-surface-container flex items-center px-4 gap-3 border-b border-white/5 shrink-0">
                <div className="flex gap-1 mr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <span className="text-[11px] font-mono text-on-surface-variant flex-1">opponent.py</span>
                <span className="text-[10px] font-mono text-primary font-bold">{opponent.name}</span>
                <span className="w-2 h-2 rounded-full bg-error animate-pulse shrink-0" title="Live" />
              </div>

              <div className="flex-1 relative bg-[#0d0d12]">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={opponentCode}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 11,
                    fontFamily: '"JetBrains Mono", monospace',
                    scrollBeyondLastLine: false,
                    lineHeight: 20,
                    padding: { top: 8 },
                    renderLineHighlight: 'none',
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    occurrencesHighlight: 'off',
                  }}
                  loading={
                    <div className="flex h-full items-center justify-center text-zinc-600 font-mono text-xs">
                      Waiting for opponent...
                    </div>
                  }
                />
                {/* Overlay label */}
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[9px] font-mono text-on-surface-variant/60 uppercase tracking-widest pointer-events-none">
                  Read Only
                </div>
              </div>

              {/* Opponent stats */}
              <div className="h-12 bg-surface-container-high border-t border-white/5 flex items-center px-4 gap-4 shrink-0">
                <div>
                  <div className="text-[9px] font-mono text-on-surface-variant uppercase">Lines</div>
                  <div className="text-xs font-mono text-on-surface">{opponentCode.split('\n').length}</div>
                </div>
                <div>
                  <div className="text-[9px] font-mono text-on-surface-variant uppercase">Characters</div>
                  <div className="text-xs font-mono text-on-surface">{opponentCode.length}</div>
                </div>
                <div className="flex-1" />
                <div className="text-[9px] font-mono text-primary/60 uppercase animate-pulse">
                  Live Feed
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
