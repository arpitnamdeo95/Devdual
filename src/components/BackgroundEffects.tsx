import React from 'react';

export const BackgroundEffects: React.FC = () => {
  return (
    <>
      {/* Noise Overlay */}
      <div 
        className="fixed inset-0 z-50 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Animated Deep Grid Background */}
      <div className="fixed inset-0 z-[-1] bg-background">
        {/* Primary Ambient Glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-container rounded-full opacity-[0.03] blur-[150px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary-container rounded-full opacity-[0.02] blur-[150px] mix-blend-screen pointer-events-none" />
        
        {/* Perspective Grid */}
        <div 
          className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
        />
        
        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-scanlines mix-blend-overlay opacity-30 pointer-events-none" />
      </div>
    </>
  );
};
