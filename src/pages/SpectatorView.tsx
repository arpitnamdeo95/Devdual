import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { socket } from '../socket';
import { Eye, ArrowLeft, Activity } from 'lucide-react';

/* ── Emoji reactions palette ── */
const REACTIONS = ['🔥', '⚡', '🎯', '👏', '💀', '🚀', '😱', '🤯'];

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;   // 0-100 percent from left
}

export default function SpectatorView() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Array<{ id: string; name: string; rating: number }>>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState(30 * 60);
  const [status, setStatus] = useState<'IN_PROGRESS' | 'ENDED'>('IN_PROGRESS');
  const [winner, setWinner] = useState<string | null>(null);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Array<{user: string, message: string, time: string}>>([]);

  /* ── Floating emoji state ── */
  const [floaters, setFloaters] = useState<FloatingEmoji[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [cooldown, setCooldown] = useState<string | null>(null); // emoji in cooldown
  const arenaRef = useRef<HTMLDivElement>(null);

  /* ── Socket listeners ── */
  useEffect(() => {
    if (!roomId) return;
    socket.emit('join-room', { roomId, isSpectator: true });

    const onRoomState = (state: any) => {
      setPlayers(state.players || []);
      setCodes(state.code || {});
    };
    const onCodeUpdate = (data: any) => {
      setCodes(prev => ({ ...prev, [data.id]: data.code }));
    };
    const onGameEnd = (data: any) => {
      setStatus('ENDED');
      setWinner(data.winnerName || data.winnerId || 'Player');
    };
    const onReaction = (data: { emoji: string; id: string }) => {
      spawnFloater(data.emoji, data.id);
      setReactionCounts(prev => ({ ...prev, [data.emoji]: (prev[data.emoji] || 0) + 1 }));
    };

    socket.on('room-state', onRoomState);
    socket.on('opponent-code-update', onCodeUpdate);
    socket.on('game-end', onGameEnd);
    socket.on('room-reaction', onReaction);

    return () => {
      socket.off('room-state', onRoomState);
      socket.off('opponent-code-update', onCodeUpdate);
      socket.off('game-end', onGameEnd);
      socket.off('room-reaction', onReaction);
    };
  }, [roomId]);

  /* ── Countdown ── */
  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;
    const iv = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [status]);

  /* ── Spectator count drift ── */
  useEffect(() => {
    const iv = setInterval(() => setSpectatorCount(c => Math.max(1, c + Math.floor(Math.random() * 5) - 2)), 5000);
    return () => clearInterval(iv);
  }, []);

  /* ── Spawn a floating emoji ── */
  function spawnFloater(emoji: string, id: string) {
    const x = 10 + Math.random() * 80; // random horizontal position
    const floater: FloatingEmoji = { id, emoji, x };
    setFloaters(prev => [...prev, floater]);
    // Remove after animation completes (~3s)
    setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== id)), 3200);
  }

  /* ── Send reaction ── */
  function sendReaction(emoji: string) {
    if (cooldown === emoji) return;
    socket.emit('room-reaction', { roomId, emoji });
    // Optimistic local spawn
    const id = `local_${Date.now()}`;
    spawnFloater(emoji, id);
    setReactionCounts(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    // Cooldown 1.5s per emoji
    setCooldown(emoji);
    setTimeout(() => setCooldown(null), 1500);
  }

  const p1 = players[0];
  const p2 = players[1];
  const timerColor = timer < 300 ? 'text-red-400' : timer < 600 ? 'text-yellow-400' : 'text-emerald-400';
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="h-screen overflow-hidden bg-background text-on-surface font-body flex flex-col">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden pt-16">
        <AppSidebar />

        <main className="flex-1 flex flex-col overflow-hidden relative">

          {/* ── Top bar ── */}
          <header className="h-12 bg-surface border-b border-white/5 flex items-center justify-between px-5 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/live')} className="text-zinc-500 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="font-black text-sm tracking-tight">
                  LIVE&nbsp;
                  <span className="text-on-surface-variant font-mono text-xs font-normal">
                    #{roomId?.substring(5, 13) || 'DEMO'}
                  </span>
                </span>
              </div>
              {status === 'ENDED' && (
                <span className="px-2 py-0.5 bg-tertiary/20 text-tertiary border border-tertiary/30 text-[9px] font-black rounded uppercase tracking-widest">
                  Match Over
                </span>
              )}
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-tertiary" />
                <span className="font-mono text-sm font-bold text-tertiary">{spectatorCount}</span>
              </div>
              <span className={`font-mono font-black text-xl ${timerColor}`}>{fmt(timer)}</span>
            </div>
          </header>

          {/* ── Winner banner ── */}
          {status === 'ENDED' && winner && (
            <div className="h-10 bg-gradient-to-r from-yellow-400/20 via-yellow-400/30 to-transparent border-b border-yellow-400/30 flex items-center justify-center gap-3 shrink-0">
              <span className="material-symbols-outlined text-yellow-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              <span className="font-black tracking-wide text-yellow-300 text-sm uppercase">{winner} wins the duel!</span>
            </div>
          )}

          {/* ── Main arena area (editors + floaters) ── */}
          <div ref={arenaRef} className="flex-1 flex overflow-hidden relative">

            {/* Floating emoji layer */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              {floaters.map(f => (
                <div
                  key={f.id}
                  className="absolute bottom-24 animate-float-up text-3xl select-none"
                  style={{
                    left: `${f.x}%`,
                    animation: 'floatUp 3s ease-out forwards',
                  }}
                >
                  {f.emoji}
                </div>
              ))}
            </div>

            {/* ── Editors ── */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

              {/* Player 1 */}
              <div className="flex-1 flex flex-col border-r border-white/5">
                <div className="h-10 bg-surface-container border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-tertiary/20 flex items-center justify-center text-[9px] font-black text-tertiary">P1</div>
                    <span className="text-sm font-bold text-tertiary">{p1?.name || 'Waiting...'}</span>
                    {p1?.rating && <span className="text-[10px] font-mono text-zinc-600">{p1.rating} ELO</span>}
                  </div>
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={codes[p1?.id || ''] || '# Waiting for Player 1...\n'}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: { top: 16 },
                      renderLineHighlight: 'none',
                    }}
                  />
                </div>
              </div>

              {/* VS divider */}
              <div className="hidden md:flex w-px bg-white/5 items-center justify-center relative">
                <div className="absolute w-9 h-9 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-[10px] font-black shadow-xl z-10">
                  VS
                </div>
              </div>

              {/* Player 2 */}
              <div className="flex-1 flex flex-col">
                <div className="h-10 bg-surface-container border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                  <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <div className="flex items-center gap-2">
                    {p2?.rating && <span className="text-[10px] font-mono text-zinc-600">{p2.rating} ELO</span>}
                    <span className="text-sm font-bold text-primary">{p2?.name || 'Waiting...'}</span>
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary">P2</div>
                  </div>
                </div>
                <div className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={codes[p2?.id || ''] || '# Waiting for Player 2...\n'}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: { top: 16 },
                      renderLineHighlight: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ── Reaction Bar (bottom) ── */}
          <div className="h-16 bg-surface border-t border-white/5 shrink-0 flex items-center justify-between px-6">

            {/* Recent activity feed */}
            <div className="hidden md:flex items-center gap-3 overflow-hidden flex-1 mr-8">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest shrink-0">Spectators:</span>
              <div className="flex gap-4 overflow-hidden">
                {recentActivity.slice(-3).map((a, i) => (
                  <span key={i} className="text-xs text-zinc-500 font-mono whitespace-nowrap">
                    <span className="text-primary font-bold">{a.user}</span> — {a.message.substring(0, 30)}{a.message.length > 30 ? '…' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Emoji Reactions */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mr-1 hidden md:block">React:</span>
              {REACTIONS.map(emoji => {
                const count = reactionCounts[emoji] || 0;
                const isOnCooldown = cooldown === emoji;
                return (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    disabled={isOnCooldown}
                    title={count > 0 ? `${count} reactions` : ''}
                    className={`relative group flex flex-col items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 ${
                      isOnCooldown
                        ? 'border-primary/40 bg-primary/10 scale-90 opacity-60'
                        : 'border-white/5 bg-surface-container hover:border-primary/40 hover:bg-primary/10 hover:scale-110 active:scale-95'
                    }`}
                  >
                    <span className="text-lg leading-none">{emoji}</span>
                    {count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                        {count > 99 ? '99' : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </main>
      </div>

      {/* Inline CSS for float-up animation */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0)    scale(1);    opacity: 1; }
          50%  { transform: translateY(-80px) scale(1.3); opacity: 0.9; }
          100% { transform: translateY(-200px) scale(0.8); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
