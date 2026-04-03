import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { LiquidEther } from './LiquidEther';
import { BackgroundElements } from './BackgroundElements';
import { LiveTicker } from './LiveTicker';
import { Book, Shield, FileText, Globe, ArrowRight } from 'lucide-react';

interface ContentPageProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const ContentPageLayout: React.FC<ContentPageProps> = ({ title, subtitle, icon, content }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] font-[Inter] flex flex-col relative overflow-hidden">
      <LiquidEther />
      <BackgroundElements />
      <Navbar />

      <main className="flex-1 p-6 pt-32 max-w-4xl mx-auto w-full relative z-10 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-container/10 border border-primary-container/30 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <p className="text-meta text-primary-container font-bold tracking-[0.2em]">{subtitle}</p>
              <h1 className="text-4xl md:text-6xl font-[Space_Grotesk] font-black uppercase text-white tracking-tighter">
                {title}
              </h1>
            </div>
          </div>

          <div className="glass-panel border border-outline-variant/30 p-8 md:p-12 prose prose-invert max-w-none prose-headings:font-[Space_Grotesk] prose-headings:uppercase prose-headings:tracking-wider prose-p:text-on-surface-variant prose-p:leading-relaxed">
            {content}
          </div>
          
          <motion.div 
            className="mt-12 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent" />
          </motion.div>
        </motion.div>
      </main>

      <div className="relative z-50">
        <LiveTicker />
      </div>
    </div>
  );
};

export const Documentation = () => (
  <ContentPageLayout
    title="Documentation"
    subtitle="Protocol v2.4.0 / Technical Specs"
    icon={<Book className="w-6 h-6 text-primary-container" />}
    content={
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">01. Core Protocol</h2>
          <p>
            DevDuel is a high-frequency algorithmic combat platform designed for tier-1 engineers. 
            The system utilizes a proprietary real-time synchronization engine (Neuro-Sync v4) 
            to facilitate millisecond-accurate code execution monitoring.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">02. Elo Algorithms</h2>
          <p>
            Matchmaking is processed via the Glicko-2 system, modified for high-volatility 
            programming environments. Expected win rates are calculated based on historical 
            execution speed, complexity management, and boundary-condition resilience.
          </p>
          <ul className="list-none space-y-3 p-0">
            <li className="flex items-center gap-3 text-sm text-primary-container font-mono">
              <ArrowRight className="w-4 h-4" /> K-Factor: Industrial Standard (32)
            </li>
            <li className="flex items-center gap-3 text-sm text-primary-container font-mono">
              <ArrowRight className="w-4 h-4" /> Volatility Offset: Optimized for Alpha-Tier
            </li>
          </ul>
        </section>
      </div>
    }
  />
);

export const PrivacyPolicy = () => (
  <ContentPageLayout
    title="Privacy Protocol"
    subtitle="Data Encryption / Signal Integrity"
    icon={<Shield className="w-6 h-6 text-accent-green" />}
    content={
      <div className="space-y-8">
        <p className="text-xl text-white font-medium">Your data is yours. We only monitor the pulse.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-surface-container/30 p-6 border-l-2 border-primary-container">
            <h3 className="text-lg font-bold mb-3">Code Logic</h3>
            <p className="text-sm opacity-70">We never persist your source code. Analysis is performed in memory and purged immediately post-session.</p>
          </div>
          <div className="bg-surface-container/30 p-6 border-l-2 border-accent-purple">
            <h3 className="text-lg font-bold mb-3">Biometrics</h3>
            <p className="text-sm opacity-70">Keystroke patterns are used strictly for anti-cheat verification and are hashed using SHA-512 with salt.</p>
          </div>
        </div>
      </div>
    }
  />
);

export const TermsOfService = () => (
  <ContentPageLayout
    title="Protocol Terms"
    subtitle="User Agreement / Behavior Specs"
    icon={<FileText className="w-6 h-6 text-accent-orange" />}
    content={
      <div className="space-y-6">
        <p>By initializing a session on DevDuel, you agree to the following terms of engagement:</p>
        <ol className="space-y-6 list-none p-0">
          <li className="flex gap-4">
            <span className="text-primary-container font-mono font-bold">1.0</span>
            <span>No unauthorized external LLM assistance during ranked duels (Zen Protocol).</span>
          </li>
          <li className="flex gap-4">
            <span className="text-primary-container font-mono font-bold">2.0</span>
            <span>Signal integrity must be maintained. Intentional disconnection results in Elo decay.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-primary-container font-mono font-bold">3.0</span>
            <span>Respect the Matrix. Toxic signals within the global lobby will lead to node suspension.</span>
          </li>
        </ol>
      </div>
    }
  />
);

export const Resources = () => (
  <ContentPageLayout
    title="System Resources"
    subtitle="Global Assets / Training Intel"
    icon={<Globe className="w-6 h-6 text-accent-purple" />}
    content={
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          'Algorithmic Pattern Library',
          'Industrial Code Generators',
          'Vulnerability Database',
          'Global Rank API',
          'Spectator Webhooks',
          'Hardware Optimization Spec'
        ].map((item) => (
          <div key={item} className="flex items-center justify-between p-4 bg-surface-container/20 border border-outline-variant/10 hover:border-primary-container/30 transition-all group">
            <span className="text-sm font-bold uppercase tracking-wider">{item}</span>
            <ArrowRight className="w-4 h-4 text-primary-container opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    }
  />
);
