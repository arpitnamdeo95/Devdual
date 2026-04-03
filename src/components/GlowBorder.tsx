import React from 'react';
import { motion } from 'framer-motion';

interface GlowBorderProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlowBorder: React.FC<GlowBorderProps> = ({
  children,
  color = 'cyan',
  className = '',
  intensity = 'medium',
}) => {
  const colorMap: Record<string, string> = {
    cyan: '#00e5ff',
    purple: '#BC00FF',
    orange: '#FF8A00',
    green: '#00FF88',
    red: '#FF3366',
  };
  const rgb = colorMap[color] || color;
  const opacityMap = { low: 0.15, medium: 0.3, high: 0.5 };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute -inset-[1px]"
        style={{
          background: `linear-gradient(135deg, ${rgb}${Math.round(opacityMap[intensity] * 255).toString(16).padStart(2, '0')}, transparent, ${rgb}${Math.round(opacityMap[intensity] * 255).toString(16).padStart(2, '0')})`,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <div className="relative bg-surface-container-lowest">
        {children}
      </div>
    </div>
  );
};
