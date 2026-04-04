import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';
import { Navbar } from '../components/Navbar';
import { LiquidEther } from '../components/LiquidEther';
import { BackgroundElements } from '../components/BackgroundElements';
import { LiveTicker } from '../components/LiveTicker';
import {
  Swords, Zap, Trophy, Eye, TrendingUp, ChevronUp, ChevronDown, Minus,
  Activity, Clock, Shield, Sparkles, Loader
} from 'lucide-react';

const leaderboardData = [
  { rank: 1, name: 'ZER0_DAY', elo: 2840, trend: 'up', wins: 142, streak: 7 },
  { rank: 2, name: 'ALGO_GOD', elo: 2815, trend: 'up', wins: 138, streak: 4 },
  { rank: 3, name: 'SYS_ADMIN', elo: 2790, trend: 'same', wins: 135, streak: 0 },
  { rank: 4, name: 'NEURO_LINK', elo: 2765, trend: 'down', wins: 130, streak: 0 },
  { rank: 5, name: 'GHOST_NET', elo: 2730, trend: 'up', wins: 128, streak: 3 },
];

const recentMatches = [
  { p1: 'BYTE_ME', p2: 'NULL_POINTER', winner: 'BYTE_ME', time: '2m ago' },
  { p1: 'CODE_MASTER', p2: 'DARK_NET', winner: 'DARK_NET', time: '5m ago' },
  { p1: 'HACKERMAN', p2: 'SYNTAX_ERROR', winner: 'HACKERMAN', time: '8m ago' },
];

export default function LobbyDashboard() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [queueCount] = useState(() => Math.floor(Math.random() * 50) + 100);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'recent'>('leaderboard');
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('match-found', (data: { roomId: string; opponent: unknown }) => {
      setIsSearching(false);
      setSearchTime(0);
      navigate(`/arena/${(data as { roomId: string }).roomId}`);
    });
    return () => { socket.off('match-found'); };
  }, [navigate]);

  useEffect(() => {
    if (!isSearching) return;
    const interval = setInterval(() => setSearchTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isSearching]);

  const handleFindMatch = () => {
    setIsSearching(true);
    socket.emit('find-match', {
      name: `Player_${Math.floor(Math.random() * 1000)}`,
      rating: 1500,
    });
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setSearchTime(0);
    socket.emit('cancel-match');
  };

  return (
<div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">


<AppNavbar />
<div className="flex pt-16 min-h-screen">

<AppSidebar />

<main className="flex-1 bg-surface-container-lowest p-8 overflow-y-auto">
<div className="max-w-7xl mx-auto space-y-8">

<header className="flex justify-between items-end">
<div>
<h1 className="text-3xl font-extrabold tracking-tighter text-on-surface">PERFORMANCE_OVERVIEW</h1>
<p className="text-on-surface-variant font-mono text-sm mt-1">SESSION_UID: 4882-9901-RANKED</p>
</div>
<div className="flex gap-4">
<button className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg text-sm font-semibold hover:bg-surface-bright transition-all">
                            EXPORT_LOGS
                        </button>
<button onClick={() => navigate('/arena/matchmaking')} className="px-4 py-2 bg-gradient-to-b from-primary to-primary-container text-on-primary rounded-lg text-sm font-bold shadow-lg shadow-primary/10 hover:brightness-110 transition-all flex items-center gap-2">
    <span className="material-symbols-outlined text-[18px]">swords</span>
    NEW_BATTLE
</button>
</div>
</header>

<div className="grid grid-cols-1 md:grid-cols-4 gap-6">

<div className="col-span-1 md:col-span-2 bg-surface-container-low rounded-xl p-6 relative overflow-hidden group">
<div className="relative z-10">
<span className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">Current Rating</span>
<div className="flex items-baseline gap-3 mt-2">
<span className="text-5xl font-black text-primary tracking-tighter">2,842</span>
<span className="text-tertiary font-mono text-sm font-bold">+142 pts</span>
</div>
</div>

<div className="absolute bottom-0 right-0 left-0 h-24 opacity-20 pointer-events-none">
<svg className="w-full h-full preserve-3d" viewBox="0 0 400 100">
<path className="text-primary" d="M0,80 Q50,75 100,60 T200,50 T300,20 T400,10" fill="none" stroke="currentColor" strokeWidth="4"></path>
</svg>
</div>
</div>

<div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between">
<span className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">Win Rate</span>
<div>
<span className="text-4xl font-bold text-on-surface">68.4%</span>
<div className="w-full h-1.5 bg-surface-container-highest mt-4 rounded-full overflow-hidden">
<div className="w-[68.4%] h-full bg-tertiary"></div>
</div>
</div>
</div>

<div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between">
<span className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">Global Rank</span>
<div>
<span className="text-4xl font-bold text-on-surface">#1,042</span>
<p className="text-on-surface-variant text-xs mt-2 font-medium">Top 2.1% Worldwide</p>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

<div className="lg:col-span-2 bg-surface-container rounded-xl p-8">
<div className="flex justify-between items-start mb-10">
<div>
<h3 className="text-lg font-bold tracking-tight text-on-surface">RATING_HISTORY</h3>
<p className="text-xs text-on-surface-variant font-mono uppercase mt-1">Last 30 Battle Sessions</p>
</div>
<div className="flex gap-2">
<span className="px-2 py-1 rounded bg-surface-container-highest text-[10px] font-mono text-on-surface-variant">1M</span>
<span className="px-2 py-1 rounded bg-primary/20 text-[10px] font-mono text-primary border border-primary/20">3M</span>
<span className="px-2 py-1 rounded bg-surface-container-highest text-[10px] font-mono text-on-surface-variant">ALL</span>
</div>
</div>

<div className="w-full h-64 relative">
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
<defs>
<linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#adc6ff" stopOpacity="0.3"></stop>
<stop offset="100%" stopColor="#adc6ff" stopOpacity="0"></stop>
</linearGradient>
</defs>

<line stroke="#424754" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="50" y2="50"></line>
<line stroke="#424754" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="100" y2="100"></line>
<line stroke="#424754" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="150" y2="150"></line>

<path d="M0,180 L0,150 L100,160 L200,120 L300,140 L400,90 L500,100 L600,60 L700,75 L800,40 L900,50 L1000,20 L1000,200 L0,200 Z" fill="url(#lineGrad)"></path>

<path d="M0,150 C50,155 50,165 100,160 C150,155 150,125 200,120 C250,115 250,145 300,140 C350,135 350,95 400,90 C450,85 450,105 500,100 C550,95 550,65 600,60 C650,55 650,80 700,75 C750,70 750,45 800,40 C850,35 850,55 900,50 C950,45 950,25 1000,20" fill="none" stroke="#adc6ff" strokeLinecap="round" strokeWidth="3"></path>

<circle cx="800" cy="40" fill="#131313" r="5" stroke="#adc6ff" strokeWidth="2"></circle>
</svg>
<div className="absolute top-0 left-[80%] -translate-x-1/2 p-2 glass-panel border border-outline-variant/20 rounded shadow-xl pointer-events-none">
<p className="text-[10px] font-mono text-primary font-bold">2,842 ELO</p>
<p className="text-[8px] text-on-surface-variant uppercase">Match ID #4421</p>
</div>
</div>
<div className="flex justify-between mt-6 px-2">
<span className="text-[10px] font-mono text-on-surface-variant">OCT_01</span>
<span className="text-[10px] font-mono text-on-surface-variant">OCT_10</span>
<span className="text-[10px] font-mono text-on-surface-variant">OCT_20</span>
<span className="text-[10px] font-mono text-on-surface-variant">OCT_30</span>
</div>
</div>

<div className="bg-surface-container rounded-xl p-8">
<h3 className="text-lg font-bold tracking-tight text-on-surface mb-6 uppercase">Skill_Distribution</h3>
<div className="space-y-5">
<div className="space-y-2">
<div className="flex justify-between text-xs font-mono uppercase">
<span className="text-on-surface">Data Structures</span>
<span className="text-primary">94%</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="w-[94%] h-full bg-primary"></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-mono uppercase">
<span className="text-on-surface">Algorithms</span>
<span className="text-primary">82%</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="w-[82%] h-full bg-primary"></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-mono uppercase">
<span className="text-on-surface">System Design</span>
<span className="text-primary">65%</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="w-[65%] h-full bg-primary"></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-mono uppercase">
<span className="text-on-surface">Concurrency</span>
<span className="text-primary">48%</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="w-[48%] h-full bg-primary"></div>
</div>
</div>
</div>
<div className="mt-8 pt-6 border-t border-outline-variant/10">
<h4 className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-4">Preferred_Stack</h4>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-mono text-on-surface border border-outline-variant/10">Rust</span>
<span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-mono text-on-surface border border-outline-variant/10">TypeScript</span>
<span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-mono text-on-surface border border-outline-variant/10">Python</span>
<span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-mono text-on-surface border border-outline-variant/10">Go</span>
</div>
</div>
</div>
</div>

<section className="bg-surface-container rounded-xl overflow-hidden">
<div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
<h3 className="text-lg font-bold tracking-tight text-on-surface uppercase">Recent_Battles</h3>
<button className="text-primary text-xs font-bold hover:underline">VIEW_ALL_HISTORY</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-high/50">
<th className="px-6 py-4 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Outcome</th>
<th className="px-6 py-4 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Problem_Name</th>
<th className="px-6 py-4 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Difficulty</th>
<th className="px-6 py-4 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Delta</th>
<th className="px-6 py-4 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Duration</th>
<th className="px-6 py-4 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest text-right">Date</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
<tr className="hover:bg-surface-container-high transition-colors cursor-pointer group">
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
<span className="text-tertiary font-bold text-xs">WIN</span>
</div>
</td>
<td className="px-6 py-4 font-mono text-sm text-on-surface">Red_Black_Tree_Rebalancing</td>
<td className="px-6 py-4">
<span className="px-2 py-0.5 rounded bg-error/10 text-error text-[10px] font-bold uppercase">Hard</span>
</td>
<td className="px-6 py-4 font-mono text-sm text-tertiary">+24</td>
<td className="px-6 py-4 font-mono text-sm text-on-surface-variant">14:42</td>
<td className="px-6 py-4 text-right font-mono text-xs text-on-surface-variant">2023-10-31</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors cursor-pointer group">
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
<span className="text-tertiary font-bold text-xs">WIN</span>
</div>
</td>
<td className="px-6 py-4 font-mono text-sm text-on-surface">Fast_Fourier_Transform_Impl</td>
<td className="px-6 py-4">
<span className="px-2 py-0.5 rounded bg-error/10 text-error text-[10px] font-bold uppercase">Hard</span>
</td>
<td className="px-6 py-4 font-mono text-sm text-tertiary">+18</td>
<td className="px-6 py-4 font-mono text-sm text-on-surface-variant">22:01</td>
<td className="px-6 py-4 text-right font-mono text-xs text-on-surface-variant">2023-10-30</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors cursor-pointer group">
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-surface-variant"></span>
<span className="text-on-surface-variant font-bold text-xs">LOSS</span>
</div>
</td>
<td className="px-6 py-4 font-mono text-sm text-on-surface">LRU_Cache_Design</td>
<td className="px-6 py-4">
<span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">Medium</span>
</td>
<td className="px-6 py-4 font-mono text-sm text-error">-12</td>
<td className="px-6 py-4 font-mono text-sm text-on-surface-variant">08:15</td>
<td className="px-6 py-4 text-right font-mono text-xs text-on-surface-variant">2023-10-29</td>
</tr>
<tr className="hover:bg-surface-container-high transition-colors cursor-pointer group">
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-tertiary"></span>
<span className="text-tertiary font-bold text-xs">WIN</span>
</div>
</td>
<td className="px-6 py-4 font-mono text-sm text-on-surface">Async_Task_Scheduler</td>
<td className="px-6 py-4">
<span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">Medium</span>
</td>
<td className="px-6 py-4 font-mono text-sm text-tertiary">+12</td>
<td className="px-6 py-4 font-mono text-sm text-on-surface-variant">10:30</td>
<td className="px-6 py-4 text-right font-mono text-xs text-on-surface-variant">2023-10-28</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
</main>
</div>

<button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center z-50">
<span className="material-symbols-outlined">add</span>
</button>

</div>
);
}
