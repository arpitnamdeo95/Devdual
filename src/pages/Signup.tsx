import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Fingerprint, ChevronDown, User, AtSign } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('JS');

  const passwordStrength = Math.min((password.length / 8) * 100, 100);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/20 selection:text-primary overflow-hidden relative flex flex-col">
      {/* Background decorations matching the theme */}
      <div className="absolute inset-0 bg-noise-overlay opacity-10 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-grid-pattern-cyan opacity-20 pointer-events-none"></div>
      
      {/* Top Navbar / Header */}
      <header className="h-16 flex items-center px-8 border-b border-white/5 relative z-10 shrink-0">
        <Link to="/" className="flex items-center gap-2 group">
           <span className="font-display font-black tracking-widest text-primary uppercase">DEVDUEL</span>
           <span className="font-mono text-[10px] text-on-surface-variant/40 tracking-widest mt-1">v1.0.4_KERNEL</span>
        </Link>
        <div className="flex-1"></div>
        <div className="flex gap-4 items-center">
            <div className="flex gap-1">
              <span className="w-1.5 h-3 bg-primary/20 block"></span>
              <span className="w-1.5 h-4 bg-primary/50 block"></span>
              <span className="w-1.5 h-2 bg-primary/80 block"></span>
            </div>
            <span className="material-symbols-outlined text-primary/50 text-sm">terminal</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-20 gap-12 lg:gap-24 relative z-10">
        
        {/* Left Side: Branding & Info */}
        <div className="flex-1 max-w-xl space-y-8 mt-12 bg-surface/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm self-start">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase">
            <div className="w-1.5 h-1.5 bg-primary shadow-[0_0_10px_#00F2FF]"></div>
            <span className="text-on-surface">New Operator Registration</span>
            <span className="text-on-surface-variant/40 mx-2">•</span>
            <span className="text-on-surface">Secure Channel Active</span>
          </div>

          <div>
             <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-[0.9]">
               Create Your<br/>
               <span className="text-primary drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">Identity</span>
             </h1>
          </div>

          <div className="space-y-4 font-mono text-sm text-on-surface-variant/80">
            <p>Enter the arena. Build your reputation. Dominate the leaderboard.</p>
            <p className="text-[#a855f7] font-bold opacity-80">// CONNECTION_ENCRYPTED_AES_256</p>
          </div>

          <div className="mt-8 border border-white/10 bg-[#131313]/80 p-6 flex items-center gap-6 rounded-lg relative overflow-hidden backdrop-blur-md max-w-sm">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40"></div>
             <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center bg-primary/5">
                <Fingerprint className="w-6 h-6 text-primary" />
             </div>
             <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-1">Protocol</div>
                <div className="font-mono text-xs uppercase tracking-widest text-[#e5e2e1]">Identity_Verification_v2</div>
             </div>
             <div className="absolute left-6 right-6 bottom-3 flex flex-col gap-1">
                <div className="w-full h-[1px] bg-white/5"></div>
                <div className="w-3/4 h-[1px] bg-white/5"></div>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-[480px] bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 p-8 pt-10 rounded-xl relative shadow-2xl before:absolute before:-inset-[1px] before:-z-10 before:rounded-xl before:bg-gradient-to-b before:from-white/10 before:to-transparent">
           {/* Top Right / Bottom Left Accent Shapes */}
           <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-primary/40"></div>
           <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-[#a855f7]/40"></div>

           <div className="mb-8">
              <h2 className="text-xl font-display font-black tracking-tight uppercase">New Operator Setup</h2>
           </div>

           <form onSubmit={handleSignup} className="space-y-6">
              
              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/80">Choose Your Codename</label>
                <div className="relative group">
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="OPERATOR_01"
                      className="w-full bg-[#131313] border border-white/5 rounded-none px-4 py-3 pl-10 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/80">Enter Your Signal Address</label>
                <div className="relative group">
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ADDRESS@DOMAIN.COM"
                      className="w-full bg-[#131313] border border-white/5 rounded-none px-4 py-3 pl-10 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/50 transition-colors uppercase"
                      required
                    />
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/80">Create Access Key</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="********"
                      className="w-full bg-[#131313] border border-white/5 rounded-none px-4 py-3 font-mono text-sm text-center text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/80">Re-enter Access Key</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="********"
                      className="w-full bg-[#131313] border border-white/5 rounded-none px-4 py-3 font-mono text-sm text-center text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/60">
                   <span>Strength: {passwordStrength > 75 ? 'Optimal' : passwordStrength > 40 ? 'Acceptable' : 'Weak'}</span>
                   <span>{Math.round(passwordStrength)}%</span>
                </div>
                <div className="h-1 w-full bg-[#131313] rounded-full overflow-hidden flex">
                   <div 
                     className={`h-full transition-all duration-300 ${passwordStrength > 75 ? 'bg-primary' : passwordStrength > 40 ? 'bg-tertiary' : 'bg-red-500'}`} 
                     style={{ width: `${passwordStrength}%` }}
                   ></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/80">Language Preference</label>
                <div className="relative">
                    <select 
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="w-full bg-[#131313] border border-white/5 rounded-none px-4 py-3 font-mono text-sm text-on-surface appearance-none outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="JS">JS</option>
                      <option value="TS">TS</option>
                      <option value="PYTHON">PYTHON</option>
                      <option value="RUST">RUST</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 pointer-events-none" />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-container text-background font-display font-black uppercase tracking-widest py-4 mt-2 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
              >
                 Initialize Account
              </button>

              <div className="grid grid-cols-3 gap-4 pt-2">
                 <button type="button" className="col-span-2 bg-[#1A1A1A] hover:bg-[#222] border border-white/5 py-3 font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-colors active:scale-[0.98]">
                    <svg className="w-3.5 h-3.5 text-on-surface" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10,0,0,0,8.84,21.5c.5.08.66-.23.66-.5V19.31C6.73,19.91,6.14,18,6.14,18A2.69,2.69,0,0,0,5,16.5c-.91-.62.07-.6.07-.6a2.1,2.1,0,0,1,1.53,1,2.15,2.15,0,0,0,2.91.83,2.16,2.16,0,0,1,.63-1.34C8,16.17,5.62,15.31,5.62,11.5a3.87,3.87,0,0,1,1-2.71,3.58,3.58,0,0,1,.1-2.64s.84-.27,2.75,1a9.63,9.63,0,0,1,5,0c1.91-1.29,2.75-1,2.75-1a3.58,3.58,0,0,1,.1,2.64,3.87,3.87,0,0,1,1,2.71c0,3.82-2.34,4.66-4.57,4.91a2.39,2.39,0,0,1,.69,1.85V21c0,.27.16.59.67.5A10,10,0,0,0,12,2Z"/></svg>
                    Continue with GitHub
                 </button>
                 <Link to="/login" className="col-span-1 bg-transparent hover:bg-white/5 border border-white/5 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center justify-center gap-1 transition-colors">
                    Login →
                 </Link>
              </div>

              {/* Terminal Logs in Form */}
              <div className="mt-8 border border-white/5 bg-[#131313] p-4 font-mono text-[10px] text-primary space-y-1">
                 <div className="opacity-50"><span className="mr-2">&gt;</span>validating identity...</div>
                 <div className="opacity-100"><span className="mr-2">&gt;</span>encrypting credentials... <span className="w-1.5 h-3 bg-primary inline-block animate-pulse align-middle ml-1"></span></div>
              </div>

           </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 flex items-center px-8 text-on-surface-variant border-t border-white/5 bg-background font-mono text-[9px] uppercase tracking-widest shrink-0 relative z-10 w-full">
          <div className="flex-1">
             © 2024 DEVDUEL_KERNEL_V1.0.4 - ALL DATA ENCRYPTED
          </div>
          <div className="flex gap-8 text-primary/60">
             <span className="text-primary animate-pulse">Initializing new operators...</span>
             <a href="#" className="hover:text-primary transition-colors">Protocol_Docs</a>
             <a href="#" className="hover:text-primary transition-colors">Security_Manifesto</a>
             <a href="#" className="hover:text-primary transition-colors">Contact_Node</a>
          </div>
      </footer>
    </div>
  );
}
