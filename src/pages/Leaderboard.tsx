import { AppSidebar, AppNavbar } from '../components/AppLayout';
import { useSpacetimeData } from '../spacetimeProvider';
import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { TrendingUp, TrendingDown, Minus, Zap, Search } from 'lucide-react';

/* ─── tiny badge helper ──────────────────────────────────────────────── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-yellow-400 font-black">🥇</span>;
  if (rank === 2) return <span className="text-slate-300 font-black">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 font-black">🥉</span>;
  return (
    <span className="text-xs font-mono font-bold text-on-surface-variant">
      #{String(rank).padStart(2, '0')}
    </span>
  );
}

/* ─── rank change indicator ─────────────────────────────────────────── */
function DeltaBadge({ delta }: { delta: number }) {
  if (delta > 0) return (
    <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-bold">
      <TrendingUp className="w-3 h-3" />+{delta}
    </span>
  );
  if (delta < 0) return (
    <span className="flex items-center gap-0.5 text-red-400 text-[10px] font-bold">
      <TrendingDown className="w-3 h-3" />{delta}
    </span>
  );
  return <Minus className="w-3 h-3 text-zinc-600" />;
}

/* ─── type ──────────────────────────────────────────────────────────── */
interface LiveEntry {
  userIdentity: string;
  username: string;
  elo: number;
  delta?: number;    // ELO change from last match
  flash?: boolean;   // was just updated?
}

export default function Leaderboard() {
  const localIdentity = localStorage.getItem('devduel_user_identity') || '';

  /* SpacetimeDB data */
  const rawEntries = useSpacetimeData(db =>
    Array.from(db.leaderboardEntry.iter()).sort((a, b) => b.elo - a.elo)
  );

  /* Local state so we can animate changes */
  const [entries, setEntries] = useState<LiveEntry[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [liveFlash, setLiveFlash] = useState(false);

  /* Sync from SpacetimeDB → local entries */
  useEffect(() => {
    if (!rawEntries.length) return;
    setEntries(prev => {
      const prevMap = new Map((prev as LiveEntry[]).map(e => [e.userIdentity, e.elo]));
      return rawEntries.map(e => ({
        userIdentity: e.userIdentity,
        username: e.username,
        elo: e.elo,
        delta: prevMap.has(e.userIdentity) ? e.elo - (prevMap.get(e.userIdentity) ?? e.elo) : 0,
        flash: prevMap.has(e.userIdentity) && prevMap.get(e.userIdentity) !== e.elo,
      }));
    });
  }, [rawEntries]);

  /* Listen to live game-end events on the socket for immediate flash */
  useEffect(() => {
    const onGameEnd = (data: any) => {
      if (!data.winnerIdentity) return;
      setLiveFlash(true);
      setLastUpdated(new Date());
      // Update winner's ELO optimistically (SpacetimeDB will also update async)
      setEntries(prev =>
        prev
          .map(e =>
            e.userIdentity === data.winnerIdentity
              ? { ...e, elo: e.elo + 25, delta: 25, flash: true }
              : e.userIdentity === data.loserIdentity
              ? { ...e, elo: Math.max(0, e.elo - 15), delta: -15, flash: true }
              : e
          )
          .sort((a, b) => b.elo - a.elo)
      );
      setTimeout(() => {
        setLiveFlash(false);
        setEntries(prev => prev.map(e => ({ ...e, flash: false, delta: 0 })));
      }, 3500);
    };
    socket.on('game-end', onGameEnd);
    return () => socket.off('game-end', onGameEnd);
  }, []);

  const filtered = entries.filter(e =>
    !searchQ || e.username.toLowerCase().includes(searchQ.toLowerCase())
  );

  /* Tier label */
  const getTier = (elo: number) => {
    if (elo >= 2500) return { label: 'GRANDMASTER', color: 'text-red-400 bg-red-400/10 border-red-400/30' };
    if (elo >= 2000) return { label: 'MASTER', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' };
    if (elo >= 1700) return { label: 'DIAMOND', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' };
    if (elo >= 1400) return { label: 'GOLD', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' };
    if (elo >= 1000) return { label: 'SILVER', color: 'text-slate-300 bg-slate-300/10 border-slate-300/30' };
    return { label: 'BRONZE', color: 'text-amber-700 bg-amber-700/10 border-amber-700/30' };
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <AppNavbar />
      <div className="flex pt-16 h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 p-8 overflow-y-auto relative">

          {/* BG glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-tertiary/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-4xl mx-auto space-y-8 relative z-10">

            {/* Header */}
            <header className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
                <span className={`w-2 h-2 rounded-full ${liveFlash ? 'bg-emerald-400 animate-pulse' : 'bg-primary/50'}`} />
                <span className="text-[11px] font-mono text-primary tracking-widest uppercase">
                  {liveFlash ? 'LIVE UPDATE' : 'Global Rankings'}
                </span>
              </div>
              <h1 className="text-5xl font-black tracking-tight">
                Global{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-primary">Leaderboard</span>
              </h1>
              <p className="text-on-surface-variant font-mono text-sm max-w-xl mx-auto">
                Real-time rankings updated live after every battle.
                {lastUpdated && (
                  <span className="ml-2 text-emerald-400">
                    Last updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </header>

            {/* Search */}
            <div className="relative max-w-xs mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search player..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="w-full bg-surface-container border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/40 font-mono text-white placeholder:text-zinc-600"
              />
            </div>

            {/* Table */}
            <div className="bg-surface-container rounded-3xl border border-white/5 overflow-hidden shadow-2xl">

              {/* Table header */}
              <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-4 px-6 py-4 bg-surface border-b border-white/5 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">
                <span className="text-center">Rank</span>
                <span>Player</span>
                <span className="text-center">Tier</span>
                <span className="text-right">ELO</span>
              </div>

              {/* Rows */}
              {filtered.map((entry, idx) => {
                const rank = entries.findIndex(e => e.userIdentity === entry.userIdentity) + 1;
                const isMe = entry.userIdentity === localIdentity;
                const tier = getTier(entry.elo);
                const initials = entry.username.slice(0, 2).toUpperCase();

                return (
                  <div
                    key={entry.userIdentity}
                    className={`grid grid-cols-[3rem_1fr_auto_auto] gap-4 items-center px-6 py-4 border-b border-white/5 last:border-0 transition-all duration-700 ${
                      entry.flash
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : isMe
                        ? 'bg-primary/10'
                        : 'hover:bg-white/[0.025]'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center">
                      <RankBadge rank={rank} />
                    </div>

                    {/* Player */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        rank === 1 ? 'bg-yellow-400/20 text-yellow-400' :
                        rank === 2 ? 'bg-slate-300/20 text-slate-300' :
                        rank === 3 ? 'bg-amber-600/20 text-amber-600' :
                        isMe ? 'bg-primary/20 text-primary' :
                        'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-bold text-sm truncate ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                          {entry.username}
                          {isMe && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <DeltaBadge delta={entry.delta ?? 0} />
                          {entry.flash && (
                            <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-bold animate-pulse">
                              <Zap className="w-2.5 h-2.5" /> LIVE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tier */}
                    <div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${tier.color}`}>
                        {tier.label}
                      </span>
                    </div>

                    {/* ELO */}
                    <div className="text-right">
                      <span className={`text-lg font-black tabular-nums ${rank <= 3 ? 'text-tertiary' : isMe ? 'text-primary' : 'text-on-surface'}`}>
                        {entry.elo}
                      </span>
                    </div>
                  </div>
                );
              })}

              {entries.length === 0 && (
                <div className="py-20 text-center">
                  <div className="text-4xl mb-4">⚔️</div>
                  <p className="text-on-surface-variant font-mono text-sm">
                    No battles yet. Be the first to climb the ranks!
                  </p>
                </div>
              )}
            </div>

            {/* Footer stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Players', val: entries.length || '—', icon: 'groups' },
                { label: 'Top ELO', val: entries[0]?.elo ?? '—', icon: 'diamond' },
                { label: 'Live Updates', val: 'Active', icon: 'wifi', highlight: true },
              ].map(s => (
                <div key={s.label} className="bg-surface-container rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">{s.label}</span>
                    <span className="material-symbols-outlined text-primary text-sm">{s.icon}</span>
                  </div>
                  <div className={`text-2xl font-black ${s.highlight ? 'text-emerald-400' : 'text-on-surface'}`}>{s.val}</div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
