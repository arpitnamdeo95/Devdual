import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
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
  const players = useSupabaseData(state => state.players);
  const allPlayers = useSupabaseData(state => [...state.players].sort((a,b) => b.elo - a.elo));
  const myMatches = useSupabaseData(state => 
    state.matches.filter(m => m.winner_id === me?.id || m.loser_id === me?.id)
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
      name: me?.username || `Guest_${Math.floor(Math.random() * 1000)}`,
      identity: localIdentity,
      rating: me?.elo || 1500,
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
                <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface uppercase font-heading">Performance_Overview</h1>
                <p className="text-on-surface-variant font-mono text-sm mt-1">SESSION_UID: {localIdentity || 'GUEST'}-RANKED</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={isSearching ? handleCancelSearch : handleFindMatch}
                  className={`px-6 py-3 rounded-xl font-black tracking-tighter flex items-center gap-2 transition-all shadow-lg ${
                    isSearching 
                      ? 'bg-error text-on-error shadow-error/20 hover:brightness-110' 
                      : 'bg-primary text-on-primary shadow-primary/20 hover:brightness-110'
                  }`}
                >
                  <span className="material-symbols-outlined">{isSearching ? 'close' : 'swords'}</span>
                  {isSearching ? `CANCEL (${searchTime}s)` : 'NEW_BATTLE'}
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="col-span-1 md:col-span-2 glass-panel border-glow-cyan rounded-xl p-6 relative overflow-hidden group">
                <div className="relative z-10">
                  <span className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">Current Rating</span>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-5xl font-black text-white neon-cyan tracking-tighter" data-text={me?.elo || 1000}>{me?.elo || 1000}</span>
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
                  </svg>
                </div>
              </div>

              <div className="glass-panel border-glow-purple rounded-xl p-6 flex flex-col justify-between group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-opacity text-tertiary">
                  <span className="material-symbols-outlined text-6xl">emoji_events</span>
                </div>
                <span className="text-xs font-mono tracking-widest text-on-surface-variant uppercase relative z-10">Win Rate</span>
                <div className="relative z-10">
                  <span className="text-4xl font-bold text-white neon-purple">{winRate}%</span>
                  <div className="w-full h-1.5 bg-surface-container-highest mt-4 rounded-full overflow-hidden shadow-glow-ambient">
                    <div className="h-full bg-tertiary shadow-glow-purple transition-all duration-1000" style={{width: `${winRate}%`}}></div>
                  </div>
                </div>
              </div>

              <div className="glass-panel border-l-2 border-primary rounded-xl p-6 flex flex-col justify-between scanline-overlay">
                <span className="text-xs font-mono tracking-widest text-on-surface-variant uppercase z-20">Global Rank</span>
                <div className="z-20">
                  <span className="text-4xl font-bold text-white neon-cyan">#{myRank || '?'}</span>
                  <p className="text-on-surface-variant text-[10px] mt-2 font-black uppercase bg-surface-container/50 inline-block px-2 py-1 rounded">Top {topPercent}% Worldwide</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-surface-container rounded-2xl p-8 border border-white/5">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-on-surface uppercase">Rating_History</h3>
                    <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Real-time performance calibration</p>
                  </div>
                </div>
                <div className="w-full h-64 relative bg-surface-container-low rounded-xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, var(--md-sys-color-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  </div>
                  {myMatches.length === 0 ? (
                    <div className="text-center space-y-2 z-10">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">monitoring</span>
                      <p className="text-xs font-mono text-on-surface-variant">NO_CHART_DATA_FOUND</p>
                    </div>
                  ) : (
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                      <defs>
                        <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="var(--md-sys-color-primary)" stopOpacity="0.3"></stop>
                          <stop offset="100%" stopColor="var(--md-sys-color-primary)" stopOpacity="0"></stop>
                        </linearGradient>
                      </defs>
                      <path d="M0,180 L100,160 L200,120 L300,140 L400,90 L500,100 L600,60 L700,75 L800,40 L900,50 L1000,20 L1000,200 L0,200 Z" fill="url(#lineGrad)"></path>
                      <path d="M0,150 C50,155 150,125 200,120 C300,115 350,95 400,90 C500,85 550,65 600,60 C700,55 750,45 800,40 C900,35 950,25 1000,20" fill="none" stroke="var(--md-sys-color-primary)" strokeLinecap="round" strokeWidth="3"></path>
                    </svg>
                  )}
                </div>
              </div>

              <div className="bg-surface-container rounded-2xl p-8 relative overflow-hidden border border-white/5">
                <h3 className="text-lg font-black tracking-tight text-on-surface mb-6 uppercase">Skill_Distribution</h3>
                {myMatches.length < 5 ? (
                  <div className="absolute inset-0 bg-surface-container/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <h4 className="text-on-surface font-black mb-1 uppercase text-sm">Insufficient Data</h4>
                    <p className="text-[10px] text-on-surface-variant font-mono leading-relaxed">Complete {5 - myMatches.length} more ranked matches to calibrate your skill signature.</p>
                  </div>
                ) : null}

                <div className={`space-y-6 transition-all duration-500 ${myMatches.length < 5 ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
                  {[
                    { label: 'Data Structures', val: Math.min(100, (me?.wins || 0) * 12 + 40) },
                    { label: 'Algorithms', val: Math.min(100, (me?.wins || 0) * 10 + 35) },
                    { label: 'System Design', val: Math.min(100, (me?.matches_played || 0) * 5 + 20) },
                    { label: 'Concurrency', val: Math.min(100, (me?.matches_played || 0) * 4 + 15) }
                  ].map((skill, si) => (
                    <div key={si} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-on-surface-variant">{skill.label}</span>
                        <span className="text-primary">{skill.val}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000 delay-300" style={{ width: `${skill.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <section className="bg-surface-container rounded-2xl overflow-hidden border border-white/5">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Recent_Battles
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high/30">
                      <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Outcome</th>
                      <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Problem</th>
                      <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Difficulty</th>
                      <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Delta</th>
                      <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myMatches.slice(0, 5).map(match => {
                      const won = match.winner_id === me?.id;
                      const opponentPlayer = players.find(p => p.id === (won ? match.loser_id : match.winner_id));
                      const opponentName = opponentPlayer?.username || 'Opponent';
                      return (
                        <tr key={match.id} className="hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => navigate(`/review/${match.id}`)}>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${won ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                              {won ? 'VICTORY' : 'DEFEAT'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-sm">{match.problem_title || 'Unknown Problem'}</div>
                            <div className="text-[10px] font-mono text-on-surface-variant">vs {opponentName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold uppercase ${match.difficulty === 'hard' ? 'text-error' : match.difficulty === 'medium' ? 'text-primary' : 'text-tertiary'}`}>
                              {match.difficulty || 'Medium'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 font-mono text-sm font-bold ${won ? 'text-tertiary' : 'text-error'}`}>
                            {won ? '+' : ''}{won ? match.winner_elo_change : match.loser_elo_change}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-[10px] text-on-surface-variant">
                            {new Date(match.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                    {myMatches.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant font-mono text-sm opacity-50 italic">
                          No battle data found for current session identity.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
