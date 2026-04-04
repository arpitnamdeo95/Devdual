import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { useState, useEffect } from 'react';
import { useParams, useNavigate , Link} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { socket } from '../socket';
import {
  Eye, Trophy, Users, Volume2, VolumeX, Radio,
  MessageCircle, ChevronRight, Activity, Terminal, Shield, Zap
} from 'lucide-react';

const chatMessages = [
  { user: 'ZER0_DAY', message: 'NULL_POINTER is crushing it with the hash map approach', time: '2m' },
  { user: 'GHOST_NET', message: 'CYBER_NINJA still has time, let them cook', time: '1m' },
  { user: 'BYTE_ME', message: 'That edge case handling is clean', time: '30s' },
  { user: 'DARK_NET', message: '🔥🔥🔥', time: '10s' },
];

const spectators = [
  { name: 'ALGO_GOD', watching: true },
  { name: 'NEURO_LINK', watching: true },
  { name: 'HACKERMAN', watching: false },
  { name: 'SYNTAX_ERROR', watching: true },
];

export default function SpectatorView() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Array<{ id: string; name: string; rating: number }>>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState(30 * 60);
  const [status, setStatus] = useState<'IN_PROGRESS' | 'ENDED'>('IN_PROGRESS');
  const [result, setResult] = useState<{ winnerId?: string } | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(847);
  const [liveChat, setLiveChat] = useState(chatMessages);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.emit('join-room', { roomId, isSpectator: true });

    socket.on('room-state', (state) => {
      setPlayers(state.players);
      setCodes(state.code || {});
    });

    socket.on('opponent-code-update', (data) => {
      setCodes((prev: Record<string, string>) => ({ ...prev, [data.id]: data.code }));
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
    const interval = setInterval(() => {
      setSpectatorCount(c => c + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const p1 = players[0];
  const p2 = players[1];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setLiveChat(prev => [...prev, { user: 'You', message: newMessage, time: 'now' }]);
    setNewMessage('');
  };

  const timerColor = timer < 300 ? 'text-accent-red' : timer < 600 ? 'text-accent-orange' : 'text-primary-container';
  const timerPercent = (timer / (30 * 60)) * 100;

  return (
<div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">


<AppNavbar />
<div className="flex flex-1 overflow-hidden">

<AppSidebar />

<main className="flex-1 overflow-y-auto bg-surface-dim p-6 md:p-10">

<div className="max-w-6xl mx-auto mb-12">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<span className="font-mono text-primary text-sm tracking-widest uppercase mb-2 block">Global Arena</span>
<h1 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface tracking-tighter">Leaderboard.</h1>
<p className="text-on-surface-variant mt-4 max-w-xl text-sm leading-relaxed">
                            Competitive technical excellence ranked by algorithm efficiency, code quality, and duel performance metrics across all regional clusters.
                        </p>
</div>

<div className="flex items-end gap-3 mt-8 md:mt-0">
<div className="flex flex-col items-center">
<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-container-high mb-2">
<img alt="2nd rank" data-alt="minimalist avatar of a software engineer with glasses and a focused expression in a high-tech studio environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJMM1drsxNR7S7aoJNPHnax-aayCIZpI3gn4TaeR3hzWYhSqJX-bXgbdDMmM7DUL49KIq5dqhG3uE9-MfZVmOyC4oRl8Zx9q6dJqyLUUlS__fsYCDJD6FfuxkYpwqVn2cvtHOWYyN0PUK6D_C3JXlGB1cJvZx0pQV2Q-tesP8dCCh_C7F_2usV5qZOzXGOyNvtyTU3qAvYRcv-WXmXE5lObNymjXxia9US69mmcxkdPWm2RvMHyg2AkzwFCe2BQ9e67vkxztcc1W0" />
</div>
<div className="w-12 h-16 bg-surface-container flex items-center justify-center rounded-t-lg">
<span className="font-mono font-bold text-on-surface-variant">2</span>
</div>
</div>
<div className="flex flex-col items-center scale-110 -translate-y-2">
<div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary mb-2 shadow-[0_0_15px_rgba(173,198,255,0.3)]">
<img alt="1st rank" data-alt="vibrant minimalist avatar of a female coder with futuristic headphones in a dark coding room with blue ambient light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqA8ssQj_WHDSg31cNx787HMAyG4VG53O6StJBgLHSBCsF286mR1s0Ddy1CoZOr3WVsl17O4Ny88g74VGJMpGkpqGtFMyBDG7IyhVVg3tVMXRuyhNBmul4LmXxuveFVFDe_MRDMCljkgOCuXatMRqXvhQiNqjhkSsgvEHCBhgKcEK2QJsuGL9TKIJNY-z0SG7W8-ctC3Y5lXROZLvV-60gVBmac70LXco7TAOtHdv2Wq3jrF89eoWcKQKUbObnJI9j1XqCchV-LmE" />
</div>
<div className="w-14 h-24 bg-primary flex items-center justify-center rounded-t-lg">
<span className="font-mono font-black text-on-primary">1</span>
</div>
</div>
<div className="flex flex-col items-center">
<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-container-high mb-2">
<img alt="3rd rank" data-alt="stylized vector avatar of a tech-savvy professional with short hair and a modern grey hoodie" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCDwFSGiMNPJYI_kbwJDTWYiGE0eAGyIukw23b0X9Lhsp1jmY_4OFzZsUiEq_mXBjibKWMGx7XMRTzv2Y3tWV3-Y-NHX44EYkxpI5GTbKXGf3L2eDN-rJWzbWDQzpHcaLIq0V6_tzo0Yr4kQAhAqmSOECVEuoDEz3HLDQ_lrdnhdR-FoIjSD6vuE14HAZRwd_Dy4dQ8vt0Cuoi-6ofgEgzCHybowS3AG_m-lmcvPrM6Ey6XBbteSCF8jHrhxKKsqEcDeSE616pR9g" />
</div>
<div className="w-12 h-12 bg-surface-container-high flex items-center justify-center rounded-t-lg">
<span className="font-mono font-bold text-on-surface-variant">3</span>
</div>
</div>
</div>
</div>
</div>

<div className="max-w-6xl mx-auto space-y-6">

<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
<div className="relative w-full md:w-96 group">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
<input className="w-full bg-surface-container-low border-none rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary/20 placeholder:text-zinc-600 transition-all font-body" placeholder="Search by handle or rank..." type="text" />
</div>
<div className="flex items-center gap-2 w-full md:w-auto">
<button className="bg-surface-container-low px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-2">
<span className="material-symbols-outlined text-sm">filter_list</span>
                            All Regions
                        </button>
<button className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/10">
                            Current Season
                        </button>
</div>
</div>

<div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high/50 text-zinc-500 font-mono text-[11px] uppercase tracking-widest border-none">
<th className="px-6 py-4 font-semibold">Rank</th>
<th className="px-6 py-4 font-semibold">Architect</th>
<th className="px-6 py-4 font-semibold">ELO Rating</th>
<th className="px-6 py-4 font-semibold">Win Rate</th>
<th className="px-6 py-4 font-semibold">Succession</th>
<th className="px-6 py-4 font-semibold text-right">Activity</th>
</tr>
</thead>
<tbody className="divide-y divide-white/[0.03]">

<tr className="group hover:bg-white/[0.02] transition-colors">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<span className="font-mono font-black text-primary text-lg">01</span>
<span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-mono text-[10px] text-primary">NY</div>
<div>
<div className="text-on-surface font-semibold text-sm">null_yield</div>
<div className="text-zinc-500 text-[11px] font-mono">ID: #8921-A</div>
</div>
</div>
</td>
<td className="px-6 py-5 font-mono text-sm font-bold text-on-surface">2,842</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-20 h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="bg-tertiary h-full w-[88%]"></div>
</div>
<span className="text-xs font-mono font-medium text-tertiary">88%</span>
</div>
</td>
<td className="px-6 py-5">
<span className="bg-tertiary/10 text-tertiary text-[10px] font-bold px-2 py-0.5 rounded border border-tertiary/20">12 STREAK</span>
</td>
<td className="px-6 py-5 text-right">
<span className="text-xs text-zinc-500">2m ago</span>
</td>
</tr>

<tr className="group hover:bg-white/[0.02] transition-colors">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<span className="font-mono font-black text-primary text-lg opacity-80">02</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-mono text-[10px] text-primary">VX</div>
<div>
<div className="text-on-surface font-semibold text-sm">vortex_ops</div>
<div className="text-zinc-500 text-[11px] font-mono">ID: #4412-B</div>
</div>
</div>
</td>
<td className="px-6 py-5 font-mono text-sm font-bold text-on-surface">2,791</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-20 h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="bg-primary h-full w-[82%]"></div>
</div>
<span className="text-xs font-mono font-medium text-primary">82%</span>
</div>
</td>
<td className="px-6 py-5">
<span className="bg-surface-container-highest text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded">4 STREAK</span>
</td>
<td className="px-6 py-5 text-right">
<span className="text-xs text-zinc-500">14m ago</span>
</td>
</tr>

<tr className="group hover:bg-white/[0.02] transition-colors">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<span className="font-mono font-black text-primary text-lg opacity-60">03</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-mono text-[10px] text-primary">SX</div>
<div>
<div className="text-on-surface font-semibold text-sm">stack_x</div>
<div className="text-zinc-500 text-[11px] font-mono">ID: #9001-Z</div>
</div>
</div>
</td>
<td className="px-6 py-5 font-mono text-sm font-bold text-on-surface">2,740</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-20 h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="bg-primary h-full w-[79%]"></div>
</div>
<span className="text-xs font-mono font-medium text-primary">79%</span>
</div>
</td>
<td className="px-6 py-5">
<span className="bg-surface-container-highest text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded">1 STREAK</span>
</td>
<td className="px-6 py-5 text-right">
<span className="text-xs text-zinc-500">1h ago</span>
</td>
</tr>

<tr className="group hover:bg-white/[0.02] transition-colors">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<span className="font-mono font-black text-zinc-600 text-lg">04</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-mono text-[10px] text-zinc-500">KM</div>
<div>
<div className="text-on-surface font-semibold text-sm">kernel_master</div>
<div className="text-zinc-500 text-[11px] font-mono">ID: #1123-K</div>
</div>
</div>
</td>
<td className="px-6 py-5 font-mono text-sm font-bold text-on-surface">2,685</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-20 h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="bg-zinc-500 h-full w-[75%]"></div>
</div>
<span className="text-xs font-mono font-medium text-zinc-500">75%</span>
</div>
</td>
<td className="px-6 py-5">
<span className="bg-error/10 text-error text-[10px] font-bold px-2 py-0.5 rounded border border-error/20">LOST 1</span>
</td>
<td className="px-6 py-5 text-right">
<span className="text-xs text-zinc-500">3h ago</span>
</td>
</tr>

<tr className="group hover:bg-white/[0.02] transition-colors">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<span className="font-mono font-black text-zinc-600 text-lg">05</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-mono text-[10px] text-zinc-500">QD</div>
<div>
<div className="text-on-surface font-semibold text-sm">quantum_dev</div>
<div className="text-zinc-500 text-[11px] font-mono">ID: #7782-Q</div>
</div>
</div>
</td>
<td className="px-6 py-5 font-mono text-sm font-bold text-on-surface">2,610</td>
<td className="px-6 py-5">
<div className="flex items-center gap-2">
<div className="w-20 h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="bg-zinc-500 h-full w-[72%]"></div>
</div>
<span className="text-xs font-mono font-medium text-zinc-500">72%</span>
</div>
</td>
<td className="px-6 py-5">
<span className="bg-tertiary/10 text-tertiary text-[10px] font-bold px-2 py-0.5 rounded border border-tertiary/20">3 STREAK</span>
</td>
<td className="px-6 py-5 text-right">
<span className="text-xs text-zinc-500">4h ago</span>
</td>
</tr>
</tbody>
</table>
</div>

<div className="px-6 py-4 bg-surface-container-highest/20 flex items-center justify-between border-t border-white/[0.03]">
<span className="text-xs text-zinc-500 font-mono">SHOWING 1-15 OF 1,284 ARCHITECTS</span>
<div className="flex items-center gap-2">
<button className="p-1 hover:text-primary transition-colors disabled:opacity-30" disabled={true}>
<span className="material-symbols-outlined">chevron_left</span>
</button>
<div className="flex gap-1">
<button className="w-6 h-6 flex items-center justify-center bg-primary text-on-primary text-[10px] font-bold rounded">1</button>
<button className="w-6 h-6 flex items-center justify-center text-on-surface-variant text-[10px] font-bold hover:bg-surface-container-high rounded transition-colors">2</button>
<button className="w-6 h-6 flex items-center justify-center text-on-surface-variant text-[10px] font-bold hover:bg-surface-container-high rounded transition-colors">3</button>
</div>
<button className="p-1 hover:text-primary transition-colors">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
</div>
</div>

<div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-surface-container-low p-6 rounded-xl border border-white/[0.03]">
<div className="flex items-center justify-between mb-4">
<span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Total Active Players</span>
<span className="material-symbols-outlined text-primary text-sm">groups</span>
</div>
<div className="text-2xl font-headline font-bold text-on-surface tracking-tight">12,482</div>
<div className="mt-2 flex items-center gap-1 text-tertiary text-[10px] font-bold">
<span className="material-symbols-outlined text-[12px]">trending_up</span>
                        +12% THIS MONTH
                    </div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl border border-white/[0.03]">
<div className="flex items-center justify-between mb-4">
<span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Average ELO</span>
<span className="material-symbols-outlined text-primary text-sm">monitoring</span>
</div>
<div className="text-2xl font-headline font-bold text-on-surface tracking-tight">1,420</div>
<div className="mt-2 flex items-center gap-1 text-zinc-500 text-[10px] font-bold">
<span className="material-symbols-outlined text-[12px]">remove</span>
                        STABLE MARGIN
                    </div>
</div>
<div className="bg-surface-container-low p-6 rounded-xl border border-white/[0.03]">
<div className="flex items-center justify-between mb-4">
<span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Daily Duels</span>
<span className="material-symbols-outlined text-primary text-sm">swords</span>
</div>
<div className="text-2xl font-headline font-bold text-on-surface tracking-tight">42,801</div>
<div className="mt-2 flex items-center gap-1 text-tertiary text-[10px] font-bold">
<span className="material-symbols-outlined text-[12px]">trending_up</span>
                        RECORD PEAK REACHED
                    </div>
</div>
</div>
</main>
</div>

<nav className="md:hidden bg-surface-container-low border-t border-white/5 flex justify-around items-center h-16 fixed bottom-0 w-full z-50">
<button onClick={() => navigate('/arena/demo')} className="flex flex-col items-center gap-1 text-zinc-500">
<span className="material-symbols-outlined">code</span>
<span className="text-[10px] font-semibold uppercase tracking-tighter">Code</span>
</button>
<button className="flex flex-col items-center gap-1 text-primary">
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
<span className="text-[10px] font-semibold uppercase tracking-tighter">Rankings</span>
</button>
<button onClick={() => navigate('/review/demo')} className="flex flex-col items-center gap-1 text-zinc-500">
<span className="material-symbols-outlined">analytics</span>
<span className="text-[10px] font-semibold uppercase tracking-tighter">Stats</span>
</button>
<button className="flex flex-col items-center gap-1 text-zinc-500">
<span className="material-symbols-outlined">person</span>
<span className="text-[10px] font-semibold uppercase tracking-tighter">Profile</span>
</button>
</nav>

</div>
);
}
