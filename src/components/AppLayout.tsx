import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { socket } from '../socket';

/* ─── Global badge toast shown on any page after winning ── */
function AchievementToastManager() {
  const [toasts, setToasts] = useState<Array<{ id: number; text: string; icon: string }>>([]); 
  const localIdentity = localStorage.getItem('devduel_user_identity') || '';

  useEffect(() => {
    const onGameEnd = (data: any) => {
      if (data.winnerIdentity && data.winnerIdentity === localIdentity) {
        const id = Date.now();
        setToasts(prev => [...prev, { id, text: 'Victory! +25 ELO', icon: 'emoji_events' }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
      }
    };
    socket.on('game-end', onGameEnd);
    return () => { socket.off('game-end', onGameEnd); };
  }, [localIdentity]);

  if (!toasts.length) return null;
  return (
    <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/40 backdrop-blur-xl shadow-2xl shadow-yellow-400/20 animate-in slide-in-from-right duration-500">
          <span className="material-symbols-outlined text-yellow-400 text-xl">{t.icon}</span>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-yellow-400/70">Achievement!</div>
            <div className="font-black text-sm text-yellow-300">{t.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AppNavbar() {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <>
      <AchievementToastManager />
      <header className="bg-[#131313]/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center w-full px-6 h-16 fixed top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="font-['JetBrains_Mono'] font-bold text-lg tracking-tighter text-[#adc6ff]"><Link to="/">DEVDUEL</Link></span>
          <nav className="hidden md:flex gap-6 items-center">
            <Link className={`font-['Inter'] font-medium text-sm tracking-tight ${path.includes('/arena') ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] pb-1' : 'text-zinc-400 hover:text-white transition-colors duration-200'}`} to="/arena/demo">Arena</Link>
            <Link className={`font-['Inter'] font-medium text-sm tracking-tight ${path.includes('/leaderboard') ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] pb-1' : 'text-zinc-400 hover:text-white transition-colors duration-200'}`} to="/leaderboard">Rankings</Link>
            <Link className={`font-['Inter'] font-medium text-sm tracking-tight flex items-center gap-1.5 ${path === '/live' ? 'text-red-400 border-b-2 border-red-400 pb-1' : 'text-zinc-400 hover:text-red-400 transition-colors duration-200'}`} to="/live">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span></span>
              Live
            </Link>
            <Link className={`font-['Inter'] font-medium text-sm tracking-tight ${path.includes('/profile') ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] pb-1' : 'text-zinc-400 hover:text-white transition-colors duration-200'}`} to="/profile">Profile</Link>
            <Link className={`font-['Inter'] font-medium text-sm tracking-tight ${path.includes('/marketplace') ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] pb-1' : 'text-zinc-400 hover:text-white transition-colors duration-200'}`} to="/marketplace">Marketplace</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-tertiary"></div>
            <span className="text-xs font-mono text-tertiary tracking-widest uppercase">Online</span>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20">
            <img className="w-full h-full object-cover" data-alt="portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWizy0Hvw1ZoGjkWir8AxTphAmK_Hc42kwK3viii26Q2LdNY4WrmpPv1ZMNkHq8XlzjrkRi8ivYcCa7wwN9NzMyCs8vWMFghl39kTHsp8oYXEpHVCeyals3243IjAIZsJRqvUD3-FrXDd-k355o5sjoNuJP2JBkwJMyX2JLKVqXkMyJQ86DZc4wIfZk2FzRsnMrLK93BWgGU7xHEyBCwN5px7Y5zoeF-8xbAejjwc2-C5MJnJIy-yiMfXxcyn8JIdiwmylhU8nrZM" />
          </div>
        </div>
      </header>
    </>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  return (
<aside className="bg-[#1c1b1b]/60 backdrop-blur-md h-[calc(100vh-4rem)] w-20 flex flex-col items-center py-8 gap-6 sticky top-16 shrink-0 z-40 border-r border-white/5">
<div className="flex flex-col items-center gap-1 mb-4">
<span className="text-[#adc6ff] font-black text-xs font-mono">B-742</span>
</div>
<div className="flex flex-col gap-4 items-center w-full overflow-y-auto code-editor-scrollbar pb-4">
<button onClick={() => navigate('/dashboard')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 shrink-0 group ${path.includes('/dashboard') ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className="material-symbols-outlined">dashboard</span>
<span className="font-['Inter'] text-[9px] font-semibold uppercase tracking-widest">Dash</span>
</button>
<button onClick={() => navigate('/arena/demo')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 shrink-0 group ${path.includes('/arena') ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className="material-symbols-outlined">code</span>
<span className="font-['Inter'] text-[9px] font-semibold uppercase tracking-widest">Code</span>
</button>
<button onClick={() => navigate('/app')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 shrink-0 group ${path === '/app' ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className="material-symbols-outlined">terminal</span>
<span className="font-['Inter'] text-[9px] font-semibold uppercase tracking-widest">Lobby</span>
</button>
<button onClick={() => navigate('/live')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 shrink-0 group relative ${path === '/live' ? 'bg-red-500/10 text-red-400 border-r-2 border-red-500' : 'text-zinc-500 hover:bg-white/5 hover:text-red-400'}`}>
  <div className="relative">
    <span className="material-symbols-outlined">live_tv</span>
    <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
  </div>
  <span className="font-['Inter'] text-[9px] font-semibold uppercase tracking-widest">Live</span>
</button>
<button onClick={() => navigate('/review/demo')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 shrink-0 group ${path.includes('/review') ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className="material-symbols-outlined">analytics</span>
<span className="font-['Inter'] text-[9px] font-semibold uppercase tracking-widest">Stats</span>
</button>
<button onClick={() => navigate('/arena/hypergraph')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 shrink-0 group ${path.includes('/hypergraph') ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className="material-symbols-outlined">hub</span>
<span className="font-['Inter'] text-[9px] font-semibold uppercase tracking-widest">Arena</span>
</button>
<button onClick={() => navigate('/leaderboard')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 shrink-0 group ${path.includes('/leaderboard') ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className="material-symbols-outlined">leaderboard</span>
<span className="font-['Inter'] text-[9px] font-semibold uppercase tracking-widest">Ranks</span>
</button>
<button onClick={() => navigate('/achievements')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 shrink-0 group ${path.includes('/achievements') ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className={`material-symbols-outlined ${path.includes('/achievements') ? 'text-yellow-400' : ''}`}>military_tech</span>
<span className={`font-['Inter'] text-[9px] font-semibold uppercase tracking-widest ${path.includes('/achievements') ? 'text-yellow-400' : ''}`}>Badges</span>
</button>
<button onClick={() => navigate('/marketplace')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 shrink-0 group ${path.includes('/marketplace') ? 'bg-blue-500/10 border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className={`material-symbols-outlined ${path.includes('/marketplace') ? 'text-[#eac124]' : ''}`}>store</span>
<span className={`font-['Inter'] text-[9px] font-semibold uppercase tracking-widest ${path.includes('/marketplace') ? 'text-[#eac124]' : ''}`}>Shop</span>
</button>
</div>
</aside>
  );
}
