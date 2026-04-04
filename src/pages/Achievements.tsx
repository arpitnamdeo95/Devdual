import { AppSidebar, AppNavbar } from '../components/AppLayout';
import { useSpacetimeData } from '../spacetimeProvider';

export default function Achievements() {
  const localIdentity = localStorage.getItem('devduel_user_identity') || '';

  const badges = useSpacetimeData(db => Array.from(db.badge.iter()));
  const myBadges = useSpacetimeData(db => 
    Array.from(db.userBadge.iter()).filter(b => b.userIdentity === localIdentity)
  );

  const ownedBadgeIds = new Set(myBadges.map(b => b.badgeId));

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <AppNavbar />
      <div className="flex pt-16 h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 p-8 overflow-y-auto relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-tertiary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
          </div>

          <div className="max-w-5xl mx-auto relative z-10 space-y-10">
            <header>
              <h1 className="text-4xl font-black tracking-tight mb-2">My <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-primary">Achievements</span></h1>
              <p className="text-on-surface-variant font-mono text-sm max-w-2xl">
                Track your progress and showcase your legendary status. Earn badges by completing challenges and participating in battles.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map(badge => {
                const owned = ownedBadgeIds.has(badge.id);
                return (
                  <div 
                    key={badge.id}
                    className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                      owned 
                        ? 'bg-surface-container-high border-tertiary/40 shadow-[0_0_30px_rgba(78,222,163,0.15)] hover:bg-surface-bright hover:-translate-y-1' 
                        : 'bg-surface-container border-white/5 opacity-60 grayscale hover:grayscale-0'
                    }`}
                  >
                    {owned && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      </div>
                    )}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                      owned ? 'bg-tertiary/20 text-tertiary' : 'bg-white/10 text-on-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined text-3xl">
                        {badge.id.includes('streak') ? 'local_fire_department' : 
                         badge.id.includes('win') ? 'emoji_events' :
                         badge.id.includes('legend') ? 'diamond' :
                         badge.id.includes('fast') ? 'bolt' : 'military_tech'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
                    <p className="text-sm font-mono text-on-surface-variant whitespace-pre-wrap">{badge.description}</p>
                  </div>
                );
              })}

              {badges.length === 0 && (
                <div className="col-span-full text-center py-20 text-on-surface-variant font-mono">
                  Loading badges from SpacetimeDB...
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
