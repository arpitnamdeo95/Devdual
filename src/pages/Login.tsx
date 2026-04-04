import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated particle background
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate('/app'), 1400);
  };

  return (
    <div
      className="min-h-screen text-white overflow-hidden relative flex flex-col"
      style={{ background: '#0a0e14', fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .login-input {
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
        }
        .login-input::placeholder { color: rgba(241,243,252,0.3); }
        .login-input:focus {
          border-color: rgba(173,198,255,0.5);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(173,198,255,0.08);
        }
        .login-btn-primary {
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
        .login-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 0 30px rgba(79,122,255,0.4); }
        .login-btn-primary:active { transform: translateY(0); }
        .login-btn-primary:disabled { opacity: 0.6; transform: none; }
        .login-btn-secondary {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: rgba(241,243,252,0.75);
          font-size: 13px;
          padding: 12px 16px;
          width: 100%;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .login-btn-secondary:hover { background: rgba(255,255,255,0.07); border-color: rgba(173,198,255,0.25); color: #f1f3fc; }
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

      {/* Animated canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      {/* Grid bg */}
      <div className="absolute inset-0 obsidian-grid opacity-40" style={{ zIndex: 0 }} />

      {/* Gradient orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pulse-glow" style={{ background: 'radial-gradient(circle, rgba(79,122,255,0.12) 0%, transparent 70%)', zIndex: 0 }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full pulse-glow" style={{ background: 'radial-gradient(circle, rgba(173,198,255,0.08) 0%, transparent 70%)', zIndex: 0, animationDelay: '1.5s' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className="material-symbols-outlined" style={{ color: '#adc6ff', fontSize: '22px' }}>terminal</span>
          <span style={{ color: '#adc6ff', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em' }}>DEVDUEL</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(241,243,252,0.25)', letterSpacing: '0.15em' }}>
          ARENA_v2.6.4_STABLE
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-[480px]">

          {/* Badge */}
          <div className="fade-in-up flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(173,198,255,0.06)', border: '1px solid rgba(173,198,255,0.12)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.7)' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(241,243,252,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>System Online • Secure Channel Active</span>
            </div>
          </div>

          {/* Title */}
          <div className="fade-in-up text-center mb-8">
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '42px', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '10px' }}>
              Access the{' '}
              <span style={{ background: 'linear-gradient(135deg, #adc6ff, #4f7aff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Arena</span>
            </h1>
            <p style={{ color: 'rgba(241,243,252,0.45)', fontSize: '15px', lineHeight: 1.6 }}>
              Authenticate to enter the battlefield. Session encrypted with AES-256.
            </p>
          </div>

          {/* Card */}
          <div className="card-glass fade-in-up-delay p-8">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label">Username / Email</label>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Enter your identity"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  id="login-email"
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <button type="button" style={{ background: 'none', border: 'none', color: 'rgba(173,198,255,0.6)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#adc6ff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(173,198,255,0.6)')}
                  >
                    Forgot access key?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    placeholder="Enter access key"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    id="login-password"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(241,243,252,0.3)', display: 'flex', alignItems: 'center' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      {showPassword ? (
                        <>
                          <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
                        </>
                      ) : (
                        <>
                          <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
                          <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="login-btn-primary"
                disabled={loading}
                id="login-submit"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? (
                  <>
                    <svg className="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="rgba(10,16,51,0.4)" strokeWidth="2"/>
                      <path d="M8 2a6 6 0 016 6" stroke="#0a1033" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>Enter the Arena <span style={{ fontSize: '16px' }}>⚡</span></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(241,243,252,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>or integrate via</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* OAuth */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="login-btn-secondary" id="login-google">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14.5 8.17c0-.46-.04-.9-.11-1.33H8v2.52h3.65a3.12 3.12 0 01-1.35 2.05v1.7h2.19c1.28-1.18 2.01-2.92 2.01-4.94z" fill="#4285F4"/>
                  <path d="M8 15c1.84 0 3.38-.61 4.5-1.65l-2.19-1.7c-.61.41-1.38.65-2.31.65-1.78 0-3.28-1.2-3.82-2.81H1.93v1.75A7 7 0 008 15z" fill="#34A853"/>
                  <path d="M4.18 9.49A4.22 4.22 0 013.97 8c0-.52.09-1.02.21-1.49V4.76H1.93A7.01 7.01 0 001 8c0 1.13.27 2.2.93 3.24l2.25-1.75z" fill="#FBBC05"/>
                  <path d="M8 3.58c1 0 1.9.34 2.6 1.01l1.96-1.96A7 7 0 008 1a7 7 0 00-6.07 3.76l2.25 1.75C4.72 4.79 6.22 3.58 8 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button className="login-btn-secondary" id="login-github">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1C4.133 1 1 4.133 1 8c0 3.097 2.009 5.73 4.796 6.657.35.065.479-.152.479-.337v-1.179c-1.948.423-2.36-.94-2.36-.94-.319-.81-.778-1.026-.778-1.026-.636-.435.048-.426.048-.426.703.049 1.073.722 1.073.722.625 1.07 1.64.761 2.04.582.064-.453.244-.761.445-.936-1.555-.177-3.19-.777-3.19-3.46 0-.765.273-1.39.72-1.88-.072-.177-.312-.888.069-1.853 0 0 .587-.188 1.923.718A6.71 6.71 0 018 5.33c.595.003 1.194.08 1.754.237 1.334-.906 1.92-.718 1.92-.718.383.965.142 1.676.07 1.853.449.49.72 1.115.72 1.88 0 2.69-1.638 3.281-3.198 3.454.251.217.476.643.476 1.296v1.922c0 .187.127.406.482.337C12.994 13.726 15 11.097 15 8c0-3.867-3.133-7-7-7z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Sign up */}
            <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'rgba(241,243,252,0.4)', fontSize: '13px' }}>New participant? </span>
              <button
                onClick={() => navigate('/signup')}
                id="go-to-signup"
                style={{ background: 'none', border: 'none', color: '#adc6ff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em', textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: "'Inter', sans-serif" }}
              >
                Create account
              </button>
            </div>
          </div>

          {/* Terminal ghost */}
          <div className="fade-in-up mt-6" style={{ background: 'rgba(10,14,20,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'rgba(241,243,252,0.2)', letterSpacing: '0.05em' }}>
            <div>&gt; verifying credentials...</div>
            <div>&gt; awaiting input...</div>
            <div style={{ color: 'rgba(173,198,255,0.3)' }}>&gt; <span style={{ animation: 'blink 1s step-end infinite', display: 'inline-block', width: '6px', height: '10px', background: 'rgba(173,198,255,0.4)', verticalAlign: 'middle' }} /></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(241,243,252,0.18)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          © 2024 DevDuel • v2.6.1
        </span>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(241,243,252,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>System: Nominal</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(241,243,252,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>All Systems Operational</span>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
};

export default Login;
