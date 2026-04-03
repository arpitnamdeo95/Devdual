import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DynamicLogo } from './DynamicLogo';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onEnterArena?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onEnterArena }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (!isLanding) {
      navigate(`/#${id}`);
    }
  };

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 overflow-hidden ${
        scrolled
          ? 'bg-background/95 backdrop-blur-xl border-b border-primary-container/10 shadow-[0_4px_30px_rgba(0,0,0,0.15)]'
          : 'bg-transparent'
      }`}
    >
      {/* Status bar — top edge neon line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary-container/40 to-transparent z-10" />

      <div className="max-w-[1600px] mx-auto py-3 px-6 md:px-12 flex justify-between items-center relative">
        {/* Logo */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-primary-container hover:opacity-80 transition-opacity group"
        >
          <DynamicLogo />
          <div className="flex flex-col text-left leading-none">
            <span className="font-display font-bold text-lg uppercase tracking-[0.2em] text-primary-container group-hover:text-white transition-colors duration-300">
              DevDuel
            </span>
            <span className="text-meta opacity-50 group-hover:text-primary-container/60 transition-colors duration-500">
              ARENA_v2.6.4_STABLE
            </span>
          </div>
        </motion.button>

        {/* Nav links — only visible on landing */}
        {isLanding && (
          <div className="hidden md:flex items-center gap-2">
            {[
              { id: 'features', label: 'system' },
              { id: 'duel', label: 'arena' },
              { id: 'leaderboard', label: 'rankings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="relative px-5 py-2 text-on-surface-variant font-code text-[11px] uppercase tracking-[0.2em] hover:text-primary-container transition-colors duration-300 group"
              >
                /{item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary-container group-hover:w-full transition-all duration-300 shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
              </button>
            ))}
          </div>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-6">
          {/* Live system data */}
          <div className="hidden lg:flex items-center gap-6 border-r border-outline-variant/10 pr-6 mr-2">
            <span className="text-meta animate-flicker tabular-nums">
              {timeStr}
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary-container/5 border border-primary-container/10">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
              <span className="text-meta">1,420 LIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isLanding && (
              <motion.button
                whileHover={{ x: -2 }}
                onClick={() => navigate('/')}
                className="text-meta hover:text-primary-container transition-colors hidden md:flex items-center gap-1.5"
              >
                ← Home
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEnterArena ?? (() => navigate('/app'))}
              className="group relative font-code font-bold text-[11px] text-background bg-primary-container px-6 py-2.5 hover:bg-white transition-all duration-300 uppercase tracking-widest overflow-hidden shadow-glow-primary clip-angle"
            >
              <div className="absolute inset-0 bg-white/40 -skew-x-12 -translate-x-[150%] group-hover:animate-light-sweep" />
              <span className="relative z-10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-background rounded-full animate-ping" />
                <span>Enter Arena</span>
              </span>
            </motion.button>

            {/* Mobile menu toggle */}
            {isLanding && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-on-surface-variant hover:text-primary-container transition-colors bg-surface-container-low/50 backdrop-blur-md rounded-sm"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isLanding && (
        <motion.div
          initial={false}
          animate={{
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden overflow-hidden bg-background/98 backdrop-blur-2xl border-t border-outline-variant/10 shadow-2xl"
        >
          <div className="px-8 py-6 space-y-4">
            {[
              { id: 'features', label: 'system' },
              { id: 'duel', label: 'arena' },
              { id: 'leaderboard', label: 'rankings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left py-4 text-on-surface-variant font-code text-sm uppercase tracking-[0.25em] hover:text-primary-container border-b border-outline-variant/5 transition-all"
              >
                /{item.label}
              </button>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <p className="text-meta opacity-40">
                Status: Operational
              </p>
              <p className="text-meta opacity-40">
                System Time: {timeStr}
              </p>
            </div>
          </div>
        </motion.div>
      )}

    </motion.nav>
  );
};
