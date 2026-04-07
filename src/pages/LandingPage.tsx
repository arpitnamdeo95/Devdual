import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-[#0a0e14] text-[#f1f3fc] font-[Inter] overflow-x-hidden selection:bg-[#c799ff] selection:text-[#440080]">
            <style>{`
                .font-headline { font-family: 'Space Grotesk', sans-serif; }
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .glow-sm { text-shadow: 0 0 8px rgba(74, 248, 227, 0.4); }
                .glow-primary { box-shadow: 0 0 20px rgba(199, 153, 255, 0.2); }
                .glass-panel { backdrop-filter: blur(12px); background: rgba(21, 26, 33, 0.7); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                .animate-marquee { display: inline-block; animation: marquee 30s linear infinite; }
            `}</style>
            

<nav className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl shadow-[0_40px_40px_rgba(0,0,0,0.06)]">
<div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
<div className="flex items-center gap-8">
<div className="text-xl font-bold tracking-tighter text-[#adc6ff] dark:text-[#adc6ff] cursor-pointer flex items-center gap-2" onClick={() => navigate('/')}>
<span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                    DEVDUEL
                </div>
<div className="hidden md:flex gap-6 font-['Inter'] font-medium text-sm tracking-tight items-center">
<button onClick={() => navigate('/arena/matchmaking')} className="text-[#e5e2e1]/60 hover:text-[#adc6ff] transition-colors duration-200 cursor-pointer active:scale-95">Arena</button>
<button onClick={() => navigate('/leaderboard')} className="text-[#e5e2e1]/60 hover:text-[#adc6ff] transition-colors duration-200 cursor-pointer active:scale-95">Rankings</button>
<button onClick={() => navigate('/login')} className="text-[#adc6ff] hover:text-[#fff] transition-colors duration-200 cursor-pointer active:scale-95">Login</button>
<button onClick={() => navigate('/signup')} className="text-on-primary bg-primary px-4 py-1.5 rounded text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95">Sign Up</button>
</div>
</div>

</div>
</nav>

<main className="relative pt-32 pb-20 overflow-hidden min-h-screen flex flex-col justify-center">

<div className="absolute inset-0 obsidian-grid opacity-30 -z-10"></div>
<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/5 rounded-full blur-[120px] -z-10"></div>
<div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
<div className="z-10">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/15 mb-6">
<span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
<span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">DevDuelARENA_v2.6.4_STABLE</span>
</div>
<h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-on-surface">
                    CODE.<br/>BATTLE.<br/><span className="text-primary">DOMINATE.</span>
</h1>
<p className="text-xl text-on-surface-variant max-w-lg mb-10 leading-relaxed">
                    The elite competitive programming arena for serious engineers. Real-time head-to-head syntax battles with sub-ms latency.
                </p>
<div className="flex flex-wrap gap-4">
<button onClick={() => navigate('/arena/demo')} className="bg-primary hover:bg-primary/90 text-on-primary px-8 py-4 rounded-lg font-bold transition-all flex items-center gap-3 active:scale-95 shadow-lg shadow-primary/20">
                        ENTER THE ARENA <span className="material-symbols-outlined">bolt</span>
</button>
<button onClick={() => navigate('/watch/demo')} className="bg-surface-container-high border border-outline-variant/20 hover:bg-surface-container-highest text-on-surface px-8 py-4 rounded-lg font-bold transition-all active:scale-95">
                        VIEW RANKINGS
                    </button>
</div>

<div className="mt-16 flex gap-12 border-t border-outline-variant/10 pt-8">
<div>
<div className="text-2xl font-bold mono">1,420</div>
<div className="text-[10px] uppercase tracking-widest text-on-surface-variant mono">Live Sessions</div>
</div>
<div>
<div className="text-2xl font-bold mono text-tertiary">460</div>
<div className="text-[10px] uppercase tracking-widest text-on-surface-variant mono">Active Coders</div>
</div>
<div>
<div className="text-2xl font-bold mono">99.9%</div>
<div className="text-[10px] uppercase tracking-widest text-on-surface-variant mono">Uptime</div>
</div>
</div>
</div>

<div className="perspective-container hidden lg:block">
<div className="terminal-3d glass-panel rounded-xl overflow-hidden shadow-2xl relative">
<div className="bg-surface-container-highest px-4 py-3 flex items-center justify-between border-b border-outline-variant/10">
<div className="flex gap-2">
<div className="w-2.5 h-2.5 rounded-full bg-error/40"></div>
<div className="w-2.5 h-2.5 rounded-full bg-secondary-container"></div>
<div className="w-2.5 h-2.5 rounded-full bg-tertiary/40"></div>
</div>
<div className="text-[10px] font-mono text-on-surface-variant tracking-widest">DUEL_VS_KRONOS_X.PY</div>
<div className="w-12"></div>
</div>
<div className="p-6 font-mono text-sm leading-relaxed min-h-[400px] bg-surface-container-lowest">
<div className="flex gap-4">
<span className="text-on-surface-variant/30 select-none">01</span>
<span><span className="text-tertiary">def</span> <span className="text-primary">solve_binary_tree</span>(root):</span>
</div>
<div className="flex gap-4 bg-primary-container/10 border-l-2 border-primary">
<span className="text-on-surface-variant/30 select-none">02</span>
<span>    <span className="text-on-surface-variant"># Analyzing path complexity...</span></span>
</div>
<div className="flex gap-4">
<span className="text-on-surface-variant/30 select-none">03</span>
<span>    queue = [(root, <span className="text-primary">0</span>)]</span>
</div>
<div className="flex gap-4">
<span className="text-on-surface-variant/30 select-none">04</span>
<span>    <span className="text-tertiary">while</span> queue:</span>
</div>
<div className="flex gap-4">
<span className="text-on-surface-variant/30 select-none">05</span>
<span>        node, level = queue.<span className="text-primary">pop</span>(<span className="text-primary">0</span>)</span>
</div>

<div className="absolute bottom-8 right-8 w-48 glass-panel p-4 rounded-lg animate-pulse border-primary/30">
<div className="text-[9px] uppercase tracking-tighter text-primary mb-2">AI Analysis Overlay</div>
<div className="h-1 bg-surface-variant rounded-full overflow-hidden mb-2">
<div className="h-full bg-primary w-2/3"></div>
</div>
<div className="text-[10px] text-on-surface-variant">Complexity: O(N)</div>
<div className="text-[10px] text-tertiary">Efficiency: 98%</div>
</div>

<div className="absolute top-20 right-[-20px] bg-tertiary text-on-tertiary px-3 py-1 rounded-sm text-[10px] font-bold shadow-xl rotate-12">
                            SYNC: 4ms
                        </div>
</div>
</div>
</div>
</div>

<div className="mt-20 border-y border-outline-variant/10 bg-surface-container-low/50 py-3 overflow-hidden whitespace-nowrap">
<div className="flex animate-marquee gap-12 font-mono text-xs text-on-surface-variant/80">
<span>&gt; ZER0_DAY defeated SYNTAX_ERROR 2s ago</span>
<span className="text-tertiary">&gt; ALGO_GOD gained +25 ELO 8s ago</span>
<span>&gt; NEW_CHALLENGE: Binary Tree Reversal (Hard) started 15s ago</span>
<span>&gt; SYSTEM: v2.4.0 Deployment Successful</span>
<span className="text-primary">&gt; ARENA_MASTER currently on 12-win streak</span>
<span>&gt; ZER0_DAY defeated SYNTAX_ERROR 2s ago</span>
<span className="text-tertiary">&gt; ALGO_GOD gained +25 ELO 8s ago</span>
</div>
</div>
</main>

<section className="py-24 bg-surface px-6">
<div className="max-w-7xl mx-auto">
<div className="mb-16">
<h2 className="text-4xl font-bold tracking-tight mb-4">Core Systems</h2>
<p className="text-on-surface-variant max-w-xl">Precision-engineered runtime for zero-latency competitive execution.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<div className="surface-container-low p-8 rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all group">
<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
<span className="material-symbols-outlined">timer</span>
</div>
<h3 className="text-xl font-bold mb-3">Ultra-Low Latency</h3>
<p className="text-on-surface-variant text-sm leading-relaxed mb-6">Our proprietary 'Neon-Wire' socket layer ensures sub-10ms round-trip execution for real-time visual feedback.</p>
<div className="font-mono text-[10px] text-primary bg-primary/5 p-3 rounded">
                        AVG_RTT: 4.2ms<br/>JITTER: &lt; 0.1ms
                    </div>
</div>

<div className="surface-container p-8 rounded-xl border border-outline-variant/10 hover:border-tertiary/20 transition-all relative overflow-hidden">
<div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 blur-2xl"></div>
<div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center mb-6 text-tertiary">
<span className="material-symbols-outlined">memory</span>
</div>
<h3 className="text-xl font-bold mb-3">Isomorphic Runtime</h3>
<p className="text-on-surface-variant text-sm leading-relaxed mb-6">Execution environments are mirrored exactly between local and arena servers using containerized micro-kernels.</p>
<div className="flex gap-2">
<span className="px-2 py-1 rounded bg-surface-container-highest font-mono text-[9px]">V8_TURBO</span>
<span className="px-2 py-1 rounded bg-surface-container-highest font-mono text-[9px]">WASM_CORE</span>
</div>
</div>

<div className="surface-container-low p-8 rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all">
<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
<span className="material-symbols-outlined">shield</span>
</div>
<h3 className="text-xl font-bold mb-3">Anti-Cheat Engine</h3>
<p className="text-on-surface-variant text-sm leading-relaxed mb-6">AI-driven key-cadence analysis and packet inspection ensure that every line of code is human-crafted in real-time.</p>
<div className="font-mono text-[10px] text-error bg-error/5 p-3 rounded">
                        THREAT_LEVEL: NOMINAL<br/>ACTIVE_SCAN: 100%
                    </div>
</div>
</div>
</div>
</section>

<section className="py-24 bg-surface-container-lowest px-6 relative overflow-hidden">
<div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
<div className="relative">
<img alt="Code interface" className="rounded-xl shadow-2xl opacity-80 border border-outline-variant/20" data-alt="Modern dark software code editor on high-resolution monitor with dramatic neon blue and emerald green syntax highlighting highlights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUmWEx_BnhgZQIu4JOakJRP7cz_d2EvmaOzp-G5RqrZd8GKKKDwaqS8LAlz-8Gx6krdDicQP8t_o7eb6Dgp9BXRUDRcbTpJ5Uq5W64Vs230AqyYcfUYVxK9TCyIPfvFJr_zezznEXRQHQehdNAF-SeoyxDRL7a0-WhAtLYjyLwLqARhJ4lcopFdYdXLvIGMgxAziu5bpS_knyW3c8ktV1DiH2IMQRRDHapWYBc90-RhcFzopb5lAiG9NSKvv3vH3oSs0jao4FTIQo"/>
<div className="absolute -bottom-8 -right-8 glass-panel p-6 rounded-xl border-tertiary/20 max-w-xs">
<div className="flex items-center gap-2 mb-4">
<span className="material-symbols-outlined text-tertiary">psychology</span>
<span className="font-bold text-sm">Neural Suggestion</span>
</div>
<p className="text-xs text-on-surface-variant leading-relaxed mb-4">Advanced heuristics predict the optimal algorithmic path before you even finish the function signature.</p>
<div className="text-[10px] font-mono text-tertiary">OPTIMIZING: 0(log n)</div>
</div>
</div>
<div>
<h2 className="text-4xl font-bold tracking-tight mb-6">Tactical Edge</h2>
<p className="text-on-surface-variant text-lg leading-relaxed mb-8">Elevate your competitive performance with integrated AI tooling built specifically for high-speed problem solving.</p>
<ul className="space-y-6">
<li className="flex items-start gap-4">
<div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 shrink-0">
<span className="material-symbols-outlined text-[14px] text-primary">check</span>
</div>
<div>
<h4 className="font-bold mb-1">Live Heuristic Analysis</h4>
<p className="text-sm text-on-surface-variant">Real-time Big-O analysis of your current solution as you type.</p>
</div>
</li>
<li className="flex items-start gap-4">
<div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 shrink-0">
<span className="material-symbols-outlined text-[14px] text-primary">check</span>
</div>
<div>
<h4 className="font-bold mb-1">Predictive Debugging</h4>
<p className="text-sm text-on-surface-variant">Auto-detect edge cases and logic flaws before running the test suite.</p>
</div>
</li>
<li className="flex items-start gap-4">
<div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 shrink-0">
<span className="material-symbols-outlined text-[14px] text-primary">check</span>
</div>
<div>
<h4 className="font-bold mb-1">Adaptive HUD</h4>
<p className="text-sm text-on-surface-variant">A custom interface that highlights opponent progress and bottleneck points.</p>
</div>
</li>
</ul>
</div>
</div>
</section>

<section className="py-24 px-6 bg-surface">
<div className="max-w-7xl mx-auto">
<div className="flex justify-between items-end mb-12">
<div>
<h2 className="text-4xl font-bold tracking-tight mb-4">The Elite</h2>
<p className="text-on-surface-variant">Current seasonal rankings. The top 0.01% of global engineering talent.</p>
</div>
<div className="hidden sm:block">
<span className="font-mono text-[10px] text-on-surface-variant/40 tracking-widest uppercase">Last Update: Just Now</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-separate border-spacing-y-2">
<thead>
<tr className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
<th className="px-6 py-4 font-medium">Rank</th>
<th className="px-6 py-4 font-medium">Engineer</th>
<th className="px-6 py-4 font-medium">ELO Rating</th>
<th className="px-6 py-4 font-medium">Streak</th>
<th className="px-6 py-4 font-medium">Tech Stack</th>
<th className="px-6 py-4 font-medium">Status</th>
</tr>
</thead>
<tbody className="text-sm">
<tr className="bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
<td className="px-6 py-5 font-mono text-primary font-bold">#01</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center font-bold text-xs">Z</div>
<span className="font-bold">ZER0_DAY</span>
</div>
</td>
<td className="px-6 py-5 font-mono">2,840</td>
<td className="px-6 py-5 text-tertiary font-bold">12 🔥</td>
<td className="px-6 py-5">
<span className="px-2 py-1 rounded bg-surface-container-high text-[10px] font-mono">RUST</span>
</td>
<td className="px-6 py-5">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold">
<span className="w-1 h-1 rounded-full bg-tertiary"></span> IN_ARENA
                                </span>
</td>
</tr>
<tr className="bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
<td className="px-6 py-5 font-mono text-primary font-bold">#02</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center font-bold text-xs">A</div>
<span className="font-bold">ALGO_GOD</span>
</div>
</td>
<td className="px-6 py-5 font-mono">2,715</td>
<td className="px-6 py-5 text-on-surface-variant font-bold">3 -</td>
<td className="px-6 py-5">
<span className="px-2 py-1 rounded bg-surface-container-high text-[10px] font-mono">CPP</span>
</td>
<td className="px-6 py-5">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-[10px] font-bold">
                                    OFFLINE
                                </span>
</td>
</tr>
<tr className="bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
<td className="px-6 py-5 font-mono text-primary font-bold">#03</td>
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center font-bold text-xs">S</div>
<span className="font-bold">SYNTAX_ERROR</span>
</div>
</td>
<td className="px-6 py-5 font-mono">2,698</td>
<td className="px-6 py-5 text-tertiary font-bold">7 🔥</td>
<td className="px-6 py-5">
<span className="px-2 py-1 rounded bg-surface-container-high text-[10px] font-mono">GO</span>
</td>
<td className="px-6 py-5">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold">
<span className="w-1 h-1 rounded-full bg-tertiary"></span> IN_ARENA
                                </span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</section>

<section className="py-32 px-6 relative overflow-hidden">
<div className="absolute inset-0 bg-primary/5 -z-10"></div>
<div className="max-w-4xl mx-auto text-center">
<h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 italic-none">READY FOR DEPLOYMENT?</h2>
<p className="text-xl text-on-surface-variant mb-12">The arena doesn't care about your resume. Only your syntax matters.</p>
<div className="flex flex-col sm:flex-row gap-4 justify-center">
<button onClick={() => navigate('/arena/demo')} className="bg-primary text-on-primary px-10 py-5 rounded-lg font-bold text-lg active:scale-95 transition-transform">
                    START MATCHMAKING
                </button>
<button onClick={() => window.open('https://discord.gg', '_blank')} className="bg-surface-container-high border border-outline-variant/20 text-on-surface px-10 py-5 rounded-lg font-bold text-lg active:scale-95 transition-transform">
                    JOIN THE DISCORD
                </button>
</div>
</div>
</section>

<footer className="bg-[#131313] border-t border-[#424754]/15">
<div className="flex flex-col md:flex-row justify-between items-center py-8 px-6 max-w-7xl mx-auto gap-4 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#e5e2e1]/40">
<div>
                © 2024 DEVDUEL • System: Operational • v2.4.0-stable
            </div>
<div className="flex gap-8">
<a className="hover:text-[#4edea3] transition-colors" href="#">Status</a>
<a className="hover:text-[#4edea3] transition-colors" href="#">GitHub</a>
<a className="hover:text-[#4edea3] transition-colors" href="#">Changelog</a>
<a className="hover:text-[#4edea3] transition-colors" href="#">Security</a>
</div>
</div>
</footer>


        </div>
    );
}
