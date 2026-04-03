import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronUp, Minus, Flame } from 'lucide-react';

const topPlayers = [
  { rank: 1, name: 'CYBER_NINJA', elo: 2845, trend: 'up', streak: 12, badge: 'GRANDMASTER', lang: 'Python' },
  { rank: 2, name: 'NULL_POINTER', elo: 2790, trend: 'same', streak: 5, badge: 'MASTER', lang: 'C++' },
  { rank: 3, name: 'BYTE_ME', elo: 2650, trend: 'up', streak: 8, badge: 'DIAMOND', lang: 'JS' },
  { rank: 4, name: 'SYNTAX_ERROR', elo: 2610, trend: 'down', streak: 0, badge: 'PLATINUM', lang: 'Java' },
  { rank: 5, name: 'HACKERMAN', elo: 2580, trend: 'up', streak: 3, badge: 'PLATINUM', lang: 'Python' },
];

const RANK_COLORS: Record<number, string> = {
  1: '#00e5ff',
  2: '#a855f7',
  3: '#e81cff',
};

const BADGE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  GRANDMASTER: { text: '#00e5ff', bg: 'rgba(0,229,255,0.08)', border: 'rgba(0,229,255,0.3)' },
  MASTER:      { text: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)' },
  DIAMOND:     { text: '#7dd3fc', bg: 'rgba(125,211,252,0.08)', border: 'rgba(125,211,252,0.3)' },
  PLATINUM:    { text: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' },
};

export const LeaderboardPreview: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      {/* Header */}
      <div className="bg-surface-container-low border border-outline-variant/30 border-b-0 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-4 h-4 text-primary-container" />
          <span className="font-code text-xs text-primary-container tracking-[0.25em] uppercase">Arena Rankings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
          <span className="font-code text-[10px] text-green-400 tracking-wider">LIVE UPDATE</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="border border-outline-variant/30 border-b-0 bg-surface-container-lowest px-6 py-2 grid grid-cols-[40px_1fr_80px_60px_80px] gap-4 items-center">
        {['RANK', 'OPERATOR', 'ELO', 'STREAK', 'LANG'].map(col => (
          <span key={col} className="font-code text-[9px] text-outline-variant tracking-[0.2em] uppercase">
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="border border-outline-variant/30 overflow-hidden">
        {topPlayers.map((player, index) => {
          const rankColor = RANK_COLORS[player.rank] || '#334155';
          const badge = BADGE_COLORS[player.badge] || BADGE_COLORS.PLATINUM;

          return (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ x: 4, backgroundColor: 'rgba(0,229,255,0.03)' }}
              className="relative grid grid-cols-[40px_1fr_80px_60px_80px] gap-4 items-center px-6 py-4 border-b border-outline-variant/15 last:border-b-0 cursor-default group transition-all duration-200"
            >
              {/* Rank */}
              <div
                className="font-display font-bold text-base tabular-nums"
                style={{ color: rankColor, textShadow: player.rank <= 3 ? `0 0 10px ${rankColor}60` : undefined }}
              >
                #{player.rank}
              </div>

              {/* Name + badge */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-1 h-7 rounded-full flex-none"
                  style={{ backgroundColor: rankColor, opacity: 0.6 }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-code font-semibold text-sm text-white tracking-wider truncate">
                      {player.name}
                    </span>
                    <span
                      className="font-code text-[8px] px-1.5 py-0.5 tracking-widest uppercase hidden md:inline"
                      style={{
                        color: badge.text,
                        backgroundColor: badge.bg,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {player.badge}
                    </span>
                  </div>
                </div>
              </div>

              {/* ELO */}
              <div className="flex items-center gap-1">
                <span
                  className="font-code font-bold text-sm tabular-nums"
                  style={{ color: rankColor }}
                >
                  {player.elo}
                </span>
                <div className="text-outline-variant">
                  {player.trend === 'up' && <ChevronUp className="w-3.5 h-3.5 text-green-400" />}
                  {player.trend === 'down' && <ChevronUp className="w-3.5 h-3.5 text-red-400 rotate-180" />}
                  {player.trend === 'same' && <Minus className="w-3.5 h-3.5 text-outline-variant" />}
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-1">
                {player.streak > 0 && <Flame className="w-3 h-3 text-orange-400 shrink-0" />}
                <span className={`font-code text-xs ${player.streak > 0 ? 'text-orange-300' : 'text-outline-variant'}`}>
                  {player.streak > 0 ? `${player.streak}W` : '—'}
                </span>
              </div>

              {/* Language */}
              <span className="font-code text-[10px] text-outline-variant tracking-wider">
                {player.lang}
              </span>

              {/* Hover left accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: rankColor }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
