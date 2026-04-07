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

import { useSupabaseData } from '../supabaseProvider';

export default function LobbyDashboard() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const navigate = useNavigate();
  const localIdentity = localStorage.getItem('devduel_user_identity') || '';

  const me = useSupabaseData(state => state.players.find(p => p.username === localIdentity));
  const allPlayers = useSupabaseData(state => [...state.players].sort((a,b) => b.elo - a.elo));
  const myMatches = useSupabaseData(state => 
    state.matches.filter(m => m.winner_id === localIdentity || m.loser_id === localIdentity)
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  );
  
  const myRank = allPlayers.findIndex(p => p.username === localIdentity) + 1;
  const totalPlayers = allPlayers.length;
  const topPercent = totalPlayers ? Math.round((myRank / totalPlayers) * 100) : 100;
  const winRate = me?.matches_played ? Math.round((me.wins / me.matches_played) * 100) : 0;

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
<div className="h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">

<AppNavbar />
<div className="flex flex-1 flex-row pt-16 w-full h-full overflow-hidden">

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

<div className="col-span-1 md:col-span-2 glass-panel border-glow-cyan rounded-xl p-6 relative overflow-hidden group">
<div className="relative z-10">
<span className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">Current Rating</span>
<div className="flex items-baseline gap-3 mt-2">
<span className="text-5xl font-black text-white neon-cyan tracking-tighter glitch" data-text={me?.elo || 1000}>{me?.elo || 1000}</span>
<span className="text-primary font-mono text-sm font-bold">{me?.wins || 0} Wins</span>
</div>
</div>

<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
  <span className="material-symbols-outlined text-8xl text-primary transform rotate-12">swords</span>
</div>

<div className="absolute bottom-0 right-0 left-0 h-24 opacity-30 pointer-events-none mix-blend-screen">
<svg className="w-full h-full preserve-3d" viewBox="0 0 400 100">
<path className="text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" d="M0,80 Q50,75 100,60 T200,50 T300,20 T400,10" fill="none" stroke="currentColor" strokeWidth="2"></path>
<path className="text-primary/20 blur-sm flex" d="M0,80 Q50,75 100,60 T200,50 T300,20 T400,10" fill="none" stroke="currentColor" strokeWidth="6"></path>
<path className="text-primary/10 blur-md flex" d="M0,80 Q50,75 100,60 T200,50 T300,20 T400,10" fill="none" stroke="currentColor" strokeWidth="12"></path>
</svg>
</div>
</div>

<div className="glass-panel border-glow-purple rounded-xl p-6 flex flex-col justify-between group">
<div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-opacity text-tertiary">
  <span className="material-symbols-outlined text-6xl">emoji_events</span>
</div>
<span className="text-xs font-mono tracking-widest text-on-surface-variant uppercase relative z-10">Win Rate</span>
<div className="relative z-10">
<span className="text-4xl font-bold text-white neon-purple">{winRate}%</span>
<div className="w-full h-1.5 bg-surface-container-highest mt-4 rounded-full overflow-hidden shadow-glow-ambient">
<div className="h-full bg-tertiary shadow-glow-purple" style={{width: `${winRate}%`}}></div>
</div>
</div>
</div>

<div className="glass-panel border-l-2 border-primary rounded-xl p-6 flex flex-col justify-between scanline-overlay">
<span className="text-xs font-mono tracking-widest text-on-surface-variant uppercase z-20">Global Rank</span>
<div className="z-20">
<span className="text-4xl font-bold text-white neon-cyan">#{myRank || '?'}</span>
<p className="text-on-surface-variant text-xs mt-2 font-medium bg-surface-container/50 inline-block px-2 py-1 rounded">Top {topPercent}% Worldwide</p>
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
<p className="text-[10px] font-mono text-primary font-bold">{me?.elo || 1000} ELO</p>
<p className="text-[8px] text-on-surface-variant uppercase">{me?.username || 'GUEST'}</p>
</div>
</div>
<div className="flex justify-between mt-6 px-2">
<span className="text-[10px] font-mono text-on-surface-variant">OCT_01</span>
<span className="text-[10px] font-mono text-on-surface-variant">OCT_10</span>
<span className="text-[10px] font-mono text-on-surface-variant">OCT_20</span>
<span className="text-[10px] font-mono text-on-surface-variant">OCT_30</span>
</div>
</div>

<div className="bg-surface-container rounded-xl p-8 relative overflow-hidden">
<h3 className="text-lg font-bold tracking-tight text-on-surface mb-6 uppercase">Skill_Distribution</h3>

{myMatches.length < 5 ? (
  <div className="absolute inset-0 bg-surface-container/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 border border-outline-variant/10 rounded-xl">
    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
      <span className="material-symbols-outlined">lock</span>
    </div>
    <h4 className="text-on-surface font-bold mb-2 uppercase">Insufficient Data</h4>
    <p className="text-xs text-on-surface-variant font-mono">Complete {5 - myMatches.length} more ranked matches to calibrate your skill signature.</p>
  </div>
) : null}

<div className={`space-y-5 transition-opacity ${myMatches.length < 5 ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
<div className="space-y-2">
<div className="flex justify-between text-xs font-mono uppercase">
<span className="text-on-surface">Data Structures</span>
<span className="text-primary">{myMatches.length < 5 ? '??' : '94'}%</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary" style={{width: `${myMatches.length < 5 ? 0 : 94}%`}}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-mono uppercase">
<span className="text-on-surface">Algorithms</span>
<span className="text-primary">{myMatches.length < 5 ? '??' : '82'}%</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary" style={{width: `${myMatches.length < 5 ? 0 : 82}%`}}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-mono uppercase">
<span className="text-on-surface">System Design</span>
<span className="text-primary">{myMatches.length < 5 ? '??' : '65'}%</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary" style={{width: `${myMatches.length < 5 ? 0 : 65}%`}}></div>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between text-xs font-mono uppercase">
<span className="text-on-surface">Concurrency</span>
<span className="text-primary">{myMatches.length < 5 ? '??' : '48'}%</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="h-full bg-primary" style={{width: `${myMatches.length < 5 ? 0 : 48}%`}}></div>
</div>
</div>
</div>
<div className={`mt-8 pt-6 border-t border-outline-variant/10 transition-opacity ${myMatches.length < 5 ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
<h4 className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-4">Preferred_Stack</h4>
<div className="flex flex-wrap gap-2">
<span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-mono text-on-surface border border-outline-variant/10">Rust</span>
<span className="px-2 py-1 bg-surface-container-high rounded text-[10px] font-mono text-on-surface border border-outline-variant/10">TypeScript</span>
</div>
</div>
</div>
</div>

<section className="glass-panel border-l-2 border-primary rounded-xl overflow-hidden mt-8 shadow-glow-intense">
<div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
<h3 className="text-lg font-bold tracking-tight text-white uppercase flex items-center gap-2">
  <span className="material-symbols-outlined text-primary">history</span>
  Recent_Battles
</h3>
<button className="text-primary text-xs font-bold hover:underline glitch" data-text="VIEW_ALL_HISTORY">VIEW_ALL_HISTORY</button>
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
{myMatches.slice(0, 4).map(match => {
  const won = match.winner_id === localIdentity;
  return (
<tr key={match.id} className="hover:bg-surface-container-high transition-colors cursor-pointer group" onClick={() => navigate(`/review/${match.id}`)}>
<td className="px-6 py-4">
<div className="flex items-center gap-2">
<span className={`w-2 h-2 rounded-full ${won ? 'bg-tertiary' : 'bg-error'}`}></span>
<span className={`${won ? 'text-tertiary' : 'text-error'} font-bold text-xs`}>{won ? 'WIN' : 'LOSS'}</span>
</div>
</td>
<td className="px-6 py-4 font-mono text-sm text-on-surface">{match.problem_title || 'Unknown'}</td>
<td className="px-6 py-4">
<span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
  match.difficulty === 'easy' ? 'bg-tertiary/10 text-tertiary' : match.difficulty === 'medium' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
}`}>{match.difficulty || 'Medium'}</span>
</td>
<td className={`px-6 py-4 font-mono text-sm ${won ? 'text-tertiary' : 'text-error'}`}>
  {won ? '+' : ''}{won ? match.winner_elo_change : match.loser_elo_change}
</td>
<td className="px-6 py-4 font-mono text-sm text-on-surface-variant">{Math.floor((match.duration_sec||0)/60)}:{(match.duration_sec||0)%60 < 10 ? '0': ''}{(match.duration_sec||0)%60}</td>
<td className="px-6 py-4 text-right font-mono text-xs text-on-surface-variant">{new Date(match.created_at).toISOString().split('T')[0]}</td>
</tr>
  );
})}
{myMatches.length === 0 && (
  <tr>
    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant font-mono text-sm">No recent matches found.</td>
  </tr>
)}
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
