import React, { useEffect, useState, useCallback } from 'react';

interface MatrixRainProps {
  className?: string;
  opacity?: number;
  color?: string;
}

const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]<>/\\=+-*&^%$#@!?';
const FONT_SIZE = 14;

export const MatrixRain: React.FC<MatrixRainProps> = ({
  className = '',
  opacity = 0.15,
  color = '#00e5ff',
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cols = Math.floor(canvas.width / FONT_SIZE);
    const drops: number[] = Array(cols).fill(1);

    const tick = () => {
      ctx.fillStyle = 'rgba(3,3,3,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px JetBrains Mono, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        // Lead char is bright white
        if (drops[i] * FONT_SIZE < canvas.height * 0.15) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = color;
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(tick, 50);
    return () => clearInterval(interval);
  }, [color]);

  useEffect(() => {
    const cleanup = draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => {
      cleanup?.();
      window.removeEventListener('resize', handleResize);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ opacity }}
    />
  );
};

/* ─── Glitch Text component ─── */
interface GlitchTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
  style?: React.CSSProperties;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  className = '',
  as: Tag = 'span',
  style,
}) => {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const scheduleGlitch = () => {
      const delay = 3000 + Math.random() * 5000;
      const timer = setTimeout(() => {
        setGlitching(true);
        setTimeout(() => {
          setGlitching(false);
          scheduleGlitch();
        }, 300);
      }, delay);
      return timer;
    };
    const t = scheduleGlitch();
    return () => clearTimeout(t);
  }, []);

  return (
    <Tag
      className={`glitch ${className}`}
      data-text={children}
      style={{
        ...style,
        textShadow: glitching
          ? '2px 0 #e81cff, -2px 0 #00e5ff'
          : (style?.textShadow as string | undefined),
        filter: glitching ? 'brightness(1.3)' : undefined,
        transition: 'text-shadow 0.05s, filter 0.05s',
      }}
    >
      {children}
    </Tag>
  );
};

/* ─── Terminal Typewriter ─── */
interface TerminalLineProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  prefix?: string;
}

export const TerminalLine: React.FC<TerminalLineProps> = ({
  text,
  speed = 40,
  delay = 0,
  className = '',
  prefix = '> ',
}) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span className={`font-code text-on-surface-variant ${className}`}>
      <span className="text-primary-container/60">{prefix}</span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-2 h-4 bg-primary-container ml-0.5 animate-blink" />
      )}
    </span>
  );
};

/* ─── Neon divider ─── */
export const NeonDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative h-px w-full overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-container/60 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm" />
  </div>
);

/* ─── Section tag ─── */
export const SectionTag: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`inline-flex items-center gap-2 mb-6 ${className}`}>
    <span className="h-px w-8 bg-primary-container/60" />
    <span className="font-code text-primary-container text-[10px] tracking-[0.3em] uppercase">
      {children}
    </span>
    <span className="h-px w-8 bg-primary-container/60" />
  </div>
);
