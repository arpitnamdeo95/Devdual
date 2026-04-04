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
    const stored = sessionStorage.getItem('reviewData');
    if (!stored) {
      setReview({ winnerAdvantage: "No match data found.", loserMistakes: "No match data found.", suggestions: ["Play a match first!"] });
      setLoading(false);
      return;
    }
    const reqBody = JSON.parse(stored);
    const BACKEND_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    
    fetch(`${BACKEND_URL}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody)
    })
    .then(res => res.json())
    .then(data => {
      setReview(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setReview({ error: "Failed to fetch AI analysis." });
      setLoading(false);
    });
  }, [matchId]);

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
<span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-mono rounded border border-tertiary/20">SUCCESS</span>
<span className="text-zinc-500 font-mono text-xs">#MATCH-8829-X</span>
</div>
<h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">Post-Match Analysis</h1>
</div>
<div className="flex gap-4">
<div className="text-right">
<div className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Runtime</div>
<div className="text-2xl font-mono text-primary font-bold">34ms</div>
</div>
<div className="w-px h-10 bg-white/10 self-center"></div>
<div className="text-right">
<div className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Memory</div>
<div className="text-2xl font-mono text-tertiary font-bold">12.4MB</div>
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
<h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Refactor Diff</h3>
<div className="flex gap-2">
<span className="flex items-center gap-1 text-[10px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded">+12 additions</span>
<span className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">-8 removals</span>
</div>
</div>
<div className="flex bg-background p-0.5 rounded">
<button className="px-3 py-1 text-[10px] font-bold bg-surface-container-highest text-white rounded">Split</button>
<button className="px-3 py-1 text-[10px] font-bold text-zinc-500">Unified</button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 font-mono text-[13px] leading-relaxed overflow-x-auto">

<div className="p-6 border-r border-white/5 bg-surface-container-lowest">
<div className="text-zinc-600 mb-4 text-[10px] uppercase font-bold tracking-widest">Initial Version</div>
<div className="space-y-0.5">
<div className="flex">
<span className="w-8 text-zinc-700 text-right pr-4 select-none">12</span>
<span className="text-on-surface-variant">def solve(data):</span>
</div>
<div className="flex bg-primary/10 border-l-2 border-primary">
<span className="w-8 text-primary/50 text-right pr-4 select-none">13</span>
<span className="text-primary-fixed-dim">    results = []</span>
</div>
<div className="flex bg-primary/10 border-l-2 border-primary">
<span className="w-8 text-primary/50 text-right pr-4 select-none">14</span>
<span className="text-primary-fixed-dim">    for item in data:</span>
</div>
<div className="flex bg-primary/10 border-l-2 border-primary">
<span className="w-8 text-primary/50 text-right pr-4 select-none">15</span>
<span className="text-primary-fixed-dim">        results.append(item ** 2)</span>
</div>
<div className="flex">
<span className="w-8 text-zinc-700 text-right pr-4 select-none">16</span>
<span className="text-on-surface-variant">    return sorted(results)</span>
</div>
</div>
</div>

<div className="p-6 bg-surface-container-low">
<div className="text-zinc-600 mb-4 text-[10px] uppercase font-bold tracking-widest">Optimized Refactor</div>
<div className="space-y-0.5">
<div className="flex">
<span className="w-8 text-zinc-700 text-right pr-4 select-none">12</span>
<span className="text-on-surface-variant">def solve(data):</span>
</div>
<div className="flex bg-tertiary/10 border-l-2 border-tertiary">
<span className="w-8 text-tertiary/50 text-right pr-4 select-none">13</span>
<span className="text-tertiary">    # Use list comprehension for speed</span>
</div>
<div className="flex bg-tertiary/10 border-l-2 border-tertiary">
<span className="w-8 text-tertiary/50 text-right pr-4 select-none">14</span>
<span className="text-tertiary">    return sorted([x*x for x in data])</span>
</div>
<div className="flex text-zinc-800 italic">
<span className="w-8 text-zinc-800 text-right pr-4 select-none">15</span>
<span className="select-none">// Memory reduced by 14%</span>
</div>
</div>
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
