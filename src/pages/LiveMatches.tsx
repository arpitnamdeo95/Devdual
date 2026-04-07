import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { Eye, Zap, Clock, Users, Swords, Radio } from 'lucide-react';

interface LiveRoom {
  roomId: string;
  players: Array<{ name: string; rating: number }>;
  spectatorCount: number;
  difficulty: string | null;
  problemTitle: string | null;
  status: 'picking' | 'battle' | 'ended';
  startedAt: number;
  elapsedSec: number;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  medium: 'text-blue-400   bg-blue-400/10   border-blue-400/30',
  hard:   'text-red-400    bg-red-400/10    border-red-400/30',
};

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ── seed fake rooms for when no real battle is happening ── */
const SEED_ROOMS: LiveRoom[] = [
  {
    roomId: 'demo_seed_1',
    players: [{ name: 'null_yield', rating: 2842 }, { name: 'vortex_ops', rating: 2791 }],
    spectatorCount: 47,
    difficulty: 'hard',
    problemTitle: 'LRU Cache',
    status: 'battle',
    startedAt: Date.now() - 780_000,
    elapsedSec: 780,
  },
  {
    roomId: 'demo_seed_2',
    players: [{ name: 'stack_x', rating: 2740 }, { name: 'quantum_dev', rating: 2610 }],
    spectatorCount: 23,
    difficulty: 'medium',
    problemTitle: 'Binary Search Tree',
    status: 'battle',
    startedAt: Date.now() - 420_000,
    elapsedSec: 420,
  },
  {
    roomId: 'demo_seed_3',
    players: [{ name: 'kernel_master', rating: 2685 }, { name: 'ghost_net', rating: 2580 }],
    spectatorCount: 9,
    difficulty: 'easy',
    problemTitle: 'Two Sum',
    status: 'picking',
    startedAt: Date.now() - 60_000,
    elapsedSec: 60,
  },
];

export default function LiveMatches() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<LiveRoom[]>(SEED_ROOMS);
  const [totalSpectators, setTotalSpectators] = useState(0);
  const [pulse, setPulse] = useState(false);

  /* ── connect and subscribe to live-rooms updates ── */
  useEffect(() => {
    socket.emit('get-live-rooms');

    const onLiveRooms = (data: LiveRoom[]) => {
      if (data.length > 0) {
        setRooms(data);
        setPulse(true);
        setTimeout(() => setPulse(false), 800);
      }
    };

    socket.on('live-rooms', onLiveRooms);
    return () => { socket.off('live-rooms', onLiveRooms); };
  }, []);

  /* ── tick elapsed time every second ── */
  useEffect(() => {
    const iv = setInterval(() => {
      setRooms(prev =>
        prev.map(r => ({
          ...r,
          elapsedSec: Math.floor((Date.now() - r.startedAt) / 1000),
        }))
      );
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  /* ── aggregate spectator count ── */
  useEffect(() => {
    setTotalSpectators(rooms.reduce((sum, r) => sum + r.spectatorCount, 0));
  }, [rooms]);

  const activeRooms  = rooms.filter(r => r.status === 'battle');
  const pickingRooms = rooms.filter(r => r.status === 'picking');

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <AppNavbar />
      <div className="flex pt-16 h-screen overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto relative p-8">

          {/* BG glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-red-500/5 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-5xl mx-auto space-y-8 relative z-10">

            {/* ── Header ── */}
            <header className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-[11px] font-mono text-red-400 tracking-widest uppercase">Broadcasting Live</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight">
                  Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-primary">Matches</span>
                </h1>
                <p className="text-on-surface-variant font-mono text-sm mt-2">
                  Watch ongoing duels in real-time. React with emojis. No chat — just pure spectator energy.
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-4 shrink-0">
                <div className="bg-surface-container rounded-2xl p-4 border border-white/5 text-center min-w-[100px]">
                  <div className="text-2xl font-black text-red-400">{activeRooms.length}</div>
                  <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mt-1">Live Now</div>
                </div>
                <div className="bg-surface-container rounded-2xl p-4 border border-white/5 text-center min-w-[100px]">
                  <div className={`text-2xl font-black text-primary transition-all duration-300 ${pulse ? 'scale-110' : ''}`}>{totalSpectators}</div>
                  <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mt-1">Watching</div>
                </div>
              </div>
            </header>

            {/* ── Active Battles ── */}
            {activeRooms.length > 0 && (
              <section>
                <h2 className="text-xs font-mono text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Swords className="w-3.5 h-3.5" /> Active Battles ({activeRooms.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeRooms.map(room => (
                    <RoomCard key={room.roomId} room={room} onWatch={() => navigate(`/watch/${room.roomId}`)} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Picking Phase ── */}
            {pickingRooms.length > 0 && (
              <section>
                <h2 className="text-xs font-mono text-yellow-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> Starting Soon ({pickingRooms.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {pickingRooms.map(room => (
                    <RoomCard key={room.roomId} room={room} onWatch={() => navigate(`/watch/${room.roomId}`)} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Empty state ── */}
            {rooms.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 gap-5">
                <div className="w-20 h-20 rounded-full bg-surface-container border border-white/5 flex items-center justify-center">
                  <Swords className="w-8 h-8 text-zinc-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-on-surface-variant mb-1">No active battles</h3>
                  <p className="text-sm font-mono text-zinc-600">Battles will appear here when players start dueling.</p>
                </div>
                <button
                  onClick={() => navigate('/arena/matchmaking')}
                  className="px-6 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl font-bold hover:bg-primary hover:text-on-primary transition-all"
                >
                  Start a Battle
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Room card component ── */
function RoomCard({ room, onWatch }: { room: LiveRoom; onWatch: () => void }) {
  const p1 = room.players[0];
  const p2 = room.players[1];
  const isLive = room.status === 'battle';
  const diffColor = room.difficulty ? DIFFICULTY_COLOR[room.difficulty] || '' : '';

  return (
    <div className={`group relative bg-surface-container rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${
      isLive ? 'border-red-500/20 hover:border-red-500/40 hover:shadow-red-500/10' : 'border-yellow-500/20 hover:border-yellow-500/40'
    }`} onClick={onWatch}>

      {/* Top bar */}
      <div className={`h-1 w-full ${isLive ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-yellow-500 to-amber-500'}`} />

      <div className="p-5 space-y-4">

        {/* Status + difficulty row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isLive ? 'text-red-400' : 'text-yellow-400'}`}>
              {isLive ? 'Live' : 'Picking'}
            </span>
          </div>
          {room.difficulty && (
            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${diffColor}`}>
              {room.difficulty}
            </span>
          )}
        </div>

        {/* Players VS */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-black text-base text-on-surface truncate">{p1?.name || '???'}</div>
            <div className="text-[10px] font-mono text-primary">{p1?.rating || '—'} ELO</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-[10px] font-black text-on-surface-variant shrink-0">
            VS
          </div>
          <div className="flex-1 min-w-0 text-right">
            <div className="font-black text-base text-on-surface truncate">{p2?.name || '???'}</div>
            <div className="text-[10px] font-mono text-tertiary">{p2?.rating || '—'} ELO</div>
          </div>
        </div>

        {/* Problem title */}
        {room.problemTitle && (
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant bg-surface-container-high rounded-lg px-3 py-2 border border-white/5">
            <Zap className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">{room.problemTitle}</span>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{fmt(room.elapsedSec)} elapsed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3 h-3" />
            <span>{room.spectatorCount} watching</span>
          </div>
        </div>

        {/* Watch button */}
        <button className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          isLive
            ? 'bg-red-500/10 text-red-400 border border-red-500/30 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500'
            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 group-hover:bg-yellow-500 group-hover:text-black group-hover:border-yellow-500'
        }`}>
          <Eye className="w-4 h-4" />
          {isLive ? 'Watch Live' : 'Join as Spectator'}
        </button>
      </div>
    </div>
  );
}
