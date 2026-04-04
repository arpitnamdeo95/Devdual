import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Fingerprint, Lock, ShieldAlert, Cpu } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to app on login
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
           <Fingerprint className="w-5 h-5 text-primary group-hover:text-primary-container transition-colors" />
           <span className="font-display font-black tracking-widest text-[#e5e2e1] uppercase">DEVDUEL</span>
           <span className="font-mono text-[10px] text-primary/60 tracking-widest mt-1">v1.0.4_KERNEL</span>
        </Link>
        <div className="flex-1"></div>
        <div className="flex gap-4 items-center">
            <span className="material-symbols-outlined text-primary/50 text-sm">tv</span>
            <span className="material-symbols-outlined text-primary/50 text-sm">terminal</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-20 gap-12 lg:gap-24 relative z-10">
        
        {/* Left Side: Branding & Info */}
        <div className="flex-1 max-w-xl space-y-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00F2FF] shadow-[0_0_10px_#00F2FF]"></div>
            <span className="font-mono text-[12px] tracking-widest text-primary font-bold uppercase">System Status: Online</span>
          </div>

          <div>
             <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-[0.9]">
               Access The<br/>
               <span className="text-primary drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">Arena</span>
             </h1>
          </div>

          <div className="space-y-2 font-mono text-sm text-on-surface-variant">
            <p>Authenticate to enter the battlefield.</p>
            <p className="opacity-60">Session encrypted using AES-256 Protocol.</p>
          </div>

          <div className="border-l-2 border-[#a855f7] bg-[#a855f7]/5 p-4 space-y-2 font-mono text-xs text-on-surface-variant/80 rounded-r-lg shadow-[inset_0_0_20px_rgba(168,85,247,0.05)] border-y border-r border-[#a855f7]/10">
             <div className="text-[#a855f7] uppercase tracking-widest font-bold mb-2 text-[10px]">Active Threat Feed</div>
             <div><span className="text-primary mr-2">&gt;</span>pinging local_node_77...</div>
             <div><span className="text-primary mr-2">&gt;</span>connection established via secure_tunnel</div>
             <div><span className="text-primary mr-2">&gt;</span>encryption keys rotated successfully</div>
          </div>

          <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest text-primary uppercase pt-4">
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Secure Access Enabled
             </div>
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_10px_rgba(78,222,163,0.5)]"></span>
                LAT: 37.7749° N
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-md bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 p-8 pt-10 rounded-xl relative shadow-2xl before:absolute before:-inset-[1px] before:-z-10 before:rounded-xl before:bg-gradient-to-b before:from-white/10 before:to-transparent">
           {/* Top Right Corner Accent */}
           <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/50 rounded-tr-xl"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#a855f7]/40 rounded-bl-xl"></div>

           <div className="mb-8">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                 <ShieldAlert className="w-4 h-4 text-primary" />
                 Identity Verification
              </div>
              <h2 className="text-2xl font-display font-black tracking-tight">User Authentication</h2>
           </div>

           <form onSubmit={handleLogin} className="space-y-6">
              
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">Username / Email</label>
                </div>
                <div className="relative group">
                    <input 
                      type="text" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your identity"
                      className="w-full bg-[#131313] border border-white/5 rounded-none px-4 py-3 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 font-mono text-sm">@</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">Password</label>
                    <a href="#" className="font-mono text-[10px] text-on-surface-variant/60 hover:text-primary transition-colors">Forgot Access Key?</a>
                </div>
                <div className="relative group">
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter access key"
                      className="w-full bg-[#131313] border border-white/5 rounded-none px-4 py-3 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/50 transition-colors"
                      required
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-container text-background font-display font-black uppercase tracking-widest py-4 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
              >
                 Enter The Arena
              </button>

              <div className="relative my-6 flex items-center justify-center">
                 <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                 </div>
                 <div className="relative bg-[#0A0A0A] px-4 font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
                    Or Integrate Via
                 </div>
              </div>

              <div className="space-y-3">
                 <button type="button" className="w-full bg-[#1A1A1A] hover:bg-[#222] border border-white/5 py-3 font-mono text-xs flex items-center justify-center gap-3 transition-colors active:scale-[0.98]">
                    <svg className="w-4 h-4 text-on-surface" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                    Continue with Google
                 </button>
                 <button type="button" className="w-full bg-[#1A1A1A] hover:bg-[#222] border border-white/5 py-3 font-mono text-xs flex items-center justify-center gap-3 transition-colors active:scale-[0.98]">
                    <svg className="w-4 h-4 text-on-surface" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10,0,0,0,8.84,21.5c.5.08.66-.23.66-.5V19.31C6.73,19.91,6.14,18,6.14,18A2.69,2.69,0,0,0,5,16.5c-.91-.62.07-.6.07-.6a2.1,2.1,0,0,1,1.53,1,2.15,2.15,0,0,0,2.91.83,2.16,2.16,0,0,1,.63-1.34C8,16.17,5.62,15.31,5.62,11.5a3.87,3.87,0,0,1,1-2.71,3.58,3.58,0,0,1,.1-2.64s.84-.27,2.75,1a9.63,9.63,0,0,1,5,0c1.91-1.29,2.75-1,2.75-1a3.58,3.58,0,0,1,.1,2.64,3.87,3.87,0,0,1,1,2.71c0,3.82-2.34,4.66-4.57,4.91a2.39,2.39,0,0,1,.69,1.85V21c0,.27.16.59.67.5A10,10,0,0,0,12,2Z"/></svg>
                    Continue with GitHub
                 </button>
              </div>

              {/* Terminal Logs in Form */}
              <div className="mt-8 border border-white/5 bg-[#131313] p-4 font-mono text-[10px] text-primary space-y-1">
                 <div className="opacity-50"><span className="mr-2">&gt;</span>verifying credentials...</div>
                 <div className="opacity-100"><span className="mr-2">&gt;</span>awaiting input...</div>
                 <div className="animate-pulse"><span className="mr-2">&gt;</span>_</div>
              </div>

              <div className="text-center pt-2">
                 <span className="font-mono text-[10px] text-on-surface-variant mr-2">New participant?</span>
                 <Link to="/signup" className="font-mono text-[10px] text-[#a855f7] hover:text-[#c084fc] uppercase tracking-widest font-bold transition-colors">Create Account</Link>
              </div>

           </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 flex items-center px-8 border-t border-white/5 bg-background font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/50 shrink-0 relative z-10">
          <div className="flex-1 flex gap-2 items-center">
             <span>DEVDUEL V2.6.1</span>
             <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
          </div>
          <div className="flex-1 text-center hidden md:block">
             System_Status: Nominal &nbsp;&nbsp;&nbsp; All Systems Operational
          </div>
          <div className="flex-1 text-right">
             © 2024 Kinetic Encryption Terminal // All Rights Reserved
          </div>
      </footer>
    </div>
  );
}
