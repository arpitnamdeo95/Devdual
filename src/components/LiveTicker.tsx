import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const matchEvents = [
  { type: 'win', player: 'ZER0_DAY', detail: 'defeated SYNTAX_ERROR', time: '2s ago' },
  { type: 'match', player: 'BYTE_ME', detail: 'matched with GHOST_NET', time: '5s ago' },
  { type: 'elo', player: 'ALGO_GOD', detail: 'gained +25 ELO', time: '8s ago' },
  { type: 'win', player: 'HACKERMAN', detail: 'flawless victory', time: '12s ago' },
  { type: 'record', player: 'CYBER_NINJA', detail: 'new speed record: 47s', time: '15s ago' },
  { type: 'match', player: 'NEURO_LINK', detail: 'matched with NULL_POINTER', time: '20s ago' },
  { type: 'win', player: 'DARK_NET', detail: 'defeated CODE_MASTER', time: '25s ago' },
  { type: 'elo', player: 'SYS_ADMIN', detail: 'gained +25 ELO', time: '30s ago' },
];

const typeColors: Record<string, string> = {
  win: 'text-accent-green',
  match: 'text-primary-container',
  elo: 'text-accent-purple',
  record: 'text-accent-orange',
};

export const LiveTicker: React.FC = () => {
  const [events, setEvents] = useState(matchEvents.slice(0, 4));

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) => {
        const nextIndex = matchEvents.indexOf(prev[prev.length - 1]) + 1;
        const nextEvent = matchEvents[nextIndex % matchEvents.length];
        const newEvents = [nextEvent, ...prev.slice(0, 3)];
        return newEvents;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-surface-container-lowest/50 border-y border-outline-variant/20 py-3">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center px-4 border-r border-outline-variant/30 mr-4">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse mr-2" />
          <span className="font-code text-[10px] text-on-surface-variant uppercase tracking-[0.2em] whitespace-nowrap">LIVE FEED</span>
        </div>
        <div className="flex-1 overflow-hidden relative h-6">
          <AnimatePresence mode="popLayout">
            {events.map((event, i) => (
              <motion.div
                key={`${event.player}-${event.time}-${i}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className={`absolute left-0 top-0 font-code text-xs whitespace-nowrap ${
                  i === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                style={{ top: i * 0 }}
              >
                <span className={typeColors[event.type] || 'text-on-surface'}>&gt; </span>
                <span className="text-white font-bold">{event.player}</span>
                <span className="text-on-surface-variant ml-2">{event.detail}</span>
                <span className="text-outline ml-3 text-[10px]">{event.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
