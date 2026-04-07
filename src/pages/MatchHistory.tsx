import { AppSidebar, AppNavbar } from '../components/AppLayout';
import { useSupabaseData } from '../supabaseProvider';
import { useNavigate } from 'react-router-dom';

export default function MatchHistory() {
  const navigate = useNavigate();
  const localIdentity = localStorage.getItem('devduel_user_identity') || '';

  // Get all matches ordered by newest first
  const allMatches = useSupabaseData(state => 
    [...state.matches]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  );

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <AppNavbar />
      <div className="flex pt-16 h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 p-8 overflow-y-auto relative">
          <div className="max-w-6xl mx-auto space-y-8">
            <header>
              <h1 className="text-4xl font-black tracking-tight mb-2">Match <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">History</span></h1>
              <p className="text-on-surface-variant font-mono text-sm max-w-2xl">
                A globally synchronized record of all battles played.
              </p>
            </header>

            <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-surface border-b border-white/5 text-[10px] text-on-surface-variant uppercase tracking-widest">
                    <th className="p-4 font-normal">Match ID</th>
                    <th className="p-4 font-normal" align="center">Winner</th>
                    <th className="p-4 font-normal" align="center">Loser</th>
                    <th className="p-4 font-normal">Date (UTC)</th>
                    <th className="p-4 font-normal text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {allMatches.map((match, idx) => {
                    const isMyMatch = match.winner_id === localIdentity || match.loser_id === localIdentity;
                    const date = new Date(match.created_at).toLocaleString();
                    
                    return (
                      <tr 
                        key={match.id} 
                        className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${isMyMatch ? 'bg-primary/5' : ''}`}
                      >
                        <td className="p-4 text-on-surface-variant truncate max-w-[120px]" title={match.id}>
                          {match.id.substring(0, 12)}...
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${match.winner_id === localIdentity ? 'bg-tertiary/20 text-tertiary' : 'bg-surface-container-high text-on-surface'}`}>
                            {match.winner_id.substring(0,10)}
                            {match.winner_id === localIdentity && ' (You)'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${match.loser_id === localIdentity ? 'bg-error/20 text-error' : 'bg-surface-container-high text-on-surface'}`}>
                            {match.loser_id.substring(0,10)}
                            {match.loser_id === localIdentity && ' (You)'}
                          </span>
                        </td>
                        <td className="p-4 text-on-surface-variant text-xs">{date}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => navigate(`/review/${match.id}`)}
                            className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                          >
                            Review Tape
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {allMatches.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-on-surface-variant text-sm">
                        No matches recorded yet. The arena awaits.
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
