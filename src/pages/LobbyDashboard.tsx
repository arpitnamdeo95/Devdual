import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';
import { Navbar } from '../components/Navbar';
import { LiquidEther } from '../components/LiquidEther';
import { BackgroundElements } from '../components/BackgroundElements';
import { LiveTicker } from '../components/LiveTicker';
import {
  Swords, Zap, Trophy, Eye, TrendingUp, ChevronUp, ChevronDown, Minus,
  Activity, Clock, Shield, Sparkles, Loader
} from 'lucide-react';

const leaderboardData = [
  { rank: 1, name: 'ZER0_DAY', elo: 2840, trend: 'up', wins: 142, streak: 7 },
  { rank: 2, name: 'ALGO_GOD', elo: 2815, trend: 'up', wins: 138, streak: 4 },
  { rank: 3, name: 'SYS_ADMIN', elo: 2790, trend: 'same', wins: 135, streak: 0 },
  { rank: 4, name: 'NEURO_LINK', elo: 2765, trend: 'down', wins: 130, streak: 0 },
  { rank: 5, name: 'GHOST_NET', elo: 2730, trend: 'up', wins: 128, streak: 3 },
];

const recentMatches = [
  { p1: 'BYTE_ME', p2: 'NULL_POINTER', winner: 'BYTE_ME', time: '2m ago' },
  { p1: 'CODE_MASTER', p2: 'DARK_NET', winner: 'DARK_NET', time: '5m ago' },
  { p1: 'HACKERMAN', p2: 'SYNTAX_ERROR', winner: 'HACKERMAN', time: '8m ago' },
];

export default function LobbyDashboard() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [queueCount] = useState(() => Math.floor(Math.random() * 50) + 100);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'recent'>('leaderboard');
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('match-found', (data: { roomId: string; opponent: unknown }) => {
      setIsSearching(false);
      setSearchTime(0);
      navigate(`/arena/${(data as { roomId: string }).roomId}`);
    });
    return () => { socket.off('match-found'); };
  }, [navigate]);

  useEffect(() => {
    if (!isSearching) return;
    const interval = setInterval(() => setSearchTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isSearching]);

  const handleFindMatch = () => {
    setIsSearching(true);
    socket.emit('find-match', {
      name: `Player_${Math.floor(Math.random() * 1000)}`,
      rating: 1500,
    });
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setSearchTime(0);
    socket.emit('cancel-match');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] font-[Inter] flex flex-col relative overflow-hidden">
      <LiquidEther />
      <BackgroundElements />
      <Navbar />

      <div className="flex-1 p-6 pt-28 max-w-7xl mx-auto w-full relative z-10">
        {/* Header with animated entrance */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-[1px] bg-accent-green" />
                <span className="text-meta opacity-70">
                  DevDuel Global Network Online
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase font-[Space_Grotesk] leading-none mb-4">
                <span className="text-gradient-cyan">CodeBattle</span><br />
                <span className="text-white">Arena</span>
              </h1>
              <p className="text-meta">
                <span className="text-accent-green">1,420</span> Active Users •{' '}
                <span className="text-accent-purple">142</span> Duels In Progress
              </p>
            </div>

            {/* The Centerpiece: DataGlobe */}
            <div className="relative w-48 h-48 hidden md:block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-primary-container/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border border-accent-purple/20 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary-container/5 blur-3xl" />
                <div className="relative">
                  <Swords className="w-12 h-12 text-primary-container animate-float" />
                  <div className="absolute -inset-4 border border-primary-container/40 rounded-full animate-ping opacity-20" />
                </div>
              </div>
              {/* Orbital nodes */}
              {[0, 72, 144, 216, 288].map((deg) => (
                <motion.div
                  key={deg}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                  className="absolute w-1.5 h-1.5 bg-primary-container rounded-full shadow-[0_0_8px_rgba(0,229,255,1)]"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${deg}deg) translateX(90px)`,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT — Main panels */}
          <div className="lg:col-span-8 space-y-6">

            {/* Find Match card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative glass-panel p-8 overflow-hidden group border border-outline-variant/30"
            >
              {/* Animated background grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />

              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-container via-primary-container/50 to-transparent" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Swords className="w-6 h-6 text-primary-container" />
                  <h2 className="text-3xl font-[Space_Grotesk] font-bold uppercase text-white">
                    Enter the Matrix
                  </h2>
                </div>
                <p className="text-[#b9cacb] max-w-lg mb-8 text-sm leading-relaxed">
                  Engage in high-stakes 1v1 coding combat. Execute algorithms under extreme pressure. Winner takes Elo.
                </p>

                <AnimatePresence mode="wait">
                  {isSearching ? (
                    <motion.div
                      key="searching"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-6"
                    >
                      <div className="flex items-center gap-3">
                        <Loader className="w-5 h-5 text-primary-container animate-spin" />
                        <div>
                          <p className="text-meta text-primary-container font-bold">
                            SCANNING FOR OPPONENT...
                          </p>
                          <p className="text-meta opacity-60 mt-1">
                            {searchTime}s elapsed • {queueCount} players in queue
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCancelSearch}
                        className="ml-auto px-4 py-2 border border-accent-red/30 text-accent-red text-meta uppercase tracking-widest hover:bg-accent-red/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="find"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFindMatch}
                      className="relative px-10 py-4 bg-primary-container text-[#002022] font-bold tracking-widest uppercase transition-all duration-300 clip-angle group overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Find Match
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-white"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Hover glow effect */}
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>

            {/* Stats + Spectate row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel border border-outline-variant/30 p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary-container via-accent-purple to-transparent" />
                <div className="flex items-center gap-2 mb-8">
                  <Shield className="w-4 h-4 text-primary-container" />
                  <span className="text-meta">Global Protocol Stats</span>
                </div>
                <div className="space-y-6">
                  {[
                    { label: 'GLOBAL RANK', value: '#4,021', color: 'text-white', icon: <Trophy className="w-4 h-4" /> },
                    { label: 'ELO RATING', value: '1540', color: 'text-accent-purple', icon: <TrendingUp className="w-4 h-4" /> },
                    { label: 'WIN RATE', value: '52.4%', color: 'text-accent-green', icon: <Activity className="w-4 h-4" /> },
                    { label: 'WINS', value: '47', color: 'text-primary-container', icon: <Sparkles className="w-4 h-4" /> },
                  ].map((row, i) => (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex justify-between items-center border-b border-outline-variant/10 pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-on-surface-variant/40">{row.icon}</span>
                        <span className="text-meta text-on-surface-variant font-medium">{row.label}</span>
                      </div>
                      <span className={`font-[Space_Grotesk] font-bold text-2xl ${row.color}`}>{row.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Spectate card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => navigate('/watch/demo')}
                className="glass-panel border border-outline-variant/30 p-8 cursor-pointer group relative overflow-hidden hover:border-primary-container/30 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent-purple via-primary-container to-transparent opacity-50" />

                <div className="flex items-center gap-2 mb-6">
                  <Eye className="w-4 h-4 text-accent-purple" />
                  <span className="text-meta">Live Uplink</span>
                </div>
                <h3 className="text-3xl font-[Space_Grotesk] font-bold text-white mb-3 uppercase leading-tight">Live Matches</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
                  Watch high-ELO masterclass duels in real-time. Gain competitive edge through observation.
                </p>

                {/* Live match preview cards */}
                <div className="space-y-3">
                  {recentMatches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-surface-container/50 px-4 py-3 border border-outline-variant/10 group-hover:border-primary-container/10 transition-colors">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-primary-container font-bold">{m.p1}</span>
                        <span className="opacity-30">vs</span>
                        <span className="text-accent-orange font-bold">{m.p2}</span>
                      </div>
                      <span className="text-meta opacity-50">{m.time}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center text-primary-container text-meta font-bold uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                  Initialize Spectator Mode
                  <ChevronUp className="w-4 h-4 ml-2 rotate-90" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* RIGHT — Leaderboard sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-4"
          >
            <div className="glass-panel border border-outline-variant/30 relative overflow-hidden h-full">
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-primary-container via-accent-purple to-transparent" />

              {/* Tabs */}
              <div className="flex border-b border-outline-variant/30">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex-1 py-4 text-meta font-bold uppercase tracking-widest transition-colors ${
                    activeTab === 'leaderboard'
                      ? 'text-primary-container bg-primary-container/5 border-b-2 border-primary-container'
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  <Trophy className="w-3 h-3 inline mr-2 mb-0.5" /> High Rank
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`flex-1 py-4 text-meta font-bold uppercase tracking-widest transition-colors ${
                    activeTab === 'recent'
                      ? 'text-accent-purple bg-accent-purple/5 border-b-2 border-accent-purple'
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  <Clock className="w-3 h-3 inline mr-2 mb-0.5" /> Recent
                </button>
              </div>

              <div className="p-4">
                <AnimatePresence mode="wait">
                  {activeTab === 'leaderboard' ? (
                    <motion.div
                      key="leaderboard"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-1"
                    >
                      {leaderboardData.map((player, idx) => (
                        <motion.div
                          key={player.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className={`flex items-center p-3 hover:bg-surface-container-high transition-colors group cursor-pointer ${
                            idx === 0 ? 'bg-primary-container/10 border border-primary-container/20' : 'border border-transparent'
                          }`}
                        >
                          <span className={`font-mono font-black text-lg w-8 ${
                            idx === 0 ? 'text-primary-container' :
                            idx === 1 ? 'text-accent-purple' :
                            idx === 2 ? 'text-accent-orange' : 'text-on-surface-variant/40'
                          }`}>
                            {player.rank.toString().padStart(2, '0')}
                          </span>

                          <div className="flex-1 ml-3">
                            <span className="font-mono text-white text-sm font-bold uppercase tracking-wider">{player.name}</span>
                            {player.streak > 0 && (
                              <span className="ml-2 text-meta bg-accent-green/10 text-accent-green px-2 py-0.5 font-bold border border-accent-green/20">
                                W{player.streak}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`font-[Space_Grotesk] font-bold text-lg ${
                              idx === 0 ? 'text-primary-container' : 'text-white'
                            }`}>
                              {player.elo}
                            </span>
                            {player.trend === 'up' && <ChevronUp className="w-3 h-3 text-accent-green" />}
                            {player.trend === 'down' && <ChevronDown className="w-3 h-3 text-accent-red" />}
                            {player.trend === 'same' && <Minus className="w-3 h-3 opacity-20" />}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="recent"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      {recentMatches.map((m, i) => (
                        <div key={i} className="bg-surface-container/30 p-4 border border-outline-variant/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-mono text-xs font-bold leading-none">
                              <span className="text-primary-container">{m.p1}</span>
                              <span className="mx-2 opacity-20">vs</span>
                              <span className="text-accent-orange">{m.p2}</span>
                            </div>
                            <span className="text-meta opacity-40">{m.time}</span>
                          </div>
                          <div className="text-meta text-accent-green font-bold flex items-center justify-between">
                            <span>RESULT: {m.winner} WIN</span>
                            <span className="w-4 h-[1px] bg-accent-green/30" />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick stats at bottom of sidebar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 p-4 grid grid-cols-2 gap-2"
              >
                {[
                  { label: 'ONLINE', value: '1.4k', color: 'text-accent-green' },
                  { label: 'QUEUE', value: '84', color: 'text-primary-container' },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 bg-surface-container-high/30 border border-outline-variant/10 text-center">
                    <p className={`font-display font-black text-xl leading-none mb-1 ${stat.color}`}>{stat.value}</p>
                    <p className="text-meta opacity-50">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Live ticker at bottom */}
      <div className="relative z-50">
        <LiveTicker />
      </div>
    </div>
  );
}
