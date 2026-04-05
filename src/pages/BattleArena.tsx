import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { socket } from '../socket';
import QuestionSelector from '../components/QuestionSelector';
import { useSpacetime } from '../spacetimeProvider';
import { Brain, Zap, AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

/* ─────────────────────────────────────────────── helpers ─── */
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/* ─────────────────────────────────────────────────────────── */
export default function BattleArena() {
  const { roomId: urlRoomId } = useParams<{ roomId: string }>();
  const navigate    = useNavigate();
  const conn = useSpacetime();

  /* ── actualRoomId: comes from socket 'match-found' event, NOT the URL
     URL stays '/arena/matchmaking' the whole time; real roomId is from server */
  const actualRoomId = useRef<string>('');

  /* Backend URL — Render in production, localhost in dev */
  const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

  /* ── phase: 'waiting' | 'searching' | 'picking' | 'battle' | 'ended' */
  const [phase, setPhase]               = useState<'waiting'|'searching'|'picking'|'battle'|'ended'>('waiting');
  const [searchSec, setSearchSec]       = useState(0);
  const [opponent, setOpponent]         = useState<{name:string}>({name:'???'});
  const [questionOptions, setQuestionOptions] = useState<any[]>([]);
  const [problem, setProblem]           = useState<any>(null);
  const [language, setLanguage]         = useState<'python' | 'javascript'>('python');
  const [code, setCode]                 = useState('');
  const [opponentCode, setOpponentCode] = useState('# Opponent is coding...\n');
  const [myProgress, setMyProgress]     = useState(0);
  const [oppProgress, setOppProgress]   = useState(0);
  const [timer, setTimer]               = useState(30 * 60);
  const [isTesting, setIsTesting]       = useState(false);
  const [testResults, setTestResults]   = useState<any[]>([]);
  const [gameResult, setGameResult]     = useState<{won:boolean;message:string}|null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const myName = useRef(`Player_${Math.floor(Math.random() * 9000) + 1000}`);

  /* ── AI Coach state ───────────────────────────────────────── */
  interface CoachHint {
    opponentApproach: string;
    myApproach: string;
    keyDifference: string;
    urgentTip: string;
    suggestions: string[];
    opponentLeading: boolean;
    threatLevel: 'low' | 'medium' | 'high';
  }
  const [coachHint, setCoachHint] = useState<CoachHint | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachOpen, setCoachOpen] = useState(true);
  const coachIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── powerups ─────────────────────────────────────────────── */
  const [hasFreeze, setHasFreeze] = useState(true);
  const [hasTestcaseDisable, setHasTestcaseDisable] = useState(true);
  const [hasBlur, setHasBlur] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);
  const [testcaseDisabled, setTestcaseDisabled] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [activePowerupAnim, setActivePowerupAnim] = useState<{type: string, byMe: boolean, userName?: string} | null>(null);

  /* ── is this a direct demo URL? ─────────────────────────── */
  const isDemoRoom = urlRoomId === 'demo';

  /* ── socket listeners ─────────────────────────────────────── */
  useEffect(() => {
    const onMatchFound = (data: any) => {
      // Store the real roomId from server (URL still says 'matchmaking')
      actualRoomId.current = data.roomId;
      setOpponent({ name: data.opponent?.name || 'Opponent' });
      // Don't set problem here — question selection comes next
    };

    const onQuestionOptions = (data: any) => {
      // Switch to picking phase and show the question selector
      setQuestionOptions(data.options || []);
      setPhase('picking');
    };

    const onFinalQuestion = (data: any) => {
      // Called by QuestionSelector once server resolves the choice
      setProblem(data.problem);
      if (code === '') setCode(data.problem?.starterCode || 'def solve():\n    pass\n');
    };

    const onRoomState = (state: any) => {
      setPhase('battle');
      if (state.problem) {
        setProblem(state.problem);
        if (code === '') setCode(state.problem.starterCode || 'def solve():\n    pass\n');
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
      sessionStorage.setItem('reviewData', JSON.stringify({
        winnerCode: data.winningCode,
        loserCode: data.loserCode,
        problemDescription: data.problemDescription || ''
      }));
      setPhase('ended');

      if (won && data.winnerIdentity && data.loserIdentity) {
         conn?.reducers.endMatch({ 
           matchId: actualRoomId.current, 
           codeUpdates: JSON.stringify({ winningCode: data.winningCode, loserCode: data.loserCode }),
           winnerId: data.winnerIdentity, 
           loserId: data.loserIdentity 
         });

         setTimeout(() => {
           if (timer >= 28 * 60) {
              conn?.reducers.grantBadge({ userIdentity: data.winnerIdentity, badgeId: 'fast_solver' });
           }
           conn?.reducers.grantBadge({ userIdentity: data.winnerIdentity, badgeId: 'first_win' });
         }, 500);
      }
    };

    const onPowerupActivated = (data: { type: string, userId: string, userName?: string }) => {
      const { type, userName } = data;
      setActivePowerupAnim({ type, byMe: false, userName });
      setTimeout(() => setActivePowerupAnim(null), 3000);

      if (type === 'freeze') {
        setIsFrozen(true);
        setTimeout(() => setIsFrozen(false), 10000);
      } else if (type === 'testcase') {
        setTestcaseDisabled(true);
        setTimeout(() => setTestcaseDisabled(false), 30000);
      } else if (type === 'blur') {
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 10000);
      }
    };

    socket.on('match-found', onMatchFound);
    socket.on('question-options', onQuestionOptions);
    socket.on('final-question', onFinalQuestion);
    socket.on('room-state', onRoomState);
    socket.on('opponent-code-update', onOpponentCode);
    socket.on('opponent-progress', onOpponentProgress);
    socket.on('game-end', onGameEnd);
    socket.on('powerup-activated', onPowerupActivated);

    return () => {
      socket.off('match-found', onMatchFound);
      socket.off('question-options', onQuestionOptions);
      socket.off('final-question', onFinalQuestion);
      socket.off('room-state', onRoomState);
      socket.off('opponent-code-update', onOpponentCode);
      socket.off('opponent-progress', onOpponentProgress);
      socket.off('game-end', onGameEnd);
      socket.off('powerup-activated', onPowerupActivated);
    };
  }, []);  // empty deps — listeners are set once on mount

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
    const h = setTimeout(() => socket.emit('code-update', { roomId: actualRoomId.current, code }), 300);
    return () => clearTimeout(h);
  }, [code, phase]);

  /* ── actions ──────────────────────────────────────────────── */
  const handleFindMatch = () => {
    setPhase('searching');
    setSearchSec(0);
    socket.emit('find-match', { name: myName.current, identity: localStorage.getItem('devduel_user_identity'), rating: 1500 });
  };

  const handleCancelSearch = () => {
    setPhase('waiting');
    setSearchSec(0);
    socket.emit('cancel-match');
  };

  const handleUsePowerup = (type: 'freeze' | 'testcase' | 'blur') => {
    if (phase !== 'battle') return;
    if (type === 'freeze' && !hasFreeze) return;
    if (type === 'testcase' && !hasTestcaseDisable) return;
    if (type === 'blur' && !hasBlur) return;

    if (type === 'freeze') setHasFreeze(false);
    if (type === 'testcase') setHasTestcaseDisable(false);
    if (type === 'blur') setHasBlur(false);

    socket.emit('use-powerup', { roomId: actualRoomId.current, type });
    setActivePowerupAnim({ type, byMe: true, userName: myName.current });
    setTimeout(() => setActivePowerupAnim(null), 3000);
  };

  const handleRunTests = async () => {
    if (!problem?.testCases) return;
    setIsTesting(true);
    setTestResults([]);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/execute`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, language, testCases: problem.testCases }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setTestResults([{ passed: false, actual: data.error || 'Server error', expected: '', input: '', stderr: 'Execution server failed to run your code.' }]);
        setIsTesting(false);
        return;
      }
      const results: any[] = data.results || [];
      setTestResults(results);
      const passed   = results.filter(r => r.passed).length;
      const progress = problem.testCases.length > 0 ? (passed / problem.testCases.length) * 100 : 0;
      setMyProgress(progress);
      socket.emit('test-progress', { roomId: actualRoomId.current, passedCount: passed, totalCount: problem.testCases.length });
    } catch (e) {
      setTestResults([{ passed: false, actual: 'Server unreachable.', expected: '', input: '' }]);
    }
    setIsTesting(false);
  };

  const handleSubmit = async () => {
    if (!problem?.testCases) return;
    setIsSubmitting(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/execute`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, language, testCases: problem.testCases }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setTestResults([{ passed: false, actual: data.error || 'Server error', expected: '', input: '', stderr: 'Execution server failed to run your code.' }]);
        setIsSubmitting(false);
        return;
      }
      const results: any[] = data.results || [];
      setTestResults(results);
      const passed   = results.filter(r => r.passed).length;
      const progress = problem.testCases.length > 0 ? (passed / problem.testCases.length) * 100 : 0;
      setMyProgress(progress);
      socket.emit('test-progress', { roomId: actualRoomId.current, passedCount: passed, totalCount: problem.testCases.length });
      if (data.success) {
        socket.emit('submit-code', { roomId: actualRoomId.current, code });
      }
    } catch (e) {
      alert('Execution server unreachable.');
    }
    setIsSubmitting(false);
  };

  const timerColor = timer < 300 ? 'text-red-400' : timer < 600 ? 'text-yellow-400' : 'text-emerald-400';

  /* ── AI Coach: fetch hint ─────────────────────────────────── */
  const fetchCoachHint = useCallback(async () => {
    if (phase !== 'battle') return;
    const oppCode = opponentCode.trim();
    const myCode = code.trim();
    if (oppCode.length < 20 || myCode.length < 5) return;
    setCoachLoading(true);
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myCode,
          opponentCode: oppCode,
          problemDescription: problem?.description || ''
        })
      });
      const data = await res.json();
      setCoachHint(data);
    } catch (e) {
      // silently fail — don't disrupt gameplay
    }
    setCoachLoading(false);
  }, [phase, opponentCode, code, problem]);

  /* ── AI Coach: poll every 30s during battle ───────────────── */
  useEffect(() => {
    if (phase !== 'battle') {
      if (coachIntervalRef.current) clearInterval(coachIntervalRef.current);
      return;
    }
    // Initial fetch after 10s to let both players write some code
    const initialTimer = setTimeout(() => fetchCoachHint(), 10000);
    coachIntervalRef.current = setInterval(() => fetchCoachHint(), 30000);
    return () => {
      clearTimeout(initialTimer);
      if (coachIntervalRef.current) clearInterval(coachIntervalRef.current);
    };
  }, [phase, fetchCoachHint]);

  /* ══════════════════════════════════════════════════════════════
     PHASE: WAITING  (direct demo URL or newly mounted)
  ══════════════════════════════════════════════════════════════ */
  if (phase === 'waiting' || phase === 'searching' || phase === 'picking') {
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

            {/* ── PHASE: PICKING — Question selector overlay ── */}
            {phase === 'picking' && questionOptions.length > 0 && (
              <QuestionSelector
                roomId={actualRoomId.current}
                options={questionOptions}
                opponentName={opponent.name}
                onFinalQuestion={(q) => {
                  setProblem(q);
                  setCode(q?.starterCode || 'def solve():\n    pass\n');
                  setPhase('battle');
                  setTimer(30 * 60);
                }}
              />
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
            onClick={() => navigate(`/review/${actualRoomId.current || urlRoomId}`)}
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

      {/* ── POWERUP OVERLAY ANIMATION ── */}
      {activePowerupAnim && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/50 backdrop-blur-md transition-all duration-300">
           {/* Epic 3D floating and scaling effect */}
           <div className={`
             flex flex-col items-center justify-center
             transform scale-150 animate-powerup-epic
             drop-shadow-[0_0_80px_rgba(255,255,255,0.4)]
             ${activePowerupAnim.type === 'freeze' ? 'text-blue-300' : 'text-purple-400'}
           `}>
              <div className="text-2xl md:text-3xl font-black mb-2 tracking-[0.2em] text-white opacity-90 slide-down-fade">
                {activePowerupAnim.byMe ? "YOU CAST" : `${activePowerupAnim.userName || "OPPONENT"} CAST`}
              </div>
              <div className={`
                text-7xl md:text-9xl font-black italic tracking-tighter uppercase
                border-[10px] rounded-3xl px-12 py-6
                shadow-[inset_0_0_50px_currentColor] 
                ${activePowerupAnim.type === 'freeze' ? 'border-blue-400 bg-blue-900/30 text-blue-200' : activePowerupAnim.type === 'blur' ? 'border-slate-500 bg-slate-900/40 text-slate-300' : 'border-purple-500 bg-purple-900/30 text-purple-200'}
                scale-up-elastic
              `}>
                {activePowerupAnim.type === 'freeze' ? '❄️ FREEZE ❄️' : activePowerupAnim.type === 'blur' ? '💨 SMOKE 💨' : '👁️ BLIND 👁️'}
              </div>
              <div className="mt-6 text-xl md:text-2xl text-white font-mono opacity-80 slide-up-fade">
                {activePowerupAnim.type === 'freeze' ? 'Opponent code editor locked (10s)' : activePowerupAnim.type === 'blur' ? 'Opponent code editor obscured (10s)' : 'Opponent test cases hidden (30s)'}
              </div>
           </div>
        </div>
      )}

      {phase === 'ended' && <GameOverOverlay />}      <AppNavbar />
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

            {/* ── POWERUPS TOOLBAR ── */}
            <div className="w-16 bg-surface-container shrink-0 border-r border-white/5 flex flex-col items-center py-4 gap-4 z-10 box-border overflow-y-auto code-editor-scrollbar">
              <div className="text-[10px] font-mono text-on-surface-variant uppercase transform -rotate-90 my-8 tracking-widest text-primary/60">
                Powerups
              </div>
              
              <button 
                onClick={() => handleUsePowerup('freeze')}
                disabled={!hasFreeze || phase !== 'battle'}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group shrink-0 ${
                  hasFreeze 
                    ? 'bg-surface hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                    : 'bg-surface text-on-surface-variant opacity-30 cursor-not-allowed border border-white/5'
                }`}
              >
                <div className="absolute left-14 hidden group-hover:flex whitespace-nowrap bg-surface-container-high px-2 py-1 rounded border border-white/10 text-[10px] font-mono shadow-xl z-50">
                  Freeze Opponent (10s)
                </div>
                <span className="material-symbols-outlined text-[20px]">ac_unit</span>
              </button>
              
              <button 
                onClick={() => handleUsePowerup('testcase')}
                disabled={!hasTestcaseDisable || phase !== 'battle'}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group shrink-0 ${
                  hasTestcaseDisable 
                    ? 'bg-surface hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                    : 'bg-surface text-on-surface-variant opacity-30 cursor-not-allowed border border-white/5'
                }`}
              >
                <div className="absolute left-14 hidden group-hover:flex whitespace-nowrap bg-surface-container-high px-2 py-1 rounded border border-white/10 text-[10px] font-mono shadow-xl z-50">
                  Blind Testcases (30s)
                </div>
                <span className="material-symbols-outlined text-[20px]">visibility_off</span>
              </button>

              <button 
                onClick={() => handleUsePowerup('blur')}
                disabled={!hasBlur || phase !== 'battle'}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group shrink-0 ${
                  hasBlur 
                    ? 'bg-surface hover:bg-slate-500/20 text-slate-400 border border-slate-500/30 shadow-[0_0_15px_rgba(100,116,139,0.3)]' 
                    : 'bg-surface text-on-surface-variant opacity-30 cursor-not-allowed border border-white/5'
                }`}
              >
                <div className="absolute left-14 hidden group-hover:flex whitespace-nowrap bg-surface-container-high px-2 py-1 rounded border border-white/10 text-[10px] font-mono shadow-xl z-50">
                  Smoke Grenade (10s)
                </div>
                <span className="material-symbols-outlined text-[20px]">smoke_free</span>
              </button>
            </div>

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
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="bg-transparent border border-white/10 rounded px-1 py-0.5 text-[11px] font-mono text-on-surface-variant outline-none cursor-pointer focus:border-primary/50"
                  title="Select Language"
                >
                  <option value="python" className="bg-surface">solution.py</option>
                  <option value="javascript" className="bg-surface">solution.js</option>
                </select>
                <div className="flex-1" />
                <span className="text-[10px] font-mono text-tertiary font-bold">{myName.current}</span>
              </div>

              <div className={`flex-1 relative ${isBlurred ? 'blur-[6px] pointer-events-none' : ''}`}>
                {isFrozen && (
                  <div className="absolute inset-0 z-[60] bg-blue-900/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none border-2 border-blue-500/50">
                    <div className="text-blue-400 font-black tracking-widest text-4xl animate-pulse drop-shadow-xl flex items-center gap-4">
                      <span className="material-symbols-outlined text-5xl">ac_unit</span>
                      FROZEN
                      <span className="material-symbols-outlined text-5xl">ac_unit</span>
                    </div>
                  </div>
                )}
                <Editor
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(v) => !isFrozen && setCode(v || '')}
                  options={{
                    readOnly: isFrozen,
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
                  disabled={isTesting || isSubmitting || phase !== 'battle' || testcaseDisabled}
                  className={`flex items-center gap-2 px-5 py-2 font-bold text-xs rounded-lg transition-all ${
                    testcaseDisabled 
                      ? 'bg-purple-900/40 text-purple-400 border border-purple-500/30' 
                      : 'bg-surface-container-highest text-on-surface hover:bg-surface-bright border border-transparent disabled:opacity-40'
                  }`}
                  title={testcaseDisabled ? "Opponent disabled your testcases!" : ""}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {testcaseDisabled ? 'visibility_off' : 'play_arrow'}
                  </span>
                  {isTesting ? 'Running...' : testcaseDisabled ? 'BLINDED (30s)' : 'Run Tests'}
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
                  <div key={i} className={`flex flex-col mb-3 pb-2 border-b border-white/5 ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    <div className="flex gap-2 items-start">
                      <span className="font-bold shrink-0">[{r.passed ? 'PASS' : 'FAIL'}]</span>
                      <span className="break-all whitespace-pre-wrap">
                        Test {i + 1}
                        {!r.passed && r.input && ` — Input: ${r.input}`}
                        {!r.passed && r.expected && ` → Expected: ${r.expected}`}
                        {!r.passed && r.actual && ` | Got: ${r.actual}`}
                      </span>
                    </div>
                    {r.stderr && (
                      <div className="mt-1 ml-10 text-red-500/90 font-mono text-[10px] whitespace-pre-wrap bg-red-950/30 p-2 rounded border border-red-500/20">
                        {r.stderr}
                      </div>
                    )}
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

            {/* ── OPPONENT EDITOR + AI COACH ── */}
            {/* ── OPPONENT EDITOR + AI COACH ── */}
            <section className="w-96 shrink-0 flex flex-col border-l border-white/5 h-full bg-[#0a0a0f]">
              {/* Opponent header */}
              <div className="h-9 bg-surface-container flex items-center px-4 gap-3 border-b border-white/5 shrink-0">
                <div className="flex gap-1 mr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <span className="text-[11px] font-mono text-on-surface-variant flex-1">opponent.py</span>
                <span className="text-[10px] font-mono text-primary font-bold">{opponent.name}</span>
                <div className="w-2 h-2 rounded-full bg-error animate-pulse shrink-0" title="Live" />
              </div>

              {/* ── AI COACH PANEL ── */}
              <div className="bg-[#0b0c14] flex flex-col overflow-hidden shrink-0 border-b border-white/5" style={{ minHeight: coachOpen ? '240px' : '36px', maxHeight: coachOpen ? '280px' : '36px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* Header */}
                <div
                  className="h-9 px-4 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors shrink-0 group"
                  onClick={() => setCoachOpen(o => !o)}
                >
                  <Brain size={12} className={`text-[#a78bfa] ${coachLoading ? 'animate-pulse' : ''}`} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a78bfa]/80 group-hover:text-[#a78bfa] transition-colors">AI Strategic Intelligence</span>
                  {coachHint && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-[4px] text-[7.5px] font-black uppercase ${
                      coachHint.threatLevel === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      coachHint.threatLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      TRT: {coachHint.threatLevel}
                    </span>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={(e) => { e.stopPropagation(); fetchCoachHint(); }}
                    disabled={coachLoading}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-[#a78bfa] transition-all disabled:opacity-30"
                  >
                    <RefreshCw size={9} className={coachLoading ? 'animate-spin' : ''} />
                  </button>
                </div>

                {/* Body */}
                {coachOpen && (
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 code-editor-scrollbar bg-black/20">
                    {!coachHint && !coachLoading && (
                      <div className="text-center py-6 opacity-40">
                         <p className="text-[9px] font-mono uppercase tracking-tighter">Initializing Neural Stream...</p>
                      </div>
                    )}
                    {coachLoading && !coachHint && (
                      <div className="text-center py-6 space-y-2">
                        <div className="flex justify-center gap-1">
                          {[0,1,2].map(i => (
                            <div key={i} className="w-1 h-1 rounded-full bg-[#a78bfa] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    {coachHint && (
                      <>
                        <div className="bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-lg p-2.5 shadow-inner">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Zap size={9} className="text-[#a78bfa]" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#a78bfa]">Critical Advice</span>
                          </div>
                          <p className="text-[10.5px] text-zinc-100/90 leading-relaxed font-medium">{coachHint.urgentTip}</p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">Threat Analysis</span>
                          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                             <p className="text-[10px] text-zinc-400 leading-tight italic">"{coachHint.keyDifference}"</p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                           {coachHint.suggestions?.slice(0, 5).map((s, i) => (
                             <div key={i} className="flex gap-2 items-center p-2 rounded-md bg-black/40 border border-white/5">
                               <div className="w-0.5 h-3 bg-primary/40 rounded-full shrink-0" />
                               <p className="text-[9.5px] text-zinc-500 font-medium leading-snug">{s}</p>
                             </div>
                           ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ── OPPONENT EDITOR ── */}
              <div className="flex-1 relative bg-[#08080c]">
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
                      Synchronizing...
                    </div>
                  }
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[9px] font-mono text-on-surface-variant/40 uppercase tracking-widest pointer-events-none border border-white/5">
                  Stream
                </div>
              </div>

              {/* ── OPPONENT STATS ── */}
              <div className="h-9 bg-surface-container-high border-t border-white/5 flex items-center px-4 gap-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-black text-on-surface-variant/40 uppercase">Lines</span>
                  <span className="text-[10px] font-mono text-on-surface">{opponentCode.split('\n').length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-black text-on-surface-variant/40 uppercase">Chars</span>
                  <span className="text-[10px] font-mono text-on-surface">{opponentCode.length}</span>
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-primary" />
                   <div className="text-[9px] font-mono text-primary/60 font-black uppercase">Active</div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
