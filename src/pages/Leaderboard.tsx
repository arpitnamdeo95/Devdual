import { AppSidebar, AppNavbar } from '../components/AppLayout';
import { useSpacetimeData } from '../spacetimeProvider';

export default function Leaderboard() {
  const localIdentity = localStorage.getItem('devduel_user_identity') || '';

  // Get leaderboard ordered by highest ELO
  const leaderboard = useSpacetimeData(db => 
    Array.from(db.leaderboardEntry.iter())
      .sort((a, b) => b.elo - a.elo)
  );

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <AppNavbar />
      <div className="flex pt-16 h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 p-8 overflow-y-auto relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-tertiary/10 rounded-full blur-[150px]" />
          </div>

          <div className="max-w-4xl mx-auto space-y-10 relative z-10">
            <header className="text-center">
              <span className="material-symbols-outlined text-6xl text-tertiary mb-4">diamond</span>
              <h1 className="text-5xl font-black tracking-tight mb-2">Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-primary">Leaderboard</span></h1>
              <p className="text-on-surface-variant font-mono text-sm max-w-2xl mx-auto">
                The most elite hackers on DevDuel. Prove your worth in the arena to climb the ranks.
              </p>
            </header>

            <div className="bg-surface-container rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-surface border-b border-white/5 text-[11px] text-on-surface-variant uppercase tracking-widest">
                    <th className="p-5 font-normal text-center w-24">Rank</th>
                    <th className="p-5 font-normal">Player</th>
                    <th className="p-5 font-normal text-right">Rating (ELO)</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    const isMe = entry.userIdentity === localIdentity;
                    
                    return (
                      <tr 
                        key={entry.userIdentity} 
                        className={`border-b border-white/5 last:border-0 transition-colors ${
                          isMe ? 'bg-primary/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="p-5 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black ${
                            rank === 1 ? 'bg-yellow-400/20 text-yellow-400' :
                            rank === 2 ? 'bg-slate-300/20 text-slate-300' :
                            rank === 3 ? 'bg-amber-700/20 text-amber-500' :
                            'text-on-surface-variant'
                          }`}>
                            #{rank}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold text-lg ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                              {entry.username}
                            </span>
                            {isMe && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] uppercase font-black tracking-widest">You</span>}
                          </div>
                          <div className="text-[10px] text-on-surface-variant/50">{entry.userIdentity.substring(0, 15)}...</div>
                        </td>
                        <td className="p-5 text-right">
                          <span className="text-xl font-black text-tertiary">{entry.elo}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-16 text-center text-on-surface-variant">
                        The leaderboard is currently empty. Be the first to play!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
