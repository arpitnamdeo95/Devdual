import { AppSidebar, AppNavbar } from '../components/AppLayout';
import { useSpacetimeData } from '../spacetimeProvider';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const localIdentity = localStorage.getItem('devduel_user_identity') || '';

  const stats = useSpacetimeData(db => Array.from(db.gameStat.iter()));
  const myMatches = useSpacetimeData(db => 
    Array.from(db.matchLog.iter())
      .filter(m => m.winnerId === localIdentity || m.loserId === localIdentity)
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
  );

  const getStat = (id: string) => stats.find(s => s.statId === id)?.value || '0';

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <AppNavbar />
      <div className="flex pt-16 h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 p-8 overflow-y-auto relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10 space-y-12">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">DevDuel <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Dashboard</span></h1>
                <p className="text-on-surface-variant font-mono text-sm max-w-2xl">
                  Global server statistics and summary of your latest action.
                </p>
              </div>
              <button
                onClick={() => navigate('/arena/matchmaking')}
                className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">swords</span>
                PLAY NOW
              </button>
            </header>

            {/* Global Stats Matrix */}
            <section>
              <h2 className="text-[12px] font-mono text-on-surface-variant uppercase tracking-widest mb-4">Live Server Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Players', value: getStat('active_players'), icon: 'groups' },
                  { label: 'Live Matches', value: getStat('matches_in_progress'), icon: 'sports_esports' },
                  { label: 'Matches Played', value: getStat('total_matches_played'), icon: 'history' },
                  { label: 'Avg Match Time', value: getStat('average_match_time') + 's', icon: 'timer' },
                ].map((s, i) => (
                  <div key={i} className="bg-surface-container rounded-2xl p-5 border border-white/5 hover:border-primary/30 transition-colors">
                    <span className="material-symbols-outlined text-primary/60 mb-2">{s.icon}</span>
                    <div className="text-3xl font-black">{s.value}</div>
                    <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Access Links */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Match History', path: '/history', icon: 'history', desc: 'Browse the global combat log' },
                { label: 'Leaderboard', path: '/leaderboard', icon: 'leaderboard', desc: 'Top player rankings & ELO' },
                { label: 'Achievements', path: '/achievements', icon: 'military_tech', desc: 'Your badges and milestones' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="bg-surface-container rounded-2xl p-6 border border-white/5 hover:border-primary/30 hover:-translate-y-1 transition-all group flex flex-col items-center justify-center text-center gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-surface-container-high text-primary flex justify-center items-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.label}</h3>
                    <p className="font-mono text-xs text-on-surface-variant mt-1">{item.desc}</p>
                  </div>
                </button>
              ))}
            </section>

            {/* Recent Match Preview */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-[12px] font-mono text-on-surface-variant uppercase tracking-widest">Your Recent Matches</h2>
                <button 
                  onClick={() => navigate('/history')}
                  className="text-[12px] font-bold text-primary hover:text-tertiary transition-colors"
                >
                  View All History →
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myMatches.slice(0, 4).map(match => {
                  const won = match.winnerId === localIdentity;
                  return (
                    <div 
                      key={match.matchId}
                      onClick={() => navigate(`/review/${match.matchId}`)}
                      className={`p-4 rounded-xl border cursor-pointer hover:-translate-y-1 transition-all flex justify-between items-center ${
                        won ? 'bg-tertiary/10 border-tertiary/20 hover:border-tertiary/50' : 'bg-error/10 border-error/20 hover:border-error/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${won ? 'bg-tertiary/20 text-tertiary' : 'bg-error/20 text-error'}`}>
                          <span className="material-symbols-outlined">{won ? 'emoji_events' : 'close'}</span>
                        </div>
                        <div>
                          <div className={`font-black text-lg ${won ? 'text-tertiary' : 'text-error'}`}>{won ? 'VICTORY' : 'DEFEAT'}</div>
                          <div className="text-[11px] font-mono text-on-surface-variant">vs {won ? match.loserId.split('_')[0] : match.winnerId.split('_')[0]}</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                    </div>
                  );
                })}
                {myMatches.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-surface-container rounded-2xl border border-white/5 font-mono text-on-surface-variant text-sm">
                    No recent matches found. Go play a game!
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
