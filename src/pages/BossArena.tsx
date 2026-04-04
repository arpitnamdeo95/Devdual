import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { BOSSES, type BossQuestion } from '../data/bosses';

export default function BossArena() {
  const { bossId } = useParams<{ bossId: string }>();
  const navigate = useNavigate();
  const boss = BOSSES.find((b) => b.id === bossId);

  // Fallback if boss not found
  useEffect(() => {
    if (!boss) navigate('/boss-select');
  }, [boss, navigate]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [failedQuestionsCount, setFailedQuestionsCount] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0); // For current question
  
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [phase, setPhase] = useState<'playing' | 'victory' | 'defeat'>('playing');

  const question: BossQuestion | undefined = boss?.questions[currentQuestionIndex];

  // Set initial code when question changes
  useEffect(() => {
    if (question) {
      setCode(question.starterCode);
      setTestResults([]);
      setWrongAttempts(0);
    }
  }, [currentQuestionIndex, question]);

  // Check victory / defeat conditions
  useEffect(() => {
    if (correctAnswersCount >= 3) {
      setPhase('victory');
    } else if (failedQuestionsCount >= 3) {
      setPhase('defeat');
    }
  }, [correctAnswersCount, failedQuestionsCount]);

  const handleSubmit = async () => {
    if (!question?.testCases || isSubmitting) return;
    setIsSubmitting(true);
    setTestResults([]);

    try {
      const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
      const res = await fetch(`${BACKEND_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, testCases: question.testCases }),
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setTestResults([{ passed: false, actual: data.error || 'Server error', expected: '', input: '', stderr: 'Execution server failed.' }]);
        setWrongAttempts(prev => prev + 1);
      } else {
        const results: any[] = data.results || [];
        setTestResults(results);
        const allPassed = results.every(r => r.passed);
        
        if (allPassed) {
          setTimeout(() => {
            setCorrectAnswersCount(prev => prev + 1);
            if (currentQuestionIndex < 4) {
              setCurrentQuestionIndex(prev => prev + 1);
            }
          }, 1500);
        } else {
          const newFails = wrongAttempts + 1;
          setWrongAttempts(newFails);
          if (newFails >= 3) {
            setTimeout(() => {
              setFailedQuestionsCount(prev => prev + 1);
              if (currentQuestionIndex < 4) {
                setCurrentQuestionIndex(prev => prev + 1);
              }
            }, 2000);
          }
        }
      }
    } catch (e) {
      setTestResults([{ passed: false, actual: 'Server unreachable.', expected: '', input: '' }]);
    }
    
    setIsSubmitting(false);
  };

  if (!boss || !question) return null;

  // HP Math
  // Boss HP drops when correctAnswers + 1
  const targetWinsToKill = 3;
  const bossHpPercent = Math.max(0, 100 - (correctAnswersCount / targetWinsToKill) * 100);
  
  // Player HP drops based on wrong attempts on the CURRENT question, resets to 100% per question.
  // Unless we want continuous player HP mapping to failedQuestionsCount. 
  // The prompt implies: "Player HP / progress bar (green)". Let's do Player HP = 3 wrong attempts max per question.
  const attemptsAllowed = 3;
  const playerHpPercent = Math.max(0, 100 - (wrongAttempts / attemptsAllowed) * 100);

  const GameOverOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-md">
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-12 text-center shadow-2xl max-w-md w-full mx-4 space-y-6">
        <div className={`text-6xl font-black tracking-tighter ${phase === 'victory' ? 'text-emerald-400' : 'text-red-500'}`}>
          {phase === 'victory' ? '🎉 BOSS DEFEATED' : '💀 YOU DIED'}
        </div>
        <p className="text-slate-400 font-mono text-sm leading-relaxed">
          {phase === 'victory' 
            ? `Outstanding! You successfully solved ${correctAnswersCount} challenges and vanquished ${boss.name}.`
            : `The ${boss.name} overwhelmed your logic. Review your fundamentals and try again.`}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate('/boss-select')}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold font-mono tracking-widest uppercase hover:bg-indigo-500 transition-colors"
          >
            Leave Arena
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-slate-200 font-body">
      {phase !== 'playing' && <GameOverOverlay />}
      <AppNavbar />
      
      <div className="flex flex-1 flex-row pt-16 w-full h-full overflow-hidden">
        <AppSidebar />

        <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* ── TOP BAR (GAME HUD) ── */}
          <div className="h-20 bg-[#1e293b] border-b border-slate-700/50 shrink-0 flex items-center px-8 gap-8 shadow-md z-10">
            {/* Boss Info */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-end font-mono text-[10px] tracking-widest uppercase text-slate-400">
                <span className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-lg bg-clip-text text-transparent bg-gradient-to-br ${boss.color}`}>{boss.icon}</span>
                  {boss.name}
                </span>
                <span className="text-red-400">HP {Math.round(bossHpPercent)}%</span>
              </div>
              <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] transition-all duration-700 ease-in-out" 
                  style={{ width: `${bossHpPercent}%` }}
                />
              </div>
            </div>

            <div className="text-center shrink-0 w-32 border-x border-slate-700/50 px-4">
               <div className="font-mono text-sm font-bold text-slate-300">Phase {currentQuestionIndex + 1} / 5</div>
               <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mt-1">
                 Scores: <span className="text-emerald-400">{correctAnswersCount}</span> - <span className="text-red-400">{failedQuestionsCount}</span>
               </div>
            </div>

            {/* Player Info */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-end font-mono text-[10px] tracking-widest uppercase text-slate-400">
                <span className="text-emerald-400">Integrity {Math.round(playerHpPercent)}%</span>
                <span>You</span>
              </div>
              <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex justify-end">
                <div 
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] transition-all duration-300 ease-in-out" 
                  style={{ width: `${playerHpPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* ── LEFT PANE: PROBLEM STATEMENT ── */}
            <aside className="w-[350px] shrink-0 bg-[#0f172a] border-r border-slate-700/50 overflow-y-auto px-6 py-6 custom-scrollbar">
               <div className="inline-block px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] uppercase tracking-widest font-bold mb-4 border border-indigo-500/20">
                 {question.difficulty}
               </div>
               <h2 className="text-xl font-bold text-white mb-6 font-headline">{question.title}</h2>
               
               <div className="space-y-6">
                 <div>
                   <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Objective</div>
                   <p className="text-sm text-slate-300 leading-relaxed">
                     {question.description}
                   </p>
                 </div>

                 {question.examples.length > 0 && (
                   <div>
                     <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Examples</div>
                     <div className="space-y-3">
                       {question.examples.map((ex, i) => (
                         <div key={i} className="bg-[#1e293b] rounded-lg p-3 border border-slate-700/50 font-mono text-xs space-y-1.5">
                           <div><span className="text-slate-500">Input:</span> <span className="text-indigo-300">{ex.input}</span></div>
                           <div><span className="text-slate-500">Output:</span> <span className="text-emerald-300">{ex.output}</span></div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {question.constraints.length > 0 && (
                   <div>
                     <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Constraints</div>
                     <ul className="space-y-1.5 list-none">
                       {question.constraints.map((c, i) => (
                         <li key={i} className="text-xs font-mono text-slate-400 flex gap-2">
                           <span className="text-indigo-500">-</span> {c}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
            </aside>

            {/* ── RIGHT PANE: EDITOR & CONSOLE ── */}
            <section className="flex-1 flex flex-col min-w-0">
               {/* Editor Header */}
               <div className="h-10 bg-[#1e293b] border-b border-slate-700/50 flex items-center px-4 gap-4 shrink-0">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-[#0f172a] border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-300 outline-none focus:border-indigo-500"
                  >
                    <option value="python">solution.py</option>
                    <option value="javascript">solution.js</option>
                  </select>
                  <div className="flex-1" />
                  <span className="font-mono text-xs text-slate-500 mr-2">Attempts: {wrongAttempts}/{attemptsAllowed}</span>
               </div>
               
               {/* Monaco Editor */}
               <div className="flex-1 bg-[#1e1e1e] relative">
                 <Editor
                   height="100%"
                   language={language}
                   theme="vs-dark"
                   value={code}
                   onChange={(v) => setCode(v || '')}
                   options={{
                     minimap: { enabled: false },
                     fontSize: 14,
                     fontFamily: '"JetBrains Mono", monospace',
                     scrollBeyondLastLine: false,
                     lineHeight: 22,
                     padding: { top: 16 },
                     hideCursorInOverviewRuler: true
                   }}
                 />
               </div>

               {/* Action Bar */}
               <div className="h-14 bg-[#1e293b] border-t border-slate-700/50 flex items-center justify-between px-6 shrink-0">
                  {wrongAttempts >= 3 ? (
                    <div className="text-red-400 flex items-center gap-2 font-mono text-xs">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Too many failed attempts. Moving to next phase...
                    </div>
                  ) : (
                    <div className="text-slate-400 font-mono text-xs">
                      {isSubmitting ? 'Validating solution...' : 'Ready for compilation'}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || wrongAttempts >= 3 || phase !== 'playing'}
                    className="px-6 py-2 bg-indigo-600 text-white font-mono font-bold text-xs uppercase tracking-widest rounded shadow-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                    Submit Code
                  </button>
               </div>

               {/* Console Box */}
               <div className="h-40 bg-[#020617] p-4 text-xs font-mono overflow-y-auto custom-scrollbar border-t border-slate-700/50 shrink-0">
                 <div className="text-slate-500 uppercase tracking-widest mb-3 text-[10px]">System Console</div>
                 
                 {testResults.length === 0 && !isSubmitting && (
                   <p className="text-slate-600">No output generated yet.</p>
                 )}
                 
                 {isSubmitting && (
                   <p className="text-indigo-400 animate-pulse">] Executing sequence against test matrix...</p>
                 )}

                 {testResults.map((r, i) => (
                   <div key={i} className={`mb-2 ${r.passed ? 'text-emerald-400/90' : 'text-red-400/90'}`}>
                     <span className="font-bold mr-2">[{r.passed ? '✓' : '✗'}]</span>
                     Test Case {i + 1}
                     {!r.passed && r.expected && ` -> Expected: ${r.expected} | Got: ${r.actual}`}
                     {r.stderr && <div className="mt-1 ml-6 text-red-500 text-[10px] bg-red-950/20 p-2 rounded">{r.stderr}</div>}
                   </div>
                 ))}

                 {testResults.length > 0 && testResults.every(r => r.passed) && (
                   <div className="mt-4 text-emerald-400 font-bold flex items-center gap-2 bg-emerald-900/20 p-2 rounded border border-emerald-900/50">
                     <span className="material-symbols-outlined text-[16px]">check_circle</span>
                     System bypassed. Prepare for next phase.
                   </div>
                 )}
               </div>

            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
