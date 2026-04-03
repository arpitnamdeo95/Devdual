import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ArrowLeft, Cpu, Zap, BarChart3, TrendingUp,
  AlertTriangle, CheckCircle2, Code2, Lightbulb, Download, Target, Activity
} from 'lucide-react';

const loadingMessages = [
  'Initializing neural analysis...',
  'Scanning code patterns...',
  'Evaluating time complexity...',
  'Measuring code quality metrics...',
  'Comparing algorithmic approaches...',
  'Generating recommendations...',
];

interface MetricBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  delay?: number;
}

const MetricBar: React.FC<MetricBarProps> = ({ label, value, maxValue, color, delay = 0 }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const percent = (value / maxValue) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-meta">{label}</span>
        <span className="font-mono text-xs font-bold text-white">{value}/{maxValue}</span>
      </div>
      <div className="h-1.5 bg-surface-container-high overflow-hidden rounded-full">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: animated ? `${percent}%` : 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: delay / 1000 }}
        />
      </div>
    </div>
  );
};

export default function AIReview() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [review, setReview] = useState<Record<string, string> | null>(null);
  const [activePanel, setActivePanel] = useState<'analysis' | 'code' | 'suggestions'>('analysis');

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingMessages.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    // Simulated fetch - replace with real API if available
    setTimeout(() => {
      setReview({
        winnerAdvantage: "The winner utilized an O(n) Hash Map approach, eliminating the need for nested iterations. Code structure adhered to clean-code principles with descriptive naming and modular logic.",
        loserMistakes: "The implementation relied on O(n²) nested loops, causing significant performance degradation on larger datasets. Lack of boundary checks for null inputs resulted in fragile execution.",
        suggestions: "Prioritize space-time tradeoffs by leveraging hash-based lookups. Implementing defensive programming patterns will improve the 'Edge Case' score significantly."
      });
      setLoading(false);
    }, 3600);
  }, [matchId]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] font-[Inter] flex flex-col relative overflow-hidden">
      {/* HUD Noise & Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 grid-bg" />

      {/* Header */}
      <header className="relative z-10 border-b border-outline-variant/30 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/app')}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-meta font-bold">Back to Hub</span>
            </motion.button>
            <div className="w-px h-6 bg-outline-variant/30" />
            <div>
              <h1 className="text-2xl font-[Space_Grotesk] font-bold uppercase text-white tracking-tighter flex items-center gap-3">
                <Brain className="w-5 h-5 text-accent-purple" />
                Intelligence Review
              </h1>
              <p className="text-meta opacity-50 mt-0.5">
                Session Protocol: {matchId}
              </p>
            </div>
          </div>
          {!loading && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 px-5 py-2.5 text-meta font-bold hover:text-primary-container hover:border-primary-container/30 transition-all"
            >
              <Download className="w-3 h-3" />
              Sync Report
            </motion.button>
          )}
        </div>
      </header>

      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center p-6"
            >
              {/* Core Loader */}
              <div className="relative mb-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 border border-outline-variant/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-2 border border-accent-purple/40 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-primary-container animate-pulse" />
                </div>
              </div>

              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-meta text-primary-container font-black tracking-[0.3em] mb-6"
              >
                {loadingMessages[loadingStep]}
              </motion.p>

              <div className="w-64 h-[2px] bg-surface-container-high overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-container via-accent-purple to-primary-container"
                  animate={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-7xl mx-auto p-6 md:p-8"
            >
              {/* High-Level Score Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel border border-outline-variant/30 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8"
              >
                <div className="flex flex-wrap items-center gap-12">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center shadow-glow-primary/10">
                      <TrendingUp className="w-8 h-8 text-primary-container" />
                    </div>
                    <div>
                      <p className="text-meta mb-1">Winner Efficiency</p>
                      <p className="font-[Space_Grotesk] text-4xl font-black text-white">94<span className="text-lg opacity-30 ml-1">/100</span></p>
                    </div>
                  </div>
                  <div className="w-px h-12 bg-outline-variant/20 hidden md:block" />
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-accent-orange" />
                    </div>
                    <div>
                      <p className="text-meta mb-1">Execution Index</p>
                      <p className="font-[Space_Grotesk] text-4xl font-black text-white">62<span className="text-lg opacity-30 ml-1">/100</span></p>
                    </div>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-meta mb-2 opacity-50 tracking-[0.2em]">Confidence Rating</p>
                  <p className="font-[Space_Grotesk] text-2xl font-black text-accent-green">AUTHENTICATED 98.7%</p>
                </div>
              </motion.div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'analysis' as const, label: 'Neuro-Analysis', icon: <BarChart3 className="w-4 h-4" /> },
                  { id: 'code' as const, label: 'Optimal Pattern', icon: <Code2 className="w-4 h-4" /> },
                  { id: 'suggestions' as const, label: 'Strategic Intel', icon: <Lightbulb className="w-4 h-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id)}
                    className={`flex items-center gap-3 px-6 py-3 text-meta font-bold transition-all whitespace-nowrap ${
                      activePanel === tab.id
                        ? 'bg-accent-purple/10 text-accent-purple border-b-2 border-accent-purple'
                        : 'text-on-surface-variant hover:text-white hover:bg-surface-container/50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  {activePanel === 'analysis' && (
                    <motion.div
                      key="analysis"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                      {/* Dominant Approach */}
                      <div className="glass-panel border border-outline-variant/30 relative h-full">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-container via-accent-green to-transparent" />
                        <div className="p-8">
                          <div className="flex items-center gap-3 mb-6">
                            <CheckCircle2 className="w-5 h-5 text-accent-green" />
                            <span className="text-meta text-accent-green font-bold">Peak Performance Log</span>
                          </div>
                          <h3 className="text-2xl font-[Space_Grotesk] font-bold text-white uppercase mb-4 tracking-tight">Algorithmic Superiority</h3>
                          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">{review?.winnerAdvantage}</p>

                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-[#0E0E0E] p-4 border-l-2 border-primary-container">
                                <span className="text-meta opacity-40 mb-2 block font-normal">Temporal</span>
                                <span className="font-black text-white font-mono text-xl">O(N)</span>
                              </div>
                              <div className="bg-[#0E0E0E] p-4 border-l-2 border-primary-container">
                                <span className="text-meta opacity-40 mb-2 block font-normal">Spatial</span>
                                <span className="font-black text-white font-mono text-xl">O(N)</span>
                              </div>
                            </div>
                            <div className="space-y-4 py-4 border-t border-outline-variant/10">
                              <MetricBar label="Logic Consistency" value={92} maxValue={100} color="bg-primary-container" delay={200} />
                              <MetricBar label="Syntactic Sugar" value={88} maxValue={100} color="bg-accent-green" delay={400} />
                              <MetricBar label="Boundary Resilience" value={95} maxValue={100} color="bg-accent-purple" delay={600} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Failure Points */}
                      <div className="glass-panel border border-outline-variant/30 relative h-full">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-orange via-accent-red to-transparent" />
                        <div className="p-8">
                          <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-5 h-5 text-accent-orange" />
                            <span className="text-meta text-accent-orange font-bold">Bottleneck Identification</span>
                          </div>
                          <h3 className="text-2xl font-[Space_Grotesk] font-bold text-white uppercase mb-4 tracking-tight">Critical Regression Points</h3>
                          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">{review?.loserMistakes}</p>

                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-[#0E0E0E] p-4 border-l-2 border-accent-orange">
                                <span className="text-meta opacity-40 mb-2 block font-normal">Temporal</span>
                                <span className="font-black text-white font-mono text-xl">O(N²)</span>
                              </div>
                              <div className="bg-[#0E0E0E] p-4 border-l-2 border-accent-orange">
                                <span className="text-meta opacity-40 mb-2 block font-normal">Spatial</span>
                                <span className="font-black text-white font-mono text-xl">O(1)</span>
                              </div>
                            </div>
                            <div className="space-y-4 py-4 border-t border-outline-variant/10">
                              <MetricBar label="Performance Drain" value={45} maxValue={100} color="bg-accent-orange" delay={300} />
                              <MetricBar label="Legacy Patterns" value={72} maxValue={100} color="bg-accent-green" delay={500} />
                              <MetricBar label="Unhandled Crashes" value={30} maxValue={100} color="bg-accent-red" delay={700} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activePanel === 'code' && (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="glass-panel border border-outline-variant/30 p-8"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-primary-container" />
                          <span className="text-meta text-primary-container font-black">Zero-Defect Implementation</span>
                        </div>
                        <div className="text-meta opacity-50">Standard: ES-Next Protocol</div>
                      </div>
                      <div className="bg-[#050505] border border-outline-variant/20 p-8 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
                        <div className="flex border-l border-primary-container/20">
                          <div className="pr-6 text-right text-on-surface-variant/20 select-none bg-[#080808] px-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                              <div key={n} className="leading-7">{n.toString().padStart(2, '0')}</div>
                            ))}
                          </div>
                          <code className="text-[#e2e8f0] py-0 pl-6 block">
                            <div className="leading-7"><span className="text-accent-purple italic">async function</span> <span className="text-primary-container font-bold">executeOptimal</span>(<span className="text-accent-orange">payload</span>, <span className="text-accent-orange">target</span>) {'{'}</div>
                            <div className="leading-7 pl-6"><span className="text-accent-purple italic">const</span> lookup = <span className="text-accent-purple">new</span> <span className="text-accent-green">Map</span>();</div>
                            <div className="leading-7 pl-6"><span className="text-accent-purple italic">for</span> (<span className="text-accent-purple">let</span> [ptr, val] <span className="text-accent-purple">of</span> payload.entries()) {'{'}</div>
                            <div className="leading-7 pl-12"><span className="text-accent-purple italic">const</span> delta = target - val;</div>
                            <div className="leading-7 pl-12"><span className="text-accent-purple italic">if</span> (lookup.has(delta)) <span className="text-accent-purple">return</span> [lookup.get(delta), ptr];</div>
                            <div className="leading-7 pl-12">lookup.set(val, ptr);</div>
                            <div className="leading-7 pl-6">{'}'}</div>
                            <div className="leading-7">{'}'}</div>
                          </code>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activePanel === 'suggestions' && (
                    <motion.div
                      key="suggestions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      {/* Strategic Report */}
                      <div className="glass-panel border border-outline-variant/30 p-8 bg-accent-green/5">
                        <div className="flex items-center gap-3 mb-6">
                          <Lightbulb className="w-5 h-5 text-accent-green" />
                          <span className="text-meta text-accent-green font-black tracking-[0.3em]">Neuro-Strategic Directive</span>
                        </div>
                        <p className="text-white font-[Space_Grotesk] text-xl leading-relaxed italic border-l-4 border-accent-green pl-6 py-2">
                          "{review?.suggestions}"
                        </p>
                      </div>

                      {/* Tactical improvements */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {
                            title: 'Core Architecture',
                            desc: 'Transition to event-driven processing map for high-concurrency safety.',
                            icon: <Zap className="w-6 h-6" />,
                            color: 'border-primary-container',
                            textColor: 'text-primary-container',
                          },
                          {
                            title: 'Signal Sanitization',
                            desc: 'Implement strict typing and schema validation at all entry points.',
                            icon: <AlertTriangle className="w-6 h-6" />,
                            color: 'border-accent-orange',
                            textColor: 'text-accent-orange',
                          },
                          {
                            title: 'Protocol Hygiene',
                            desc: 'Unified naming conventions following the AAA-Industrial coding spec.',
                            icon: <Code2 className="w-6 h-6" />,
                            color: 'border-accent-purple',
                            textColor: 'text-accent-purple',
                          },
                        ].map((card, i) => (
                          <motion.div
                            key={card.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.15 }}
                            className={`glass-panel border-l-4 ${card.color} p-6 hover:bg-surface-container-high/50 transition-colors cursor-default`}
                          >
                            <div className={`flex items-center gap-3 mb-4 ${card.textColor}`}>
                              {card.icon}
                              <span className="text-meta font-black">{card.title}</span>
                            </div>
                            <p className="text-on-surface-variant text-sm leading-relaxed font-medium">{card.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Deployment Action */}
              <motion.div 
                className="mt-12 flex flex-col items-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/app')}
                  className="bg-primary-container text-background font-black text-meta px-12 py-4 tracking-[0.4em] clip-angle shadow-glow-primary/20 hover:shadow-glow-primary/50 transition-all"
                >
                  INITIALIZE LOBBY UPLINK
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent Atmospheric Layer */}
      <div className="fixed inset-0 pointer-events-none z-[100] scanline-overlay opacity-20" />
    </div>
  );
}
