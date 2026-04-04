
/**
 * Superplane.tsx
 * A high-performance, stable background component.
 * Uses CSS glassmorphism and animated SVG paths for a premium industrial look.
 */

export default function Superplane() {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] overflow-hidden pointer-events-none z-[-1]">
      {/* Dynamic Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Animated Light Streaks */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <linearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#00F2FF" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {/* Horizontal Streaks */}
        {[10, 30, 50, 70, 90].map((y, i) => (
          <rect 
            key={`h-${i}`}
            x="-100%" y={`${y}%`} width="100%" height="1" 
            fill="url(#streakGrad)"
            className="animate-streak-h"
            style={{ animationDelay: `${i * 1.5}s` }}
          />
        ))}
      </svg>
      
      <style>{`
        @keyframes streak-h {
          from { transform: translateX(0); }
          to { transform: translateX(200%); }
        }
        .animate-streak-h {
          animation: streak-h 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
