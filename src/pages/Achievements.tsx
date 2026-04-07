import { AppSidebar, AppNavbar } from '../components/AppLayout';
import { useSupabaseData } from '../supabaseProvider';
import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Shield, Zap, Flame, Award, Star, History, Target, TrendingUp, Medal, Loader } from 'lucide-react';

/* ─── Badge metadata ────────────────────────────────────────────────── */
const BADGE_META: Record<string, { icon: any; color: string; glow: string; rarity: string; textColor: string }> = {
  first_win:    { icon: Award,    color: 'bg-yellow-400/10 border-yellow-400/30', textColor: 'text-yellow-400', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.25)]', rarity: 'COMMON' },
  fast_solver:  { icon: Zap,      color: 'bg-emerald-400/10 border-emerald-400/30', textColor: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(52,211,153,0.25)]', rarity: 'RARE' },
  streak_3:     { icon: Flame,    color: 'bg-orange-400/10 border-orange-400/30', textColor: 'text-orange-400', glow: 'shadow-[0_0_30px_rgba(251,146,60,0.25)]', rarity: 'RARE' },
  streak_5:     { icon: Flame,    color: 'bg-red-400/10 border-red-400/30',       textColor: 'text-red-400',    glow: 'shadow-[0_0_30px_rgba(248,113,113,0.25)]', rarity: 'EPIC' },
  streak_10:    { icon: Target,   color: 'bg-indigo-400/10 border-indigo-400/30', textColor: 'text-indigo-400',  glow: 'shadow-[0_0_30px_rgba(129,140,248,0.25)]', rarity: 'LEGENDARY' },
  matches_10:   { icon: History,  color: 'bg-blue-400/10 border-blue-400/30',     textColor: 'text-blue-400',   glow: '', rarity: 'COMMON' },
  matches_50:   { icon: Shield,   color: 'bg-zinc-400/10 border-zinc-400/30',     textColor: 'text-white',      glow: '', rarity: 'RARE' },
  elo_1500:     { icon: TrendingUp, color: 'bg-cyan-400/10 border-cyan-400/30', textColor: 'text-cyan-400',   glow: '', rarity: 'COMMON' },
  elo_2000:     { icon: Star,     color: 'bg-amber-400/10 border-amber-400/30',   textColor: 'text-amber-400',  glow: '', rarity: 'EPIC' },
  elo_2500:     { icon: Medal,    color: 'bg-purple-400/10 border-purple-400/30', textColor: 'text-purple-400', glow: 'shadow-[0_0_50px_rgba(168,85,247,0.3)]', rarity: 'LEGENDARY' },
};

function getBadgeMeta(id: string) {
  const meta = BADGE_META[id];
  if (meta) return meta;
  return { icon: Medal, color: 'bg-primary/10 border-primary/30', textColor: 'text-primary', glow: '', rarity: 'COMMON' };
}

function rarityColor(r: string) {
  if (r === 'LEGENDARY') return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
  if (r === 'EPIC')      return 'text-red-400 bg-red-400/10 border-red-400/30';
  if (r === 'RARE')      return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30';
}

/* ─── Toast ─────────────────────────────────────────────────────────── */
interface ToastData { id: number; badge: { name: string; id: string } }

export default function Achievements() {
  const localIdentity = localStorage.getItem('devduel_user_identity') || '';

  const me = useSupabaseData(state => state.players.find(p => p.username === localIdentity));
  const badges = useSupabaseData(state => state.badges);
  const myBadges = useSupabaseData(state =>
    state.playerBadges.filter(b => b.player_id === me?.id)
  );

  const ownedBadgeIds = new Set(myBadges.map(b => b.badge_id));
  const prevOwnedRef  = useRef<Set<string>>(new Set());

  /* ── Track newly awarded badges and fire toasts ── */
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  useEffect(() => {
    const prev = prevOwnedRef.current;
    const newlyEarned = [...ownedBadgeIds].filter(id => !prev.has(id));

    if (newlyEarned.length && prev.size > 0) { // Don't toast on initial load
      newlyEarned.forEach(badgeId => {
        const badgeObj = badges.find(b => b.id === badgeId);
        if (!badgeObj) return;
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, badge: { name: badgeObj.name, id: badgeId } }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
      });
    }

    prevOwnedRef.current = new Set(ownedBadgeIds);
  }, [myBadges]);

  const earnedCount = ownedBadgeIds.size;
  const totalCount = badges.length || 10;
  const progressPercent = Math.round((earnedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/20">
      <AppNavbar />
      <div className="flex flex-1 flex-row pt-16 w-full h-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 bg-surface-container-lowest/30 p-8 overflow-y-auto relative">
          
          {/* ── Badge Toast Notifications ── */}
          <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
              {toasts.map(t => {
                const meta = getBadgeMeta(t.badge.id);
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`flex items-center gap-5 px-6 py-5 rounded-3xl border backdrop-blur-2xl shadow-2xl min-w-[320px] pointer-events-auto ${meta.color} ${meta.glow}`}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-black/40 border border-white/10">
                      <Icon className={meta.textColor} size={28} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">New Milestone Retrived</div>
                      <div className="font-black text-lg text-white font-heading">{t.badge.name}</div>
                      <div className={`text-[8px] mt-2 px-2 py-0.5 rounded border-2 w-fit font-black uppercase tracking-widest ${rarityColor(meta.rarity)}`}>
                        {meta.rarity}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-on-surface uppercase font-heading">Achievements_Log</h1>
                <p className="text-on-surface-variant font-mono text-[10px] mt-2 uppercase tracking-[0.4em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                   Personnel performance milestones
                </p>
              </div>
              
              <div className="bg-surface-container border border-white/5 p-6 rounded-3xl min-w-[300px]">
                 <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Overall_Sync_Progress</span>
                    <span className="font-mono text-2xl font-black text-white">{progressPercent}%</span>
                 </div>
                 <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-gradient-to-r from-primary to-cyan-400"
                    />
                 </div>
                 <div className="mt-3 text-[9px] font-mono text-on-surface-variant uppercase tracking-widest text-right">
                    {earnedCount} / {totalCount} Records unlocked
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.map((badge) => {
                const isOwned = ownedBadgeIds.has(badge.id);
                const meta = getBadgeMeta(badge.id);
                const Icon = meta.icon;

                return (
                  <motion.div
                    key={badge.id}
                    whileHover={isOwned ? { y: -5, scale: 1.02 } : {}}
                    className={`relative p-6 rounded-3xl border transition-all duration-500 overflow-hidden group ${
                      isOwned 
                        ? `${meta.color} border-white/10 shadow-xl` 
                        : 'bg-surface-container-low/20 border-white/5 opacity-40 grayscale'
                    }`}
                  >
                    {!isOwned && (
                       <div className="absolute top-3 right-3 text-white/20">
                          <Lock size={14} />
                       </div>
                    )}
                    
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${
                      isOwned ? 'bg-black/30 border border-white/10 scale-110 shadow-lg' : 'bg-white/5 border border-white/5'
                    }`}>
                      <Icon className={isOwned ? meta.textColor : 'text-on-surface-variant/30'} size={28} />
                    </div>

                    <h3 className={`font-black text-lg uppercase tracking-tight mb-2 font-heading ${isOwned ? 'text-white' : 'text-on-surface-variant'}`}>
                      {badge.name}
                    </h3>
                    <p className="text-[11px] font-medium leading-relaxed text-on-surface-variant mb-6">
                      {badge.description}
                    </p>

                    <div className={`text-[8px] px-2 py-1 rounded inline-block font-black uppercase tracking-widest border ${
                      isOwned ? rarityColor(meta.rarity) : 'border-white/5 text-white/10'
                    }`}>
                      {badge.rarity || 'UNKNOWN'}
                    </div>
                    
                    {isOwned && (
                      <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity">
                         <Icon size={120} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
              
              {badges.length === 0 && (
                 <div className="col-span-full py-20 flex flex-col items-center justify-center text-on-surface-variant/30">
                    <Loader className="animate-spin mb-4" size={40} />
                    <span className="font-mono text-sm uppercase tracking-widest">Awaiting_Database_Sync...</span>
                 </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Lock({ size, className }: { size: number; className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    );
}
