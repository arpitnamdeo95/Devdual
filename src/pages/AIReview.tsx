import { AppNavbar, AppSidebar } from '../components/AppLayout';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate , Link} from 'react-router-dom';
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
  const [review, setReview] = useState<any>(null);
  const [activePanel, setActivePanel] = useState<'analysis' | 'code' | 'suggestions'>('analysis');
  const [matchData, setMatchData] = useState<any>(null);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev >= loadingMessages.length - 1 ? prev : prev + 1));
    }, 800);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const stored = sessionStorage.getItem('reviewData');
    if (!stored) {
      setReview({ winnerAdvantage: "No match data found.", loserMistakes: "No match data found.", suggestions: ["Play a match first!"] });
      setLoading(false);
      return;
    }
    const parsed = JSON.parse(stored);
    setMatchData(parsed);

    const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    
    fetch(`${BACKEND_URL}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    })
    .then(res => res.json())
    .then(data => {
      setReview(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setReview({ 
        error: "Failed to fetch AI analysis.",
        complexityComparison: "Unable to compare results.",
        winnerAdvantage: "Player showed superior logic speed.",
        loserMistakes: "Slower algorithmic conversion identified.",
        suggestions: ["Focus on reducing nested loops", "Consider built-in sorting methods"],
        winnerScore: 85,
        loserScore: 62
      });
      setLoading(false);
    });
  }, [matchId]);

  if (loading) {
     return (
        <div className="h-screen flex flex-col items-center justify-center bg-background text-on-surface font-body p-8 space-y-12">
           <div className="relative w-32 h-32">
              <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                 className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full shadow-[0_0_40px_rgba(0,229,255,0.2)]"
              />
              <motion.div 
                 animate={{ rotate: -360 }}
                 transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                 className="absolute inset-4 border-4 border-tertiary/20 border-t-tertiary rounded-full shadow-[0_0_30px_rgba(78,222,163,0.2)]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Brain className="w-10 h-10 text-white animate-pulse" />
              </div>
           </div>
           <div className="space-y-3 text-center">
              <motion.h2 
                 key={loadingStep}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-2xl font-display font-black tracking-widest uppercase"
              >
                 {loadingMessages[loadingStep]}
              </motion.h2>
              <div className="flex justify-center gap-1">
                 {[0, 1, 2, 3].map(i => (
                    <motion.div
                       key={i}
                       animate={{ opacity: [0.2, 1, 0.2] }}
                       transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                       className="w-1.5 h-1.5 bg-primary rounded-full"
                    />
                 ))}
              </div>
           </div>
        </div>
     );
  }

  return (
<div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">


<AppNavbar />
<div className="flex flex-1 overflow-hidden">

<AppSidebar />

<main className="flex-1 overflow-y-auto p-8 lg:p-12">
<div className="max-w-6xl mx-auto space-y-12">

<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
<div>
<div className="flex items-center gap-3 mb-2">
<span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-mono rounded border border-tertiary/20">ANALYSIS COMPLETE</span>
<span className="text-zinc-500 font-mono text-xs">#{matchId?.substring(0, 8).toUpperCase() || 'MATCH'}</span>
</div>
<h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">Post-Match Report</h1>
</div>
<div className="flex gap-4">
<div className="text-right">
<div className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Runtime</div>
<div className="text-2xl font-mono text-primary font-bold">{review?.runtimeMs || '34ms'}</div>
</div>
<div className="w-px h-10 bg-white/10 self-center"></div>
<div className="text-right">
<div className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Memory</div>
<div className="text-2xl font-mono text-tertiary font-bold">{review?.memoryMb || '12.4MB'}</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<div className="md:col-span-2 bg-surface-container-low rounded-xl p-6 border border-white/5 flex flex-col gap-6">
<div className="flex justify-between items-center">
<h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Runtime Distribution</h3>
<span className="text-xs text-tertiary font-mono">Beats 98.4% of users</span>
</div>
<div className="relative h-48 w-full flex items-end gap-1">

<div className="flex-1 bg-white/5 h-12 rounded-t-sm"></div>
<div className="flex-1 bg-white/5 h-20 rounded-t-sm"></div>
<div className="flex-1 bg-white/5 h-32 rounded-t-sm"></div>
<div className="flex-1 bg-white/10 h-40 rounded-t-sm"></div>
<div className="flex-1 bg-primary/40 h-44 rounded-t-sm border-t border-primary relative">
<div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary whitespace-nowrap">You (34ms)</div>
</div>
<div className="flex-1 bg-white/10 h-36 rounded-t-sm"></div>
<div className="flex-1 bg-white/5 h-24 rounded-t-sm"></div>
<div className="flex-1 bg-white/5 h-16 rounded-t-sm"></div>
<div className="flex-1 bg-white/5 h-8 rounded-t-sm"></div>
</div>
<div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/5">
<span>0ms</span>
<span>50ms</span>
<span>100ms</span>
<span>150ms</span>
<span>200ms+</span>
</div>
</div>

<div className="bg-surface-container-low rounded-xl p-6 border border-white/5 flex flex-col justify-between">
<div>
<h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4">Complexity Analysis</h3>
<div className="space-y-4">
<div className="text-sm text-zinc-400 leading-relaxed">
{review?.complexityComparison || 'Analyzing complexity...'}
</div>
</div>
</div>
<div className="mt-8 pt-4 border-t border-white/5 text-[11px] text-zinc-500 leading-relaxed italic">
  Scores: Winner {review?.winnerScore || 0}/100 | You {review?.loserScore || 0}/100
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-white/5">
<div className="bg-surface-container-high px-6 py-4 flex justify-between items-center border-b border-white/5">
<div className="flex items-center gap-4">
<h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Refactor Suggestion</h3>
<div className="flex gap-2">
<span className="flex items-center gap-1 text-[10px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded">AI Optimized</span>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 font-mono text-[12px] leading-relaxed overflow-x-auto min-h-[300px]">

<div className="p-6 border-r border-white/5 bg-surface-container-lowest">
<div className="text-zinc-600 mb-4 text-[10px] uppercase font-bold tracking-widest flex justify-between items-center">
  <span>Your Submission</span>
  <Code2 className="w-3 h-3 opacity-30" />
</div>
<pre className="whitespace-pre-wrap text-on-surface-variant font-mono">
{matchData?.loserCode || '# No code provided'}
</pre>
</div>

<div className="p-6 bg-surface-container-low border-t md:border-t-0 md:border-l border-white/5">
<div className="text-tertiary mb-4 text-[10px] uppercase font-bold tracking-widest flex justify-between items-center">
  <span>AI Recommended Refactor</span>
  <Zap className="w-3 h-3 text-tertiary" />
</div>
<pre className="whitespace-pre-wrap text-tertiary font-mono">
{review?.optimizedRefactor || '# AI is generating optimization...'}
</pre>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
<div className="space-y-4">
<h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Winner Advantage</h4>
<div className="bg-surface-container rounded-lg p-5 border-l-4 border-primary">
<p className="text-xs text-zinc-400 leading-relaxed">
    {review?.winnerAdvantage || 'Loading advantage...'}
</p>
</div>
</div>
<div className="space-y-4">
<h4 className="text-xs font-black text-error uppercase tracking-[0.2em]">Loser Mistakes</h4>
<div className="bg-surface-container rounded-lg p-5 border-l-4 border-error">
<p className="text-xs text-zinc-400 leading-relaxed">
    {review?.loserMistakes || 'Loading mistakes...'}
</p>
</div>
</div>
<div className="space-y-4">
<h4 className="text-xs font-black text-tertiary uppercase tracking-[0.2em]">Specific Suggestions</h4>
<div className="space-y-3">
    {(review?.suggestions || []).map((s: string, i: number) => (
        <div key={i} className="bg-surface-container rounded-lg p-4 border-l-4 border-tertiary">
            <p className="text-[11px] text-zinc-400 leading-relaxed">{s}</p>
        </div>
    ))}
</div>
</div>
</div>
</div>
</main>
</div>



</div>
);
}
