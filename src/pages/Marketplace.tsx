import { AppNavbar, AppSidebar } from '../components/AppLayout';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Superplane } from '../components/Superplane';

interface PowerUp {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  color: string;
  category: 'attack' | 'defense' | 'utility';
  owned: number;
}

export default function Marketplace() {
  const [points, setPoints] = useState(2450);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    {
      id: 'freeze',
      name: 'Blizzard',
      description: 'Freezes the opponent\'s screen and disables their keyboard for 3 seconds, breaking their rhythm and momentum.',
      price: 300,
      icon: 'ac_unit',
      color: '#00F2FF',
      category: 'attack',
      owned: 2,
    },
    {
      id: 'blind',
      name: 'Smoke Grenade',
      description: 'Obscures the opponent\'s code editor with dense smoke, making it impossible to read their code for 5 seconds.',
      price: 250,
      icon: 'smoke_free',
      color: '#6c757d',
      category: 'attack',
      owned: 0,
    },
    {
      id: 'time_warp',
      name: 'Time Warp',
      description: 'Reverses the opponent\'s last 10 seconds of code typing. Highly disruptive during critical implementation phases.',
      price: 500,
      icon: 'history',
      color: '#c77dff',
      category: 'attack',
      owned: 1,
    },
    {
      id: 'auto_complete',
      name: 'Auto-Complete',
      description: 'Summons an AI assistant to automatically solve and write the next 2 lines of code for your current algorithm.',
      price: 800,
      icon: 'smart_toy',
      color: '#4ADE80',
      category: 'utility',
      owned: 0,
    },
    {
      id: 'invulnerability',
      name: 'Aegis Shield',
      description: 'A passive shield that completely blocks the next incoming hostile power-up intended for you.',
      price: 450,
      icon: 'shield',
      color: '#fbbf24',
      category: 'defense',
      owned: 3,
    },
  ]);

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const buyPowerUp = (id: string) => {
    const itemIndex = powerUps.findIndex(p => p.id === id);
    if (itemIndex === -1) return;

    const item = powerUps[itemIndex];
    if (points >= item.price) {
      setPoints(prev => prev - item.price);
      setPowerUps(prev => {
        const next = [...prev];
        next[itemIndex].owned += 1;
        return next;
      });
      showNotification(`Successfully purchased ${item.name}!`, 'success');
    } else {
      showNotification(`Not enough points for ${item.name}.`, 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <AppNavbar />
      <div className="flex flex-1 flex-row pt-16 w-full h-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 bg-surface-container-lowest p-8 overflow-y-auto relative">

          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className={`fixed top-24 left-1/2 z-50 px-6 py-3 rounded-lg font-code text-sm uppercase tracking-widest shadow-xl border ${notification.type === 'success'
                    ? 'bg-primary-container/20 border-primary-container text-primary-container'
                    : 'bg-error/20 border-error text-error'
                  }`}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface uppercase font-display">Marketplace</h1>
                <p className="text-on-surface-variant font-mono text-sm mt-1 uppercase tracking-[0.2em]">ACQUIRE ARSENAL & POWER-UPS</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-3 px-6 py-3 bg-surface-container-high border border-outline-variant/10 rounded-xl shadow-lg">
                  <span className="material-symbols-outlined text-tertiary">toll</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Available Points</span>
                    <motion.span
                      key={points}
                      initial={{ scale: 1.2, color: '#00F2FF' }}
                      animate={{ scale: 1, color: '#e5e2e1' }}
                      className="text-2xl font-black tabular-nums"
                    >
                      {points.toLocaleString()}
                    </motion.span>
                  </div>
                </div>
              </div>
            </header>



            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {powerUps.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}
                  className="bg-surface-container-low border border-outline-variant/5 rounded-xl overflow-hidden group flex flex-col"
                  style={{ '--item-color': item.color } as any}
                >
                  <div className="p-6 flex-1 flex flex-col relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-8xl" style={{ color: item.color }}>{item.icon}</span>
                    </div>

                    <div className="flex justify-between items-start mb-6 rounded-md relative z-10">
                      <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
                      >
                        <span className="material-symbols-outlined text-3xl" style={{ color: item.color }}>{item.icon}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-on-surface-variant px-2 py-1 rounded bg-surface-container-high border border-outline-variant/20 mb-1">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-sm font-mono mt-1 px-2 py-1 bg-surface-container-high rounded">
                          <span className="material-symbols-outlined text-[14px] text-tertiary">inventory_2</span>
                          <span className="text-on-surface font-bold text-xs uppercase">Owned: {item.owned}</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 relative z-10" style={{ color: item.color }}>{item.name}</h3>
                    <p className="text-on-surface-variant text-sm flex-1 relative z-10">{item.description}</p>
                  </div>

                  <div className="p-4 border-t border-outline-variant/10 bg-surface-container flex justify-between items-center z-10 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary">toll</span>
                      <span className="font-bold font-mono text-lg">{item.price}</span>
                    </div>
                    <button
                      onClick={() => buyPowerUp(item.id)}
                      disabled={points < item.price}
                      className={`px-6 py-2 rounded font-code text-xs uppercase tracking-widest font-bold transition-all flex-1 ${points >= item.price
                          ? 'bg-white text-background hover:bg-primary-container disabled:opacity-50'
                          : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed border border-outline-variant/10'
                        }`}
                    >
                      {points >= item.price ? 'Purchase' : 'Need Points'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
