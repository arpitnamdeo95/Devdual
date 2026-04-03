import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, Shield, Brain, Swords, Timer, Users, ArrowRight, Play, ChevronDown, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { LiquidEther } from '../components/LiquidEther';
import { Hero3DScene } from '../components/Hero3DScene';
import { CTAButton } from '../components/CTAButton';
import { FeatureCard } from '../components/FeatureCard';
import { DuelPreview } from '../components/DuelPreview';
import { LeaderboardPreview } from '../components/LeaderboardPreview';
import { SectionWrapper } from '../components/SectionWrapper';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { LiveTicker } from '../components/LiveTicker';
import { BackgroundElements } from '../components/BackgroundElements';
import { MatrixRain, GlitchText, NeonDivider, SectionTag } from '../components/HackerFX';
import { DotLottiePlayer } from '@dotlottie/react-player';

const features = [
  {
    icon: <Swords className="w-6 h-6 text-primary-container" />,
    title: 'Real-Time 1v1 Duels',
    description: 'Face off in live coding battles. Every keystroke synced — no lag, no mercy.',
  },
  {
    icon: <Brain className="w-6 h-6 text-secondary-fixed" />,
    title: 'AI Post-Match Review',
    description: 'AI dissects both solutions — complexity, quality, and battle-hardened insights.',
  },
  {
    icon: <Timer className="w-6 h-6 text-tertiary-container" />,
    title: 'Timed Pressure Arena',
    description: '30-minute countdown. Solve faster, solve cleaner. The clock is your enemy.',
  },
  {
    icon: <Shield className="w-6 h-6 text-primary-container" />,
    title: 'ELO-Based Matchmaking',
    description: 'Skill-based matching ensures every duel is genuinely competitive. Climb the ranks.',
  },
  {
    icon: <Users className="w-6 h-6 text-secondary-fixed" />,
    title: 'Spectator Mode',
    description: 'Watch elite matches live. Both editors synced in real-time. Learn from the best.',
  },
  {
    icon: <Zap className="w-6 h-6 text-tertiary-container" />,
    title: 'Multi-Language Support',
    description: 'JS, Python, C++, or Java. Judge0 validates against hidden test cases instantly.',
  },
];

const TypewriterText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const timer = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        if (i <= text.length) {
          setDisplayText(text.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 35);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [text, delay]);

  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor(p => !p), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span>
      {displayText}
      {showCursor && <span className="text-primary-container">|</span>}
    </span>
  );
};

const STATS = [
  { label: 'Matches Today', value: 8204, suffix: '' },
  { label: 'Active Duels', value: 142, prefix: '◆ ' },
  { label: 'Top ELO', value: 2840, suffix: '' },
];

/* Animated terminal log lines in hero */
const LOG_LINES = [
  { text: 'Initializing arena system...', delay: 400, color: '#94a3b8' },
  { text: 'Connected to matchmaking server', delay: 1000, color: '#4ade80' },
  { text: 'Loading Judge0 runtime [v1.13.0]', delay: 1800, color: '#94a3b8' },
  { text: 'System online — 1,420 operators active', delay: 2600, color: '#00e5ff' },
];

function TerminalBoot() {
  return (
    <div className="mt-10 bg-surface-container-low/60 backdrop-blur-md border border-outline-variant/20 px-5 py-4 font-code text-xs max-w-md shadow-2xl relative group overflow-hidden">
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-[1px] bg-primary-container" />
          <span className="text-green-400 tracking-[0.3em] text-meta">System Boot Sequence</span>
        </div>
      </div>
      {LOG_LINES.map((line, i) => (
        <AnimatedLogLine key={i} {...line} />
      ))}
    </div>
  );
}

function AnimatedLogLine({ text, delay, color }: { text: string; delay: number; color: string }) {
  const [shown, setShown] = useState(false);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!shown) return;
    let i = 0;
    const id = setInterval(() => {
      setTyped(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [shown, text]);

  if (!shown) return null;
  return (
    <div className="flex items-center gap-2 leading-6" style={{ color }}>
      <span className="text-outline-variant/60">$</span>
      <span>{typed}</span>
      {typed.length < text.length && (
        <span className="inline-block w-1.5 h-3.5 bg-current animate-blink" />
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="relative min-h-screen bg-background text-on-surface overflow-x-hidden">
      {/* Persistent Visual Effects */}
      <LiquidEther />
      <BackgroundElements />
      <Navbar onEnterArena={() => navigate('/app')} />

      {/* ─────── HERO SECTION ─────── */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        <Hero3DScene />
        <MatrixRain className="z-[1]" opacity={0.06} />

        {/* Scan line sweep overlay */}
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          <motion.div
            animate={{ top: ['-5%', '105%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-container/20 to-transparent shadow-[0_0_15px_rgba(0,229,255,0.2)]"
          />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 pt-32 pb-20 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl flex-1 shrink-0"
            >
              {/* Status badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="inline-flex items-center gap-3 border border-primary-container/20 bg-primary-container/5 px-4 py-2 mb-10 clip-angle"
              >
                <div className="flex flex-col gap-6 items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-meta">
                      System Online — <AnimatedCounter end={1420} suffix=" Active Coders" className="inline text-meta" />
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Dynamic Headline */}
              <h1 className="font-display font-black leading-none tracking-tighter mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                  className="text-5xl md:text-7xl xl:text-8xl text-white mb-2"
                >
                  CODE.
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.7 }}
                  className="text-5xl md:text-7xl xl:text-8xl"
                >
                  <span className="text-gradient-cyan [text-shadow:0_0_40px_rgba(0,229,255,0.4)]">
                    BATTLE.
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.7 }}
                  className="text-5xl md:text-7xl xl:text-8xl text-white"
                >
                  DOMINATE.
                </motion.div>
              </h1>

              {/* Terminal-style description */}
              <div className="font-body text-on-surface-variant text-lg md:text-xl leading-relaxed max-w-xl mb-12">
                <span className="text-primary-container font-code text-sm mr-2">&gt;</span>
                <TypewriterText text="Real-time multiplayer coding duels. Face an opponent, solve same problem, let your code speak." delay={800} />
              </div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="flex flex-wrap gap-4 items-center"
              >
                <CTAButton onClick={() => navigate('/app')} variant="glow" size="lg" icon={<Zap className="w-5 h-5 fill-current" />}>
                  Enter the Arena
                </CTAButton>
                <CTAButton variant="secondary" onClick={() => navigate('/watch/demo')} size="lg" icon={<Play className="w-4 h-4 fill-current" />}>
                  Watch Live Match
                </CTAButton>
              </motion.div>

              {/* Terminal sequence */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="hidden md:block"
              >
                <TerminalBoot />
              </motion.div>

              {/* Match Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex gap-10 mt-16 pt-8 border-t border-outline-variant/10"
              >
                <div>
                  <h3 className="text-3xl font-display font-bold text-white tracking-tight">2.4k+</h3>
                  <p className="text-meta mt-1">
                    Duels Daily
                  </p>
                </div>
                <div>
                  <h3 className="text-3xl font-display font-bold text-white tracking-tight">150+</h3>
                  <p className="text-meta mt-1 font-medium">
                    Challenges
                  </p>
                </div>
                <div className="absolute -left-2 top-0 py-4 h-full w-[1px] bg-primary-container/20 group-hover:bg-primary-container/50 transition-colors" />
              </motion.div>
            </motion.div>
            
            {/* 3D/Lottie Animation Centerpiece */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
              className="hidden lg:block flex-1 w-full max-w-xl xl:max-w-2xl relative shrink select-none"
            >
              <div className="absolute inset-0 bg-primary-container/5 rounded-full blur-[120px] pointer-events-none" />
              <DotLottiePlayer
                src="/coding-animation.lottie"
                autoplay
                loop
                style={{ width: '100%', height: 'auto', maxHeight: '640px' }}
              />
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10 cursor-pointer group"
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="font-code text-outline-variant text-meta tracking-[0.4em] uppercase group-hover:text-primary-container transition-colors">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <div className="w-[1.5px] h-10 bg-gradient-to-b from-primary-container to-transparent opacity-60" />
            <ChevronDown className="w-4 h-4 text-primary-container -mt-1" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ─────── LIVE TICKER ─────── */}
      <LiveTicker />

      {/* ─────── FEATURES SECTION ─────── */}
      <SectionWrapper id="features">
        <div className="absolute inset-0 grid-bg opacity-100 pointer-events-none" />
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mb-16 relative z-10"
        >
          <SectionTag>Core Systems</SectionTag>
          <h2 className="font-display font-black text-4xl md:text-6xl text-white leading-none tracking-tight">
            Built for{' '}
            <GlitchText as="span" className="neon-cyan">
              the Obsessed
            </GlitchText>
          </h2>
          <p className="font-body text-on-surface-variant mt-5 text-lg max-w-lg leading-relaxed">
            Every feature simulates high-pressure, real-world engineering culture — inside a competitive duel arena.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
          {features.map((feat, i) => (
            <FeatureCard key={feat.title} {...feat} delay={i * 0.08} index={i} />
          ))}
        </div>
      </SectionWrapper>

      {/* ─────── LIVE DUEL PREVIEW SECTION ─────── */}
      <SectionWrapper id="duel">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mb-8"
        >
          <SectionTag>Arena Preview</SectionTag>
          <h2 className="font-display font-black text-4xl md:text-6xl text-white leading-none tracking-tight">
            Watch it{' '}
            <span className="text-gradient-purple [text-shadow:0_0_30px_rgba(188,0,255,0.3)]">
              Happen Live
            </span>
          </h2>
          <p className="font-body text-on-surface-variant mt-4 text-lg max-w-xl leading-relaxed">
            Two editors. One problem. Real-time sync. AI overlay tracking complexity and velocity. This is how masters compete.
          </p>
        </motion.div>

        <DuelPreview />

        <div className="flex justify-center mt-12">
          <CTAButton onClick={() => navigate('/app')} variant="glow" size="lg" icon={<Sparkles className="w-5 h-5" />}>
            Initialize Your First Duel
          </CTAButton>
        </div>
      </SectionWrapper>

      {/* ─────── LEADERBOARD SECTION ─────── */}
      <SectionWrapper id="leaderboard">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mb-4 text-center"
        >
          <div className="flex justify-center">
            <SectionTag>Global Rankings</SectionTag>
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl text-white leading-none tracking-tight">
            The{' '}
            <GlitchText as="span" className="neon-purple">
              Elite
            </GlitchText>
          </h2>
          <p className="font-body text-on-surface-variant mt-4 text-lg max-w-xl mx-auto leading-relaxed">
            These are the top operatives. Every win earns ELO. Every loss costs it. Authenticate to track your climb.
          </p>
        </motion.div>

        <LeaderboardPreview />

        <div className="flex justify-center mt-16">
          <CTAButton onClick={() => navigate('/app')} variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
            Climb the Rankings
          </CTAButton>
        </div>
      </SectionWrapper>

      {/* ─────── FINAL CALL TO ACTION ─────── */}
      <section className="relative py-48 px-6 md:px-12 text-center overflow-hidden">
        {/* Cinematic glow background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.08, 0.15, 0.08],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-[800px] h-[800px] rounded-full blur-[140px]"
            style={{ background: 'radial-gradient(circle, #00e5ff 0%, #a855f7 50%, #e81cff 100%)' }}
          />
        </div>
        <MatrixRain opacity={0.05} />

        {/* Framing Dividers */}
        <NeonDivider className="absolute top-0 left-0 right-0 brightness-150" />
        <NeonDivider className="absolute bottom-0 left-0 right-0 brightness-150" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-10">
            <SectionTag>Ready to Execute?</SectionTag>
          </div>
          <h2 className="font-display font-black text-5xl md:text-7xl xl:text-8xl text-white leading-none tracking-tight mb-8">
            Your Opponent is
            <br />
            <motion.span
              className="text-gradient-synth inline-block drop-shadow-[0_0_30px_rgba(0,229,255,0.3)]"
              animate={{ filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              Already Waiting.
            </motion.span>
          </h2>
          <p className="font-body text-on-surface-variant text-xl mb-14 max-w-lg mx-auto leading-relaxed">
            Jump into the lobby, get matched instantly, and prove your technical superiority in real-time.
          </p>
          <div className="flex justify-center">
            <CTAButton onClick={() => navigate('/app')} variant="glow" size="lg" className="px-16 py-6 group">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-background animate-ping mr-3 group-hover:bg-primary-container transition-colors" />
              Enter the Arena Now
            </CTAButton>
          </div>
        </motion.div>
      </section>

      {/* ─────── FOOTER ─────── */}
      <footer className="border-t border-outline-variant/10 py-12 px-6 md:px-12 relative bg-surface-container-lowest/50 backdrop-blur-xl shrink-0">
        <NeonDivider className="absolute top-0 left-0 right-0 opacity-40" />
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <span className="font-display font-black text-gradient-cyan text-2xl tracking-[0.25em] uppercase">DevDuel</span>
            <div className="h-4 w-px bg-outline-variant/20 hidden md:block" />
            <span className="font-code text-on-surface-variant text-[10px] tracking-widest uppercase opacity-60">
              // Real-Time Coding Wars
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10 font-code text-[11px] text-on-surface-variant uppercase tracking-[0.3em]">
            {[
              { href: '#features', label: '/System' },
              { href: '#duel', label: '/Arena' },
              { href: '#leaderboard', label: '/Global-Rank' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className="relative group hover:text-primary-container transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[1.5px] bg-primary-container group-hover:w-full transition-all duration-300 shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
              </a>
            ))}
            <button
              onClick={() => navigate('/app')}
              className="relative group hover:text-primary-container transition-all duration-300 transform hover:-translate-y-0.5"
            >
              /Enter-Lobby
              <span className="absolute -bottom-1.5 left-0 w-0 h-[1.5px] bg-primary-container group-hover:w-full transition-all duration-300 shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            </button>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-1 opacity-40">
            <p className="font-code text-meta tracking-widest">
              © 2026 DEWDUEL.PROTOCOL
            </p>
            <p className="font-code text-[8px] tracking-[0.2em] text-primary-container">
              v1.0.4-alpha // ALL SYSTEMS NOMINAL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
