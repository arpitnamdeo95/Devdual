import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [codename, setCodename] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);
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
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
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

  useEffect(() => {
    if (!password) { setStrength(0); return; }
    let s = 0;
    if (password.length >= 6) s += 20;
    if (password.length >= 10) s += 20;
    if (/[A-Z]/.test(password)) s += 20;
    if (/[0-9]/.test(password)) s += 20;
    if (/[^A-Za-z0-9]/.test(password)) s += 20;
    setStrength(s);
  }, [password]);

  const strengthLabel = strength === 0 ? 'WEAK' : strength <= 40 ? 'WEAK' : strength <= 60 ? 'MODERATE' : strength <= 80 ? 'STRONG' : 'ELITE';
  const strengthColor = strength === 0 ? '#ef4444' : strength <= 40 ? '#ef4444' : strength <= 60 ? '#f59e0b' : strength <= 80 ? '#4ade80' : '#adc6ff';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate('/login'), 1200);
  };

  const languages = ['TypeScript', 'JavaScript', 'Python', 'C++', 'Rust', 'Go', 'Java'];

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden relative flex flex-col"
      style={{ background: '#0a0e14', fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .signup-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #f1f3fc;
          font-size: 14px;
          padding: 13px 16px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }
        .signup-input::placeholder { color: rgba(241,243,252,0.3); }
        .signup-input:focus {
          border-color: rgba(173,198,255,0.5);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(173,198,255,0.08);
        }
        .signup-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #f1f3fc;
          font-size: 14px;
          padding: 13px 36px 13px 16px;
          width: 100%;
          outline: none;
          appearance: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(241,243,252,0.3)' strokeWidth='1.5' strokeLinecap='round' fill='none'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          box-sizing: border-box;
        }
        .signup-select:focus { border-color: rgba(173,198,255,0.5); box-shadow: 0 0 0 3px rgba(173,198,255,0.08); }
        .signup-select option { background: #1a2035; color: #f1f3fc; }
        .signup-btn-primary {
          background: linear-gradient(135deg, #4f7aff 0%, #adc6ff 100%);
          border: none;
          border-radius: 10px;
          color: #0a1033;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.05em;
          padding: 14px 24px;
          width: 100%;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          font-family: 'Space Grotesk', sans-serif;
          box-shadow: 0 0 20px rgba(79,122,255,0.25);
        }
        .signup-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 0 30px rgba(79,122,255,0.4); }
        .signup-btn-primary:active { transform: translateY(0); }
        .signup-btn-primary:disabled { opacity: 0.6; transform: none; }
        .signup-btn-secondary {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: rgba(241,243,252,0.75);
          font-size: 13px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .signup-btn-secondary:hover { background: rgba(255,255,255,0.07); border-color: rgba(173,198,255,0.25); color: #f1f3fc; }
        .form-label { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(241,243,252,0.4); font-family: 'JetBrains Mono', monospace; }
        .card-glass {
          background: rgba(15,20,32,0.8);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(173,198,255,0.04);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
        @keyframes fadeInUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        .fade-in-up { animation: fadeInUp 0.6s ease forwards; }
        .fade-in-up-delay { animation: fadeInUp 0.6s ease 0.15s forwards; opacity: 0; }
        @keyframes pulseGlow { 0%,100% { opacity:0.4; } 50% { opacity:0.7; } }
        .pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
        .obsidian-grid {
          background-image:
            linear-gradient(rgba(173,198,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(173,198,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      <div className="absolute inset-0 obsidian-grid opacity-40" style={{ zIndex: 0 }} />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pulse-glow" style={{ background: 'radial-gradient(circle, rgba(79,122,255,0.12) 0%, transparent 70%)', zIndex: 0 }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pulse-glow" style={{ background: 'radial-gradient(circle, rgba(173,198,255,0.08) 0%, transparent 70%)', zIndex: 0, animationDelay: '1.5s' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <span className="material-symbols-outlined" style={{ color: '#adc6ff', fontSize: '22px' }}>terminal</span>
          <span style={{ color: '#adc6ff', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em' }}>DEVDUEL</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(241,243,252,0.25)', letterSpacing: '0.15em' }}>
          ARENA_v2.6.4_STABLE
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-[520px]">

          <div className="fade-in-up flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(173,198,255,0.06)', border: '1px solid rgba(173,198,255,0.12)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.7)' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(241,243,252,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>New Operator Registration • Secure Channel Active</span>
            </div>
          </div>

          <div className="fade-in-up text-center mb-8">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '40px', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '10px' }}>
              Create your{' '}
              <span style={{ background: 'linear-gradient(135deg, #adc6ff, #4f7aff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Identity</span>
            </h1>
            <p style={{ color: 'rgba(241,243,252,0.45)', fontSize: '15px', lineHeight: 1.6 }}>
              Enter the arena. Build your reputation. Dominate the leaderboard.
            </p>
          </div>

          <div className="card-glass fade-in-up-delay p-8">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label">Choose your codename</label>
                <input
                  type="text"
                  className="signup-input"
                  placeholder="OPERATOR_01"
                  value={codename}
                  onChange={e => setCodename(e.target.value)}
                  id="signup-codename"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label">Signal Address</label>
                <input
                  type="email"
                  className="signup-input"
                  placeholder="address@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  id="signup-email"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="form-label">Create Access Key</label>
                  <input
                    type="password"
                    className="signup-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    id="signup-password"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="form-label">Confirm Key</label>
                  <input
                    type="password"
                    className="signup-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    id="signup-confirm-password"
                  />
                </div>
              </div>

              {password && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="form-label">Strength: <span style={{ color: strengthColor }}>{strengthLabel}</span></span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: strengthColor }}>{strength}%</span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${strength}%`, height: '100%', background: strengthColor, boxShadow: `0 0 8px ${strengthColor}`, borderRadius: '99px', transition: 'width 0.4s ease, background 0.4s ease' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label">Language Preference</label>
                <select
                  className="signup-select"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  id="signup-language"
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <button
                type="submit"
                className="signup-btn-primary"
                disabled={loading}
                id="signup-submit"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}
              >
                {loading ? (
                  <>
                    <svg className="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="rgba(10,16,51,0.4)" strokeWidth="2"/>
                      <path d="M8 2a6 6 0 016 6" stroke="#0a1033" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Initializing...
                  </>
                ) : (
                  <>Initialize Account <span style={{ fontSize: '16px' }}>→</span></>
                )}
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="signup-btn-secondary" style={{ flex: 1 }} id="signup-github">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1C4.133 1 1 4.133 1 8c0 3.097 2.009 5.73 4.796 6.657.35.065.479-.152.479-.337v-1.179c-1.948.423-2.36-.94-2.36-.94-.319-.81-.778-1.026-.778-1.026-.636-.435.048-.426.048-.426.703.049 1.073.722 1.073.722.625 1.07 1.64.761 2.04.582.064-.453.244-.761.445-.936-1.555-.177-3.19-.777-3.19-3.46 0-.765.273-1.39.72-1.88-.072-.177-.312-.888.069-1.853 0 0 .587-.188 1.923.718A6.71 6.71 0 018 5.33c.595.003 1.194.08 1.754.237 1.334-.906 1.92-.718 1.92-.718.383.965.142 1.676.07 1.853.449.49.72 1.115.72 1.88 0 2.69-1.638 3.281-3.198 3.454.251.217.476.643.476 1.296v1.922c0 .187.127.406.482.337C12.994 13.726 15 11.097 15 8c0-3.867-3.133-7-7-7z"/>
                  </svg>
                  Continue with GitHub
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="signup-btn-secondary"
                  id="go-to-login"
                  style={{ whiteSpace: 'nowrap', paddingLeft: '20px', paddingRight: '20px' }}
                >
                  Login →
                </button>
              </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'rgba(241,243,252,0.4)', fontSize: '13px' }}>Already enlisted? </span>
              <button
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: '#adc6ff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em', textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: "'Inter', sans-serif" }}
              >
                Access the arena
              </button>
            </div>
          </div>

          <div className="fade-in-up mt-4 flex justify-center">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,14,20,0.5)' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L1 3v4c0 2.21 2.13 4.27 5 5 2.87-.73 5-2.79 5-5V3L6 1z" stroke="rgba(74,222,128,0.7)" strokeWidth="1" strokeLinejoin="round" fill="rgba(74,222,128,0.1)"/>
              </svg>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(241,243,252,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Connection encrypted · AES-256 · Identity Verification v2
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(241,243,252,0.18)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          © 2024 DevDuel · v2.6.1 · All Data Encrypted
        </span>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Protocol Docs', 'Security Manifesto', 'Contact'].map(link => (
            <button key={link} style={{ background: 'none', border: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(241,243,252,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(173,198,255,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(241,243,252,0.18)')}
            >{link}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Signup;
