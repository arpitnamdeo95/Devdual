/**
 * QuestionSelector.tsx
 *
 * Shown after matchmaking, before the battle starts.
 * Both players see 3 difficulty cards; each picks one.
 * The server resolves the final question and emits 'final-question'.
 *
 * Props:
 *   roomId        – current socket room
 *   options       – array of 3 question summaries from server
 *   opponentName  – display name of opponent
 *   onFinalQuestion(question) – called when server resolves the pick
 */

import { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';

// ── Types ────────────────────────────────────────────────────────────────────
interface QuestionOption {
  id:         string;
  title:      string;
  difficulty: 'easy' | 'medium' | 'hard';
  points:     number;
  tags:       string[];
  description: string;
  examples:   { input: string; output: string }[];
}

interface Props {
  roomId:          string | undefined;
  options:         QuestionOption[];
  opponentName:    string;
  onFinalQuestion: (question: any) => void;
}

// ── Difficulty metadata ───────────────────────────────────────────────────────
const DIFFICULTY_META = {
  easy: {
    label:      'EASY',
    points:     2,
    color:      'emerald',
    glow:       'shadow-[0_0_24px_rgba(52,211,153,0.25)]',
    border:     'border-emerald-500/40',
    bg:         'bg-emerald-500/10',
    badgeBg:    'bg-emerald-500/20 text-emerald-400',
    btnClass:   'bg-emerald-500 hover:bg-emerald-400 text-black',
    ring:       'ring-emerald-500',
    barColor:   'bg-emerald-500',
  },
  medium: {
    label:      'MEDIUM',
    points:     3,
    color:      'yellow',
    glow:       'shadow-[0_0_24px_rgba(251,191,36,0.2)]',
    border:     'border-yellow-400/40',
    bg:         'bg-yellow-400/10',
    badgeBg:    'bg-yellow-400/20 text-yellow-400',
    btnClass:   'bg-yellow-400 hover:bg-yellow-300 text-black',
    ring:       'ring-yellow-400',
    barColor:   'bg-yellow-400',
  },
  hard: {
    label:      'HARD',
    points:     5,
    color:      'red',
    glow:       'shadow-[0_0_24px_rgba(248,113,113,0.25)]',
    border:     'border-red-500/40',
    bg:         'bg-red-500/10',
    badgeBg:    'bg-red-500/20 text-red-400',
    btnClass:   'bg-red-500 hover:bg-red-400 text-white',
    ring:       'ring-red-500',
    barColor:   'bg-red-500',
  },
} as const;

const TIMER_SECONDS = 15;

// ── Component ────────────────────────────────────────────────────────────────
export default function QuestionSelector({ roomId, options, opponentName, onFinalQuestion }: Props) {
  const [selected, setSelected]            = useState<string | null>(null);   // difficulty chosen by YOU
  const [opponentChose, setOpponentChose]  = useState(false);                 // did opponent select?
  const [timeLeft, setTimeLeft]            = useState(TIMER_SECONDS);
  const [resolving, setResolving]          = useState(false);                 // brief "Finalizing…" state
  const timerRef                           = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  // Auto-pick if timer hits 0 and player hasn't selected
  useEffect(() => {
    if (timeLeft === 0 && !selected) {
      const difficulties = ['easy', 'medium', 'hard'] as const;
      const random = difficulties[Math.floor(Math.random() * 3)];
      handleSelect(random);
    }
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Socket events ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onOpponentSelected = () => setOpponentChose(true);

    const onFinal = (data: { difficulty: string; problem: any }) => {
      setResolving(true);
      // Brief delay so user sees "Finalizing" feedback before arena opens
      setTimeout(() => onFinalQuestion(data.problem), 800);
    };

    socket.on('opponent-selected',   onOpponentSelected);
    socket.on('final-question',      onFinal);

    return () => {
      socket.off('opponent-selected', onOpponentSelected);
      socket.off('final-question',    onFinal);
    };
  }, [onFinalQuestion]);

  // ── Handle player selection ────────────────────────────────────────────────
  const handleSelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (selected || resolving) return; // prevent double-selection
    setSelected(difficulty);
    clearInterval(timerRef.current!);
    socket.emit('player-selected', { roomId, difficulty });
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const timerPct     = (timeLeft / TIMER_SECONDS) * 100;
  const timerUrgent  = timeLeft <= 5;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    /* Full-screen overlay — sits on top of the arena without modifying it */
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">

      {/* ── Top status bar ─────────────────────────────────────────────── */}
      <div className="w-full max-w-3xl mb-8 px-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
            Select Difficulty
          </div>
          <div className="flex items-center gap-3">
            {/* Opponent status */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${opponentChose ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse'}`} />
              <span className="text-[10px] font-mono text-on-surface-variant">
                {opponentChose ? `${opponentName} ready` : `${opponentName} choosing...`}
              </span>
            </div>
            {/* Timer */}
            <div className={`font-mono font-black text-sm tabular-nums ${
              timerUrgent ? 'text-red-400' : 'text-on-surface'
            }`}>
              {String(timeLeft).padStart(2, '0')}s
            </div>
          </div>
        </div>

        {/* Timer progress bar */}
        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${
              timerUrgent ? 'bg-red-400' : 'bg-primary'
            }`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      </div>

      {/* ── Heading ────────────────────────────────────────────────────── */}
      <div className="text-center mb-8 px-4">
        <h2 className="text-2xl font-black tracking-tighter text-on-surface">
          CHOOSE YOUR CHALLENGE
        </h2>
        <p className="text-xs font-mono text-on-surface-variant mt-1">
          Both players select a difficulty. Higher difficulty wins conflicts.
        </p>
      </div>

      {/* ── Question cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-3xl px-4">
        {options.map((q) => {
          const meta       = DIFFICULTY_META[q.difficulty];
          const isSelected = selected === q.difficulty;
          const isDisabled = !!selected || resolving;
          const isDimmed   = isDisabled && !isSelected;

          return (
            <div
              key={q.id}
              className={`
                relative flex flex-col rounded-xl border p-5 transition-all duration-300
                ${meta.border} ${meta.bg}
                ${isSelected ? `${meta.glow} ring-2 ${meta.ring} scale-[1.02]` : ''}
                ${isDimmed ? 'opacity-40 scale-[0.98]' : ''}
                ${!isDisabled ? 'cursor-pointer hover:scale-[1.02] hover:brightness-110' : 'cursor-default'}
              `}
              onClick={() => !isDisabled && handleSelect(q.difficulty)}
            >
              {/* Difficulty badge + points */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${meta.badgeBg}`}>
                  {meta.label}
                </span>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  +{q.points} pts
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-on-surface mb-2 leading-tight">
                {q.title}
              </h3>

              {/* Short description */}
              <p className="text-[11px] text-on-surface-variant/80 leading-relaxed flex-1 mb-4 line-clamp-3">
                {q.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {q.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 bg-surface-container-highest rounded text-[9px] font-mono text-on-surface-variant uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Example preview */}
              {q.examples[0] && (
                <div className="bg-black/30 rounded-lg p-2 font-mono text-[10px] mb-4 border border-white/5">
                  <div className="text-on-surface-variant">
                    In: <span className="text-primary/80">{q.examples[0].input}</span>
                  </div>
                  <div className="text-on-surface-variant">
                    Out: <span className="text-emerald-400">{q.examples[0].output}</span>
                  </div>
                </div>
              )}

              {/* Select button */}
              <button
                disabled={isDisabled}
                onClick={(e) => { e.stopPropagation(); handleSelect(q.difficulty); }}
                className={`
                  w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wider
                  transition-all duration-200 disabled:cursor-not-allowed
                  ${isSelected
                    ? `${meta.btnClass} opacity-100`
                    : `${meta.btnClass} ${isDimmed ? 'opacity-0' : 'opacity-90 hover:opacity-100'}`
                  }
                `}
              >
                {isSelected ? '✓ Selected' : 'Choose'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Bottom status ───────────────────────────────────────────────── */}
      <div className="mt-8 text-center">
        {resolving ? (
          <div className="flex items-center gap-2 text-primary font-mono text-sm animate-pulse">
            <span className="material-symbols-outlined text-lg">sync</span>
            Finalizing challenge...
          </div>
        ) : selected ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center text-on-surface font-mono text-sm">
              <span className="material-symbols-outlined text-lg text-emerald-400">check_circle</span>
              You chose <span className="font-bold uppercase ml-1">{selected}</span>
            </div>
            <p className="text-[11px] font-mono text-on-surface-variant">
              {opponentChose
                ? 'Both players ready — resolving...'
                : `Waiting for ${opponentName} to choose...`}
            </p>
          </div>
        ) : (
          <p className="text-[11px] font-mono text-on-surface-variant">
            Auto-selects randomly in {timeLeft}s if no choice made
          </p>
        )}
      </div>
    </div>
  );
}
