import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, Terminal, ArrowRight, Loader } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        ctx.fillStyle = `rgba(0, 242, 255, ${p.opacity})`;
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
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (err) {
      setError(err.message);
      setLoading(false);
    } else if (data.user) {
      const username = data.user.user_metadata?.username || data.user.email;
      localStorage.setItem('devduel_user_identity', username);
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center relative overflow-hidden font-body">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />
      <div className="absolute inset-0 obsidian-grid opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="bg-surface-container-low/80 backdrop-blur-xl border border-white/5 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
              <Terminal className="text-primary" size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 font-heading">Access_Arena</h1>
            <p className="text-on-surface-variant text-sm font-mono tracking-widest uppercase">ENCRYPTED_CHANNEL: ACTIVE</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] ml-1">Email_Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 focus:border-primary/50 focus:ring-0 outline-none transition-all font-mono text-sm group-hover:border-white/20"
                  placeholder="name@nexus.io"
                  required
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-hover:text-primary/50 transition-colors" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] ml-1">Access_Key</label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 focus:border-primary/50 focus:ring-0 outline-none transition-all font-mono text-sm group-hover:border-white/20"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-hover:text-primary/50 transition-colors" size={18} />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-error/10 border border-error/20 rounded-xl p-4 text-[11px] text-error font-mono flex items-center gap-3"
                >
                  <Shield size={14} className="shrink-0" />
                  {error.toUpperCase()}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <>
                  INITIALIZE_SESSION
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-on-surface-variant text-[11px] font-mono">
            New operator? <button onClick={() => navigate('/signup')} className="text-primary font-bold hover:underline">CREATE_IDENTITY</button>
          </p>
        </div>
        
        <div className="mt-8 flex justify-center gap-6 opacity-30">
          <button className="text-[10px] font-black uppercase tracking-widest hover:opacity-100 transition-opacity">RECOVER_KEY</button>
          <span className="text-white/10">•</span>
          <button className="text-[10px] font-black uppercase tracking-widest hover:opacity-100 transition-opacity">SECURITY_PROTOCOL</button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
