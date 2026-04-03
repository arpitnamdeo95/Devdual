import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';

/* ──── Syntax highlighted code by simple keyword rules ──── */
const TOKEN_MAP: Record<string, string> = {
  'function': '#569cd6',
  'const': '#569cd6',
  'return': '#c586c0',
  'Math': '#4ec9b0',
  'pow': '#dcdcaa',
  'round': '#dcdcaa',
  'async': '#569cd6',
  'await': '#569cd6',
  'export': '#569cd6',
  'let': '#569cd6',
  'var': '#569cd6',
  '//.+': '#6a9955',
};

function colorize(text: string): React.ReactNode[] {
  return text.split('\n').map((line, i) => {
    // Comment line
    if (line.trimStart().startsWith('//')) {
      return (
        <div key={i} style={{ color: '#6a9955' }}>
          {line}
        </div>
      );
    }


    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    const keywords = Object.keys(TOKEN_MAP).filter(k => !k.startsWith('/'));
    let idx = 0;

    while (remaining.length > 0) {
      let found = false;
      for (const kw of keywords) {
        const kwIdx = remaining.indexOf(kw);
        if (kwIdx === 0 || (kwIdx > 0 && !/[a-zA-Z0-9_$]/.test(remaining[kwIdx - 1]))) {
          if (kwIdx >= 0 && kwIdx <= 5) {
            if (kwIdx > 0) {
              parts.push(<span key={key++} style={{ color: '#d4d4d4' }}>{remaining.slice(0, kwIdx)}</span>);
            }
            parts.push(<span key={key++} style={{ color: TOKEN_MAP[kw], fontWeight: 600 }}>{kw}</span>);
            remaining = remaining.slice(kwIdx + kw.length);
            found = true;
            break;
          }
        }
      }
      if (!found) {
        // Check for string literals
        const strMatch = remaining.match(/^(['"`]).*?\1/);
        if (strMatch) {
          parts.push(<span key={key++} style={{ color: '#ce9178' }}>{strMatch[0]}</span>);
          remaining = remaining.slice(strMatch[0].length);
        } else {
          parts.push(<span key={key++} style={{ color: '#d4d4d4' }}>{remaining[0]}</span>);
          remaining = remaining.slice(1);
        }
      }
      idx++;
      if (idx > 1000) break;
    }

    return <div key={i}>{parts}</div>;
  });
}

const player1Code = `function calculateElo(player, opponent, result) {
  const expected = 1 / (1 + Math.pow(10,
    (opponent - player) / 400));
  return player + 32 * (result - expected);
}`;

const player2Code = `const calculateElo = (p1, p2, res) => {
  const exp = 1 / (1 + 10 ** ((p2 - p1) / 400));
  // Optimized via bitwise math
  return Math.round(p1 + 32 * (res - exp));
};`;

interface EditorColumnProps {
  player: string;
  isLeading: boolean;
  code: string;
  accentColor: string;
  delayMs?: number;
}

const EditorColumn: React.FC<EditorColumnProps> = ({
  player,
  isLeading,
  code,
  accentColor,
  delayMs = 0,
}) => {
  const [typedCode, setTypedCode] = useState('');

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      let i = 0;
      const intervalId = setInterval(() => {
        setTypedCode(code.slice(0, i));
        i++;
        if (i > code.length) clearInterval(intervalId);
      }, 30 + Math.random() * 20);
      return () => clearInterval(intervalId);
    }, delayMs);
    return () => clearTimeout(delayTimer);
  }, [code, delayMs]);

  const lines = typedCode.split('\n');

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0d] overflow-hidden relative">
      {/* Editor header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: `${accentColor}22` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
          />
          <span className="font-code text-xs font-semibold text-white tracking-wider">{player}</span>
        </div>
        <div className="flex items-center gap-3">
          {isLeading && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="font-code text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 border"
              style={{
                color: accentColor,
                borderColor: `${accentColor}40`,
                backgroundColor: `${accentColor}10`,
              }}
            >
              ◆ LEADING
            </motion.span>
          )}
          <span className="font-code text-[9px] text-outline-variant">solution.js</span>
        </div>
      </div>

      {/* Line numbers + code */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers */}
        <div className="flex-none w-10 pt-4 pb-4 flex flex-col items-end pr-3 select-none bg-[#0a0a0a] border-r border-outline-variant/10">
          {Array.from({ length: Math.max(lines.length, 6) }, (_, i) => (
            <span key={i} className="font-code text-[11px] leading-6 text-outline-variant/40">
              {i + 1}
            </span>
          ))}
        </div>

        {/* Code area */}
        <pre className="font-code text-xs leading-6 p-4 overflow-x-auto flex-1 whitespace-pre-wrap break-words min-h-[200px] md:min-h-[260px]">
          <code>
            {colorize(typedCode)}
            {typedCode.length < code.length && (
              <span
                className="inline-block w-2 h-[1.1em] animate-blink align-middle ml-0.5"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </code>
        </pre>
      </div>
    </div>
  );
};

export const DuelPreview: React.FC = () => {
  const [showAiPopup, setShowAiPopup] = useState(false);
  const [time, setTime] = useState(165); // 2:45 in seconds

  useEffect(() => {
    const timer = setTimeout(() => setShowAiPopup(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (time <= 0) return;
    const id = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [time]);

  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');
  const progress = time / 1800; // 30 min total

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full mt-12 border border-outline-variant/30 bg-[#080808] overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.06)]"
    >
      {/* Top chrome bar */}
      <div className="bg-[#0e0e0e] border-b border-outline-variant/20 py-2.5 px-5 flex items-center justify-between">
        {/* Window dots */}
        <div className="flex gap-2">
          {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c, opacity: 0.8 }} />
          ))}
        </div>

        {/* Match ID */}
        <div className="flex items-center gap-2">
          <Terminal className="w-3 h-3 text-primary-container/60" />
          <span className="font-code text-[10px] text-on-surface-variant tracking-[0.15em]">
            ARENA › MATCH_ID:9824
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-24 h-[3px] bg-outline-variant/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-container to-secondary-container rounded-full transition-all duration-1000"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-code font-bold text-white text-base tabular-nums">
              {minutes}:{seconds}
            </span>
          </div>
        </div>
      </div>

      {/* Problem statement banner */}
      <div className="bg-surface-container-low border-b border-outline-variant/10 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-code text-[9px] text-outline-variant tracking-[0.2em] uppercase">Problem</span>
          <span className="font-code text-xs text-white font-semibold">ELO Rating Calculator</span>
          <span className="font-code text-[9px] px-2 py-0.5 bg-green-400/10 border border-green-400/20 text-green-400 tracking-wider">EASY</span>
        </div>
        <div className="flex items-center gap-2 font-code text-[9px] text-outline-variant">
          <span className="text-yellow-400">▲ 2 submissions</span>
          <span>·</span>
          <span>TC: O(1)</span>
        </div>
      </div>

      {/* Editors */}
      <div className="flex flex-col md:flex-row w-full">
        <EditorColumn
          player="NULL_POINTER"
          isLeading={false}
          code={player1Code}
          accentColor="#3b82f6"
        />
        <div className="w-px bg-outline-variant/20 hidden md:block relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-8 h-8 bg-surface-container border border-outline-variant/50 flex items-center justify-center">
              <span className="font-code text-[10px] text-on-surface font-bold">VS</span>
            </div>
          </div>
        </div>
        <div className="h-px bg-outline-variant/20 md:hidden" />
        <EditorColumn
          player="CYBER_NINJA"
          isLeading={true}
          code={player2Code}
          accentColor="#00e5ff"
          delayMs={400}
        />
      </div>

      {/* AI Analysis Popup */}
      <AnimatePresence>
        {showAiPopup && (
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.35 }}
            className="absolute bottom-6 right-6 bg-[#0a0a0a]/95 backdrop-blur-md border border-primary-container/40 p-4 flex items-start gap-3 shadow-glow-primary z-50 max-w-[280px]"
          >
            <Cpu className="w-5 h-5 text-primary-container shrink-0 mt-0.5 animate-[spin_4s_linear_infinite]" />
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle className="w-3 h-3 text-primary-container" />
                <span className="font-code text-[9px] text-primary-container uppercase tracking-[0.2em]">AI Insight</span>
              </div>
              <p className="font-body text-xs text-white/80 leading-relaxed">
                <span className="text-primary-container font-medium">CYBER_NINJA</span> applied bitwise ops yielding{' '}
                <span className="font-code text-green-400 bg-green-400/10 px-1">O(1)</span> space optimization.
              </p>
            </div>
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary-container/50" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary-container/50" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAiPopup && (
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.35, delay: 0.5 }}
            className="absolute bottom-20 left-6 bg-[#0a0a0a]/95 backdrop-blur-md border border-yellow-500/40 p-4 flex items-start gap-3 shadow-[0_0_20px_rgba(234,179,8,0.15)] z-50 max-w-[240px]"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-code text-[9px] text-yellow-500 uppercase tracking-[0.2em] mb-1.5">Syntax Warning</div>
              <p className="font-body text-xs text-white/80 leading-relaxed">
                Missing semicolon on line 3 · Time penalty:{' '}
                <span className="text-rose-400 font-code">+2.0s</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
