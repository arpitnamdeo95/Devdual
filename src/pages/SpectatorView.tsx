import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { socket } from '../socket';
import {
  Eye, Trophy, Users, Volume2, VolumeX, Radio,
  MessageCircle, ChevronRight, Activity, Terminal, Shield, Zap
} from 'lucide-react';

const chatMessages = [
  { user: 'ZER0_DAY', message: 'NULL_POINTER is crushing it with the hash map approach', time: '2m' },
  { user: 'GHOST_NET', message: 'CYBER_NINJA still has time, let them cook', time: '1m' },
  { user: 'BYTE_ME', message: 'That edge case handling is clean', time: '30s' },
  { user: 'DARK_NET', message: '🔥🔥🔥', time: '10s' },
];

const spectators = [
  { name: 'ALGO_GOD', watching: true },
  { name: 'NEURO_LINK', watching: true },
  { name: 'HACKERMAN', watching: false },
  { name: 'SYNTAX_ERROR', watching: true },
];

export default function SpectatorView() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Array<{ id: string; name: string; rating: number }>>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState(30 * 60);
  const [status, setStatus] = useState<'IN_PROGRESS' | 'ENDED'>('IN_PROGRESS');
  const [result, setResult] = useState<{ winnerId?: string } | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(847);
  const [liveChat, setLiveChat] = useState(chatMessages);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.emit('join-room', { roomId, isSpectator: true });

    socket.on('room-state', (state) => {
      setPlayers(state.players);
      setCodes(state.code || {});
    });

    socket.on('opponent-code-update', (data) => {
      setCodes((prev: Record<string, string>) => ({ ...prev, [data.id]: data.code }));
    });

    socket.on('game-end', (data) => {
      setStatus('ENDED');
      setResult(data);
    });

    return () => {
      socket.off('room-state');
      socket.off('opponent-code-update');
      socket.off('game-end');
    };
  }, [roomId]);

  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;
    const interval = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpectatorCount(c => c + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const p1 = players[0];
  const p2 = players[1];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setLiveChat(prev => [...prev, { user: 'You', message: newMessage, time: 'now' }]);
    setNewMessage('');
  };

  const timerColor = timer < 300 ? 'text-accent-red' : timer < 600 ? 'text-accent-orange' : 'text-primary-container';
  const timerPercent = (timer / (30 * 60)) * 100;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] font-[Inter] flex flex-col relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 grid-bg" />
      <div className="fixed inset-0 pointer-events-none z-[100] scanline-overlay opacity-10" />

      {/* Top Protocol Bar */}
      <header className="h-14 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-outline-variant/30 z-[60] flex justify-between items-center px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-0 bg-accent-red blur-md animate-pulse rounded-full opacity-40" />
              <div className="relative w-2.5 h-2.5 rounded-full bg-accent-red animate-pulse" />
            </div>
            <span className="text-accent-red font-black text-meta tracking-[0.2em] flex items-center gap-2">
              <Radio className="w-3.5 h-3.5" /> LIVE PROTOCOL
            </span>
          </div>
          <div className="w-px h-4 bg-outline-variant/30" />
          <span className="text-meta opacity-50 font-bold">NODE: {roomId?.substring(0, 12).toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-8">
          {/* Spectator Telemetry */}
          <div className="flex items-center gap-3 text-on-surface-variant font-bold text-meta tracking-widest">
            <Eye className="w-4 h-4" />
            <span className="text-primary-container tabular-nums font-black">{spectatorCount.toLocaleString()}</span>
            <span className="hidden sm:inline opacity-40">UPLINKS</span>
          </div>

          {/* Temporal Meter */}
          <div className="flex items-center gap-4">
            <div className="w-32 h-1 bg-surface-container-high/50 overflow-hidden rounded-full">
              <motion.div
                className={`h-full ${timer < 300 ? 'bg-accent-red' : timer < 600 ? 'bg-accent-orange' : 'bg-primary-container'} shadow-glow-primary/20`}
                animate={{ width: `${timerPercent}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <span className={`font-[Space_Grotesk] font-bold text-xl ${timerColor} tabular-nums tracking-tight`}>
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-4 border-l border-outline-variant/20 pl-8">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-on-surface-variant hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`transition-colors flex items-center gap-2 text-meta font-bold ${showChat ? 'text-primary-container' : 'text-on-surface-variant hover:text-white'}`}
            >
              <MessageCircle className="w-4 h-4" />
              {showChat ? 'HIDE COMMS' : 'SHOW COMMS'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Main Observation Grid */}
        <div className={`flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 transition-all duration-500`}>
          {/* Subject A */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel flex flex-col relative border border-outline-variant/30 overflow-hidden"
          >
            <div className="px-5 py-4 bg-surface-container-high/40 border-b border-outline-variant/30 flex justify-between items-center relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 blur-sm bg-primary-container/30 rounded-full animate-float" />
                  <div className="relative w-3.5 h-3.5 rounded-full bg-primary-container" />
                </div>
                <div>
                  <h3 className="text-primary-container font-[Space_Grotesk] font-black uppercase tracking-[0.1em] text-lg leading-none">
                    {p1 ? p1.name : 'SUBJECT_A'}
                  </h3>
                  <p className="text-meta opacity-40 mt-1">UPLINK STABLE</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">RATING</p>
                  <p className="font-mono text-white font-black">{p1?.rating || 1540}</p>
                </div>
                <div className="w-8 h-8 rounded-sm bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-container/40" />
                </div>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden">
               <Editor
                height="100%"
                language="javascript"
                theme="vs-dark"
                value={codes[p1?.id] || '// Synchronizing data streams...'}
                options={{
                  minimap: { enabled: false },
                  readOnly: true,
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  padding: { top: 24, bottom: 24 },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'none',
                }}
              />
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-container/20" />
            </div>
          </motion.div>

          {/* Subject B */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-panel flex flex-col relative border border-outline-variant/30 overflow-hidden"
          >
            <div className="px-5 py-4 bg-surface-container-high/40 border-b border-outline-variant/30 flex justify-between items-center relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 blur-sm bg-accent-orange/30 rounded-full animate-float" />
                  <div className="relative w-3.5 h-3.5 rounded-full bg-accent-orange" />
                </div>
                <div>
                  <h3 className="text-accent-orange font-[Space_Grotesk] font-black uppercase tracking-[0.1em] text-lg leading-none">
                    {p2 ? p2.name : 'SUBJECT_B'}
                  </h3>
                  <p className="text-meta opacity-40 mt-1">UPLINK STABLE</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">RATING</p>
                  <p className="font-mono text-white font-black">{p2?.rating || 1480}</p>
                </div>
                <div className="w-8 h-8 rounded-sm bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-accent-orange/40" />
                </div>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden">
               <Editor
                height="100%"
                language="javascript"
                theme="vs-dark"
                value={codes[p2?.id] || '// Synchronizing data streams...'}
                options={{
                  minimap: { enabled: false },
                  readOnly: true,
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  padding: { top: 24, bottom: 24 },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  renderLineHighlight: 'none',
                }}
              />
              <div className="absolute top-0 left-0 w-1 h-full bg-accent-orange/20" />
            </div>
          </motion.div>
        </div>

        {/* Comms Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-outline-variant/30 bg-[#080808]/80 backdrop-blur-3xl flex flex-col overflow-hidden relative"
            >
              <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
              
              {/* Telemetry Panel */}
              <div className="p-6 border-b border-outline-variant/20 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-container" />
                    <span className="text-meta font-black">Active Uplinks</span>
                  </div>
                  <span className="text-[10px] bg-primary-container/10 text-primary-container px-2 py-0.5 font-bold uppercase">Authorized</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {spectators.map((s, i) => (
                    <div
                      key={i}
                      className={`px-3 py-1 border transition-all text-meta font-bold cursor-default ${
                        s.watching
                          ? 'border-primary-container/30 bg-primary-container/5 text-primary-container'
                          : 'border-outline-variant/10 bg-transparent text-on-surface-variant/30'
                      }`}
                    >
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feed Display */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 relative custom-scrollbar">
                <div className="flex items-center gap-3 mb-6">
                  <Terminal className="w-4 h-4 text-on-surface-variant" />
                  <span className="text-meta opacity-40 font-black">ENCRYPTED COMMS FEED</span>
                </div>
                {liveChat.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-surface-container/30 p-4 border-l-2 border-primary-container/20 hover:border-primary-container/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-meta font-black ${
                        msg.user === 'You' ? 'text-accent-green' : 'text-primary-container'
                      }`}>{msg.user}</span>
                      <span className="text-[10px] font-mono opacity-20 uppercase tracking-tighter">{msg.time}</span>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{msg.message}</p>
                  </motion.div>
                ))}
              </div>

              {/* Input Interface */}
              <div className="p-6 border-t border-outline-variant/30 bg-[#0A0A0A]/50 relative">
                <div className="relative group">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Input frequency..."
                    className="w-full bg-[#0E0E0E] border border-outline-variant/30 px-5 py-4 text-sm text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-primary-container focus:bg-[#121212] transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-primary-container/10 text-primary-container hover:bg-primary-container hover:text-background transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MATCH_CONCLUDED Overlay */}
      <AnimatePresence>
        {status === 'ENDED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]/80 backdrop-blur-xl"
          >
            <div className="absolute inset-0 grid-bg pointer-events-none opacity-10" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="glass-panel border border-primary-container/30 p-16 text-center max-w-xl"
            >
              <Trophy className="w-16 h-16 text-primary-container mx-auto mb-8 animate-float" />
              <h2 className="text-5xl text-white font-[Space_Grotesk] font-black mb-4 uppercase tracking-tighter">
                SIGNAL TERMINATED
              </h2>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-container/30 to-transparent mb-8" />
              <p className="text-meta text-primary-container font-black tracking-[0.5em] mb-12">
                DOMINANT SIG: <span className="text-white text-xl ml-2">
                  {result?.winnerId === p1?.id ? p1?.name : (result?.winnerId === p2?.id ? p2?.name : 'DRAW')}
                </span>
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/review/${roomId}`)}
                  className="bg-accent-purple text-white px-8 py-4 font-black text-meta tracking-widest uppercase hover:shadow-glow-purple transition-all clip-angle"
                >
                  DEBRIEF INTEL
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app')}
                  className="bg-transparent border border-outline-variant/50 text-white px-8 py-4 font-black text-meta tracking-widest uppercase hover:border-primary-container hover:text-primary-container transition-all clip-angle"
                >
                  RETURN TO HUB
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
