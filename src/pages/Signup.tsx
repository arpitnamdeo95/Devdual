import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, Terminal, ArrowRight, Loader, Zap, Mail, Trash2 } from 'lucide-react';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [codename, setCodename] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.3 + 0.1,
        });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(173, 198, 255, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("PASSWORDS_DO_NOT_MATCH");
      return;
    }
    
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: codename,
        }
      }
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else if (data.session) {
      localStorage.setItem('devduel_user_identity', codename);
      navigate('/app');
    } else {
        // Confirmation required probably
        setError("REGISTRATION_PENDING_CONFIRMATION");
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center relative overflow-hidden font-body">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />
      <div className="absolute inset-0 obsidian-grid opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg p-6"
      >
        <div className="bg-surface-container-low/80 backdrop-blur-xl border border-white/5 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tertiary to-transparent opacity-50" />
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center mb-6 border border-tertiary/20 shadow-glow-tertiary/20 shadow-lg">
              <Zap className="text-tertiary" size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 font-heading">Register_Operator</h1>
            <p className="text-on-surface-variant text-[10px] font-mono tracking-[0.3em] uppercase">SYSTEM_REGISTRY: OPEN</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] ml-1">CODENAME</label>
              <div className="relative group">
                <input
                  type="text"
                  value={codename}
                  onChange={e => setCodename(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 focus:border-tertiary/50 focus:ring-0 outline-none transition-all font-mono text-sm group-hover:border-white/20"
                  placeholder="OPERATOR_01"
                  required
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-hover:text-tertiary/50 transition-colors" size={16} />
              </div>
            </div>

            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] ml-1">SIGNAL_ADDRESS</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 focus:border-tertiary/50 focus:ring-0 outline-none transition-all font-mono text-sm group-hover:border-white/20"
                  placeholder="nexus@io.com"
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-hover:text-tertiary/50 transition-colors" size={16} />
              </div>
            </div>

            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] ml-1">CREATE_KEY</label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 focus:border-tertiary/50 focus:ring-0 outline-none transition-all font-mono text-sm group-hover:border-white/20"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-hover:text-tertiary/50 transition-colors" size={16} />
              </div>
            </div>

            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] ml-1">CONFIRM_KEY</label>
              <div className="relative group">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 focus:border-tertiary/50 focus:ring-0 outline-none transition-all font-mono text-sm group-hover:border-white/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:col-span-2 bg-error/10 border border-error/20 rounded-xl p-4 text-[10px] text-error font-mono flex items-center gap-3"
                >
                  <Shield size={14} className="shrink-0" />
                  {error.toUpperCase()}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 bg-tertiary text-on-tertiary py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-lg shadow-tertiary/20 hover:brightness-110 active:scale-[0.98] transition-all mt-4"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <>
                  AUTHORIZE_NEW_IDENTITY
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-on-surface-variant text-[11px] font-mono">
            Already enlisted? <button onClick={() => navigate('/login')} className="text-tertiary font-bold hover:underline">ACCESS_ARENA</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
