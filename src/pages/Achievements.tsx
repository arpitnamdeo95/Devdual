import { AppSidebar, AppNavbar } from '../components/AppLayout';
import { useSpacetimeData } from '../spacetimeProvider';
import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';

/* ─── Badge metadata ────────────────────────────────────────────────── */
const BADGE_META: Record<string, { icon: string; color: string; glow: string; rarity: string }> = {
  first_win:    { icon: 'emoji_events', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.25)]', rarity: 'COMMON' },
  fast_solver:  { icon: 'bolt',         color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', glow: 'shadow-[0_0_30px_rgba(52,211,153,0.25)]', rarity: 'RARE' },
  streak_3:     { icon: 'local_fire_department', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30', glow: 'shadow-[0_0_30px_rgba(251,146,60,0.25)]', rarity: 'RARE' },
  streak_5:     { icon: 'local_fire_department', color: 'text-red-400 bg-red-400/10 border-red-400/30',    glow: 'shadow-[0_0_30px_rgba(248,113,113,0.25)]', rarity: 'EPIC' },
  legend:       { icon: 'diamond',      color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',  glow: 'shadow-[0_0_30px_rgba(192,132,252,0.25)]', rarity: 'LEGENDARY' },
};

function getBadgeMeta(id: string) {
  for (const key of Object.keys(BADGE_META)) {
    if (id.includes(key)) return BADGE_META[key];
  }
  return { icon: 'military_tech', color: 'text-primary bg-primary/10 border-primary/30', glow: '', rarity: 'COMMON' };
}

function rarityColor(r: string) {
  if (r === 'LEGENDARY') return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
  if (r === 'EPIC')      return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
  if (r === 'RARE')      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30';
}

/* ─── Toast ─────────────────────────────────────────────────────────── */
interface ToastData { id: number; badge: { name: string; id: string } }

export default function Achievements() {
  const localIdentity = localStorage.getItem('devduel_user_identity') || '';

  const badges   = useSpacetimeData(db => Array.from(db.badge.iter()));
  const myBadges = useSpacetimeData(db =>
    Array.from(db.userBadge.iter()).filter(b => b.userIdentity === localIdentity)
  );

  const ownedBadgeIds = new Set(myBadges.map(b => b.badgeId));
  const prevOwnedRef  = useRef<Set<string>>(new Set());

  /* ── Track newly awarded badges and fire toasts ── */
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  useEffect(() => {
    const prev = prevOwnedRef.current;
    const newlyEarned = [...ownedBadgeIds].filter(id => !prev.has(id));

    if (newlyEarned.length) {
      newlyEarned.forEach(badgeId => {
        const badgeObj = badges.find(b => b.id === badgeId);
        if (!badgeObj) return;
        const id = toastCounter + 1;
        setToastCounter(c => c + 1);
        setToasts(prev => [...prev, { id, badge: { name: badgeObj.name, id: badgeId } }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
      });
    }

    prevOwnedRef.current = new Set(ownedBadgeIds);
  }, [myBadges]);

  /* ── Also listen for live badge grant (via game-end → grantBadge) ── */
  useEffect(() => {
    const onGameEnd = (data: any) => {
      if (data.winnerIdentity && data.winnerIdentity === localIdentity) {
        const id = Date.now();
        setToasts(prev => [...prev, { id, badge: { name: 'First Win', id: 'first_win' } }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
      }
    };
    socket.on('game-end', onGameEnd);
    return () => { socket.off('game-end', onGameEnd); };
  }, [localIdentity]);

  const earned = badges.filter(b => ownedBadgeIds.has(b.id));
  const locked = badges.filter(b => !ownedBadgeIds.has(b.id));

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">

      {/* ── Badge Toast Notifications ── */}
      <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => {
          const meta = getBadgeMeta(t.badge.id);
          return (
            <div
              key={t.id}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[280px] pointer-events-auto animate-in slide-in-from-right duration-500 ${meta.color} ${meta.glow}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-black/20`}>
                <span className="material-symbols-outlined text-2xl">{meta.icon}</span>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">🏅 Badge Unlocked!</div>
                <div className="font-black text-base">{t.badge.name}</div>
                <div className={`text-[10px] mt-1 px-1.5 py-0.5 rounded border w-fit font-bold uppercase tracking-widest ${rarityColor(meta.rarity)}`}>
                  {meta.rarity}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AppNavbar />
      <div className="flex pt-16 h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 p-8 overflow-y-auto relative">

          {/* BG glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-tertiary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
          </div>

          <div className="max-w-5xl mx-auto relative z-10 space-y-10">

            {/* Header */}
            <header>
              <h1 className="text-4xl font-black tracking-tight mb-2">
                My{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-primary">
                  Achievements
                </span>
              </h1>
              <p className="text-on-surface-variant font-mono text-sm max-w-2xl">
                Earn badges by winning battles, solving problems fast, and achieving milestones.
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                  {earned.length} / {badges.length} earned
                </span>
              </p>
            </header>

            {/* Progress bar */}
            <div className="bg-surface-container rounded-2xl p-5 border border-white/5">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-mono text-on-surface-variant">Achievement Progress</span>
                <span className="font-bold text-tertiary">{badges.length ? Math.round((earned.length / badges.length) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-tertiary to-primary rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(78,222,163,0.4)]"
                  style={{ width: `${badges.length ? (earned.length / badges.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Earned */}
            {earned.length > 0 && (
              <section>
                <h2 className="text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
                  Unlocked ({earned.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {earned.map(badge => {
                    const meta = getBadgeMeta(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 bg-surface-container-high ${meta.color} ${meta.glow}`}
                      >
                        {/* Owned checkmark */}
                        <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-lg z-10">
                          <span className="material-symbols-outlined text-sm">check</span>
                        </div>

                        {/* Rarity */}
                        <div className={`absolute top-4 left-4 text-[9px] px-2 py-0.5 rounded border font-black uppercase tracking-widest ${rarityColor(meta.rarity)}`}>
                          {meta.rarity}
                        </div>

                        <div className="mt-6">
                          <div className="w-14 h-14 rounded-full border mb-4 flex items-center justify-center bg-black/20">
                            <span className="material-symbols-outlined text-3xl">{meta.icon}</span>
                          </div>
                          <h3 className="text-lg font-black mb-1">{badge.name}</h3>
                          <p className="text-sm opacity-80 font-mono leading-relaxed">{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Locked */}
            {locked.length > 0 && (
              <section>
                <h2 className="text-xs font-mono text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-zinc-600 text-sm">lock</span>
                  Locked ({locked.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {locked.map(badge => {
                    const meta = getBadgeMeta(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className="relative p-6 rounded-2xl border border-white/5 bg-surface-container opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-300 group"
                      >
                        <span className="absolute top-4 right-4 material-symbols-outlined text-zinc-600 text-sm group-hover:text-zinc-400 transition-colors">lock</span>
                        <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-3xl text-on-surface-variant">{meta.icon}</span>
                        </div>
                        <h3 className="text-lg font-black mb-1 text-on-surface">{badge.name}</h3>
                        <p className="text-sm text-on-surface-variant font-mono leading-relaxed">{badge.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {badges.length === 0 && (
              <div className="col-span-full text-center py-20 text-on-surface-variant font-mono">
                <div className="text-4xl mb-4">🏅</div>
                <p>Connecting to badge server...</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
