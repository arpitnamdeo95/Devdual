import { useNavigate } from 'react-router-dom';
import { BOSSES } from '../data/bosses';
import { AppNavbar, AppSidebar } from '../components/AppLayout';

export default function BossSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-body">
      <AppNavbar />
      <div className="flex pt-16 h-[calc(100vh-64px)] overflow-hidden">
        <AppSidebar />
        
        <main className="flex-1 p-8 overflow-y-auto relative">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <header className="text-center space-y-4 max-w-2xl mx-auto pt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-mono text-xs uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px]">swords_out</span>
                Single Player Campaign
              </div>
              <h1 className="text-5xl font-black tracking-tight text-white">Algorithm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Bosses</span></h1>
              <p className="text-slate-400 font-mono text-sm leading-relaxed">
                Test your mastery of specific data structures and algorithms by defeating their guardians. Defeat 3 out of 5 variations to claim victory.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
              {BOSSES.map((boss) => (
                <div 
                  key={boss.id}
                  className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 transition-all hover:border-indigo-500/50 hover:bg-slate-800/80 group flex flex-col h-full shadow-xl shadow-black/20 hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/boss-arena/${boss.id}`)}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${boss.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-3xl text-white drop-shadow-md">{boss.icon}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">{boss.name}</h2>
                  <p className="text-slate-400 font-mono text-xs leading-relaxed flex-1 mb-8">
                    {boss.description}
                  </p>

                  <div className="space-y-4 mt-auto">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500">Challenges</span>
                      <span className="text-indigo-400 font-bold">{boss.questions.length} variations</span>
                    </div>

                    <button className="w-full py-3 px-4 bg-slate-800 text-white font-mono text-sm font-bold uppercase tracking-widest rounded-xl border border-slate-700 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-colors flex items-center justify-center gap-2">
                       Challenge
                       <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
