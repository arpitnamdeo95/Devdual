import { AppNavbar, AppSidebar } from '../components/AppLayout';
import Superplane from '../components/Superplane';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '../supabaseProvider';
import { supabase } from '../supabaseClient';
import { ShoppingBag, Zap, Shield, Sparkles, Trophy, Loader, ChevronRight, Coins } from 'lucide-react';

interface PowerUp {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  color: string;
  category: 'attack' | 'defense' | 'utility';
}

export default function Marketplace() {
  const [powerUps] = useState<PowerUp[]>([
    {
      id: 'freeze',
      name: 'Blizzard',
      description: 'Freezes the opponent\'s screen and disables their keyboard for 3 seconds, breaking their rhythm and momentum.',
      price: 300,
      icon: 'ac_unit',
      color: '#00F2FF',
      category: 'attack',
    },
    {
      id: 'blind',
      name: 'Smoke Grenade',
      description: 'Obscures the opponent\'s code editor with dense smoke, making it impossible to read their code for 5 seconds.',
      price: 250,
      icon: 'smoke_free',
      color: '#6c757d',
      category: 'attack',
    },
    {
      id: 'time_warp',
      name: 'Time Warp',
      description: 'Reverses the opponent\'s last 10 seconds of code typing. Highly disruptive during critical implementation phases.',
      price: 500,
      icon: 'history',
      color: '#c77dff',
      category: 'attack',
    },
    {
      id: 'auto_complete',
      name: 'Auto-Complete',
      description: 'Summons an AI assistant to automatically solve and write the next 2 lines of code for your current algorithm.',
      price: 800,
      icon: 'smart_toy',
      color: '#4ADE80',
      category: 'utility',
    },
    {
      id: 'invulnerability',
      name: 'Aegis Shield',
      description: 'A passive shield that completely blocks the next incoming hostile power-up intended for you.',
      price: 450,
      icon: 'shield',
      color: '#fbbf24',
      category: 'defense',
    },
  ]);

  const globalState = useSupabase();
  const identity = localStorage.getItem('devduel_user_identity');
  const me = globalState?.players?.find((p: any) => p.username === identity);
  const myInventory = globalState?.inventory?.filter((i: any) => i.player_id === me?.id) || [];
  
  const points = me?.points || 0;
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const buyPowerUp = async (id: string, price: number) => {
    if (!me?.id) {
        showNotification("You must be logged in to purchase items.", 'error');
        return;
    }

    setPurchasingId(id);
    const { data, error } = await supabase.rpc('buy_powerup', {
      p_player_id: me.id,
      p_item_id: id,
      p_cost: price
    });
    
    setPurchasingId(null);
    if (error || !data) {
      showNotification(`Purchase failed: ${error?.message || 'Check your points.'}`, 'error');
    } else {
      showNotification(`Successfully acquired!`, 'success');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary/30">
      <AppNavbar />
      <div className="flex flex-1 flex-row pt-16 w-full h-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 bg-surface-container-lowest/50 p-8 overflow-y-auto relative backdrop-blur-sm">
          <div className="fixed inset-0 z-[-1] opacity-30">
            <Superplane />
          </div>

          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className={`fixed top-24 left-1/2 z-50 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl border flex items-center gap-3 ${notification.type === 'success'
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-error/20 border-error text-error'
                  }`}
              >
                <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-primary' : 'bg-error'} animate-pulse`} />
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <header className="flex justify-between items-end border-b border-white/5 pb-8">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-black tracking-tighter text-on-surface uppercase font-heading"
                >
                  ARSENAL_UPGRADE
                </motion.h1>
                <p className="text-on-surface-variant font-mono text-[10px] mt-2 uppercase tracking-[0.4em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   Enhance your competitive capabilities
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-4 px-8 py-4 bg-surface-container border border-white/5 rounded-2xl shadow-glow-ambient">
                  <Coins className="text-primary" size={24} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Combat Points</span>
                    <motion.span
                      key={points}
                      initial={{ scale: 1.1, color: '#00F2FF' }}
                      animate={{ scale: 1, color: '#e5e2e1' }}
                      className="text-2xl font-black tabular-nums leading-none font-mono"
                    >
                      {points.toLocaleString()}
                    </motion.span>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {powerUps.map((item, idx) => {
                const quantity = myInventory.find((i: any) => i.item_id === item.id)?.quantity || 0;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-surface-container-low/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden group flex flex-col hover:border-primary/30 transition-all shadow-xl"
                  >
                    <div className="p-8 flex-1 flex flex-col relative">
                      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <span className="material-symbols-outlined text-8xl" style={{ color: item.color }}>{item.icon}</span>
                      </div>

                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border"
                          style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }}
                        >
                          <span className="material-symbols-outlined text-4xl" style={{ color: item.color }}>{item.icon}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-surface-container border border-white/5`}>
                            {item.category}
                          </span>
                          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
                            <span className="text-[10px] font-black text-primary uppercase">Stock: {quantity}</span>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-2xl font-black uppercase tracking-tighter mb-3 relative z-10 text-white font-heading">{item.name}</h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed font-medium mb-8 relative z-10">{item.description}</p>
                      
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2">
                           <Coins className="text-primary" size={18} />
                           <span className="font-black font-mono text-xl text-white">{item.price}</span>
                        </div>
                        <button
                          onClick={() => buyPowerUp(item.id, item.price)}
                          disabled={points < item.price || purchasingId === item.id}
                          className={`h-11 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${points >= item.price
                              ? 'bg-primary text-on-primary shadow-glow-primary/20 hover:brightness-110 active:scale-95'
                              : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed grayscale'
                            }`}
                        >
                          {purchasingId === item.id ? (
                            <Loader className="animate-spin" size={16} />
                          ) : (
                            <>
                              {points >= item.price ? 'Aquire_Unit' : 'Low_Points'}
                              <ChevronRight size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
