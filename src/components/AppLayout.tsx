import { Link, useLocation, useNavigate } from 'react-router-dom';

export function AppNavbar() {
  const location = useLocation();
  const path = location.pathname;
  
  return (
<header className="bg-[#131313]/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center w-full px-6 h-16 fixed top-0 z-50">
<div className="flex items-center gap-8">
<span className="font-['JetBrains_Mono'] font-bold text-lg tracking-tighter text-[#adc6ff]"><Link to="/">DEVDUEL</Link></span>
<nav className="hidden md:flex gap-6 items-center">
<Link className={`font-['Inter'] font-medium text-sm tracking-tight ${path.includes('/arena') ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] pb-1' : 'text-zinc-400 hover:text-white transition-colors duration-200'}`} to="/arena/demo">Arena</Link>
<Link className={`font-['Inter'] font-medium text-sm tracking-tight ${path.includes('/watch') ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] pb-1' : 'text-zinc-400 hover:text-white transition-colors duration-200'}`} to="/watch/demo">Rankings</Link>
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
<div className="flex flex-col gap-6 items-center w-full">
<button onClick={() => navigate('/arena/demo')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 group ${path.includes('/arena') ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className="material-symbols-outlined">code</span>
<span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-widest scale-90">Code</span>
</button>
<button onClick={() => navigate('/app')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 group ${path === '/app' ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className="material-symbols-outlined">terminal</span>
<span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-widest scale-90">Results</span>
</button>
<button onClick={() => navigate('/review/demo')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 group ${path.includes('/review') ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className="material-symbols-outlined">analytics</span>
<span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-widest scale-90">Analysis</span>
</button>
<button onClick={() => navigate('/docs')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 group ${path.includes('/docs') ? 'bg-blue-500/10 text-[#adc6ff] border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className="material-symbols-outlined">description</span>
<span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-widest scale-90">Docs</span>
</button>
<button onClick={() => navigate('/marketplace')} className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ease-in-out transition-all duration-200 group ${path.includes('/marketplace') ? 'bg-blue-500/10 border-r-2 border-[#adc6ff]' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
<span className={`material-symbols-outlined ${path.includes('/marketplace') ? 'text-[#eac124]' : ''}`}>store</span>
<span className={`font-['Inter'] text-[10px] font-semibold uppercase tracking-widest scale-90 ${path.includes('/marketplace') ? 'text-[#eac124]' : ''}`}>Shop</span>
</button>
</div>
</aside>
  );
}
